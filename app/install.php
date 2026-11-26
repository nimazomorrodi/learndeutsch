<?php
declare(strict_types=1);

function installCurriculum(PDO $pdo): void
{
    $schema = file_get_contents(APP_ROOT . '/database/schema.sql');
    if (!$pdo->query("SHOW COLLATION LIKE 'utf8mb4_0900_as_ci'")->fetch()) {
        $collation = $pdo->query("SHOW COLLATION LIKE 'uca1400_as_ci'")->fetch() ? 'uca1400_as_ci' : 'utf8mb4_unicode_ci';
        $schema = str_replace('utf8mb4_0900_as_ci', $collation, $schema);
    }
    $pdo->exec($schema);
    if (!$pdo->query("SHOW COLUMNS FROM users WHERE Field = 'display_name'")->fetch()) {
        $pdo->exec('ALTER TABLE users ADD COLUMN display_name VARCHAR(80) NULL');
    }
    if (!$pdo->query("SHOW COLUMNS FROM users WHERE Field = 'review_direction'")->fetch()) {
        $pdo->exec("ALTER TABLE users ADD COLUMN review_direction ENUM('de-fa', 'fa-de') NOT NULL DEFAULT 'de-fa'");
    }
    $seed = json_decode(file_get_contents(APP_ROOT . '/database/curriculum.json'), flags: JSON_THROW_ON_ERROR);
    $pdo->beginTransaction();
    $level = $pdo->prepare('INSERT INTO levels (code,position,content) VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE position=VALUES(position), content=VALUES(content)');
    foreach ($seed->levels as $i => $item) {
        $level->execute([$item->code, $i, json_encode($item, JSON_THROW_ON_ERROR)]);
    }
    $lesson = $pdo->prepare('INSERT INTO lessons (id,level_code,position,content) VALUES (?,?,?,?)
        ON DUPLICATE KEY UPDATE level_code=VALUES(level_code), position=VALUES(position), content=VALUES(content)');
    foreach ($seed->lessons as $i => $item) {
        $lesson->execute([$item->id, $item->level, $i, json_encode($item, JSON_THROW_ON_ERROR)]);
    }
    $reference = $pdo->prepare('INSERT INTO reference_materials (name,content) VALUES (?,?)
        ON DUPLICATE KEY UPDATE content=VALUES(content)');
    foreach (['grammar' => 'grammar-reference', 'verbs' => 'verb-forms', 'nouns' => 'noun-forms',
        'senses' => 'dictionary-senses', 'english' => 'english-glosses'] as $name => $file) {
        $reference->execute([$name, file_get_contents(APP_ROOT . "/database/$file.json")]);
    }
    $pdo->commit();
}
