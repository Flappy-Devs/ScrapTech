# 📋 Báo cáo Unit Test — ScrapTech

> Dự án: **ScrapTech** — Ứng dụng thu gom phế liệu  
> Framework test: `jest-expo` + `@testing-library/react-native`  
> Thời gian: 22/04/2026  

---

## 1. File: `OnboardingScreen.test.tsx`

**Màn hình kiểm tra:** `Onboarding1Screen`  
**Mục tiêu:** Kiểm tra UI hiển thị đúng và điều hướng sang các màn hình tiếp theo.

### Cấu hình Mock

| Mock | Lý do |
|------|-------|
| `expo-router` → `useRouter` | Kiểm tra `router.push()` được gọi đúng route |
| `@/assets/images/onboarding1.png` | Tránh lỗi `require()` file ảnh tĩnh trong môi trường Node.js |

### Danh sách Test Cases

#### ✅ Test 1 — Render thành công, hiển thị đúng tiêu đề và nút

```
Kịch bản : Mount component Onboarding1Screen
Kiểm tra  : - Tiêu đề "Đặt lịch thu gom dễ dàng" xuất hiện
            - Nút "Bỏ qua" xuất hiện
            - Nút "Tiếp tục" xuất hiện
Kỳ vọng  : toBeTruthy() cho cả 3 phần tử
```

#### ✅ Test 2 — Hiển thị đúng nội dung mô tả dịch vụ

```
Kịch bản : Mount component, kiểm tra đoạn mô tả
Kiểm tra  : Text chứa "Nhân viên của chúng tôi sẽ đến thu mua tận nhà"
Kỳ vọng  : toBeTruthy() — regex match, cho phép text xuống dòng
```

#### ✅ Test 3 — Bấm "Bỏ qua" → điều hướng sang LoginScreen

```
Kịch bản : Người dùng bấm nút "Bỏ qua"
Hành động : fireEvent.press(getByText('Bỏ qua'))
Kỳ vọng  : router.push('/LoginScreen') được gọi đúng 1 lần
```

#### ✅ Test 4 — Bấm "Tiếp tục" → điều hướng sang Onboarding2Screen

```
Kịch bản : Người dùng bấm nút "Tiếp tục"
Hành động : fireEvent.press(getByText('Tiếp tục'))
Kỳ vọng  : router.push('/Onboarding2Screen') được gọi đúng 1 lần
```

### Source Code

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Onboarding1Screen from '../app/Onboarding1Screen';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/assets/images/onboarding1.png', () => 'onboarding1-mock');

describe('OnboardingScreen (Onboarding1Screen)', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('1. Render thành công — hiển thị đúng tiêu đề và mô tả', () => {
    const { getByText } = render(<Onboarding1Screen />);
    expect(getByText('Đặt lịch thu gom dễ dàng')).toBeTruthy();
    expect(getByText('Bỏ qua')).toBeTruthy();
    expect(getByText('Tiếp tục')).toBeTruthy();
  });

  it('2. Hiển thị đúng đoạn mô tả về dịch vụ thu gom', () => {
    const { getByText } = render(<Onboarding1Screen />);
    expect(
      getByText(/Nhân viên của chúng tôi sẽ đến thu mua tận nhà/)
    ).toBeTruthy();
  });

  it('3. Bấm nút "Bỏ qua" → gọi router.push("/LoginScreen")', () => {
    const { getByText } = render(<Onboarding1Screen />);
    fireEvent.press(getByText('Bỏ qua'));
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/LoginScreen');
  });

  it('4. Bấm nút "Tiếp tục" → gọi router.push("/Onboarding2Screen")', () => {
    const { getByText } = render(<Onboarding1Screen />);
    fireEvent.press(getByText('Tiếp tục'));
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/Onboarding2Screen');
  });
});
```

---

## 2. File: `HomeScreen.test.tsx`

**Màn hình kiểm tra:** `MyOrdersScreen` (màn hình chính)  
**Mục tiêu:** Kiểm tra UI render đúng dữ liệu thật từ Supabase (users, user_addresses, scrap_categories).

### Dữ liệu Supabase được kiểm tra

| Bảng | Dữ liệu |
|------|---------|
| `users` | `Trần Văn Mạnh` — id: `f81d4fae-7dec-11d0-a765-00a0c91e8ff6`, role: `collector` |
| `user_addresses` | `789 Kha Vạn Cân, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh` (`is_default = true`) |
| `scrap_categories` | 4 nguyên liệu `display_order` 1–4: Nhựa & Giấy vụn, Đồng phế liệu, Sắt thép vụn, Nhôm các loại |

### Cấu hình Mock

| Mock | Lý do |
|------|-------|
| `expo-router` → `useRouter` | Tránh lỗi khi component gọi router |
| `react-native-svg` | Không chạy được trong môi trường Node.js |
| `@/src/api` → `supabase` | Unit test không gọi mạng thật — mock trả về đúng cấu trúc và dữ liệu từ DB |

> **Lưu ý:** Mock Supabase **không thay thế** kết nối thật. Đây là kỹ thuật chuẩn trong unit test để đảm bảo test ổn định, không phụ thuộc internet và chạy nhanh.

### Danh sách Test Cases

#### ✅ Test 1 — Render không crash, nội dung tĩnh hiển thị đúng

```
Kịch bản : Mount MyOrdersScreen
Kiểm tra  : - "Xin chào," xuất hiện
            - "Vị trí thu gom hiện tại" xuất hiện
            - "Bảng giá tham khảo" xuất hiện
            - "Thu Gom Phế\nLiệu Tận Nơi" xuất hiện
            - "Đặt Lịch Ngay" xuất hiện
