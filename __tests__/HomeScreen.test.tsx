/**
 * HomeScreen.test.tsx
 * Test cho MyOrdersScreen — màn hình chính kết nối Supabase thật.
 * Mock Supabase client với data khớp 100% với file SQL mẫu.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MyOrdersScreen from '../app/MyOrdersScreen';

// ── 1. Mock expo-router ───────────────────────────────────────────────────────
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

// ── 2. Mock react-native-svg ─────────────────────────────────────────────────
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    __esModule: true,
    default:  ({ children }: any) => <>{children}</>,
    Svg:      ({ children }: any) => <>{children}</>,
    Path:     () => null,
    Circle:   () => null,
    Rect:     () => null,
    G:        ({ children }: any) => <>{children}</>,
    Defs:     ({ children }: any) => <>{children}</>,
    ClipPath: ({ children }: any) => <>{children}</>,
  };
});

// ── 3. Mock Supabase — data từ 3 file SQL thật ───────────────────────────────
const MOCK_USER = {
  id: 'f81d4fae-7dec-11d0-a765-00a0c91e8ff6',
  full_name: 'Trần Văn Mạnh',
  role: 'collector',
};

const MOCK_ADDRESS = {
  id: 'd86ba82c-a34c-4af4-a8ec-6cb69a3b70f3',
  user_id: 'f81d4fae-7dec-11d0-a765-00a0c91e8ff6',
  address_line: '789 Kha Vạn Cân',
  ward: 'Phường Linh Trung',
  district: 'TP. Thủ Đức',
  city: 'TP. Hồ Chí Minh',
  is_default: true,
};

const MOCK_CATEGORIES = [
  { id: '3743b26e', name: 'Nhựa & Giấy vụn', unit: 'Gói/kg', price_min: '65000.00',  price_max: '90000.00',  display_order: 1 },
  { id: '8124f3e3', name: 'Đồng phế liệu',   unit: 'kg',     price_min: '180000.00', price_max: '380000.00', display_order: 2 },
  { id: '540c7904', name: 'Sắt thép vụn',    unit: 'kg',     price_min: '10000.00',  price_max: '25000.00',  display_order: 3 },
  { id: '0594cf1d', name: 'Nhôm các loại',   unit: 'kg',     price_min: '35000.00',  price_max: '85000.00',  display_order: 4 },
];

const buildChain = (table: string) => {
  const chain: any = {};
  chain.select = jest.fn(() => chain);
  chain.eq     = jest.fn(() => chain);
  chain.gte    = jest.fn(() => chain);
  chain.lte    = jest.fn(() => chain);
  chain.order  = jest.fn(() => chain);
  chain.limit  = jest.fn(() => chain);

  chain.single = jest.fn(() => {
    if (table === 'users')          return Promise.resolve({ data: MOCK_USER,    error: null });
    if (table === 'user_addresses') return Promise.resolve({ data: MOCK_ADDRESS, error: null });
    return Promise.resolve({ data: null, error: { message: 'not found' } });
  });

  // Promise-like cho query trả về array (scrap_categories)
  chain.then = jest.fn((cb: any) =>
    Promise.resolve({ data: MOCK_CATEGORIES, error: null }).then(cb)
  );

  return chain;
};

jest.mock('@/src/api', () => ({
  supabase: {
    from: jest.fn((table: string) => buildChain(table)),
  },
}));

// ─────────────────────────────────────────────────────────────────────────────

describe('HomeScreen (MyOrdersScreen) — Supabase integration', () => {

  // ── Test 1: Render không crash, nội dung tĩnh xuất hiện ─────────────────
  it('1. Render thành công — nội dung tĩnh xuất hiện, không crash', () => {
    const { getByText } = render(<MyOrdersScreen />);

    expect(getByText('Xin chào,')).toBeTruthy();
    expect(getByText('Vị trí thu gom hiện tại')).toBeTruthy();
    expect(getByText('Bảng giá tham khảo')).toBeTruthy();
    expect(getByText('Đặt Lịch Ngay')).toBeTruthy();
  });

  // ── Test 2: Tên người dùng từ bảng users ────────────────────────────────
  it('2. Hiển thị đúng tên "Trần Văn Mạnh" từ bảng users', async () => {
    const { getByText } = render(<MyOrdersScreen />);

    await waitFor(() => {
      expect(getByText('Trần Văn Mạnh')).toBeTruthy();
    });
  });

  // ── Test 3: Địa chỉ từ bảng user_addresses ──────────────────────────────
  it('3. Hiển thị đúng địa chỉ mặc định từ bảng user_addresses', async () => {
    const { getByText } = render(<MyOrdersScreen />);

    await waitFor(() => {
      expect(
        getByText('789 Kha Vạn Cân, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh')
      ).toBeTruthy();
    });
  });

  // ── Test 4: 4 danh mục từ scrap_categories ──────────────────────────────
  it('4. Hiển thị 4 danh mục nguyên liệu (display_order 1–4) từ scrap_categories', async () => {
    const { getByText } = render(<MyOrdersScreen />);

    await waitFor(() => {
      expect(getByText('Nhựa & Giấy vụn')).toBeTruthy();
      expect(getByText('Đồng phế liệu')).toBeTruthy();
      expect(getByText('Sắt thép vụn')).toBeTruthy();
      expect(getByText('Nhôm các loại')).toBeTruthy();
    });
  });

  // ── Test 5: Bấm CTA không crash ─────────────────────────────────────────
  it('5. Bấm nút "Đặt Lịch Ngay" không ném lỗi', () => {
    const { getByText } = render(<MyOrdersScreen />);

    expect(() => fireEvent.press(getByText('Đặt Lịch Ngay'))).not.toThrow();
  });

  // ── Test 6: Bottom nav đủ 3 tab ─────────────────────────────────────────
  it('6. Bottom nav có đủ 3 tab và không crash khi bấm', () => {
    const { getByText } = render(<MyOrdersScreen />);

    expect(getByText('Trang chủ')).toBeTruthy();
    expect(getByText('Lịch sử')).toBeTruthy();
    expect(getByText('Cá nhân')).toBeTruthy();

    expect(() => fireEvent.press(getByText('Lịch sử'))).not.toThrow();
    expect(() => fireEvent.press(getByText('Cá nhân'))).not.toThrow();
  });
});
