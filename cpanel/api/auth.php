<?php
require __DIR__ . '/bootstrap.php';
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $input = body();
    $identifier = strtolower(trim((string)($input['identifier'] ?? '')));
    $password = (string)($input['password'] ?? '');
    if ($identifier === '' || $password === '') respond(['error'=>'Kullanıcı adı/e-posta ve şifre zorunludur.'],422);
    $q = $pdo->prepare('SELECT * FROM users WHERE (LOWER(username)=? OR LOWER(email)=?) AND deleted_at IS NULL LIMIT 1');
    $q->execute([$identifier,$identifier]);
    $user = $q->fetch();
    if (!$user || $user['status'] !== 'active' || !password_verify($password, $user['password_hash'])) respond(['error'=>'Kullanıcı adı veya şifre hatalı.'],401);
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $pdo->prepare('UPDATE users SET last_login_at=NOW() WHERE id=?')->execute([$user['id']]);
    unset($user['password_hash'], $user['reset_token_hash'], $user['reset_token_expires_at']);
    respond(['user'=>$user]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create-user') {
    $actor = requireUser($pdo);
    if ($actor['role'] !== 'admin') respond(['error'=>'Bu işlem yalnızca süper admin tarafından yapılabilir.'],403);
    $input = body();
    $first = trim((string)($input['firstName'] ?? ''));
    $last = trim((string)($input['lastName'] ?? ''));
    $username = strtolower(trim((string)($input['username'] ?? '')));
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $phone = trim((string)($input['phone'] ?? '')) ?: null;
    $role = (string)($input['role'] ?? 'advisor');
    $status = (string)($input['status'] ?? 'active');
    $password = (string)($input['password'] ?? '');
    if ($first === '' || $last === '' || $username === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 10) respond(['error'=>'Ad, soyad, kullanıcı adı, geçerli e-posta ve en az 10 karakterli şifre zorunludur.'],422);
    if (!in_array($role, ['admin','manager','advisor'], true)) $role = 'advisor';
    if (!in_array($status, ['active','inactive','suspended','left'], true)) $status = 'active';
    $check = $pdo->prepare('SELECT id FROM users WHERE (LOWER(username)=? OR LOWER(email)=?) AND deleted_at IS NULL LIMIT 1');
    $check->execute([$username, $email]);
    if ($check->fetch()) respond(['error'=>'Bu kullanıcı adı veya e-posta zaten kayıtlı.'],409);
    $id = bin2hex(random_bytes(16));
    $avatar = (string)($input['avatarUrl'] ?? '');
    if (strlen($avatar) > 490) $avatar = '';
    $q = $pdo->prepare('INSERT INTO users (id,username,email,password_hash,first_name,last_name,phone,role,status,force_password_change,avatar_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    $q->execute([$id,$username,$email,password_hash($password,PASSWORD_DEFAULT),$first,$last,$phone,$role,$status,!empty($input['forcePasswordChange']) ? 1 : 0,$avatar ?: null]);
    respond(['ok'=>true,'user'=>['id'=>$id,'username'=>$username,'email'=>$email,'first_name'=>$first,'last_name'=>$last,'role'=>$role,'status'=>$status]]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'users') {
    $actor = requireUser($pdo);
    if ($actor['role'] !== 'admin') respond(['error'=>'Bu listeyi yalnızca süper admin görebilir.'],403);
    $q = $pdo->query('SELECT id,username,email,first_name,last_name,phone,role,status,last_login_at,created_at,avatar_url FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC');
    respond(['users'=>$q->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'logout') { $_SESSION=[]; session_destroy(); respond(['ok'=>true]); }
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'me') respond(['user'=>currentUser($pdo)]);
respond(['error'=>'Geçersiz istek.'],404);
