#!/usr/bin/env bash
# Runs in the GitHub production environment.
set -euo pipefail
required=(DEPLOY_SSH_KEY DEPLOY_KNOWN_HOSTS DEPLOY_HOST DEPLOY_USER DEPLOY_PORT)
if [[ ${1:-} != --check ]]; then required+=(DB_NAME DB_USER DB_PASSWORD); fi
for name in "${required[@]}"; do
    [[ -n "${!name:-}" ]] || { echo "::error::Missing production setting: $name"; exit 1; }
done
[[ "$DEPLOY_PORT" =~ ^[0-9]+$ && "$DEPLOY_USER" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_-]*$ && "$DEPLOY_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]]
webroot=domains/nimazomorrodi.com/public_html/learn
[[ "${DEPLOY_WEBROOT:-$webroot}" == "$webroot" ]] || { echo 'DEPLOY_WEBROOT must point to the learn folder.' >&2; exit 1; }
release="$GITHUB_SHA-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT"
[[ "$release" =~ ^[0-9a-f]{40}-[0-9]+-[0-9]+$ ]]
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
(umask 077; printf '%s\n' "$DEPLOY_SSH_KEY" | tr -d '\r' > "$work/key"; printf '%s\n' "$DEPLOY_KNOWN_HOSTS" > "$work/known_hosts")
unset DEPLOY_SSH_KEY
ssh_cmd=(ssh -T -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes
    -o "UserKnownHostsFile=$work/known_hosts" -i "$work/key" -p "$DEPLOY_PORT" "$DEPLOY_USER@$DEPLOY_HOST")
remote=".lernhaus/releases/$release"
in_learn="cd '$webroot' &&"
if [[ ${1:-} != --check-db ]]; then
    "${ssh_cmd[@]}" "$in_learn bash -s" < bin/deploy-prepare.sh
fi
if [[ ${1:-} == --check ]]; then
    echo 'SSH and the subdomain document root are ready.'
    exit 0
fi
python3 - <<'PY' > "$work/database.json"
import json, os, re, sys
env = os.environ
host = env.get("DB_HOST") or "localhost"
port = env.get("DB_PORT") or "3306"
name = env["DB_NAME"]
if not re.fullmatch(r"[\w.-]+", host) or not re.fullmatch(r"[\w-]+", name) or not port.isascii() or not port.isdigit() or not 1 <= int(port) <= 65535:
    sys.exit("Invalid database host, port or name")
json.dump({"dsn": f"mysql:host={host};port={port};dbname={name};charset=utf8mb4",
           "user": env["DB_USER"], "password": env["DB_PASSWORD"]},sys.stdout)
PY
unset DB_PASSWORD
if [[ ${1:-} == --check-db ]]; then
    if "${ssh_cmd[@]}" "$in_learn php -r '"'
        try {
            $c=json_decode(stream_get_contents(STDIN),true,flags:JSON_THROW_ON_ERROR);
            [$server,$rest]=explode(";dbname=",$c["dsn"],2);
            [$name,$charset]=explode(";",$rest,2);
            $db=new PDO($server.";".$charset,$c["user"],$c["password"]);
            echo "MySQL accepted the supplied credentials.\n";
            $db->exec("USE `".$name."`");
            $db->query("SELECT 1")->fetchColumn();
            echo "Database login verified on the hosting server.\n";
        } catch (PDOException $e) {
            $message=$e->getMessage();
            preg_match("~SQLSTATE\\[[^]]+\\]\\s*\\[([0-9]+)\\]~", $message, $match);
            $code=(int)($e->errorInfo[1] ?? $match[1] ?? $e->getCode());
            $hint=match($code) {
                1045 => "Check the database username and password.",
                1044 => "The database user lacks access to this database.",
                1049 => "Check the full database name in the hosting panel.",
                2002, 2003, 2005, 2006 => match(true) {
                    str_contains($message, "No such file or directory") => "The configured local MySQL socket was not found.",
                    str_contains($message, "getaddrinfo") => "The hosting server could not resolve the database hostname.",
                    str_contains($message, "Connection refused") => "The database host refused the TCP connection.",
                    default => "Check the database host, socket and port."
                },
                default => "Check the hosting database settings."
            };
            fwrite(STDERR, "::error::Database connection failed (driver $code). $hint\n");
            exit(in_array($code,[1044,1045,1049],true) ? 2 : 1);
        }
    '"'" < "$work/database.json"; then
        exit 0
    else
        status=$?
    fi
    if [[ "$status" == 2 ]]; then
        # Give field-specific hPanel hints without logging secret values.
        if [[ "${DB_HOST:-localhost}" != localhost ]]; then
            echo "::notice::Check DB_HOST: Hostinger specifies localhost for MySQL connections from the hosting account."
        fi
        for field in DB_USER DB_NAME; do
            if [[ "${!field}" != "${DEPLOY_USER}_"?* ]]; then
                echo "::notice::Check $field: copy the complete identifier, including the account prefix, from hPanel."
            fi
        done
    fi
    exit "$status"
fi
php -r '$config = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR); echo "<?php\nreturn ", var_export($config, true), ";\n";' < "$work/database.json" |
    "${ssh_cmd[@]}" "$in_learn (set -e; mkdir -p .lernhaus/releases; mkdir '$remote'; mkdir -m 700 '$remote/.local'; umask 077; cat > '$remote/.local/hosted-db.php')"
tar -czf - app database dist bin/migrate.php | "${ssh_cmd[@]}" "$in_learn tar -xzf - -C '$remote'"
"${ssh_cmd[@]}" "$in_learn bash -s -- '$release'" < bin/deploy-host.sh
