from functools import wraps

from app.utils.errors import PermissionError

PROPERTY_ROLE_HEADERS = ('property', '物业人员')


def is_property(request) -> bool:
    return request.headers.get('X-User-Role', '') in PROPERTY_ROLE_HEADERS


def assert_property_role(request) -> None:
    """物业专属操作的轻量角色校验（完整鉴权由 JWT 接入后替换）。"""
    if not is_property(request):
        raise PermissionError('PERMISSION_DENIED')


def require_property(view_method):
    @wraps(view_method)
    def _wrapped(self, request, *args, **kwargs):
        assert_property_role(request)
        return view_method(self, request, *args, **kwargs)

    return _wrapped
