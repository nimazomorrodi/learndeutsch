<?php
declare(strict_types=1);

const LOCAL_DIR = __DIR__ . '/../.local';
const APP_ROOT = __DIR__ . '/..';

function db(bool $admin = false): PDO
{
    $config = json_decode(file_get_contents(LOCAL_DIR . '/mysql.json'), true, flags: JSON_THROW_ON_ERROR);
    return new PDO('mysql:unix_socket=' . realpath(LOCAL_DIR) . '/mysql.sock;dbname=lernhaus;charset=utf8mb4',
        $admin ? 'root' : 'lernhaus_app', $config[$admin ? 'admin' : 'app'], [
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
        'cards' => (object)[], 'quizzes' => (object)[]];
}
