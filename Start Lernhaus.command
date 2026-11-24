#!/bin/zsh
set -eu
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd -- "${0:A:h}"
umask 077
php bin/setup.php
echo "Lernhaus → http://127.0.0.1:4876/"
exec php -d display_errors=0 -S 127.0.0.1:4876 -t dist
