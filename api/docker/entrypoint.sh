#!/bin/sh
set -e

cd /var/www/html

# Make the uploaded images reachable and run the database migrations
php artisan storage:link --force || true
php artisan migrate --force

# Apache runs as www-data and must be able to write logs and uploads
chown -R www-data:www-data storage bootstrap/cache

exec "$@"