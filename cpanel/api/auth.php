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

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'logout') { $_SESSION=[]; session_destroy(); respond(['ok'=>true]); }
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'me') respond(['user'=>currentUser($pdo)]);
respond(['error'=>'Geçersiz istek.'],404);
