<?php
declare(strict_types=1);

require __DIR__ . '/../app/database.php';
umask(0077);
foreach ([LOCAL_DIR, LOCAL_DIR . '/sessions', LOCAL_DIR . '/mysql'] as $dir) {
    if (!is_dir($dir) && !mkdir($dir, 0700, true)) {
        throw new RuntimeException("Cannot create $dir");
    }
}
chmod(LOCAL_DIR, 0700);
$lock = fopen(LOCAL_DIR . '/setup.lock', 'ce');
flock($lock, LOCK_EX);
$dir = realpath(LOCAL_DIR);
$configPath = "$dir/mysql.json";
if (!file_exists($configPath)) {
    $config = ['admin' => bin2hex(random_bytes(30)), 'app' => bin2hex(random_bytes(30))];
    file_put_contents("$configPath.tmp", json_encode($config, JSON_THROW_ON_ERROR));
    rename("$configPath.tmp", $configPath);
}
$config = json_decode(file_get_contents($configPath), true, flags: JSON_THROW_ON_ERROR);
function runMysql(array $options): void
{
    $process = proc_open(['mysqld', '--no-defaults', ...$options], [STDIN, STDOUT, STDERR], $pipes);
    if (!$process || proc_close($process) !== 0) {
        throw new RuntimeException('MySQL startup failed. See .local/mysql.log.');
    }
}
$options = ["--datadir=$dir/mysql", "--log-error=$dir/mysql.log", '--innodb-buffer-pool-size=64M'];
if (!is_dir("$dir/mysql/mysql")) {
    runMysql([...$options, '--initialize-insecure']);
}
try {
    $pdo = db(true);
} catch (PDOException $error) {
    if (file_exists("$dir/mysql.sock") && !str_contains($error->getMessage(), 'Connection refused')) {
        throw $error;
    }
    $init = "$dir/start.sql";
    // The private socket directory is accessible only to the operating-system user.
    file_put_contents($init,
        "ALTER USER 'root'@'localhost' IDENTIFIED BY '" . $config['admin'] . "';\n" .
        "CREATE DATABASE IF NOT EXISTS lernhaus CHARACTER SET utf8mb4;\n" .
        "CREATE USER IF NOT EXISTS 'lernhaus_app'@'localhost' IDENTIFIED BY '" . $config['app'] . "';\n");
    try {
        runMysql([...$options, '--daemonize', '--skip-networking', '--mysqlx=OFF',
            "--socket=$dir/mysql.sock", "--pid-file=$dir/mysql.pid", "--init-file=$init"]);
        $pdo = db(true);
    } finally {
        if (file_exists($init)) unlink($init);
    }
}
$pdo->exec(file_get_contents(APP_ROOT . '/database/schema.sql'));
if (!$pdo->query("SHOW COLUMNS FROM users WHERE Field = 'display_name'")->fetch()) {
    $pdo->exec('ALTER TABLE users ADD COLUMN display_name VARCHAR(80) NULL');
}
if (!$pdo->query("SHOW COLUMNS FROM users WHERE Field = 'review_direction'")->fetch()) {
    $pdo->exec("ALTER TABLE users ADD COLUMN review_direction ENUM('de-fa', 'fa-de') NOT NULL DEFAULT 'de-fa'");
}
$seed = json_decode(file_get_contents(APP_ROOT . '/database/curriculum.json'), flags: JSON_THROW_ON_ERROR);
$pdo->beginTransaction();
$level = $pdo->prepare('INSERT INTO levels (code,position,content) VALUES (?,?,?) AS new
    ON DUPLICATE KEY UPDATE position=new.position, content=new.content');
foreach ($seed->levels as $i => $item) {
    $level->execute([$item->code, $i, json_encode($item, JSON_THROW_ON_ERROR)]);
}
$lesson = $pdo->prepare('INSERT INTO lessons (id,level_code,position,content) VALUES (?,?,?,?) AS new
    ON DUPLICATE KEY UPDATE level_code=new.level_code, position=new.position, content=new.content');
foreach ($seed->lessons as $i => $item) {
    $lesson->execute([$item->id, $item->level, $i, json_encode($item, JSON_THROW_ON_ERROR)]);
}
$reference = $pdo->prepare('INSERT INTO reference_materials (name,content) VALUES (?,?) AS new
    ON DUPLICATE KEY UPDATE content=new.content');
foreach (['grammar' => 'grammar-reference', 'verbs' => 'verb-forms', 'nouns' => 'noun-forms', 'senses' => 'dictionary-senses'] as $name => $file) {
    $reference->execute([$name, file_get_contents(APP_ROOT . "/database/$file.json")]);
}
$pdo->commit();
foreach (['levels' => 'SELECT', 'lessons' => 'SELECT', 'reference_materials' => 'SELECT', 'users' => 'SELECT, INSERT',
    'user_progress' => 'SELECT, INSERT, UPDATE'] as $table => $rights) {
    $pdo->exec("GRANT $rights ON lernhaus.$table TO 'lernhaus_app'@'localhost'");
}
$pdo->exec("GRANT UPDATE (display_name, review_direction) ON lernhaus.users TO 'lernhaus_app'@'localhost'");
flock($lock, LOCK_UN);
fclose($lock);
echo "Local MySQL is ready.\n";
