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
?>
<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#FAF8F2">
  <title><?= $bootstrap ? 'میز مطالعه' : ($register ? 'ساخت حساب' : 'ورود') ?> | Lernhaus</title>
  <script>try{document.documentElement.dataset.theme=localStorage.getItem('lernhaus-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{}</script>
  <link rel="icon" href="assets/mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="tailwind.css">
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
  <script defer src="lessons.js"></script>
  <script defer src="account.js"></script>
  <script defer src="practice-data.js"></script>
  <script defer src="chapter.js"></script>
  <script defer src="study-pages.js"></script>
  <script defer src="conjugation.js"></script>
  <script defer src="reference.js"></script>
  <script defer src="dictionary.js"></script>
  <script defer src="app.js"></script>
<?php endif; ?>
</body>
</html>
