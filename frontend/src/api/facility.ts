import type { ApiEnvelope, Facility, FacilitySlot, Reservation } from '../types/facility';
import { ApiBusinessError } from '../types/facility';

const API_BASE = '/api';

/** 角色：租客无需角色头；物业操作带 X-User-Role: property */
function headers(role: 'tenant' | 'property' = 'tenant'): Record<string, string> {
  const base: Record<string, string> = { 'Content-Type': 'application/json' };
  if (role === 'property') base['X-User-Role'] = 'property';
  return base;
}

async function request<T>(path: string, options: RequestInit & { role?: 'tenant' | 'property' } = {}): Promise<T> {
  const { role = 'tenant', ...init } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    headers: headers(role),
    ...init,
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new ApiBusinessError(String(payload.code ?? response.status), payload.error ?? '请求失败');
  }
  return payload.data;
}

function query(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

/* -------------------------------- 设施 -------------------------------- */

export function listFacilities(includeClosed = false) {
  // 含停用设施属于维护视角，需要物业角色
  return request<Facility[]>(`/facilities/${query({ includeClosed: includeClosed ? true : undefined })}`, {
    role: includeClosed ? 'property' : 'tenant',
  });
}

export function createFacility(body: { name: string; location?: string; description?: string }) {
  return request<Facility>('/facilities/', { method: 'POST', body: JSON.stringify(body), role: 'property' });
}

export function updateFacility(id: number, body: Partial<Pick<Facility, 'name' | 'location' | 'description' | 'status'>>) {
  return request<Facility>(`/facilities/${id}/`, { method: 'PATCH', body: JSON.stringify(body), role: 'property' });
}

export function deleteFacility(id: number) {
  return request<{ id: number; deleted: boolean }>(`/facilities/${id}/`, {
    method: 'DELETE',
    role: 'property',
  });
}

/* -------------------------------- 时段 -------------------------------- */

export function listSlots(
  params: { facilityId?: number; date?: string; includeDisabled?: boolean } = {},
) {
  const { includeDisabled, ...rest } = params;
  // includeDisabled 是维护参数，需要物业角色
  return request<FacilitySlot[]>(
    `/slots/${query({ ...rest, includeDisabled: includeDisabled ? true : undefined })}`,
    { role: includeDisabled ? 'property' : 'tenant' },
  );
}

export function createSlot(body: { facilityId: number; date: string; startTime: string; endTime: string }) {
  return request<FacilitySlot>('/slots/', { method: 'POST', body: JSON.stringify(body), role: 'property' });
}

export function closeSlot(id: number) {
  return request<{ id: number; isOpen: boolean }>(`/slots/${id}/close/`, { method: 'POST', role: 'property' });
}

/* -------------------------------- 预约 -------------------------------- */

export function listReservations(params: { tenantPhone?: string; status?: string; facilityId?: number; date?: string } = {}) {
  return request<Reservation[]>(`/reservations/${query(params)}`);
}

export function createReservation(body: { slotId: number; tenantName: string; tenantPhone: string }) {
  return request<Reservation>('/reservations/', { method: 'POST', body: JSON.stringify(body) });
}

export function cancelReservation(id: number, tenantPhone: string) {
  return request<Reservation>(`/reservations/${id}/cancel/`, {
    method: 'POST',
    body: JSON.stringify({ tenantPhone }),
  });
}

export function markNoShow(id: number) {
  return request<Reservation>(`/reservations/${id}/no-show/`, { method: 'POST', role: 'property' });
}

/* -------------------------------- 核销 -------------------------------- */

export function checkIn(voucherCode: string) {
  return request<Reservation>('/check-in/', {
    method: 'POST',
    body: JSON.stringify({ voucherCode }),
    role: 'property',
  });
}

export function finishUse(voucherCode: string) {
  return request<Reservation>('/finish-use/', {
    method: 'POST',
    body: JSON.stringify({ voucherCode }),
    role: 'property',
  });
}
