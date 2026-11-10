<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Content-Type:text/html; charset=utf-8'); echo '<form method="post" style="max-width:420px;margin:40px auto;font:16px Arial"><h2>Realty Center Süper Admin</h2><input name="username" value="admin" required style="width:100%;padding:10px"><br><br><input name="email" type="email" placeholder="admin e-posta adresi" required style="width:100%;padding:10px"><br><br><input name="password" type="password" minlength="10" required placeholder="Güçlü şifre" style="width:100%;padding:10px"><br><br><button style="padding:10px 18px">Oluştur</button></form>'; exit; }
$username = strtolower(trim((string)($_POST['username'] ?? 'admin')));
$email = strtolower(trim((string)($_POST['email'] ?? '')));
$password = (string)($_POST['password'] ?? '');
if (!preg_match('/^[a-z0-9._-]{3,80}$/', $username) || !filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($password)<10) respond(['error'=>'Bilgileri kontrol edin.'],422);
$id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',random_int(0,65535),random_int(0,65535),random_int(0,65535),random_int(16384,20479),random_int(32768,49151),random_int(0,65535),random_int(0,65535),random_int(0,65535));
$q=$pdo->prepare('INSERT INTO users (id,username,email,password_hash,first_name,last_name,role,status) VALUES (?,?,?,?,?,?,"admin","active") ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash),email=VALUES(email),role="admin",status="active"');
$q->execute([$id,$username,$email,password_hash($password,PASSWORD_DEFAULT),'Süper','Admin']);
echo 'Süper admin oluşturuldu. Güvenlik için setup-admin.php dosyasını hemen silin.';
