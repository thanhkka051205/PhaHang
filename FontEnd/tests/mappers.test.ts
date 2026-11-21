import { describe, it, expect } from 'vitest';
import {
  mapBackendStatusToFrontend,
  mapFrontendStatusToBackend,
  ORDER_STATUS_MAP
} from '../src/api/mappers';

describe('Order Status Mappers', () => {
  it('Chuyển đổi từ chuỗi tiếng Việt của Backend Spring Boot sang Enum Frontend', () => {
    expect(mapBackendStatusToFrontend('Chờ xác nhận')).toBe('PENDING');
    expect(mapBackendStatusToFrontend('Đã xác nhận')).toBe('CONFIRMED');
    expect(mapBackendStatusToFrontend('Đang giao')).toBe('SHIPPING');
    expect(mapBackendStatusToFrontend('Hoàn thành')).toBe('COMPLETED');
    expect(mapBackendStatusToFrontend('Đã hủy')).toBe('CANCELLED');
  });

  it('Chuyển đổi ngược lại từ Enum Frontend sang chuỗi hiển thị tiếng Việt', () => {
    expect(mapFrontendStatusToBackend('PENDING')).toBe('Chờ xác nhận');
    expect(mapFrontendStatusToBackend('CONFIRMED')).toBe('Đã xác nhận');
    expect(mapFrontendStatusToBackend('SHIPPING')).toBe('Đang giao');
    expect(mapFrontendStatusToBackend('COMPLETED')).toBe('Hoàn thành');
    expect(mapFrontendStatusToBackend('CANCELLED')).toBe('Đã hủy');
  });

  it('ORDER_STATUS_MAP có đủ cấu hình màu sắc SaaS cho cả 5 trạng thái', () => {
    const statuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'] as const;
    statuses.forEach(s => {
      expect(ORDER_STATUS_MAP[s]).toBeDefined();
      expect(ORDER_STATUS_MAP[s].text).toBeTruthy();
      expect(ORDER_STATUS_MAP[s].bgClass).toBeTruthy();
    });
  });
});
