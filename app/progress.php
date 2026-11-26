<?php
declare(strict_types=1);

function inRange(mixed $value, int $min, int $max): bool
{
    return is_int($value) && $value >= $min && $value <= $max;
}

function validDate(mixed $value): bool
{
    if (!is_string($value) || !preg_match('/^(\d{4})-(\d{2})-(\d{2})$/D', $value, $parts)) return false;
    return checkdate((int)$parts[2], (int)$parts[3], (int)$parts[1]);
}

function validAnswers(mixed $list, int $max): bool
{
    if (!is_array($list) || count($list) > $max) return false;
    foreach ($list as $answer) {
        if (!inRange($answer, 0, 2)) return false;
    }
    return true;
}

// Apply to trusted stored data or a validated import. Keep previously finished
// lessons complete while preserving every original section ID and bookmark.
function upgradeLessonParts(stdClass $state): stdClass
{
    if (($state->partsVersion ?? 1) === 2) return $state;
    foreach ($state->done as $id => $parts) {
        if (count($parts) === 4 && !in_array(4, $parts, true)) {
            $state->done->{$id}[] = 4;
        }
    }
    $state->partsVersion = 2;
    return $state;
}

function validProgress(mixed $s, array $lessons): bool
{
    $catalog = array_column($lessons, null, 'id');
    if (!$s instanceof stdClass || !is_string($s->last ?? null) || !isset($catalog[$s->last]) ||
        !inRange($s->part ?? null, 0, 4) || !inRange($s->partsVersion ?? 1, 1, 2)) return false;
    foreach (['done', 'days', 'cards', 'quizzes'] as $map) {
        if (!(($s->$map ?? null) instanceof stdClass)) return false;
    }
    foreach ($s->done as $id => $parts) {
        if (!isset($catalog[$id]) || !is_array($parts) || count($parts) > 5) return false;
        foreach ($parts as $part) {
            if (!inRange($part, 0, 4)) return false;
        }
        if (count(array_unique($parts)) !== count($parts)) return false;
    }
    foreach ($s->days as $day => $count) {
        if (!validDate($day) || !inRange($count, 1, 1000000)) return false;
    }
    $decks = [$s->cards];
    foreach (['articleAutoplay', 'reviewAutoplay', 'vocabAutoplay'] as $setting) {
        if (property_exists($s, $setting) && !is_bool($s->$setting)) return false;
    }
    foreach (['articleCards', 'vocabPracticeCards'] as $field) {
        if (!property_exists($s, $field)) continue;
        if (!($s->$field instanceof stdClass)) return false;
        $decks[] = $s->$field;
    }
    foreach ($decks as $deck) {
        foreach ($deck as $key => $card) {
            if (!preg_match('/^([a-z0-9_-]+):(0|[1-9]\d*)$/D', $key, $m) ||
                !isset($catalog[$m[1]]->words[(int)$m[2]]) || !inRange($card->box ?? null, 1, 5) ||
                !validDate($card->due ?? null)) return false;
            if (property_exists($card, 'lastResult') &&
                !in_array($card->lastResult, ['correct', 'wrong', 'unknown'], true)) return false;
        }
    }
    if (property_exists($s, 'practice')) {
        if (!($s->practice instanceof stdClass)) return false;
        foreach ($s->practice as $id => $entry) {
            $drills = $catalog[$id]->drills ?? null;
            if (!$drills || !is_array($entry->answers ?? null) || count($entry->answers) !== count($drills) ||
                !is_string($entry->writing ?? null) || mb_strlen($entry->writing) > 2000) return false;
            foreach ($entry->answers as $answer) {
                if (!is_string($answer) || mb_strlen($answer) > 100) return false;
            }
        }
    }
    foreach ($s->quizzes as $key => $quiz) {
        if (!preg_match('~^([a-z0-9_-]+)/(chapter|mixed|words|grammar)$~D', $key, $m) || !isset($catalog[$m[1]])) return false;
        $size = $m[2] === 'mixed' ? 4 : 2;
        if ($m[2] === 'chapter') {
            $lesson = $catalog[$m[1]];
            if (!isset($lesson->reading, $lesson->listening, $lesson->communication)) return false;
            $vocabularyCount = isset($lesson->examVocabulary) ? count($lesson->examVocabulary) : 2;
            $size = 4 + $vocabularyCount + count($lesson->communication);
        }
        if (!inRange($quiz->best ?? null, 0, $size)) return false;
        if (isset($quiz->run)) {
            $r = $quiz->run;
            if (!inRange($r->index ?? null, 0, $size - 1) || !validAnswers($r->answers ?? null, $size) ||
                !in_array(count($r->answers), [$r->index, $r->index + 1], true)) return false;
        }
        if (isset($quiz->last)) {
            $r = $quiz->last;
            if (!inRange($r->score ?? null, 0, $size) || !validDate($r->day ?? null) ||
                !validAnswers($r->answers ?? null, $size) || count($r->answers) !== $size) return false;
        }
    }
    return true;
}
