import { ApiBusinessError } from '../types/facility';
const API_BASE = '/api';
/** 角色：租客无需角色头；物业操作带 X-User-Role: property */
function headers(role = 'tenant') {
    const base = { 'Content-Type': 'application/json' };
    if (role === 'property')
        base['X-User-Role'] = 'property';
    return base;
}
async function request(path, options = {}) {
    const { role = 'tenant', ...init } = options;
    const response = await fetch(`${API_BASE}${path}`, {
        headers: headers(role),
        ...init,
    });
    const payload = (await response.json());
    if (!response.ok || !payload.success) {
        throw new ApiBusinessError(String(payload.code ?? response.status), payload.error ?? '请求失败');
    }
    return payload.data;
}
function query(params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '')
            search.append(key, String(value));
    });
    const text = search.toString();
    return text ? `?${text}` : '';
}
/* -------------------------------- 设施 -------------------------------- */
export function listFacilities(includeClosed = true) {
    return request(`/facilities/${query({ includeClosed })}`);
}
export function createFacility(body) {
    return request('/facilities/', { method: 'POST', body: JSON.stringify(body), role: 'property' });
}
export function updateFacility(id, body) {
    return request(`/facilities/${id}/`, { method: 'PATCH', body: JSON.stringify(body), role: 'property' });
}
export function deleteFacility(id) {
    return request(`/facilities/${id}/`, {
        method: 'DELETE',
        role: 'property',
    });
}
/* -------------------------------- 时段 -------------------------------- */
export function listSlots(params = {}) {
    return request(`/slots/${query(params)}`);
}
export function createSlot(body) {
    return request('/slots/', { method: 'POST', body: JSON.stringify(body), role: 'property' });
}
export function closeSlot(id) {
    return request(`/slots/${id}/close/`, { method: 'POST', role: 'property' });
}
/* -------------------------------- 预约 -------------------------------- */
export function listReservations(params = {}) {
    return request(`/reservations/${query(params)}`);
}
export function createReservation(body) {
    return request('/reservations/', { method: 'POST', body: JSON.stringify(body) });
}
export function cancelReservation(id, tenantPhone) {
    return request(`/reservations/${id}/cancel/`, {
        method: 'POST',
        body: JSON.stringify({ tenantPhone }),
    });
}
export function markNoShow(id) {
    return request(`/reservations/${id}/no-show/`, { method: 'POST', role: 'property' });
}
/* -------------------------------- 核销 -------------------------------- */
export function checkIn(voucherCode) {
    return request('/check-in/', {
        method: 'POST',
        body: JSON.stringify({ voucherCode }),
        role: 'property',
    });
}
export function finishUse(voucherCode) {
    return request('/finish-use/', {
        method: 'POST',
        body: JSON.stringify({ voucherCode }),
        role: 'property',
    });
}