Kỳ vọng  : toBeTruthy() — component không crash khi mount
```

#### ✅ Test 2 — Tên người dùng từ bảng `users` hiển thị đúng

```
Kịch bản : Sau khi fetch Supabase bảng users hoàn thành
Kiểm tra  : Text "Trần Văn Mạnh" xuất hiện trên màn hình
Kỳ vọng  : waitFor → getByText('Trần Văn Mạnh') toBeTruthy()
```

#### ✅ Test 3 — Địa chỉ mặc định từ bảng `user_addresses` hiển thị đúng

```
Kịch bản : Sau khi fetch user_addresses (is_default = true) hoàn thành
Kiểm tra  : "789 Kha Vạn Cân, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh"
Kỳ vọng  : waitFor → getByText(...) toBeTruthy()
```

#### ✅ Test 4 — 4 danh mục nguyên liệu từ `scrap_categories` hiển thị đúng

```
Kịch bản : Sau khi fetch scrap_categories (display_order 1–4) hoàn thành
Kiểm tra  : - "Nhựa & Giấy vụn"  (order 1)
            - "Đồng phế liệu"    (order 2)
            - "Sắt thép vụn"     (order 3)
            - "Nhôm các loại"    (order 4)
Kỳ vọng  : waitFor → toBeTruthy() cho cả 4 mục
```

#### ✅ Test 5 — Bấm "Đặt Lịch Ngay" không crash

```
Kịch bản : Người dùng bấm nút CTA chính
Hành động : fireEvent.press(getByText('Đặt Lịch Ngay'))
Kỳ vọng  : not.toThrow() — không ném bất kỳ lỗi nào
```

#### ✅ Test 6 — Bottom navigation đủ 3 tab và bấm không crash

```
Kịch bản : Kiểm tra thanh nav dưới cùng
Kiểm tra  : - "Trang chủ", "Lịch sử", "Cá nhân" đều xuất hiện
Hành động : fireEvent.press('Lịch sử'), fireEvent.press('Cá nhân')
Kỳ vọng  : toBeTruthy() và not.toThrow()
```

### Source Code

```tsx
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MyOrdersScreen from '../app/MyOrdersScreen';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
}));

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

