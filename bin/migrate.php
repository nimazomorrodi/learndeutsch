<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit(1);
require __DIR__ . '/../app/database.php';
require __DIR__ . '/../app/install.php';
installCurriculum(db());
echo "Schema and lesson data are ready.\n";
