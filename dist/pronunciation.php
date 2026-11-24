<?php
declare(strict_types=1);

require __DIR__ . '/../app/session.php';
if (empty($_SESSION['id'])) reply(401, ['error' => 'login']);
session_write_close();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    reply(405, ['error' => 'method']);
}
$card = $_GET['card'] ?? '';
$lang = $_GET['lang'] ?? '';
$part = $_GET['part'] ?? '';
if (!is_string($card) || !preg_match('/^([a-z0-9_-]+):(0|[1-9]\d*)$/D', $card, $match) ||
    !in_array($lang, ['de', 'fa'], true) || !in_array($part, ['word', 'example'], true)) {
    reply(400, ['error' => 'card']);
}

try {
    $read = db()->prepare('SELECT content FROM lessons WHERE id=?');
    $read->execute([$match[1]]);
    $content = $read->fetchColumn();
    $lesson = $content ? json_decode($content, true, flags: JSON_THROW_ON_ERROR) : [];
    $word = $lesson['words'][(int)$match[2]] ?? null;
    if (!$word) reply(404, ['error' => 'card']);
    $column = $lang === 'de' ? 0 : 1;
    $text = $word[$column];
    if ($part === 'example') {
        $text = '';
        foreach ($lesson['examples'][$word[0]] ?? [] as $pair) {
            if (!empty($pair[0]) && !empty($pair[1])) {
                $text = $pair[$column];
                break;
            }
        }
    }
    if ($text === '') reply(404, ['error' => 'example']);

    $digest = hash('sha256', $text);
    $url = "assets/audio/leitner/v1/$lang/$digest.mp3";
    $path = __DIR__ . '/' . $url;
    if (!is_file($path)) {
        // One inference at a time keeps model memory bounded across tabs. The
        // generator publishes a complete MP3 with an atomic rename.
        $lock = fopen(LOCAL_DIR . '/leitner-audio.lock', 'c');
        if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Cannot lock audio generation');
        clearstatcache(true, $path);
        if (!is_file($path)) {
            $process = proc_open([LOCAL_DIR . '/speech-venv/bin/python', APP_ROOT . '/bin/generate-audio.py',
                '--clip', $lang, '--output', $path], [0 => ['pipe', 'r']], $pipes);
            if (!$process) throw new RuntimeException('Cannot start local speech engine');
            fwrite($pipes[0], $text);
            fclose($pipes[0]);
            if (proc_close($process) !== 0 || !is_file($path)) throw new RuntimeException('Audio generation failed');
        }
        fclose($lock);
    }
    header('Location: ' . $url, true, 302);
} catch (Throwable $error) {
    error_log($error->getMessage());
    reply(503, ['error' => 'audio']);
}
