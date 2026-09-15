from rest_framework.response import Response


def ok(data=None, status_code=200):
    """统一成功响应格式。"""
    return Response({'success': True, 'code': 0, 'data': data, 'error': None}, status=status_code)
