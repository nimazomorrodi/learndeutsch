<?php
declare(strict_types=1);

require_once __DIR__ . '/database.php';
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.save_path', LOCAL_DIR . '/sessions');
session_name('lernhaus_session');
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'path' => '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off']);
session_start();
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));

function validToken(mixed $value): bool
{
    return is_string($value) && hash_equals($_SESSION['csrf'], $value);
}

function reply(int $code, array $body): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_THROW_ON_ERROR);
    exit;
}

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function authenticate(PDO $pdo, string $action, string $username, string $password): ?string
{
    if ($action === 'register') {
        if (!preg_match('/^[\p{L}\p{N}_-]{3,40}$/uD', $username)) {
            return 'برای نام کاربری ۳ تا ۴۰ حرف، عدد، خط تیره یا زیرخط وارد کن.';
        }
        if (mb_strlen($password) < 8 || strlen($password) > 72 || str_contains($password, "\0")) {
            return 'رمز عبور باید دست‌کم ۸ نویسه و حداکثر ۷۲ بایت باشد.';
        }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $pdo->beginTransaction();
        try {
            $pdo->prepare('INSERT INTO users (username,password_hash) VALUES (?,?)')->execute([$username, $hash]);
            $id = (int)$pdo->lastInsertId();
            $pdo->prepare('INSERT INTO user_progress (user_id,state) VALUES (?,?)')
                ->execute([$id, json_encode(initialProgress(), JSON_THROW_ON_ERROR)]);
            $pdo->commit();
        } catch (Throwable $error) {
            $pdo->rollBack();
            if ($error instanceof PDOException && ($error->errorInfo[1] ?? null) === 1062) {
                return 'این نام کاربری قبلاً ثبت شده. نام دیگری انتخاب کن یا وارد شو.';
            }
            throw $error;
        }
    } else {
        $statement = $pdo->prepare('SELECT id,password_hash FROM users WHERE username=?');
        $statement->execute([$username]);
        $user = $statement->fetch();
        if (!$user || strlen($password) > 72 || str_contains($password, "\0") || !password_verify($password, $user['password_hash'])) {
            return 'نام کاربری یا رمز عبور درست نیست.';
        }
        $id = (int)$user['id'];
    }
    session_regenerate_id(true);
    $_SESSION = ['id' => $id, 'csrf' => bin2hex(random_bytes(32))];
    return null;
}
