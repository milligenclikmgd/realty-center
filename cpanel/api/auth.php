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
    try { $pdo->exec('ALTER TABLE users MODIFY avatar_url MEDIUMTEXT NULL'); $pdo->exec('ALTER TABLE users ADD COLUMN city VARCHAR(100) NULL, ADD COLUMN district VARCHAR(100) NULL'); } catch (Throwable $ignored) {}
    $avatar = (string)($input['avatarUrl'] ?? '');
    $q = $pdo->prepare('INSERT INTO users (id,username,email,password_hash,first_name,last_name,phone,role,status,force_password_change,avatar_url,city,district) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
    $q->execute([$id,$username,$email,password_hash($password,PASSWORD_DEFAULT),$first,$last,$phone,$role,$status,!empty($input['forcePasswordChange']) ? 1 : 0,$avatar ?: null,$input['city'] ?? null,$input['district'] ?? null]);
    respond(['ok'=>true,'user'=>['id'=>$id,'username'=>$username,'email'=>$email,'first_name'=>$first,'last_name'=>$last,'role'=>$role,'status'=>$status]]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update-user') {
    requireUser($pdo);
    $input = body();
    $id = (string)($input['id'] ?? '');
    $first = trim((string)($input['firstName'] ?? ''));
    $last = trim((string)($input['lastName'] ?? ''));
    $username = strtolower(trim((string)($input['username'] ?? '')));
    $email = strtolower(trim((string)($input['email'] ?? '')));
    if ($id === '' || $first === '' || $last === '' || $username === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) respond(['error'=>'Zorunlu alanları kontrol edin.'],422);
    try { $pdo->exec('ALTER TABLE users MODIFY avatar_url MEDIUMTEXT NULL'); $pdo->exec('ALTER TABLE users ADD COLUMN city VARCHAR(100) NULL, ADD COLUMN district VARCHAR(100) NULL'); } catch (Throwable $ignored) {}
    $check = $pdo->prepare('SELECT id FROM users WHERE (LOWER(username)=? OR LOWER(email)=?) AND id<>? AND deleted_at IS NULL LIMIT 1');
    $check->execute([$username,$email,$id]);
    if ($check->fetch()) respond(['error'=>'Bu kullanıcı adı veya e-posta zaten kayıtlı.'],409);
    $q = $pdo->prepare('UPDATE users SET first_name=?,last_name=?,username=?,email=?,phone=?,role=?,status=?,avatar_url=?,city=?,district=? WHERE id=? AND deleted_at IS NULL');
    $q->execute([$first,$last,$username,$email,trim((string)($input['phone'] ?? '')) ?: null,$input['role'] ?? 'advisor',$input['status'] ?? 'active',$input['avatarUrl'] ?? null,$input['city'] ?? null,$input['district'] ?? null,$id]);
    if (!empty($input['password'])) {
        if (strlen((string)$input['password']) < 10) respond(['error'=>'Yeni şifre en az 10 karakter olmalı.'],422);
        $p = $pdo->prepare('UPDATE users SET password_hash=?,force_password_change=? WHERE id=?');
        $p->execute([password_hash((string)$input['password'], PASSWORD_DEFAULT),!empty($input['forcePasswordChange']) ? 1 : 0,$id]);
    }
    respond(['ok'=>true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'users') {
    requireUser($pdo);
    $q = $pdo->query('SELECT id,username,email,first_name,last_name,phone,role,status,last_login_at,created_at,avatar_url,city,district FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC');
    respond(['users'=>$q->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'offices') {
    requireUser($pdo);
    try { $pdo->exec('ALTER TABLE offices ADD COLUMN latitude DECIMAL(10,7) NULL, ADD COLUMN longitude DECIMAL(10,7) NULL'); } catch (Throwable $ignored) {}
    $q = $pdo->query("SELECT o.id,o.name,o.city,o.district,o.address,o.phone,o.email,o.manager_user_id AS owner_profile_id,o.image_url,o.description,o.work_hours,o.latitude,o.longitude,o.status,o.deleted_at,CONCAT(COALESCE(u.first_name,''),' ',COALESCE(u.last_name,'')) AS manager_name FROM offices o LEFT JOIN users u ON u.id=o.manager_user_id WHERE o.deleted_at IS NULL ORDER BY o.created_at DESC");
    respond(['offices'=>$q->fetchAll()]);
}
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'office-members') { requireUser($pdo); $q=$pdo->query('SELECT office_id,user_id AS advisor_id,is_manager FROM office_advisors'); respond(['members'=>$q->fetchAll()]); }
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete-office') { requireUser($pdo); $id=(string)(body()['id']??''); if($id==='') respond(['error'=>'Ofis seçilmedi.'],422); $q=$pdo->prepare('UPDATE offices SET deleted_at=NOW() WHERE id=?'); $q->execute([$id]); respond(['ok'=>true]); }

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'save-office') {
    requireUser($pdo);
    $input = body();
    $id = trim((string)($input['id'] ?? ''));
    $name = trim((string)($input['name'] ?? ''));
    if ($name === '' || trim((string)($input['city'] ?? '')) === '' || trim((string)($input['district'] ?? '')) === '') respond(['error'=>'Ofis adı, il ve ilçe zorunludur.'],422);
    try { $pdo->exec('ALTER TABLE offices ADD COLUMN latitude DECIMAL(10,7) NULL, ADD COLUMN longitude DECIMAL(10,7) NULL'); } catch (Throwable $ignored) {}
    $values = [$name,trim((string)$input['city']),trim((string)$input['district']),trim((string)($input['address'] ?? '')),trim((string)($input['phone'] ?? '')) ?: null,trim((string)($input['email'] ?? '')) ?: null,($input['owner_profile_id'] ?? null) ?: null,$input['image_url'] ?? null,$input['description'] ?? null,$input['work_hours'] ?? null,$input['latitude'] ?? null,$input['longitude'] ?? null];
    if ($id !== '') { $q=$pdo->prepare('UPDATE offices SET name=?,city=?,district=?,address=?,phone=?,email=?,manager_user_id=?,image_url=?,description=?,work_hours=?,latitude=?,longitude=? WHERE id=? AND deleted_at IS NULL'); $q->execute([...$values,$id]); }
    else { $id=bin2hex(random_bytes(16)); $q=$pdo->prepare('INSERT INTO offices (id,name,city,district,address,phone,email,manager_user_id,image_url,description,work_hours,latitude,longitude) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'); $q->execute([$id,...$values]); }
    respond(['ok'=>true,'id'=>$id]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'logs') {
    requireUser($pdo);
    $entity = trim((string)($_GET['entity_id'] ?? ''));
    $q = $pdo->prepare('SELECT id,action,entity_type,entity_id,details,created_at FROM audit_logs WHERE (? = "" OR entity_id=?) ORDER BY created_at DESC LIMIT 200');
    $q->execute([$entity,$entity]);
    respond(['logs'=>$q->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'assign-office') {
    requireUser($pdo);
    $input = body();
    $office = (string)($input['office_id'] ?? '');
    $user = (string)($input['user_id'] ?? '');
    if ($office === '' || $user === '') respond(['error'=>'Ofis ve danışman seçimi zorunludur.'],422);
    $q = $pdo->prepare('INSERT INTO office_advisors (office_id,user_id,is_manager) VALUES (?,?,?) ON DUPLICATE KEY UPDATE is_manager=VALUES(is_manager)');
    $q->execute([$office,$user,!empty($input['is_manager']) ? 1 : 0]);
    respond(['ok'=>true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'logout') { $_SESSION=[]; session_destroy(); respond(['ok'=>true]); }
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'me') respond(['user'=>currentUser($pdo)]);
respond(['error'=>'Geçersiz istek.'],404);
