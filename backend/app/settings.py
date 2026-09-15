import os
import sys
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'dev-secret')
DEBUG = os.getenv('DJANGO_DEBUG', 'true') == 'true'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'rest_framework',
    'app.apps.users',
    'app.apps.properties',
    'app.apps.booking',
    'app.apps.contract',
    'app.apps.repair',
    'app.apps.facility',
]

MIDDLEWARE = ['django.middleware.common.CommonMiddleware', 'app.middleware.request_log.RequestLogMiddleware']
ROOT_URLCONF = 'app.urls'
DATABASES = {'default': dj_database_url.config(default=os.getenv('DATABASE_URL', 'sqlite:///db.sqlite3'))}
# SQLite 下设置锁等待，便于并发测试；测试使用文件库以便跨线程共享数据
if DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3':
    DATABASES['default']['OPTIONS'] = {'timeout': 30}
    if 'test' in sys.argv:
        DATABASES['default']['TEST'] = {'NAME': '/tmp/rentfind_facility_test.sqlite3'}

    # 开启 WAL：多个写事务排队等待而不是立即 database is locked
    from django.db.backends.signals import connection_created

    def _enable_sqlite_wal(sender, connection, **kwargs):
        if connection.vendor == 'sqlite':
            with connection.cursor() as cursor:
                cursor.execute('PRAGMA journal_mode=WAL')
                cursor.execute('PRAGMA busy_timeout=30000')

    connection_created.connect(_enable_sqlite_wal)
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
USE_TZ = True
TIME_ZONE = 'Asia/Shanghai'
LANGUAGE_CODE = 'zh-hans'
MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_URL = '/media/'
REST_FRAMEWORK = {'EXCEPTION_HANDLER': 'app.utils.exception_handler.standard_exception_handler'}
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'root': {'handlers': ['console'], 'level': 'INFO'},
}
