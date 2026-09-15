from rest_framework import status


class ApiError(Exception):
    """业务异常基类：携带错误码与 HTTP 状态码，由统一异常处理器转成标准响应。"""

    http_status = status.HTTP_400_BAD_REQUEST

    def __init__(self, code: str, message: str | None = None):
        from app.constants.errors import ERROR_CODES
        self.code = code
        self.message = message or ERROR_CODES.get(code, code)
        super().__init__(self.message)


class NotFoundError(ApiError):
    http_status = status.HTTP_404_NOT_FOUND


class ConflictError(ApiError):
    http_status = status.HTTP_409_CONFLICT


class PermissionError(ApiError):
    http_status = status.HTTP_403_FORBIDDEN
