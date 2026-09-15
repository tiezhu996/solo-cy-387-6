#!/bin/sh
set -e

echo "[entrypoint] 应用数据库迁移..."
python manage.py migrate --noinput

echo "[entrypoint] 初始化共享设施演示数据（幂等）..."
python manage.py seed_facilities || true

echo "[entrypoint] 启动 gunicorn..."
exec gunicorn app.wsgi:application --bind 0.0.0.0:8000
