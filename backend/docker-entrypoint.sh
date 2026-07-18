#!/bin/sh
set -eu

secrets_dir=/app/secrets
mkdir -p "$secrets_dir"
umask 077

generate_hex_secret() {
    tr -d '-' < /proc/sys/kernel/random/uuid
    tr -d '-' < /proc/sys/kernel/random/uuid
}

ensure_secret() {
    secret_file="$1"
    secret_kind="$2"
    if [ ! -s "$secret_file" ]; then
        temporary_file="${secret_file}.tmp"
        if [ "$secret_kind" = "jwt" ]; then
            generate_hex_secret > "$temporary_file"
        else
            tr -d '-' < /proc/sys/kernel/random/uuid | cut -c1-20 > "$temporary_file"
        fi
        mv "$temporary_file" "$secret_file"
    fi
}

jwt_secret_file="$secrets_dir/jwt-secret"
admin_password_file="$secrets_dir/bootstrap-admin-password"
demo_password_file="$secrets_dir/bootstrap-demo-password"
bootstrap_marker_file="$secrets_dir/bootstrap-applied"

if [ -z "${JWT_SECRET:-}" ]; then
    ensure_secret "$jwt_secret_file" jwt
    JWT_SECRET=$(sed -n '1p' "$jwt_secret_file")
    export JWT_SECRET
fi

if [ -z "${ADMIN_BOOTSTRAP_PASSWORD:-}" ]; then
    ensure_secret "$admin_password_file" password
    ADMIN_BOOTSTRAP_PASSWORD=$(sed -n '1p' "$admin_password_file")
    export ADMIN_BOOTSTRAP_PASSWORD
fi

if [ -z "${DEMO_BOOTSTRAP_PASSWORD:-}" ]; then
    ensure_secret "$demo_password_file" password
    DEMO_BOOTSTRAP_PASSWORD=$(sed -n '1p' "$demo_password_file")
    export DEMO_BOOTSTRAP_PASSWORD
fi

if [ ! -f "$bootstrap_marker_file" ]; then
    APPLY_BOOTSTRAP_CREDENTIALS=true
else
    APPLY_BOOTSTRAP_CREDENTIALS=false
fi
export APPLY_BOOTSTRAP_CREDENTIALS

exec "$@"
