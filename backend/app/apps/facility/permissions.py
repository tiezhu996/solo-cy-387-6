from functools import wraps

from app.utils.errors import PermissionError

PROPERTY_ROLE_HEADERS = ('property', '物业人员')


def require_property(view_method):
    """物业专属操作的轻量角色校验（完整鉴权由 JWT 接入后替换）。"""

    @wraps(view_method)
    def _wrapped(self, request, *args, **kwargs):
        role = request.headers.get('X-User-Role', '')
        if role not in PROPERTY_ROLE_HEADERS:
            raise PermissionError('PERMISSION_DENIED')
        return view_method(self, request, *args, **kwargs)

    return _wrapped
