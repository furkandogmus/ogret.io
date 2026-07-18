#!/bin/sh
set -eu

secrets_dir=/app/secrets
admin_password=$(sed -n '1p' "$secrets_dir/bootstrap-admin-password")
demo_password=$(sed -n '1p' "$secrets_dir/bootstrap-demo-password")

printf 'Admin    admin@ogret.io   %s\n' "$admin_password"
printf 'Öğretmen zeynep@ogret.io  %s\n' "$demo_password"
printf 'Öğrenci  ahmet@ogret.io   %s\n' "$demo_password"
