import React, { useState } from "react";
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

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Top spacer to push content down a bit */}
        <View style={styles.topSpacer} />

        {/* Welcome Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            <Text style={styles.textBlack}>Chào mừng đến với  </Text>
            <Text style={styles.textGreen}>ScrapTech</Text>
          </Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Đăng nhập để bắt đầu cuộc hành trình của bạn
        </Text>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Phone field label */}
          <Text style={styles.label}>Số điện thoại</Text>

          {/* Phone input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Hãy điền số điện thoại của bạn"
              placeholderTextColor="#8f9098"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* OTP Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/VerifyOtpScreen")}
        >
          <Text style={styles.buttonText}>Nhận OTP</Text>
        </TouchableOpacity>

        {/* Register link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => {/* Handle register */}}>
            <Text style={styles.registerText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  topSpacer: {
    flex: 0.5,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 40,
  },
  textBlack: { color: "#000000" },
  textGreen: { color: "#22c55e" },
  subtitle: {
    color: "#8f9098",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 40,
  },
  formContainer: {
    marginBottom: 40,
  },
  label: {
    color: "#2f3036",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  inputContainer: {
    height: 49,
    borderRadius: 16.2,
    borderWidth: 1,
    borderColor: "#c5c6cc",
    justifyContent: "center",
  },
  input: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#171717",
  },
  button: {
    height: 54,
    backgroundColor: "#22c55e",
    borderRadius: 16.2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  footerText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
  registerText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomSpacer: {
    flex: 1,
  },
});
