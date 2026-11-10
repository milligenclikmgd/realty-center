<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(['error' => 'Bu uç nokta yalnızca POST isteği kabul eder.'], 405);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = strtolower((string)parse_url($origin, PHP_URL_HOST));
    $requestHost = strtolower((string)preg_replace('/:\\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
    if ($originHost === '' || !hash_equals($requestHost, $originHost)) {
        respond(['error' => 'Güvenlik doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.'], 403);
    }
}
if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
    respond(['error' => 'Siteler arası yükleme engellendi.'], 403);
}

requireUser($pdo);

if (!isset($_FILES['file'])) {
    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    $postLimit = (string)ini_get('post_max_size');
    $message = $contentLength > 0
        ? "Dosya cPanel POST sınırını aşıyor (post_max_size: {$postLimit}). .user.ini ayarlarının uygulanmasını bekleyip tekrar deneyin."
        : 'Yüklenecek dosya bulunamadı.';
    respond(['error' => $message], $contentLength > 0 ? 413 : 422);
}
$file = $_FILES['file'];
if (!is_array($file) || is_array($file['name'] ?? null)) respond(['error' => 'Tek seferde tek dosya yükleyin.'], 422);

$uploadErrors = [
    UPLOAD_ERR_INI_SIZE => 'Dosya PHP upload_max_filesize sınırını aşıyor. cPanel MultiPHP INI Editor ayarlarını kontrol edin.',
    UPLOAD_ERR_FORM_SIZE => 'Dosya izin verilen boyutu aşıyor.',
    UPLOAD_ERR_PARTIAL => 'Dosya eksik yüklendi. Bağlantıyı kontrol edip tekrar deneyin.',
    UPLOAD_ERR_NO_FILE => 'Yüklenecek dosya seçilmedi.',
    UPLOAD_ERR_NO_TMP_DIR => 'Sunucuda PHP geçici yükleme klasörü bulunamadı.',
    UPLOAD_ERR_CANT_WRITE => 'Sunucu dosyayı diske yazamadı. cPanel disk alanını kontrol edin.',
    UPLOAD_ERR_EXTENSION => 'Sunucudaki bir PHP eklentisi yüklemeyi durdurdu.',
];
$errorCode = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
if ($errorCode !== UPLOAD_ERR_OK) {
    $status = in_array($errorCode, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) ? 413 : 422;
    respond(['error' => $uploadErrors[$errorCode] ?? 'Dosya yüklenemedi.'], $status);
}
if (!is_uploaded_file((string)$file['tmp_name'])) respond(['error' => 'Yüklenen dosya doğrulanamadı.'], 400);

$size = (int)$file['size'];
if ($size <= 0) respond(['error' => 'Dosya boş görünüyor.'], 422);
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file((string)$file['tmp_name']);
$types = [
    'image/jpeg' => ['extension' => 'jpg', 'max' => 15 * 1024 * 1024, 'kind' => 'image'],
    'image/png' => ['extension' => 'png', 'max' => 15 * 1024 * 1024, 'kind' => 'image'],
    'image/webp' => ['extension' => 'webp', 'max' => 15 * 1024 * 1024, 'kind' => 'image'],
    'image/gif' => ['extension' => 'gif', 'max' => 15 * 1024 * 1024, 'kind' => 'image'],
    'image/avif' => ['extension' => 'avif', 'max' => 15 * 1024 * 1024, 'kind' => 'image'],
    'video/mp4' => ['extension' => 'mp4', 'max' => 50 * 1024 * 1024, 'kind' => 'video'],
    'video/webm' => ['extension' => 'webm', 'max' => 50 * 1024 * 1024, 'kind' => 'video'],
    'video/quicktime' => ['extension' => 'mov', 'max' => 50 * 1024 * 1024, 'kind' => 'video'],
];
if (!is_string($mime) || !isset($types[$mime])) {
    respond(['error' => 'Bu dosya türü desteklenmiyor. JPG, PNG, WEBP, GIF, AVIF, MP4, WEBM veya MOV kullanın.'], 415);
}
if ($size > $types[$mime]['max']) {
    $limit = $types[$mime]['kind'] === 'video' ? '50 MB' : '15 MB';
    respond(['error' => "Dosya boyutu {$limit} sınırını aşıyor."], 413);
}

$uploadDir = dirname(__DIR__) . '/uploads/listings';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
    respond(['error' => 'Yükleme klasörü oluşturulamadı. cPanel dosya izinlerini kontrol edin.'], 500);
}
if (!is_writable($uploadDir)) respond(['error' => 'Yükleme klasörüne yazma izni yok. cPanel uploads/listings izinlerini kontrol edin.'], 500);

$fileName = bin2hex(random_bytes(20)) . '.' . $types[$mime]['extension'];
$target = $uploadDir . '/' . $fileName;
if (!move_uploaded_file((string)$file['tmp_name'], $target)) {
    respond(['error' => 'Dosya sunucuya kaydedilemedi. cPanel disk alanı ve klasör izinlerini kontrol edin.'], 500);
}
@chmod($target, 0644);

respond([
    'ok' => true,
    'url' => '/uploads/listings/' . $fileName,
    'type' => $types[$mime]['kind'] === 'video' ? $mime : $mime,
    'name' => (string)$file['name'],
]);
