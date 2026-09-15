from rest_framework.views import exception_handler

from app.utils.errors import ApiError


def _format(payload):
    """把 DRF 校验错误统一收敛成字符串。"""
    if isinstance(payload, dict):
        for field, detail in payload.items():
            return f'{field}: {_format(detail)}'
    if isinstance(payload, (list, tuple)):
        return _format(payload[0]) if payload else '参数不合法'
    return str(payload)


def standard_exception_handler(exc, context):
    # 业务异常：统一标准格式，附带明确错误码
    if isinstance(exc, ApiError):
        from rest_framework.response import Response
        return Response(
            {'success': False, 'code': exc.code, 'data': None, 'error': exc.message},
            status=exc.http_status,
        )

    response = exception_handler(exc, context)
    if response is None:
        return response
    message = _format(response.data)
    response.data = {'success': False, 'code': response.status_code, 'data': None, 'error': message}
    return response
