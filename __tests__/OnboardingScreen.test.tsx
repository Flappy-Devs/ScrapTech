import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Onboarding1Screen from '../app/Onboarding1Screen';
import Onboarding2Screen from '../app/Onboarding2Screen';
import Onboarding3Screen from '../app/Onboarding3Screen';

// Mock expo-router để kiểm tra điều hướng
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock asset (ảnh) để tránh lỗi khi require file tĩnh trong môi trường test
jest.mock('@/assets/images/onboarding1.png', () => 'onboarding1-mock');
jest.mock('@/assets/images/onboarding2.png', () => 'onboarding2-mock');
jest.mock('@/assets/images/onboarding3.png', () => 'onboarding3-mock');

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING 1
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING 2
// ─────────────────────────────────────────────────────────────────────────────
describe('OnboardingScreen (Onboarding2Screen)', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('1. Render thành công — hiển thị tiêu đề "Giá cả minh bạch"', () => {
    const { getByText } = render(<Onboarding2Screen />);
    expect(getByText('Giá cả minh bạch')).toBeTruthy();
    expect(getByText('Bỏ qua')).toBeTruthy();
    expect(getByText('Tiếp tục')).toBeTruthy();
  });

  it('2. Hiển thị đúng đoạn mô tả về giá phế liệu', () => {
    const { getByText } = render(<Onboarding2Screen />);
    expect(
      getByText(/Tra giá phế liệu mới nhất trước khi bán/)
    ).toBeTruthy();
  });

  it('3. Bấm nút "Bỏ qua" → gọi router.push("/LoginScreen")', () => {
    const { getByText } = render(<Onboarding2Screen />);
    fireEvent.press(getByText('Bỏ qua'));
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/LoginScreen');
  });

  it('4. Bấm nút "Tiếp tục" → gọi router.push("/Onboarding3Screen")', () => {
    const { getByText } = render(<Onboarding2Screen />);
    fireEvent.press(getByText('Tiếp tục'));
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/Onboarding3Screen');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING 3
// ─────────────────────────────────────────────────────────────────────────────
describe('OnboardingScreen (Onboarding3Screen)', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('1. Render thành công — hiển thị tiêu đề "Sạch nhà, Xanh đất nước"', () => {
    const { getByText } = render(<Onboarding3Screen />);
    expect(getByText('Sạch nhà, Xanh đất nước')).toBeTruthy();
    expect(getByText('Bỏ qua')).toBeTruthy();
    expect(getByText('Bắt đầu')).toBeTruthy();
  });

  it('2. Hiển thị đúng đoạn mô tả về bảo vệ môi trường', () => {
    const { getByText } = render(<Onboarding3Screen />);
    expect(
      getByText(/Phân loại rác, tái chế phế liệu/)
    ).toBeTruthy();
  });

  it('3. Bấm nút "Bỏ qua" → gọi router.push("/LoginScreen")', () => {
    const { getByText } = render(<Onboarding3Screen />);
    fireEvent.press(getByText('Bỏ qua'));
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/LoginScreen');
  });

  it('4. Bấm nút "Bắt đầu" → gọi router.push("/LoginScreen")', () => {
    const { getByText } = render(<Onboarding3Screen />);
    fireEvent.press(getByText('Bắt đầu'));
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/LoginScreen');
  });
});
