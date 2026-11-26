<?php
declare(strict_types=1);

const LOCAL_DIR = __DIR__ . '/../.local';
const APP_ROOT = __DIR__ . '/..';

function db(bool $admin = false): PDO
{
    $dsn = getenv('LERNHAUS_DB_DSN');
    if ($dsn !== false && $dsn !== '') {
        $user = getenv('LERNHAUS_DB_USER');
        $password = getenv('LERNHAUS_DB_PASSWORD');
        if (!$user || $password === false) throw new PDOException('Hosted database configuration is incomplete');
    } elseif (is_file(LOCAL_DIR . '/hosted-db.php') || is_file(LOCAL_DIR . '/hosted-db.json')) {
        $config = is_file(LOCAL_DIR . '/hosted-db.php')
            ? require LOCAL_DIR . '/hosted-db.php'
            : json_decode(file_get_contents(LOCAL_DIR . '/hosted-db.json'), true, flags: JSON_THROW_ON_ERROR);
        $dsn = $config['dsn'];
        $user = $config['user'];
        $password = $config['password'];
    } else {
        $config = json_decode(file_get_contents(LOCAL_DIR . '/mysql.json'), true, flags: JSON_THROW_ON_ERROR);
        $dsn = 'mysql:unix_socket=' . realpath(LOCAL_DIR) . '/mysql.sock;dbname=lernhaus;charset=utf8mb4';
        $user = $admin ? 'root' : 'lernhaus_app';
        $password = $config[$admin ? 'admin' : 'app'];
    }
    return new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

function curriculum(PDO $db): array
{
    $catalog = [];
    foreach (['levels', 'lessons'] as $table) {
        $rows = $db->query("SELECT content FROM $table ORDER BY position")->fetchAll(PDO::FETCH_COLUMN);
        $catalog[$table] = array_map(fn($row) => json_decode($row, flags: JSON_THROW_ON_ERROR), $rows);
    }
    return $catalog;
}

function initialProgress(): stdClass
{
    return (object)['last' => 'hallo', 'part' => 4, 'partsVersion' => 2, 'done' => (object)[], 'days' => (object)[],
        'cards' => (object)[], 'articleCards' => (object)[], 'articleAutoplay' => false, 'quizzes' => (object)[]];
}
