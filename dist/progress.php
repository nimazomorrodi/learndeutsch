<?php
declare(strict_types=1);

require __DIR__ . '/../app/session.php';
require __DIR__ . '/../app/progress.php';
if (empty($_SESSION['id'])) reply(401, ['error' => 'login']);
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $read = db()->prepare('SELECT p.revision, u.display_name, u.review_direction FROM user_progress p
        JOIN users u ON u.id=p.user_id WHERE p.user_id=?');
    $read->execute([$_SESSION['id']]);
    $row = $read->fetch();
    if (!$row) reply(401, ['error' => 'login']);
    reply(200, ['revision' => (int)$row['revision'], 'csrf' => $_SESSION['csrf'], 'displayName' => $row['display_name'],
        'reviewDirection' => $row['review_direction']]);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    reply(405, ['error' => 'method']);
}
if (!validToken($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) reply(403, ['error' => 'session']);
$userId = $_SESSION['id'];
$body = file_get_contents('php://input', length: 1024 * 1024 + 1);
if (strlen($body) > 1024 * 1024) reply(413, ['error' => 'size']);
$input = json_decode($body);
if (!($input instanceof stdClass) || !is_int($input->revision ?? null) || $input->revision < 0 ||
    !(($input->state ?? null) instanceof stdClass)) reply(422, ['error' => 'format']);
try {
    $pdo = db();
    if (!validProgress($input->state, curriculum($pdo)['lessons'])) reply(422, ['error' => 'state']);
    $state = json_encode(upgradeLessonParts($input->state), JSON_THROW_ON_ERROR);
    $update = $pdo->prepare('UPDATE user_progress SET state=?, revision=revision+1 WHERE user_id=? AND revision=?');
    $update->execute([$state, $userId, $input->revision]);
    if (!$update->rowCount()) {
        // A successful write whose response was lost may be safely acknowledged on retry.
        $check = $pdo->prepare('SELECT revision, state=CAST(? AS JSON) AS identical FROM user_progress WHERE user_id=?');
        $check->execute([$state, $userId]);
        $row = $check->fetch();
        if (!$row || !(int)$row['identical'] || (int)$row['revision'] !== $input->revision + 1) {
            reply(409, ['error' => 'conflict']);
        }
    }
    reply(200, ['revision' => $input->revision + 1]);
} catch (PDOException $error) {
    error_log($error->getMessage());
    reply(503, ['error' => 'database']);
}
