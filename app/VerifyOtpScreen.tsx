import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formattedTimer = `00:${String(timer).padStart(2, "0")}`;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <Path
                d="M10 12L6 8L10 4"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Xác thực số điện thoại</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Nhập mã 4 chữ số được gửi đến điện thoại của bạn
          </Text>

          {/* OTP Fields */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                style={[
                  styles.otpInput,
                  { borderColor: digit ? "#22c55e" : "#c5c6cc" },
                ]}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOtpChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              />
            ))}
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Verify Button */}
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => {
              // Mock auth session to bypass layout protection
              setSession({
                user: { id: "test-user-id" },
                access_token: "mock-token",
              } as any);
              router.push("/MyOrdersScreen");
            }}
          >
            <Text style={styles.verifyButtonText}>Xác thực OTP</Text>
          </TouchableOpacity>

          {/* Resend link */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Không nhận được mã?</Text>
            <TouchableOpacity onPress={() => timer === 0 && setTimer(30)}>
              <Text style={styles.resendAction}>
                Gửi lại sau {formattedTimer}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    color: "#000000",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#8f9098",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 40,
  },
  otpInput: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#171717",
  },
  spacer: {
    flex: 1,
  },
  verifyButton: {
    height: 54,
    backgroundColor: "#22c55e",
    borderRadius: 16.2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  verifyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 40,
  },
  resendText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
  resendAction: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "600",
  },
});