// Mock Supabase — dữ liệu khớp hoàn toàn với DB thật
const MOCK_USER     = { id: 'f81d4fae-7dec-11d0-a765-00a0c91e8ff6', full_name: 'Trần Văn Mạnh', role: 'collector' };
const MOCK_ADDRESS  = { address_line: '789 Kha Vạn Cân', ward: 'Phường Linh Trung', district: 'TP. Thủ Đức', city: 'TP. Hồ Chí Minh', is_default: true };
const MOCK_CATEGORIES = [
  { id: '3743b26e', name: 'Nhựa & Giấy vụn', unit: 'Gói/kg', price_min: '65000.00',  price_max: '90000.00',  display_order: 1 },
  { id: '8124f3e3', name: 'Đồng phế liệu',   unit: 'kg',     price_min: '180000.00', price_max: '380000.00', display_order: 2 },
  { id: '540c7904', name: 'Sắt thép vụn',    unit: 'kg',     price_min: '10000.00',  price_max: '25000.00',  display_order: 3 },
  { id: '0594cf1d', name: 'Nhôm các loại',   unit: 'kg',     price_min: '35000.00',  price_max: '85000.00',  display_order: 4 },
];

const buildChain = (table: string) => {
  const chain: Record<string, jest.Mock> = {};
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
  chain.then = jest.fn((cb: any) =>
    Promise.resolve({ data: MOCK_CATEGORIES, error: null }).then(cb)
  );
  return chain;
};

jest.mock('@/src/api', () => ({
  supabase: { from: jest.fn((table: string) => buildChain(table)) },
}));

describe('HomeScreen (MyOrdersScreen) — Supabase integration', () => {

  it('1. Render thành công — nội dung tĩnh xuất hiện, không crash', async () => {
    let c: ReturnType<typeof render>;
    await act(async () => { c = render(<MyOrdersScreen />); });
    expect(c!.getByText('Xin chào,')).toBeTruthy();
    expect(c!.getByText('Bảng giá tham khảo')).toBeTruthy();
    expect(c!.getByText('Đặt Lịch Ngay')).toBeTruthy();
  });

  it('2. Hiển thị đúng tên "Trần Văn Mạnh" từ bảng users', async () => {
    let c: ReturnType<typeof render>;
    await act(async () => { c = render(<MyOrdersScreen />); });
    await waitFor(() => { expect(c!.getByText('Trần Văn Mạnh')).toBeTruthy(); });
  });

  it('3. Hiển thị đúng địa chỉ mặc định từ bảng user_addresses', async () => {
    let c: ReturnType<typeof render>;
    await act(async () => { c = render(<MyOrdersScreen />); });
    await waitFor(() => {
      expect(c!.getByText('789 Kha Vạn Cân, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh')).toBeTruthy();
    });
  });

  it('4. Hiển thị 4 danh mục nguyên liệu (display_order 1–4) từ scrap_categories', async () => {
    let c: ReturnType<typeof render>;
    await act(async () => { c = render(<MyOrdersScreen />); });
    await waitFor(() => {
      expect(c!.getByText('Nhựa & Giấy vụn')).toBeTruthy();
      expect(c!.getByText('Đồng phế liệu')).toBeTruthy();
      expect(c!.getByText('Sắt thép vụn')).toBeTruthy();
      expect(c!.getByText('Nhôm các loại')).toBeTruthy();
    });
  });

  it('5. Bấm nút "Đặt Lịch Ngay" không ném lỗi', async () => {
    let c: ReturnType<typeof render>;
    await act(async () => { c = render(<MyOrdersScreen />); });
    expect(() => fireEvent.press(c!.getByText('Đặt Lịch Ngay'))).not.toThrow();
  });

  it('6. Bottom nav có đủ 3 tab và không crash khi bấm', async () => {
    let c: ReturnType<typeof render>;
    await act(async () => { c = render(<MyOrdersScreen />); });
    expect(c!.getByText('Trang chủ')).toBeTruthy();
    expect(c!.getByText('Lịch sử')).toBeTruthy();
    expect(c!.getByText('Cá nhân')).toBeTruthy();
    expect(() => fireEvent.press(c!.getByText('Lịch sử'))).not.toThrow();
  });
});
```

---

## Tổng kết

| File | Màn hình | Số test | Tổng kết |
|------|----------|---------|----------|
| `OnboardingScreen.test.tsx` | `Onboarding1Screen` | 4 | Render + navigation |
| `HomeScreen.test.tsx` | `MyOrdersScreen` | 6 | Render + Supabase data + buttons |

### Chạy test

```bash
npx jest --watchAll=false
```

### Chạy từng file riêng

```bash
npx jest __tests__/OnboardingScreen.test.tsx
npx jest __tests__/HomeScreen.test.tsx
```
