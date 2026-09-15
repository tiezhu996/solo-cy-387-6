export interface Facility {
  id: number;
  name: string;
  location: string;
  description: string;
  status: '开放' | '停用';
  createdAt: string;
}

export interface FacilitySlot {
  id: number;
  facilityId: number;
  facilityName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: '可预约' | '已约满' | '已结束';
  booked: boolean;
  expired: boolean;
  reservationId: number | null;
}

export type ReservationStatus = '待核销' | '已取消' | '已核销' | '已完成' | '爽约';

export interface Reservation {
  id: number;
  facilityId: number;
  facilityName: string;
  slotId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  voucherCode: string;
  tenantName: string;
  tenantPhone: string;
  createdAt: string | null;
  cancelledAt: string | null;
  checkedInAt: string | null;
  finishedAt: string | null;
  noShowAt: string | null;
}

/** 后端统一响应包络 */
export interface ApiEnvelope<T> {
  success: boolean;
  code: number | string;
  data: T;
  error: string | null;
}

export class ApiBusinessError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiBusinessError';
    this.code = code;
  }
}
