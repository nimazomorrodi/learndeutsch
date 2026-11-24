#!/usr/bin/env bash
# Executed over SSH after a complete release has been uploaded.
set -euo pipefail
release=$1
webroot=$2
base="$HOME/.lernhaus"
root="$base/releases/$release"
[[ "$release" =~ ^[0-9a-f]{40}-[0-9]+-[0-9]+$ ]]
[[ "$webroot" == /* ]] || webroot="$HOME/$webroot"
[[ -d "$webroot" ]] || { echo "Subdomain document root not found: $webroot" >&2; exit 1; }
[[ -d "$root/dist" && -s "$root/.local/hosted-db.json" ]]
mkdir -p "$base/shared/sessions"
chmod 700 "$base/shared" "$base/shared/sessions" "$root/.local"
ln -s "$base/shared/sessions" "$root/.local/sessions"
php_bin=php
if ! php -r 'exit(PHP_VERSION_ID >= 80100 && extension_loaded("pdo_mysql") && extension_loaded("mbstring") ? 0 : 1);'; then
    php_bin=
    for candidate in /opt/alt/php{85,84,83,82,81}/usr/bin/php; do
        if [[ -x "$candidate" ]] && "$candidate" -r 'exit(extension_loaded("pdo_mysql") && extension_loaded("mbstring") ? 0 : 1);'; then
            php_bin="$candidate"
            break
        fi
    done
    [[ -n "$php_bin" ]] || { echo 'PHP 8.1+ with pdo_mysql and mbstring is required.' >&2; exit 1; }
fi
printf '%s\n' "${release%%-*}" > "$root/dist/lernhaus-release.txt"
# Only the contents of dist are exposed. Leave host-specific files and other sites alone.
for file in "$root"/dist/*; do
    name=${file##*/}
    target="$webroot/$name"
    if [[ -e "$target" || -L "$target" ]]; then
        [[ -L "$target" && "$(readlink "$target")" == "$base/current/dist/$name" ]] ||
            { echo "Existing web file needs a first-deploy decision: $target" >&2; exit 1; }
    fi
done
previous=$(readlink "$base/current" || true)
"$php_bin" "$root/bin/migrate.php"
for file in "$root"/dist/*; do
    name=${file##*/}
    [[ -L "$webroot/$name" ]] || ln -s "$base/current/dist/$name" "$webroot/$name"
done
ln -s "$root" "$base/next-$release"
mv -Tf "$base/next-$release" "$base/current"
if curl -fsS --retry 2 --max-time 15 "https://learn.nimazomorrodi.com/lernhaus-release.txt?v=$release" | grep -Fxq "${release%%-*}" &&
   curl -fsS --retry 2 --max-time 15 "https://learn.nimazomorrodi.com/index.php?v=$release" | grep -F 'id="username"' >/dev/null; then
    echo "Published https://learn.nimazomorrodi.com"
else
    if [[ -n "$previous" ]]; then
        ln -s "$previous" "$base/restore-$release"
        mv -Tf "$base/restore-$release" "$base/current"
    elif [[ "$(readlink "$base/current")" == "$root" ]]; then
        unlink "$base/current"
        for file in "$root"/dist/*; do
            name=${file##*/}
            [[ "$(readlink "$webroot/$name")" != "$base/current/dist/$name" ]] || unlink "$webroot/$name"
        done
    fi
    echo 'Public HTTPS verification failed; check the document root, database, and TLS at the origin.' >&2
    exit 1
fi
