import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Onboarding1Screen from '../app/Onboarding1Screen';

// Mock expo-router để kiểm tra điều hướng
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock asset (ảnh) để tránh lỗi khi require file tĩnh trong môi trường test
jest.mock('@/assets/images/onboarding1.png', () => 'onboarding1-mock');

describe('OnboardingScreen (Onboarding1Screen)', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Test 1: Render ──────────────────────────────────────────────────────────
  it('1. Render thành công — hiển thị đúng tiêu đề và mô tả', () => {
    const { getByText } = render(<Onboarding1Screen />);

    // Tiêu đề chính
    expect(getByText('Đặt lịch thu gom dễ dàng')).toBeTruthy();

    // Kiểm tra nút Bỏ qua và Tiếp tục có xuất hiện
    expect(getByText('Bỏ qua')).toBeTruthy();
    expect(getByText('Tiếp tục')).toBeTruthy();
  });

  // ── Test 2: Nội dung mô tả ──────────────────────────────────────────────────
  it('2. Hiển thị đúng đoạn mô tả về dịch vụ thu gom', () => {
    const { getByText } = render(<Onboarding1Screen />);

    // Kiểm tra text mô tả (regex cho phép xuống dòng)
    expect(
      getByText(/Nhân viên của chúng tôi sẽ đến thu mua tận nhà/)
    ).toBeTruthy();
  });

  // ── Test 3: Bấm nút "Bỏ qua" → điều hướng sang LoginScreen ────────────────
  it('3. Bấm nút "Bỏ qua" → gọi router.push("/LoginScreen")', () => {
    const { getByText } = render(<Onboarding1Screen />);

    fireEvent.press(getByText('Bỏ qua'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/LoginScreen');
  });

  // ── Test 4: Bấm nút "Tiếp tục" → điều hướng sang Onboarding2Screen ────────
  it('4. Bấm nút "Tiếp tục" → gọi router.push("/Onboarding2Screen")', () => {
    const { getByText } = render(<Onboarding1Screen />);

    fireEvent.press(getByText('Tiếp tục'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/Onboarding2Screen');
  });
});
