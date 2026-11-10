<?php
declare(strict_types=1);

session_name('realty_center_session');
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$configPath = '/home/realtycentercom/realty-config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Sunucu yapılandırması bulunamadı.']);
    exit;
}
$config = require $configPath;
try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config['db_host'], $config['db_name']),
        $config['db_user'],
        $config['db_password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Veritabanı bağlantısı kurulamadı.']);
    exit;
}
function body(): array { return json_decode(file_get_contents('php://input'), true) ?: []; }
function respond(array $data, int $status = 200): never { http_response_code($status); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function currentUser(PDO $pdo): ?array {
    if (empty($_SESSION['user_id'])) return null;
    $q = $pdo->prepare('SELECT id,username,email,first_name,last_name,phone,role,status,avatar_url,force_password_change FROM users WHERE id=? AND deleted_at IS NULL LIMIT 1');
    $q->execute([$_SESSION['user_id']]);
    $user = $q->fetch();
    return $user ?: null;
}
function requireUser(PDO $pdo): array { $user = currentUser($pdo); if (!$user || $user['status'] !== 'active') respond(['error'=>'Oturum geçersiz.'],401); return $user; }
