<?php
declare(strict_types=1);

require __DIR__ . '/../app/session.php';

if (empty($_SESSION['id'])) reply(401, ['error' => 'login']);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    reply(405, ['error' => 'method']);
}
if (!validToken($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) reply(403, ['error' => 'session']);

if (isset($_POST['review_direction'])) {
    $direction = $_POST['review_direction'];
    if (!in_array($direction, ['de-fa', 'fa-de'], true)) reply(422, ['error' => 'direction']);
    try {
        $update = db()->prepare('UPDATE users SET review_direction=? WHERE id=?');
        $update->execute([$direction, $_SESSION['id']]);
        reply(200, ['reviewDirection' => $direction]);
    } catch (PDOException $error) {
        error_log($error->getMessage());
        reply(503, ['error' => 'database']);
    }
}

$input = $_POST['display_name'] ?? null;
if (!is_string($input) || !mb_check_encoding($input, 'UTF-8') ||
    preg_match('/[\p{Cc}\p{Zl}\p{Zp}\x{202A}-\x{202E}\x{2066}-\x{2069}]/u', $input)) {
    reply(422, ['message' => 'نام نمایشی را در یک خط وارد کن.']);
}
$name = preg_replace('/^\p{Zs}+|\p{Zs}+$/u', '', $input);
if (mb_strlen($name, 'UTF-8') > 80) reply(422, ['message' => 'نام نمایشی می‌تواند تا ۸۰ نویسه داشته باشد.']);
$displayName = $name === '' ? null : $name;
try {
    $update = db()->prepare('UPDATE users SET display_name=? WHERE id=?');
    $update->execute([$displayName, $_SESSION['id']]);
    reply(200, ['displayName' => $displayName]);
} catch (PDOException $error) {
    error_log($error->getMessage());
    reply(503, ['error' => 'database']);
}
