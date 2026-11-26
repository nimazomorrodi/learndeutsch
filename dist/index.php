<?php
declare(strict_types=1);

require __DIR__ . '/../app/session.php';
require __DIR__ . '/../app/progress.php';
function home(): never
{
    header('Location: /', true, 303);
    exit;
}
$error = null;
$bootstrap = null;
$offline = false;
$register = ($_GET['view'] ?? '') === 'register';
$username = '';
try {
    $pdo = db();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action = $_POST['action'] ?? '';
        $register = $action === 'register';
        $username = is_string($_POST['username'] ?? null) ? trim($_POST['username']) : '';
        if (!validToken($_POST['csrf'] ?? null)) {
            http_response_code(403);
            $error = 'نشست تغییر کرده. صفحه را تازه کن و دوباره تلاش کن.';
        } elseif ($action === 'logout') {
            $_SESSION = [];
            session_destroy();
            setcookie(session_name(), '', ['expires' => 1, 'path' => '/', 'httponly' => true, 'samesite' => 'Strict']);
            home();
        } elseif (empty($_SESSION['id']) && in_array($action, ['login', 'register'], true)) {
            $password = is_string($_POST['password'] ?? null) ? $_POST['password'] : '';
            $error = authenticate($pdo, $action, $username, $password);
            if ($error === null) home();
        }
    }
    if (isset($_SESSION['id'])) {
        $read = $pdo->prepare('SELECT u.username, u.display_name, u.review_direction, p.state, p.revision FROM users u
            JOIN user_progress p ON p.user_id=u.id WHERE u.id=?');
        $read->execute([$_SESSION['id']]);
        $account = $read->fetch();
        if (!$account) {
            unset($_SESSION['id']);
            home();
        }
        $reference = [];
        foreach ($pdo->query('SELECT name, content FROM reference_materials') as $row) {
            $reference[$row['name']] = json_decode($row['content'], flags: JSON_THROW_ON_ERROR);
        }
        $bootstrap = curriculum($pdo) + [
            'reference' => $reference,
            'username' => $account['username'], 'displayName' => $account['display_name'],
            'reviewDirection' => $account['review_direction'],
            'state' => upgradeLessonParts(json_decode($account['state'], flags: JSON_THROW_ON_ERROR)),
            'revision' => (int)$account['revision'], 'csrf' => $_SESSION['csrf'],
        ];
    }
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    http_response_code(503);
    $offline = true;
}
$releaseFile = __DIR__ . '/lernhaus-release.txt';
$assetVersion = is_file($releaseFile) ? '?v=' . rawurlencode(trim(file_get_contents($releaseFile))) : '';
?>
<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#FAF8F2">
  <meta name="application-name" content="Lernhaus">
  <meta name="apple-mobile-web-app-title" content="Lernhaus">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <title lang="en" dir="ltr">Lernhaus</title>
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/icons/lernhaus-180.png">
  <link rel="apple-touch-icon" sizes="167x167" href="assets/icons/lernhaus-167.png">
  <link rel="apple-touch-icon" sizes="152x152" href="assets/icons/lernhaus-152.png">
  <script src="theme.js<?= $assetVersion ?>"></script>
  <link rel="icon" href="assets/mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css<?= $assetVersion ?>">
  <link rel="stylesheet" href="tailwind.css<?= $assetVersion ?>">
</head>
<body>
<?php if ($offline): ?>
  <main class="mx-auto max-w-md p-8"><h1>دیتابیس در دسترس نیست</h1><p>راه‌انداز محلی Lernhaus را اجرا کن و این صفحه را تازه کن.</p></main>
<?php elseif (!$bootstrap): require __DIR__ . '/../app/views/auth.php'; ?>
<?php else: ?>
  <a class="skip" href="#main">رفتن به محتوای اصلی</a>
  <div id="layout">
    <aside id="sidebar" aria-label="منوی کناری"></aside>
    <div id="scrim" hidden></div>
    <div id="workspace"><header id="topbar"></header>
      <div id="save-notice" class="save-notice" role="alert" hidden></div>
      <main id="main" tabindex="-1"></main>
    </div>
  </div>
  <div id="toast" role="status" aria-live="polite"></div>
  <form method="post" id="sign-out" hidden>
    <input type="hidden" name="action" value="logout">
    <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
  </form>
  <script id="account-data" type="application/json"><?= json_encode($bootstrap, JSON_HEX_TAG | JSON_HEX_AMP | JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE) ?></script>
  <?php foreach (['lessons', 'account', 'practice-data', 'chapter', 'study-pages', 'conjugation', 'reference', 'dictionary', 'article-practice', 'vocab-practice', 'app'] as $script): ?>
    <script defer src="<?= $script ?>.js<?= $assetVersion ?>"></script>
  <?php endforeach; ?>
<?php endif; ?>
  <script defer src="pwa.js<?= $assetVersion ?>"></script>
</body>
</html>
