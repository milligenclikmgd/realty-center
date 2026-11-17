<?php
declare(strict_types=1);

$file = (string)($_GET['file'] ?? '');
if (!preg_match('/\A[a-f0-9]{40}\.pdf\z/i', $file)) {
    http_response_code(404);
    exit;
}

$baseDir = realpath(dirname(__DIR__, 2) . '/uploads/corporate');
$path = $baseDir ? realpath($baseDir . DIRECTORY_SEPARATOR . $file) : false;
if (!$baseDir || !$path || dirname($path) !== $baseDir || !is_file($path) || !is_readable($path)) {
    http_response_code(404);
    exit;
}

$handle = fopen($path, 'rb');
$signature = $handle ? fread($handle, 5) : false;
if ($handle) fclose($handle);
if ($signature !== '%PDF-') {
    http_response_code(404);
    exit;
}

header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="Realty-Center-Belgesi.pdf"');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=3600');
header('Content-Length: ' . (string)filesize($path));
readfile($path);
