/**
 * HomeScreen.test.tsx
 * Test cho MyOrdersScreen — màn hình chính kết nối Supabase thật.
 *
 * Chiến lược: mock Supabase client nhưng trả về đúng cấu trúc &
 * dữ liệu khớp với 3 file SQL mẫu (users / user_addresses / scrap_categories).
 *
 * User được test: f81d4fae-7dec-11d0-a765-00a0c91e8ff6 (Trần Văn Mạnh)
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MyOrdersScreen from '../app/MyOrdersScreen';

// ── 1. Mock expo-router ───────────────────────────────────────────────────────
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

// ── 2. Mock react-native-svg (không chạy được trong Node.js test) ────────────
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

// ── 3. Mock Supabase — trả về đúng data từ DB thật ───────────────────────────
//
//  Bảng users:
//    id = f81d4fae-7dec-11d0-a765-00a0c91e8ff6 → Trần Văn Mạnh, collector
//
//  Bảng user_addresses (is_default = true):
//    789 Kha Vạn Cân, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh
//
//  Bảng scrap_categories (display_order 1–4):
//    1 → Nhựa & Giấy vụn  | Gói/kg | 65.000 – 90.000
//    2 → Đồng phế liệu    | kg     | 180.000 – 380.000
//    3 → Sắt thép vụn     | kg     | 10.000 – 25.000
//    4 → Nhôm các loại    | kg     | 35.000 – 85.000
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'f81d4fae-7dec-11d0-a765-00a0c91e8ff6',
  full_name: 'Trần Văn Mạnh',
  phone_number: '0912345678',
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
  { id: '3743b26e-3eed-4944-a459-a563ba46fef9', name: 'Nhựa & Giấy vụn', unit: 'Gói/kg', price_min: '65000.00', price_max: '90000.00', display_order: 1 },
  { id: '8124f3e3-84a7-4428-8c01-c475fd30a8a2', name: 'Đồng phế liệu',   unit: 'kg',     price_min: '180000.00', price_max: '380000.00', display_order: 2 },
  { id: '540c7904-3eed-4fa5-a27a-353c839562a5', name: 'Sắt thép vụn',    unit: 'kg',     price_min: '10000.00',  price_max: '25000.00',  display_order: 3 },
  { id: '0594cf1d-f95e-472c-bdb9-3be204b7f1c2', name: 'Nhôm các loại',   unit: 'kg',     price_min: '35000.00',  price_max: '85000.00',  display_order: 4 },
];

// Builder tạo query chain giả theo từng bảng
const buildChain = (table: string) => {
  const chain: Record<string, jest.Mock> = {};

  chain.select  = jest.fn(() => chain);
  chain.eq      = jest.fn(() => chain);
  chain.gte     = jest.fn(() => chain);
  chain.lte     = jest.fn(() => chain);
  chain.order   = jest.fn(() => chain);
  chain.limit   = jest.fn(() => chain);

  chain.single  = jest.fn(() => {
    if (table === 'users') {
      return Promise.resolve({ data: MOCK_USER, error: null });
    }
    if (table === 'user_addresses') {
      return Promise.resolve({ data: MOCK_ADDRESS, error: null });
    }
    return Promise.resolve({ data: null, error: { message: 'not found' } });
  });

  // Promise-like cho query trả về mảng (scrap_categories)
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

  // ── Test 1: Render không crash, nội dung tĩnh hiển thị đúng ─────────────
  it('1. Render thành công — nội dung tĩnh xuất hiện, không crash', async () => {
    let component: ReturnType<typeof render>;

    await act(async () => {
      component = render(<MyOrdersScreen />);
    });

    // Các text cố định trên UI, không phụ thuộc data fetch
    expect(component!.getByText('Xin chào,')).toBeTruthy();
    expect(component!.getByText('Vị trí thu gom hiện tại')).toBeTruthy();
    expect(component!.getByText('Bảng giá tham khảo')).toBeTruthy();
    expect(component!.getByText('Thu Gom Phế\nLiệu Tận Nơi')).toBeTruthy();
    expect(component!.getByText('Đặt Lịch Ngay')).toBeTruthy();
  });

  // ── Test 2: Tên người dùng từ bảng `users` hiển thị đúng ───────────────
  it('2. Hiển thị đúng tên "Trần Văn Mạnh" từ bảng users (id = f81d4fae...8ff6)', async () => {
    let component: ReturnType<typeof render>;

    await act(async () => {
      component = render(<MyOrdersScreen />);
    });

    await waitFor(() => {
      expect(component!.getByText('Trần Văn Mạnh')).toBeTruthy();
    });
  });

  // ── Test 3: Địa chỉ từ bảng `user_addresses` (is_default = true) ────────
  it('3. Hiển thị đúng địa chỉ mặc định từ bảng user_addresses', async () => {
    let component: ReturnType<typeof render>;

    await act(async () => {
      component = render(<MyOrdersScreen />);
    });

    await waitFor(() => {
      // Địa chỉ được ghép: address_line, ward, district, city
      expect(
        component!.getByText(
          '789 Kha Vạn Cân, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh'
        )
      ).toBeTruthy();
    });
  });

  // ── Test 4: 4 danh mục (display_order 1–4) từ scrap_categories ──────────
  it('4. Hiển thị 4 danh mục nguyên liệu (display_order 1–4) từ scrap_categories', async () => {
    let component: ReturnType<typeof render>;

    await act(async () => {
      component = render(<MyOrdersScreen />);
    });

    await waitFor(() => {
      expect(component!.getByText('Nhựa & Giấy vụn')).toBeTruthy(); // order 1
      expect(component!.getByText('Đồng phế liệu')).toBeTruthy();   // order 2
      expect(component!.getByText('Sắt thép vụn')).toBeTruthy();    // order 3
      expect(component!.getByText('Nhôm các loại')).toBeTruthy();   // order 4
    });
  });

  // ── Test 5: Bấm "Đặt Lịch Ngay" không crash ────────────────────────────
  it('5. Bấm nút "Đặt Lịch Ngay" không ném lỗi', async () => {
    let component: ReturnType<typeof render>;

    await act(async () => {
      component = render(<MyOrdersScreen />);
    });

    const ctaBtn = component!.getByText('Đặt Lịch Ngay');
    expect(() => fireEvent.press(ctaBtn)).not.toThrow();
  });

  // ── Test 6: Bottom nav render đủ 3 tab và có thể bấm ───────────────────
  it('6. Bottom nav có đủ 3 tab — Trang chủ, Lịch sử, Cá nhân và không crash khi bấm', async () => {
    let component: ReturnType<typeof render>;

    await act(async () => {
      component = render(<MyOrdersScreen />);
    });

    const home    = component!.getByText('Trang chủ');
    const history = component!.getByText('Lịch sử');
    const profile = component!.getByText('Cá nhân');

    expect(home).toBeTruthy();
    expect(history).toBeTruthy();
    expect(profile).toBeTruthy();

    // Bấm mỗi tab không crash
    expect(() => fireEvent.press(history)).not.toThrow();
    expect(() => fireEvent.press(profile)).not.toThrow();
  });
});
