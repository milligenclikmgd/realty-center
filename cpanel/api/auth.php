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
        $html = $getRemote($canonical);
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
