# 错误码统一定义：错误码 -> 中文错误信息
ERROR_CODES = {
    'PROPERTY_NOT_FOUND': '房源不存在',
    'BOOKING_CONFLICT': '看房时间冲突',
    'REPAIR_INVALID': '报修信息不合法',

    # 共享设施预约与核销
    'FACILITY_NOT_FOUND': '设施不存在或已停用',
    'FACILITY_NAME_DUPLICATE': '设施名称已存在',
    'SLOT_NOT_FOUND': '开放时段不存在',
    'SLOT_CLOSED': '该时段未开放预约',
    'SLOT_FULL': '该时段已被预约',
    'SLOT_OVERLAP': '与同一设施已有开放时段重叠',
    'SLOT_TIME_INVALID': '时段时间不合法，结束时间必须晚于开始时间',
    'FACILITY_IN_USE': '设施存在有效预约，无法删除',
    'RESERVATION_NOT_FOUND': '预约不存在',
    'VOUCHER_NOT_FOUND': '核销凭证不存在',
    'VOUCHER_ALREADY_USED': '凭证已核销，请勿重复核销',
    'RESERVATION_CANCELLED': '预约已取消，无法核销',
    'RESERVATION_NO_SHOW': '预约已标记爽约，无法核销',
    'RESERVATION_ALREADY_FINISHED': '使用已结束，无法重复操作',
    'RESERVATION_NOT_CHECKED_IN': '预约尚未核销，无法结束使用',
    'RESERVATION_NOT_STARTED': '还未到核销时间，请在开场前 15 分钟内核销',
    'ALREADY_CANCELLED': '预约已取消，无需重复操作',
    'ALREADY_NO_SHOW': '该预约已标记爽约',
    'NOT_ACTIVE_RESERVATION': '当前状态下无法执行该操作',
    'PERMISSION_DENIED': '仅物业人员可执行该操作',
}
