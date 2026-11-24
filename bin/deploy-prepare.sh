#!/usr/bin/env bash
# Runs on the hosting account from the public folder of the learn subdomain.
set -euo pipefail
[[ "$(pwd -P)" == "$HOME/domains/nimazomorrodi.com/public_html/learn" && -w . ]] || {
    echo 'Deployment must run inside the learn document root.' >&2
    exit 1
}
base=.lernhaus
mkdir -p -m 711 -- "$base"
for path in "$base" "$base/releases" "$base/shared" "$base/shared/sessions"; do
    [[ ! -L "$path" ]] || { echo "Deployment folder must stay inside learn: $path" >&2; exit 1; }
done
guard="$base/.htaccess"
if [[ ! -e "$guard" && ! -L "$guard" ]]; then
    if (set -o noclobber; printf 'Require all denied\n' > "$guard"); then chmod 644 "$guard"; fi
fi
[[ -f "$guard" && ! -L "$guard" && "$(< "$guard")" == 'Require all denied' ]] || {
    echo 'The access rules for learn/.lernhaus differ from the deployment rules.' >&2
    exit 1
}

# Verify both URL paths against the same origin and the same harmless file.
probe=$(mktemp -d "$base/probe-XXXXXXXX")
name=${probe##*/}
public="lernhaus-$name.txt"
cleanup() {
    if [[ "$(readlink "$public" || true)" == "$probe/check.txt" ]]; then unlink "$public"; fi
    rm -f -- "$probe/check.txt"
    rmdir -- "$probe"
}
trap cleanup EXIT
chmod 711 "$probe"
printf '%s\n' "$name" > "$probe/check.txt"
chmod 644 "$probe/check.txt"
ln -s -- "$probe/check.txt" "$public"
host=learn.nimazomorrodi.com
origin=(curl --silent --max-time 8 --noproxy '*' --resolve "$host:80:127.0.0.1" --resolve "$host:443:127.0.0.1")
verified=false
for scheme in http https; do
    url="$scheme://$host"
    if [[ "$("${origin[@]}" --fail "$url/$public" || true)" != "$name" ]]; then continue; fi
    code=$("${origin[@]}" -o /dev/null -w '%{http_code}' "$url/$probe/check.txt")
    [[ "$code" == 403 ]] || { echo "Private release files must return HTTP 403 (received $code)." >&2; exit 1; }
    verified=true
done
[[ "$verified" == true ]] || { echo 'Could not verify the public test file on the hosting web server.' >&2; exit 1; }
echo 'Verified learn document root, public links and denied private files.'
