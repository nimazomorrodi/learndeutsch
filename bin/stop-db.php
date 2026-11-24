<?php
declare(strict_types=1);

require __DIR__ . '/../app/database.php';
db(true)->exec('SHUTDOWN');
echo "Local MySQL is stopping.\n";
