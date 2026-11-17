<?php
require __DIR__ . '/bootstrap.php';
$action = $_GET['action'] ?? '';

if (in_array($action, ['crm','crm-activities','crm-save-customer','crm-add-activity','crm-save-task','crm-complete-task','crm-public-lead','inbox','inbox-create-public','inbox-update'], true)) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS inbox_messages (
        id CHAR(36) NOT NULL PRIMARY KEY,
        category VARCHAR(40) NOT NULL,
        subject VARCHAR(255) NULL,
        full_name VARCHAR(180) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(190) NULL,
        city VARCHAR(100) NULL,
        district VARCHAR(100) NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'new',
        assigned_user_id CHAR(36) NULL,
        notified_advisors LONGTEXT NULL,
        data_json LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_inbox_category_status (category,status),
        INDEX idx_inbox_created (created_at),
        INDEX idx_inbox_assigned (assigned_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $pdo->exec("CREATE TABLE IF NOT EXISTS crm_customers (
        id CHAR(36) NOT NULL PRIMARY KEY,
        full_name VARCHAR(180) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(190) NULL,
        customer_type VARCHAR(30) NOT NULL DEFAULT 'buyer',
        city VARCHAR(100) NULL,
        district VARCHAR(100) NULL,
        property_type VARCHAR(100) NULL,
        budget_min DECIMAL(15,2) NULL,
        budget_max DECIMAL(15,2) NULL,
        source VARCHAR(100) NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'new',
        notes TEXT NULL,
        assigned_user_id CHAR(36) NULL,
        created_by CHAR(36) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_crm_assigned (assigned_user_id),
        INDEX idx_crm_status (status),
        INDEX idx_crm_phone (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $pdo->exec("CREATE TABLE IF NOT EXISTS crm_activities (
        id CHAR(36) NOT NULL PRIMARY KEY,
        customer_id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        activity_type VARCHAR(30) NOT NULL DEFAULT 'note',
        body TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_crm_activity_customer (customer_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $pdo->exec("CREATE TABLE IF NOT EXISTS crm_tasks (
        id CHAR(36) NOT NULL PRIMARY KEY,
        customer_id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        due_at DATETIME NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        assigned_user_id CHAR(36) NOT NULL,
        created_by CHAR(36) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME NULL,
        INDEX idx_crm_task_assignee (assigned_user_id, status, due_at),
        INDEX idx_crm_task_customer (customer_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

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
    try {
        try { $pdo->exec('ALTER TABLE users MODIFY avatar_url MEDIUMTEXT NULL'); } catch (Throwable $ignored) {}
        try { $pdo->exec('ALTER TABLE users ADD COLUMN city VARCHAR(100) NULL, ADD COLUMN district VARCHAR(100) NULL'); } catch (Throwable $ignored) {}
        $q = $pdo->query('SELECT id,username,email,first_name,last_name,phone,role,status,last_login_at,created_at,avatar_url,city,district FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC');
        respond(['users'=>$q->fetchAll()]);
    } catch (Throwable $e) {
        respond(['error'=>'Kullanıcı tablosu okunamadı: '.$e->getMessage()],500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'listings') {
    requireUser($pdo);
    try {
        $q = $pdo->query("SELECT l.id, l.listing_number, l.owner_user_id AS owner_id, l.title, l.category, l.property_type, l.transaction_type, l.price, l.currency, l.city, l.district, l.neighborhood, l.rooms, l.area, l.description, l.details, l.approval_status, l.is_featured, l.created_at, l.updated_at, l.deleted_at, GROUP_CONCAT(CASE WHEN m.media_type='image' THEN m.file_url END ORDER BY m.sort_order SEPARATOR '||') AS image_urls FROM listings l LEFT JOIN listing_media m ON m.listing_id=l.id GROUP BY l.id ORDER BY l.created_at DESC");
        $rows = $q->fetchAll();
        foreach ($rows as &$row) {
            $row['images'] = $row['image_urls'] ? explode('||', $row['image_urls']) : [];
            unset($row['image_urls']);
            if (is_string($row['details']) && $row['details'] !== '') $row['details'] = json_decode($row['details'], true) ?: [];
        }
        respond(['listings'=>$rows]);
    } catch (Throwable $e) { respond(['error'=>'İlan tablosu okunamadı: '.$e->getMessage()],500); }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'public-listings') {
    try {
        $q = $pdo->query("SELECT l.id,l.listing_number,l.owner_user_id AS owner_id,l.title,l.category,l.property_type,l.transaction_type,l.price,l.currency,l.city,l.district,l.neighborhood,l.rooms,l.area,l.description,l.details,l.approval_status,l.is_featured,l.created_at,l.updated_at,CONCAT(COALESCE(u.first_name,''),' ',COALESCE(u.last_name,'')) AS owner_name,u.phone AS owner_phone,GROUP_CONCAT(CONCAT(m.media_type,'|::|',m.file_url) ORDER BY m.sort_order SEPARATOR '|||') AS media_items FROM listings l LEFT JOIN users u ON u.id=l.owner_user_id LEFT JOIN listing_media m ON m.listing_id=l.id WHERE l.approval_status='Yayında' AND l.deleted_at IS NULL GROUP BY l.id ORDER BY l.created_at DESC");
        $rows = $q->fetchAll();
        foreach ($rows as &$row) {
            $row['images'] = []; $row['video_url'] = '';
            foreach (explode('|||', (string)($row['media_items'] ?? '')) as $item) {
                $parts = explode('|::|', $item, 2); if (count($parts) !== 2) continue;
                if ($parts[0] === 'image') $row['images'][] = $parts[1];
                if ($parts[0] === 'video' && $row['video_url'] === '') $row['video_url'] = $parts[1];
            }
            unset($row['media_items']);
            if (is_string($row['details']) && $row['details'] !== '') $row['details'] = json_decode($row['details'], true) ?: [];
        }
        respond(['listings'=>$rows]);
    } catch (Throwable $e) { respond(['error'=>'Yayındaki ilanlar okunamadı.'],500); }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'realty-media') {
    try {
        $q = $pdo->prepare('SELECT setting_value FROM homepage_settings WHERE setting_key=? LIMIT 1');
        $q->execute(['realty_media_content']);
        $row = $q->fetch();
        $content = $row ? json_decode((string)$row['setting_value'], true) : null;
        $videos = is_array($content) && is_array($content['videos'] ?? null) ? $content['videos'] : null;
        respond(['videos'=>$videos]);
    } catch (Throwable $e) { respond(['error'=>'Realty Medya içerikleri yüklenemedi.'],500); }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'youtube-metadata') {
    $actor = requireUser($pdo);
    if (($actor['role'] ?? '') !== 'admin') respond(['error'=>'YouTube içerik bilgilerini yalnızca admin alabilir.'],403);
    $input = body();
    $url = trim((string)($input['url'] ?? ''));
    $parts = parse_url($url);
    $host = strtolower((string)($parts['host'] ?? ''));
    $scheme = strtolower((string)($parts['scheme'] ?? ''));
    $youtubeId = '';
    if (in_array($host, ['youtube.com','www.youtube.com','m.youtube.com'], true)) {
        $query = []; parse_str((string)($parts['query'] ?? ''), $query);
        $youtubeId = (string)($query['v'] ?? '');
        if ($youtubeId === '' && preg_match('#^/(?:embed|shorts)/([A-Za-z0-9_-]{11})#', (string)($parts['path'] ?? ''), $match)) $youtubeId = $match[1];
    } elseif (in_array($host, ['youtu.be','www.youtu.be'], true)) {
        $youtubeId = trim((string)($parts['path'] ?? ''), '/');
    }
    if (!in_array($scheme, ['https','http'], true) || !preg_match('/^[A-Za-z0-9_-]{11}$/', $youtubeId)) respond(['error'=>'Geçerli bir YouTube video bağlantısı girin.'],422);
    $getRemote = static function($target) {
        if (function_exists('curl_init')) {
            $curl = curl_init($target);
            curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_CONNECTTIMEOUT=>5,CURLOPT_TIMEOUT=>10,CURLOPT_USERAGENT=>'RealtyCenterMedia/1.0 (+https://realtycenter.com.tr)',CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2]);
            $body = curl_exec($curl);
            $status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
            curl_close($curl);
            if (!is_string($body) || $status < 200 || $status >= 300) throw new RuntimeException('YouTube metadata request failed.');
            return $body;
        }
        $context = stream_context_create(['http'=>['timeout'=>10,'ignore_errors'=>false,'header'=>"User-Agent: RealtyCenterMedia/1.0\r\n"]]);
        $body = @file_get_contents($target, false, $context);
        if (!is_string($body)) throw new RuntimeException('YouTube metadata request failed.');
        return $body;
    };
    try {
        $canonical = 'https://www.youtube.com/watch?v='.$youtubeId;
        $oembedJson = $getRemote('https://www.youtube.com/oembed?'.http_build_query(['url'=>$canonical,'format'=>'json']));
        $oembed = json_decode($oembedJson, true);
        $title = trim((string)($oembed['title'] ?? ''));
        if ($title === '') respond(['error'=>'YouTube video başlığı alınamadı.'],502);
        try { $html = $getRemote($canonical); } catch (Throwable $ignored) { $html = ''; }
        $description = '';
        preg_match_all('/<meta\b[^>]*>/i', $html, $tags);
        foreach ($tags[0] as $tag) {
            if (!preg_match("/\b(?:property|name)\s*=\s*([\"'])(.*?)\\1/i", $tag, $nameMatch)) continue;
            $name = strtolower(trim($nameMatch[2]));
            if (!in_array($name, ['og:description','description'], true)) continue;
            if (!preg_match("/\bcontent\s*=\s*([\"'])(.*?)\\1/i", $tag, $contentMatch)) continue;
            $description = trim(html_entity_decode($contentMatch[2], ENT_QUOTES|ENT_HTML5, 'UTF-8'));
            if ($name === 'og:description' || $description !== '') break;
        }
        respond(['title'=>mb_substr($title,0,255),'description'=>mb_substr($description,0,5000),'thumbnail'=>'https://img.youtube.com/vi/'.$youtubeId.'/hqdefault.jpg']);
    } catch (Throwable $e) { respond(['error'=>'YouTube bilgileri otomatik alınamadı. Başlığı ve açıklamayı elle girebilir ya da yeniden deneyebilirsiniz.'],502); }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'save-realty-media') {
    $actor = requireUser($pdo);
    if (($actor['role'] ?? '') !== 'admin') respond(['error'=>'Realty Medya içeriklerini yalnızca admin düzenleyebilir.'],403);
    $input = body();
    $source = is_array($input['videos'] ?? null) ? $input['videos'] : [];
    if (count($source) > 300) respond(['error'=>'En fazla 300 video eklenebilir.'],422);
    $videos = [];
    foreach ($source as $index => $video) {
        if (!is_array($video)) continue;
        $url = trim((string)($video['url'] ?? ''));
        $parts = parse_url($url);
        $host = strtolower((string)($parts['host'] ?? ''));
        $scheme = strtolower((string)($parts['scheme'] ?? ''));
        if (!in_array($scheme, ['https','http'], true)) respond(['error'=>'YouTube bağlantısı http veya https olmalıdır.'],422);
        $youtubeId = '';
        if (in_array($host, ['youtube.com','www.youtube.com','m.youtube.com'], true)) {
            $query = []; parse_str((string)($parts['query'] ?? ''), $query);
            $youtubeId = (string)($query['v'] ?? '');
            if ($youtubeId === '' && preg_match('#^/(?:embed|shorts)/([A-Za-z0-9_-]{11})#', (string)($parts['path'] ?? ''), $match)) $youtubeId = $match[1];
        } elseif (in_array($host, ['youtu.be','www.youtu.be'], true)) {
            $youtubeId = trim((string)($parts['path'] ?? ''), '/');
        }
        if (!preg_match('/^[A-Za-z0-9_-]{11}$/', $youtubeId)) respond(['error'=>'Geçerli bir YouTube bağlantısı kullanın.'],422);
        $category = ($video['category'] ?? '') === 'news' ? 'news' : (($video['category'] ?? '') === 'tv' ? 'tv' : '');
        $title = trim((string)($video['title'] ?? ''));
        if ($category === '' || $title === '') respond(['error'=>'İçerik türü ve video başlığı zorunludur.'],422);
        $id = trim((string)($video['id'] ?? ''));
        if ($id === '' || strlen($id) > 80) $id = bin2hex(random_bytes(16));
        $videos[] = [
            'id'=>$id,
            'source'=>'youtube',
            'category'=>$category,
            'url'=>$url,
            'title'=>mb_substr($title,0,255),
            'thumbnail'=>'https://img.youtube.com/vi/'.$youtubeId.'/hqdefault.jpg',
            'description'=>mb_substr(trim((string)($video['description'] ?? '')),0,5000),
            'createdAt'=>trim((string)($video['createdAt'] ?? date(DATE_ATOM))),
            'sort_order'=>$index+1
        ];
    }
    try {
        $json = json_encode(['videos'=>$videos], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
        $q = $pdo->prepare('INSERT INTO homepage_settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)');
        $q->execute(['realty_media_content',$json]);
        $log = $pdo->prepare('INSERT INTO audit_logs (user_id,action,entity_type,metadata) VALUES (?,?,?,?)');
        $log->execute([$actor['id'],'realty_media_updated','realty_media',json_encode(['video_count'=>count($videos)],JSON_UNESCAPED_UNICODE)]);
        respond(['ok'=>true,'videos'=>$videos]);
    } catch (Throwable $e) { respond(['error'=>'Realty Medya içerikleri kaydedilemedi.'],500); }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'library-content') {
    try {
        $q = $pdo->prepare('SELECT setting_value FROM homepage_settings WHERE setting_key=? LIMIT 1');
        $q->execute(['realty_library_content']);
        $row = $q->fetch();
        $content = $row ? json_decode((string)$row['setting_value'], true) : null;
        $categories = is_array($content) && is_array($content['categories'] ?? null) ? $content['categories'] : null;
        respond(['categories'=>$categories]);
    } catch (Throwable $e) { respond(['error'=>'Realty Kütüphane içerikleri yüklenemedi.'],500); }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'save-library-content') {
    $actor = requireUser($pdo);
    if (($actor['role'] ?? '') !== 'admin') respond(['error'=>'Realty Kütüphane içeriklerini yalnızca admin düzenleyebilir.'],403);
    $input = body();
    $source = is_array($input['categories'] ?? null) ? $input['categories'] : [];
    if (count($source) > 40) respond(['error'=>'En fazla 40 kütüphane kategorisi kaydedilebilir.'],422);
    $categories = [];
    $cleanHtml = static function($html) {
        $html = strip_tags((string)$html, '<p><h2><h3><h4><ul><ol><li><strong><em><b><i><br><blockquote>');
        return preg_replace_callback('/<([a-z0-9]+)\\b[^>]*>/i', static fn($match) => '<'.strtolower($match[1]).'>', $html);
    };
    foreach ($source as $category) {
        if (!is_array($category)) continue;
        $id = trim((string)($category['id'] ?? ''));
        $slug = strtolower(trim((string)($category['slug'] ?? '')));
        $title = trim((string)($category['title'] ?? ''));
        if ($id === '' || strlen($id) > 100) $id = bin2hex(random_bytes(16));
        if ($title === '' || !preg_match('/^[a-z0-9-]{1,100}$/', $slug)) respond(['error'=>'Kategori adı ve bağlantı adresi geçerli olmalıdır.'],422);
        $color = trim((string)($category['color'] ?? '#CD011E'));
        if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $color)) $color = '#CD011E';
        $articlesSource = is_array($category['articles'] ?? null) ? $category['articles'] : [];
        if (count($articlesSource) > 200) respond(['error'=>'Bir kategoride en fazla 200 içerik olabilir.'],422);
        $articles = [];
        foreach ($articlesSource as $article) {
            if (!is_array($article)) continue;
            $articleId = trim((string)($article['id'] ?? ''));
            $articleTitle = trim((string)($article['title'] ?? ''));
            $image = trim((string)($article['image'] ?? ''));
            $summary = trim((string)($article['summary'] ?? ''));
            if ($articleTitle === '') respond(['error'=>'Her içerik için başlık zorunludur.'],422);
            if ($image !== '' && !(str_starts_with($image, '/') && !str_starts_with($image, '//') && !str_contains($image, '..')) && !(filter_var($image, FILTER_VALIDATE_URL) && strtolower((string)parse_url($image, PHP_URL_SCHEME)) === 'https')) respond(['error'=>'Kapak görseli URL’si geçersiz.'],422);
            $body = (string)($article['content'] ?? '');
            if (strlen($body) > 100000) respond(['error'=>'İçerik metni çok uzun.'],422);
            $publishedAt = trim((string)($article['publishedAt'] ?? ''));
            if ($articleId === '' || strlen($articleId) > 100) $articleId = bin2hex(random_bytes(16));
            if ($publishedAt === '') $publishedAt = date(DATE_ATOM);
            $articles[] = ['id'=>$articleId,'title'=>mb_substr($articleTitle,0,255),'summary'=>mb_substr($summary,0,5000),'image'=>$image,'content'=>$cleanHtml($body),'publishedAt'=>mb_substr($publishedAt,0,40)];
        }
        $categories[] = ['id'=>$id,'slug'=>$slug,'title'=>mb_substr($title,0,180),'description'=>mb_substr(trim((string)($category['description'] ?? '')),0,5000),'color'=>$color,'articles'=>$articles];
    }
    try {
        $json = json_encode(['categories'=>$categories], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
        $q = $pdo->prepare('INSERT INTO homepage_settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)');
        $q->execute(['realty_library_content',$json]);
        $log = $pdo->prepare('INSERT INTO audit_logs (user_id,action,entity_type,metadata) VALUES (?,?,?,?)');
        $log->execute([$actor['id'],'library_content_updated','realty_library',json_encode(['category_count'=>count($categories),'article_count'=>array_sum(array_map(static fn($item)=>count($item['articles']),$categories))],JSON_UNESCAPED_UNICODE)]);
        respond(['ok'=>true,'categories'=>$categories]);
    } catch (Throwable $e) { respond(['error'=>'Realty Kütüphane içerikleri kaydedilemedi.'],500); }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'inbox') {
    $actor = requireUser($pdo);
    if (!in_array($actor['role'] ?? '', ['admin','manager','advisor'], true)) respond(['error'=>'İletişim Merkezi erişim yetkiniz yok.'],403);
    $rows = $pdo->query("SELECT id,category,subject,full_name,phone,email,city,district,status,assigned_user_id,notified_advisors,data_json,created_at,updated_at FROM inbox_messages ORDER BY created_at DESC LIMIT 1500")->fetchAll();
    $items = [];
    foreach ($rows as $row) {
        $notify = json_decode((string)($row['notified_advisors'] ?? '[]'), true);
        $data = json_decode((string)($row['data_json'] ?? '{}'), true);
        $notify = is_array($notify) ? $notify : [];
        if (($actor['role'] ?? '') === 'advisor' && $row['assigned_user_id'] !== $actor['id'] && !in_array($actor['id'], array_column($notify,'id'), true)) continue;
        $row['notified_advisors'] = $notify; $row['data'] = is_array($data) ? $data : [];
        unset($row['data_json']); $items[] = $row;
    }
    $assignees = [];
    if (in_array($actor['role'] ?? '', ['admin','manager'], true)) {
        $assignees = $pdo->query("SELECT id,first_name,last_name,role FROM users WHERE deleted_at IS NULL AND status='active' AND role IN ('advisor','manager') ORDER BY first_name,last_name")->fetchAll();
    }
    respond(['items'=>$items,'assignees'=>$assignees,'viewer'=>['id'=>$actor['id'],'role'=>$actor['role']]]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'inbox-create-public') {
    $input = body();
    $allowed = ['contact','barter','buyer_request','financial','feedback','advisor_application','franchise_application','area_request'];
    $category = trim((string)($input['category'] ?? ''));
    if (!in_array($category,$allowed,true)) respond(['error'=>'Talep türü geçersiz.'],422);
    $data = is_array($input['data'] ?? null) ? $input['data'] : [];
    $fullName = trim((string)($input['full_name'] ?? $data['fullName'] ?? $data['name'] ?? ''));
    $phone = trim((string)($input['phone'] ?? $data['phone'] ?? ''));
    $email = strtolower(trim((string)($input['email'] ?? $data['email'] ?? '')));
    $city = trim((string)($input['city'] ?? $data['city'] ?? ''));
    $district = trim((string)($input['district'] ?? $data['district'] ?? ''));
    $subject = trim((string)($input['subject'] ?? $data['subject'] ?? $data['type'] ?? $data['mode'] ?? ''));
    if ($fullName === '' || $phone === '') respond(['error'=>'Ad soyad ve telefon zorunludur.'],422);
    if ($email !== '' && !filter_var($email,FILTER_VALIDATE_EMAIL)) respond(['error'=>'E-posta adresini kontrol edin.'],422);
    if (strlen(json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) ?: '') > 60000) respond(['error'=>'Form içeriği izin verilen boyutu aşıyor.'],413);
    $notified = [];
    if ($category === 'area_request' && $city !== '') {
        $q=$pdo->prepare("SELECT id,first_name,last_name,city,district FROM users WHERE deleted_at IS NULL AND status='active' AND role='advisor' AND city=? ORDER BY first_name,last_name");
        $q->execute([$city]);
        foreach ($q->fetchAll() as $person) {
            if ($district === '' || mb_strtolower(trim((string)$person['district']),'UTF-8') === mb_strtolower($district,'UTF-8')) $notified[]=['id'=>$person['id'],'name'=>trim($person['first_name'].' '.$person['last_name']),'city'=>$person['city'],'district'=>$person['district']];
        }
    }
    $id=bin2hex(random_bytes(16));
    try {
        $pdo->beginTransaction();
        $q=$pdo->prepare("INSERT INTO inbox_messages (id,category,subject,full_name,phone,email,city,district,status,notified_advisors,data_json) VALUES (?,?,?,?,?,?,?,?, 'new',?,?)");
        $q->execute([$id,$category,mb_substr($subject,0,255),mb_substr($fullName,0,180),mb_substr($phone,0,50),$email?:null,mb_substr($city,0,100)?:null,mb_substr($district,0,100)?:null,json_encode($notified,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)]);
        if ($category === 'contact') {
            $systemUser='00000000000000000000000000000000'; $customerId=bin2hex(random_bytes(16));
            $message=trim((string)($data['message'] ?? $input['message'] ?? ''));
            $q=$pdo->prepare("INSERT INTO crm_customers (id,full_name,phone,email,customer_type,source,status,notes,assigned_user_id,created_by) VALUES (?,?,?,?,?,'Web sitesi iletişim formu','new',?,NULL,?)");
            $q->execute([$customerId,mb_substr($fullName,0,180),mb_substr($phone,0,50),$email?:null,'other',mb_substr($message,0,5000),$systemUser]);
            if ($message !== '') $pdo->prepare('INSERT INTO crm_activities (id,customer_id,user_id,activity_type,body) VALUES (?,?,?,?,?)')->execute([bin2hex(random_bytes(16)),$customerId,$systemUser,'message',mb_substr($message,0,5000)]);
        }
        $pdo->commit();
        respond(['ok'=>true,'id'=>$id,'notified_advisors'=>$notified]);
    } catch (Throwable $e) { if($pdo->inTransaction())$pdo->rollBack(); respond(['error'=>'Talep kaydedilemedi. Lütfen tekrar deneyin.'],500); }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'inbox-update') {
    $actor=requireUser($pdo);
    if (!in_array($actor['role'] ?? '',['admin','manager'],true)) respond(['error'=>'Mesaj durumunu yalnızca yönetici değiştirebilir.'],403);
    $input=body();$id=trim((string)($input['id']??''));$status=trim((string)($input['status']??'new'));$assigned=trim((string)($input['assigned_user_id']??''))?:null;
    if($id==='')respond(['error'=>'Talep kaydı seçilmedi.'],422);
    if(!in_array($status,['new','reviewing','completed','closed'],true))respond(['error'=>'Talep durumu geçersiz.'],422);
    if($assigned!==null){$q=$pdo->prepare("SELECT id FROM users WHERE id=? AND deleted_at IS NULL AND status='active' AND role IN ('advisor','manager') LIMIT 1");$q->execute([$assigned]);if(!$q->fetch())respond(['error'=>'Atanan kullanıcı bulunamadı.'],422);}
    $q=$pdo->prepare('UPDATE inbox_messages SET status=?,assigned_user_id=? WHERE id=?');$q->execute([$status,$assigned,$id]);
    if(!$q->rowCount()) { $check=$pdo->prepare('SELECT id FROM inbox_messages WHERE id=?');$check->execute([$id]);if(!$check->fetch())respond(['error'=>'Talep bulunamadı.'],404); }
    $log=$pdo->prepare('INSERT INTO audit_logs (user_id,action,entity_type,entity_id,metadata) VALUES (?,?,?,?,?)');$log->execute([$actor['id'],'inbox_updated','inbox_message',$id,json_encode(['status'=>$status,'assigned_user_id'=>$assigned],JSON_UNESCAPED_UNICODE)]);
    respond(['ok'=>true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'crm-public-lead') {
    $now = time();
    if (!empty($_SESSION['crm_lead_last_sent']) && ($now - (int)$_SESSION['crm_lead_last_sent']) < 20) respond(['error'=>'Lütfen yeni talep göndermeden önce kısa süre bekleyin.'],429);
    $input = body();
    $name = trim((string)($input['full_name'] ?? ''));
    $phone = trim((string)($input['phone'] ?? ''));
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $message = trim((string)($input['message'] ?? ''));
    if (mb_strlen($name) < 2 || $phone === '' || $message === '') respond(['error'=>'Ad, telefon ve mesaj zorunludur.'],422);
    if ($email !== '' && !filter_var($email,FILTER_VALIDATE_EMAIL)) respond(['error'=>'E-posta adresini kontrol edin.'],422);
    if (strlen($message) > 5000) respond(['error'=>'Mesaj çok uzun.'],422);
    $systemUser = '00000000000000000000000000000000';
    $id = bin2hex(random_bytes(16));
    try {
        $pdo->beginTransaction();
        $q=$pdo->prepare("INSERT INTO crm_customers (id,full_name,phone,email,customer_type,source,status,notes,assigned_user_id,created_by) VALUES (?,?,?,?,?,'Web sitesi iletişim formu','new',?,NULL,?)");
        $q->execute([$id,mb_substr($name,0,180),mb_substr($phone,0,50),$email?:null,'other',mb_substr($message,0,5000),$systemUser]);
        $a=$pdo->prepare('INSERT INTO crm_activities (id,customer_id,user_id,activity_type,body) VALUES (?,?,?,?,?)');
        $a->execute([bin2hex(random_bytes(16)),$id,$systemUser,'message',mb_substr($message,0,5000)]);
        $pdo->commit();
        $_SESSION['crm_lead_last_sent']=$now;
        respond(['ok'=>true]);
    } catch (Throwable $e) { if($pdo->inTransaction())$pdo->rollBack(); respond(['error'=>'Talep şu anda kaydedilemedi. Lütfen tekrar deneyin.'],500); }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'crm') {
    $actor = requireUser($pdo);
    if (!in_array($actor['role'], ['admin','manager','advisor'], true)) respond(['error'=>'CRM erişim yetkiniz yok.'],403);
    $isAdvisor = $actor['role'] === 'advisor';
    $where = $isAdvisor ? 'WHERE c.assigned_user_id=?' : '';
    $q = $pdo->prepare("SELECT c.id,c.full_name,c.phone,c.email,c.customer_type,c.city,c.district,c.property_type,c.budget_min,c.budget_max,c.source,c.status,c.notes,c.assigned_user_id,c.created_at,c.updated_at,CONCAT(COALESCE(u.first_name,''),' ',COALESCE(u.last_name,'')) AS assigned_name,(SELECT COUNT(*) FROM crm_activities a WHERE a.customer_id=c.id) AS activity_count FROM crm_customers c LEFT JOIN users u ON u.id=c.assigned_user_id ".$where." ORDER BY c.updated_at DESC LIMIT 1000");
    $q->execute($isAdvisor ? [$actor['id']] : []);
    $customers = $q->fetchAll();
    $taskWhere = $isAdvisor ? 'WHERE t.assigned_user_id=? AND t.status="pending"' : 'WHERE t.status="pending"';
    $tq = $pdo->prepare("SELECT t.id,t.customer_id,t.title,t.due_at,t.status,t.assigned_user_id,CONCAT(COALESCE(u.first_name,''),' ',COALESCE(u.last_name,'')) AS assigned_name,c.full_name AS customer_name FROM crm_tasks t LEFT JOIN users u ON u.id=t.assigned_user_id LEFT JOIN crm_customers c ON c.id=t.customer_id ".$taskWhere." ORDER BY t.due_at ASC LIMIT 500");
    $tq->execute($isAdvisor ? [$actor['id']] : []);
    $assignees = [];
    if (!$isAdvisor) {
        $uq = $pdo->query("SELECT id,first_name,last_name,role FROM users WHERE deleted_at IS NULL AND status='active' AND role IN ('advisor','manager') ORDER BY first_name,last_name");
        $assignees = $uq->fetchAll();
    }
    respond(['customers'=>$customers,'tasks'=>$tq->fetchAll(),'assignees'=>$assignees,'viewer'=>['id'=>$actor['id'],'role'=>$actor['role']]]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'crm-activities') {
    $actor = requireUser($pdo);
    $customerId = trim((string)($_GET['customer_id'] ?? ''));
    if ($customerId === '') respond(['error'=>'Müşteri seçilmedi.'],422);
    $access = $pdo->prepare("SELECT id FROM crm_customers WHERE id=? ".(($actor['role'] ?? '') === 'advisor' ? 'AND assigned_user_id=?' : '')." LIMIT 1");
    $access->execute(($actor['role'] ?? '') === 'advisor' ? [$customerId,$actor['id']] : [$customerId]);
    if (!$access->fetch()) respond(['error'=>'Müşteri bulunamadı veya erişim yetkiniz yok.'],404);
    $q = $pdo->prepare("SELECT a.id,a.activity_type,a.body,a.created_at,CASE WHEN a.user_id='00000000000000000000000000000000' THEN 'Web sitesi' ELSE CONCAT(COALESCE(u.first_name,''),' ',COALESCE(u.last_name,'')) END AS user_name FROM crm_activities a LEFT JOIN users u ON u.id=a.user_id WHERE a.customer_id=? ORDER BY a.created_at DESC LIMIT 200");
    $q->execute([$customerId]);
    respond(['activities'=>$q->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'crm-save-customer') {
    $actor = requireUser($pdo);
    if (!in_array($actor['role'], ['admin','manager','advisor'], true)) respond(['error'=>'CRM erişim yetkiniz yok.'],403);
    $input = body();
    $id = trim((string)($input['id'] ?? ''));
    $name = trim((string)($input['full_name'] ?? ''));
    $phone = trim((string)($input['phone'] ?? ''));
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $type = (string)($input['customer_type'] ?? 'buyer');
    $status = (string)($input['status'] ?? 'new');
    $validTypes = ['buyer','renter','seller','landlord','investor','other'];
    $validStatuses = ['new','contacted','meeting','offered','won','lost'];
    if ($name === '' || $phone === '') respond(['error'=>'Ad soyad ve telefon zorunludur.'],422);
    if ($email !== '' && !filter_var($email,FILTER_VALIDATE_EMAIL)) respond(['error'=>'E-posta adresi geçersiz.'],422);
    if (!in_array($type,$validTypes,true) || !in_array($status,$validStatuses,true)) respond(['error'=>'Müşteri türü veya durum geçersiz.'],422);
    $assigned = $actor['role'] === 'advisor' ? $actor['id'] : (trim((string)($input['assigned_user_id'] ?? '')) ?: null);
    if ($assigned !== null) {
        $uq=$pdo->prepare("SELECT id FROM users WHERE id=? AND deleted_at IS NULL AND status='active' AND role IN ('advisor','manager') LIMIT 1");
        $uq->execute([$assigned]); if(!$uq->fetch()) respond(['error'=>'Seçilen danışman/yönetici bulunamadı.'],422);
    }
    $values = [$name,$phone,$email ?: null,$type,trim((string)($input['city']??''))?:null,trim((string)($input['district']??''))?:null,trim((string)($input['property_type']??''))?:null,($input['budget_min']??'')!==''?(float)$input['budget_min']:null,($input['budget_max']??'')!==''?(float)$input['budget_max']:null,trim((string)($input['source']??''))?:null,$status,trim((string)($input['notes']??''))?:null,$assigned];
    if ($id !== '') {
        $check=$pdo->prepare("SELECT id,assigned_user_id FROM crm_customers WHERE id=? LIMIT 1");$check->execute([$id]);$existing=$check->fetch();
        if(!$existing)respond(['error'=>'Müşteri kaydı bulunamadı.'],404);
        if($actor['role']==='advisor' && $existing['assigned_user_id']!==$actor['id'])respond(['error'=>'Bu müşteri kaydını düzenleme yetkiniz yok.'],403);
        $q=$pdo->prepare('UPDATE crm_customers SET full_name=?,phone=?,email=?,customer_type=?,city=?,district=?,property_type=?,budget_min=?,budget_max=?,source=?,status=?,notes=?,assigned_user_id=? WHERE id=?');
        $q->execute([...$values,$id]);
        $event='crm_customer_updated';
    } else {
        $id=bin2hex(random_bytes(16));
        if($actor['role']==='advisor')$assigned=$actor['id'];
        $values[12]=$assigned;
        $q=$pdo->prepare('INSERT INTO crm_customers (id,full_name,phone,email,customer_type,city,district,property_type,budget_min,budget_max,source,status,notes,assigned_user_id,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $q->execute([$id,...$values,$actor['id']]);
        $event='crm_customer_created';
    }
    $log=$pdo->prepare('INSERT INTO audit_logs (user_id,action,entity_type,entity_id,metadata) VALUES (?,?,?,?,?)');
    $log->execute([$actor['id'],$event,'crm_customer',$id,json_encode(['customer'=>$name],JSON_UNESCAPED_UNICODE)]);
    respond(['ok'=>true,'id'=>$id]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'crm-add-activity') {
    $actor=requireUser($pdo);$input=body();$customerId=trim((string)($input['customer_id']??''));$bodyText=trim((string)($input['body']??''));$type=trim((string)($input['activity_type']??'note'));
    if($customerId===''||$bodyText==='')respond(['error'=>'Müşteri ve not zorunludur.'],422);
    $access=$pdo->prepare("SELECT id FROM crm_customers WHERE id=? ".($actor['role']==='advisor'?'AND assigned_user_id=?':'')." LIMIT 1");$access->execute($actor['role']==='advisor'?[$customerId,$actor['id']]:[$customerId]);if(!$access->fetch())respond(['error'=>'Müşteri bulunamadı veya erişim yetkiniz yok.'],404);
    if(!in_array($type,['note','call','meeting','message'],true))$type='note';
    $id=bin2hex(random_bytes(16));$pdo->prepare('INSERT INTO crm_activities (id,customer_id,user_id,activity_type,body) VALUES (?,?,?,?,?)')->execute([$id,$customerId,$actor['id'],$type,mb_substr($bodyText,0,5000)]);
    $pdo->prepare('UPDATE crm_customers SET updated_at=NOW() WHERE id=?')->execute([$customerId]);
    $log=$pdo->prepare('INSERT INTO audit_logs (user_id,action,entity_type,entity_id,metadata) VALUES (?,?,?,?,?)');$log->execute([$actor['id'],'crm_activity_added','crm_customer',$customerId,json_encode(['type'=>$type],JSON_UNESCAPED_UNICODE)]);
    respond(['ok'=>true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'crm-save-task') {
    $actor=requireUser($pdo);$input=body();$customerId=trim((string)($input['customer_id']??''));$title=trim((string)($input['title']??''));$dueRaw=trim((string)($input['due_at']??''));
    if($customerId===''||$title==='')respond(['error'=>'Müşteri ve takip görevi zorunludur.'],422);
    $access=$pdo->prepare("SELECT id,assigned_user_id FROM crm_customers WHERE id=? ".($actor['role']==='advisor'?'AND assigned_user_id=?':'')." LIMIT 1");$access->execute($actor['role']==='advisor'?[$customerId,$actor['id']]:[$customerId]);$customer=$access->fetch();if(!$customer)respond(['error'=>'Müşteri bulunamadı veya erişim yetkiniz yok.'],404);
    $due=null;
    if($dueRaw!==''){$timestamp=strtotime($dueRaw);if($timestamp===false)respond(['error'=>'Takip tarihi geçersiz.'],422);$due=date('Y-m-d H:i:s',$timestamp);}
    $assigned=$actor['role']==='advisor'?$actor['id']:(trim((string)($input['assigned_user_id']??''))?:($customer['assigned_user_id']?:$actor['id']));
    if($assigned!==null&&$assigned!==''){$uq=$pdo->prepare("SELECT id FROM users WHERE id=? AND deleted_at IS NULL AND status='active' AND role IN ('advisor','manager') LIMIT 1");$uq->execute([$assigned]);if(!$uq->fetch())respond(['error'=>'Görev için atanan kullanıcı bulunamadı.'],422);}
    $id=bin2hex(random_bytes(16));$pdo->prepare('INSERT INTO crm_tasks (id,customer_id,title,due_at,assigned_user_id,created_by) VALUES (?,?,?,?,?,?)')->execute([$id,$customerId,mb_substr($title,0,255),$due,$assigned,$actor['id']]);
    $log=$pdo->prepare('INSERT INTO audit_logs (user_id,action,entity_type,entity_id,metadata) VALUES (?,?,?,?,?)');$log->execute([$actor['id'],'crm_task_created','crm_customer',$customerId,json_encode(['task'=>$title],JSON_UNESCAPED_UNICODE)]);
    respond(['ok'=>true,'id'=>$id]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'crm-complete-task') {
    $actor=requireUser($pdo);$id=trim((string)(body()['id']??''));if($id==='')respond(['error'=>'Görev seçilmedi.'],422);
    $q=$pdo->prepare("UPDATE crm_tasks t JOIN crm_customers c ON c.id=t.customer_id SET t.status='done',t.completed_at=NOW() WHERE t.id=? ".($actor['role']==='advisor'?'AND t.assigned_user_id=? AND c.assigned_user_id=?':''));
    $q->execute($actor['role']==='advisor'?[$id,$actor['id'],$actor['id']]:[$id]);respond(['ok'=>true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'corporate-content') {
    try {
        $q = $pdo->prepare('SELECT setting_value FROM homepage_settings WHERE setting_key=? LIMIT 1');
        $q->execute(['corporate_content']);
        $row = $q->fetch();
        $content = $row ? json_decode((string)$row['setting_value'], true) : null;
        respond(['content' => is_array($content) ? $content : null]);
    } catch (Throwable $e) { respond(['error'=>'Kurumsal içerikler yüklenemedi.'],500); }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'save-corporate-content') {
    $actor = requireUser($pdo);
    if (($actor['role'] ?? '') !== 'admin') respond(['error'=>'Kurumsal içerikleri yalnızca admin düzenleyebilir.'],403);
    $input = body();
    $source = is_array($input['content'] ?? null) ? $input['content'] : [];
    $content = ['management'=>[], 'documents'=>[], 'partners'=>[], 'references'=>[]];
    $validFile = static function($url) {
        if ($url === '') return true;
        if (preg_match('#^/uploads/corporate/[A-Za-z0-9._-]+$#', $url) === 1) return true;
        if (str_starts_with($url, '/') && !str_starts_with($url, '//') && !str_contains($url, '..')) return true;
        return filter_var($url, FILTER_VALIDATE_URL) !== false && strtolower((string)parse_url($url, PHP_URL_SCHEME)) === 'https';
    };
    foreach (['management','documents','partners','references'] as $section) {
        $rows = is_array($source[$section] ?? null) ? $source[$section] : [];
        if (count($rows) > 100) respond(['error'=>'Her bölümde en fazla 100 kayıt olabilir.'],422);
        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $id = trim((string)($row['id'] ?? ''));
            if ($id === '' || strlen($id) > 80) $id = bin2hex(random_bytes(16));
            $order = (int)($row['sort_order'] ?? 0);
            if ($section === 'management') {
                $name = trim((string)($row['name'] ?? ''));
                $title = trim((string)($row['title'] ?? ''));
                $image = trim((string)($row['image'] ?? ''));
                $biography = trim((string)($row['biography'] ?? ''));
                if ($name === '' || $title === '' || !$validFile($image)) respond(['error'=>'Yönetim kurulu kaydında ad, unvan ve geçerli fotoğraf gereklidir.'],422);
                $content[$section][] = ['id'=>$id,'name'=>mb_substr($name,0,180),'title'=>mb_substr($title,0,180),'image'=>$image,'biography'=>mb_substr($biography,0,10000),'sort_order'=>$order];
            } elseif ($section === 'documents') {
                $title = trim((string)($row['title'] ?? ''));
                $description = trim((string)($row['description'] ?? ''));
                $fileUrl = trim((string)($row['fileUrl'] ?? ''));
                $pdfPath = strtolower((string)parse_url($fileUrl, PHP_URL_PATH));
                if ($title === '' || !$validFile($fileUrl) || ($fileUrl !== '' && !str_ends_with($pdfPath, '.pdf'))) respond(['error'=>'Belge başlığı ve geçerli PDF dosyası gereklidir.'],422);
                $content[$section][] = ['id'=>$id,'title'=>mb_substr($title,0,180),'description'=>mb_substr($description,0,1000),'fileUrl'=>$fileUrl,'sort_order'=>$order];
            } else {
                $name = trim((string)($row['name'] ?? ''));
                $logo = trim((string)($row['logo'] ?? ''));
                if ($name === '' || !$validFile($logo) || $logo === '') respond(['error'=>'İsim ve geçerli logo dosyası zorunludur.'],422);
                $content[$section][] = ['id'=>$id,'name'=>mb_substr($name,0,180),'logo'=>$logo,'content'=>mb_substr(trim((string)($row['content'] ?? '')),0,1000),'sort_order'=>$order];
            }
        }
        usort($content[$section], static fn($a,$b) => ($a['sort_order'] <=> $b['sort_order']) ?: strcmp($a['id'],$b['id']));
    }
    try {
        $json = json_encode($content, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
        $q = $pdo->prepare('INSERT INTO homepage_settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)');
        $q->execute(['corporate_content',$json]);
        $log = $pdo->prepare('INSERT INTO audit_logs (user_id,action,entity_type,metadata) VALUES (?,?,?,?)');
        $log->execute([$actor['id'],'corporate_content_updated','corporate',json_encode(['counts'=>array_map('count',$content)],JSON_UNESCAPED_UNICODE)]);
        respond(['ok'=>true,'content'=>$content]);
    } catch (Throwable $e) { respond(['error'=>'Kurumsal içerikler kaydedilemedi.'],500); }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create-listing') {
    $actor = requireUser($pdo); $input = body();
    $title=trim((string)($input['title']??'')); $number=trim((string)($input['listing_number']??''));
    $category=trim((string)($input['category']??'')); $property=trim((string)($input['property_type']??''));
    $transaction=trim((string)($input['transaction_type']??'')); $city=trim((string)($input['city']??''));
    $district=trim((string)($input['district']??'')); $price=(float)($input['price']??0);
    if ($title==='' || $number==='' || $category==='' || $property==='' || $city==='' || $district==='' || $price<=0) respond(['error'=>'İlan başlığı, numarası, kategori, konum ve geçerli fiyat zorunludur.'],422);
    if (!in_array($transaction,['Satılık','Kiralık','Devren'],true)) respond(['error'=>'İlan türü geçersiz.'],422);
    $ownerId=$actor['role']==='advisor' ? $actor['id'] : trim((string)($input['owner_id']??$actor['id']));
    if ($ownerId==='') $ownerId=$actor['id'];
    $ownerCheck=$pdo->prepare("SELECT id FROM users WHERE id=? AND deleted_at IS NULL AND status='active' LIMIT 1");
    $ownerCheck->execute([$ownerId]); if (!$ownerCheck->fetch()) respond(['error'=>'İlan sahibi kullanıcı bulunamadı veya aktif değil.'],422);
    $dup=$pdo->prepare('SELECT id FROM listings WHERE listing_number=? LIMIT 1'); $dup->execute([$number]);
    if ($dup->fetch()) respond(['error'=>'Bu ilan numarası zaten kullanılıyor. Sayfayı yenileyip tekrar deneyin.'],409);
    $status=in_array($actor['role'],['admin','manager'],true)?'Yayında':'pending';
    $details=is_array($input['details']??null)?$input['details']:[];
    $officeId=trim((string)($input['office_id']??$details['office_id']??'')) ?: null;
    $rooms=trim((string)($input['rooms']??'')) ?: null; $area=(float)($input['area']??0);
    $currency=strtoupper(trim((string)($input['currency']??'TRY'))); if ($currency==='₺'||$currency==='') $currency='TRY';
    $media=is_array($input['media']??null)?$input['media']:[];
    if (count($media)>16) respond(['error'=>'Bir ilana en fazla 16 medya dosyası eklenebilir.'],422);
    $id=vsprintf('%s%s-%s-%s-%s-%s%s%s',str_split(bin2hex(random_bytes(16)),4));
    try {
        $pdo->beginTransaction();
        $q=$pdo->prepare('INSERT INTO listings (id,listing_number,owner_user_id,office_id,title,transaction_type,category,property_type,price,currency,city,district,neighborhood,rooms,area,description,details,approval_status,is_featured,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $details['listing_number']=$number;
        $q->execute([$id,$number,$ownerId,$officeId,$title,$transaction,$category,$property,$price,$currency,$city,$district,trim((string)($input['neighborhood']??''))?:null,$rooms,$area>0?$area:null,trim((string)($input['description']??''))?:null,json_encode($details,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),$status,!empty($input['is_featured'])?1:0,$status==='Yayında'?date('Y-m-d H:i:s'):null]);
        $mq=$pdo->prepare('INSERT INTO listing_media (id,listing_id,file_url,media_type,sort_order) VALUES (?,?,?,?,?)'); $sort=0;
        foreach($media as $item) {
            if(!is_array($item)) continue; $url=trim((string)($item['url']??'')); if($url==='') continue;
            $rawType=(string)($item['type']??$item['media_type']??''); $type=($rawType==='video'||str_starts_with($rawType,'video/'))?'video':'image';
            $mid=vsprintf('%s%s-%s-%s-%s-%s%s%s',str_split(bin2hex(random_bytes(16)),4));
            $mq->execute([$mid,$id,$url,$type,$sort++]);
        }
        $pdo->commit(); respond(['ok'=>true,'id'=>$id,'listing_number'=>$number,'approval_status'=>$status]);
    } catch(Throwable $e) { if($pdo->inTransaction()) $pdo->rollBack(); respond(['error'=>'İlan cPanel veritabanına kaydedilemedi. Sunucu kayıtlarını kontrol edin.'],500); }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update-listing') {
    $actor=requireUser($pdo); $input=body(); $id=trim((string)($input['id']??''));
    if($id==='') respond(['error'=>'İlan seçilmedi.'],422);
    $q=$pdo->prepare('SELECT owner_user_id FROM listings WHERE id=? LIMIT 1'); $q->execute([$id]); $listing=$q->fetch();
    if(!$listing) respond(['error'=>'İlan bulunamadı.'],404);
    if($actor['role']==='advisor' && $listing['owner_user_id']!==$actor['id']) respond(['error'=>'Bu ilanı düzenleme yetkiniz yok.'],403);
    if(!in_array($actor['role'],['admin','manager','advisor'],true)) respond(['error'=>'Bu işlem için yetkiniz yok.'],403);
    $patch=is_array($input['patch']??null)?$input['patch']:[]; $allowed=['title','transaction_type','category','property_type','price','currency','city','district','neighborhood','rooms','area','description'];
    $sets=[];$values=[];
    foreach($allowed as $key) if(array_key_exists($key,$patch)) {$sets[]=$key.'=?';$values[]=$patch[$key];}
    $moderator=in_array($actor['role'],['admin','manager'],true);
    if($moderator && array_key_exists('approval_status',$patch)) {
        if(!in_array($patch['approval_status'],['draft','pending','Yayında','Reddedildi','archived'],true)) respond(['error'=>'İlan durumu geçersiz.'],422);
        $sets[]='approval_status=?';$values[]=$patch['approval_status'];
        if($patch['approval_status']==='Yayında') $sets[]='published_at=COALESCE(published_at,NOW())';
    }
    if($moderator && array_key_exists('is_featured',$patch)) {$sets[]='is_featured=?';$values[]=!empty($patch['is_featured'])?1:0;}
    if($moderator && array_key_exists('deleted_at',$patch)) {$sets[]='deleted_at=?';$values[]=$patch['deleted_at'];}
    if(array_key_exists('details',$patch)) {$sets[]='details=?';$values[]=json_encode($patch['details'],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);}
    if(!$sets) respond(['error'=>'Güncellenecek alan bulunamadı veya yetki yetersiz.'],422);
    $values[]=$id;$pdo->prepare('UPDATE listings SET '.implode(',',$sets).' WHERE id=?')->execute($values);respond(['ok'=>true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'bulk-listings') {
    $actor=requireUser($pdo); if(!in_array($actor['role'],['admin','manager'],true)) respond(['error'=>'Toplu ilan işlemi için yetkiniz yok.'],403);
    $input=body();$ids=array_values(array_filter(array_map('strval',is_array($input['ids']??null)?$input['ids']:[])));$patch=is_array($input['patch']??null)?$input['patch']:[];
    if(!$ids||count($ids)>100) respond(['error'=>'En fazla 100 ilan seçebilirsiniz.'],422);
    $sets=[];$values=[];
    if(array_key_exists('approval_status',$patch)&&in_array($patch['approval_status'],['draft','pending','Yayında','Reddedildi','archived'],true)){$sets[]='approval_status=?';$values[]=$patch['approval_status'];}
    if(array_key_exists('deleted_at',$patch)){$sets[]='deleted_at=?';$values[]=$patch['deleted_at'];}
    if(array_key_exists('is_featured',$patch)){$sets[]='is_featured=?';$values[]=!empty($patch['is_featured'])?1:0;}
    if(!$sets)respond(['error'=>'Geçerli toplu işlem bulunamadı.'],422);
    $ph=implode(',',array_fill(0,count($ids),'?'));$pdo->prepare('UPDATE listings SET '.implode(',',$sets).' WHERE id IN ('.$ph.')')->execute([...$values,...$ids]);respond(['ok'=>true,'updated'=>count($ids)]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'offices') {
    try { $pdo->exec('ALTER TABLE offices MODIFY image_url MEDIUMTEXT NULL'); } catch (Throwable $ignored) {}
    try { $pdo->exec('ALTER TABLE offices ADD COLUMN latitude DECIMAL(10,7) NULL, ADD COLUMN longitude DECIMAL(10,7) NULL'); } catch (Throwable $ignored) {}
    $q = $pdo->query("SELECT o.id,o.name,o.city,o.district,o.address,o.phone,o.email,o.manager_user_id AS owner_profile_id,o.image_url,o.description,o.work_hours,o.latitude,o.longitude,o.status,o.deleted_at,CONCAT(COALESCE(u.first_name,''),' ',COALESCE(u.last_name,'')) AS manager_name FROM offices o LEFT JOIN users u ON u.id=o.manager_user_id WHERE o.deleted_at IS NULL ORDER BY o.created_at DESC");
    respond(['offices'=>$q->fetchAll()]);
}
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'office-members') { requireUser($pdo); $q=$pdo->query('SELECT office_id,user_id AS advisor_id,is_manager FROM office_advisors'); respond(['members'=>$q->fetchAll()]); }
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete-office') { requireUser($pdo); $id=(string)(body()['id']??''); if($id==='') respond(['error'=>'Ofis seçilmedi.'],422); $q=$pdo->prepare('UPDATE offices SET deleted_at=NOW() WHERE id=?'); $q->execute([$id]); respond(['ok'=>true]); }

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'save-office') {
    try {
    requireUser($pdo);
    $input = body();
    $id = trim((string)($input['id'] ?? ''));
    $name = trim((string)($input['name'] ?? ''));
    if ($name === '' || trim((string)($input['city'] ?? '')) === '' || trim((string)($input['district'] ?? '')) === '') respond(['error'=>'Ofis adı, il ve ilçe zorunludur.'],422);
    try { $pdo->exec('ALTER TABLE offices MODIFY image_url MEDIUMTEXT NULL'); } catch (Throwable $ignored) {}
    try { $pdo->exec('ALTER TABLE offices ADD COLUMN latitude DECIMAL(10,7) NULL, ADD COLUMN longitude DECIMAL(10,7) NULL'); } catch (Throwable $ignored) {}
    $values = [$name,trim((string)$input['city']),trim((string)$input['district']),trim((string)($input['address'] ?? '')),trim((string)($input['phone'] ?? '')) ?: null,trim((string)($input['email'] ?? '')) ?: null,($input['owner_profile_id'] ?? null) ?: null,$input['image_url'] ?? null,$input['description'] ?? null,$input['work_hours'] ?? null,$input['latitude'] ?? null,$input['longitude'] ?? null];
    if ($id !== '') { $q=$pdo->prepare('UPDATE offices SET name=?,city=?,district=?,address=?,phone=?,email=?,manager_user_id=?,image_url=?,description=?,work_hours=?,latitude=?,longitude=? WHERE id=? AND deleted_at IS NULL'); $q->execute([...$values,$id]); }
    else { $id=bin2hex(random_bytes(16)); $q=$pdo->prepare('INSERT INTO offices (id,name,city,district,address,phone,email,manager_user_id,image_url,description,work_hours,latitude,longitude) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'); $q->execute([$id,...$values]); }
    respond(['ok'=>true,'id'=>$id]);
    } catch (Throwable $e) { respond(['error'=>'Ofis kaydedilemedi: '.$e->getMessage()],500); }
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
