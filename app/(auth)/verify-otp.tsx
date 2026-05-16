import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
    requestLoginOtp,
    requestSignupOtp,
    upsertMyProfile,
} from "@/src/features/auth/auth.api";
import { useAuth } from "@/src/hooks/useAuth";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { SafeAreaView } from "react-native-safe-area-context";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

function getParam(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function formatCountdown(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export default function VerifyOtpScreen() {
    const colors = useThemeColors();
    const { confirmPhoneOtp } = useAuth();

    const params = useLocalSearchParams<{
        phone?: string;
        flow?: string;
        fullName?: string;
    }>();

    const phone = getParam(params.phone);
    const flow = getParam(params.flow) === "signup" ? "signup" : "login";
    const fullName = getParam(params.fullName);

    const inputRef = useRef<TextInput>(null);

    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(RESEND_SECONDS);

    const otpDigits = useMemo(
        () =>
            Array.from({ length: OTP_LENGTH }, (_, index) => otp[index] ?? ""),
        [otp]
    );

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((current) => Math.max(current - 1, 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            inputRef.current?.focus();
        }, 250);

        return () => clearTimeout(timeout);
    }, []);

    async function handleVerifyOtp() {
        if (!phone) {
            Alert.alert("Thiếu số điện thoại", "Vui lòng quay lại và thử lại.");
            return;
        }

        if (otp.length !== OTP_LENGTH) {
            Alert.alert("Mã OTP chưa đủ", `Vui lòng nhập đủ ${OTP_LENGTH} số.`);
            return;
        }

        try {
            setIsVerifying(true);

            await confirmPhoneOtp(phone, otp);

            if (flow === "signup") {
                await upsertMyProfile({
                    fullName,
                    phone,
                });
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể xác thực OTP. Vui lòng thử lại.";

            Alert.alert("Xác thực thất bại", message);
        } finally {
            setIsVerifying(false);
        }
    }

    async function handleResendOtp() {
        if (!phone || countdown > 0) return;

        try {
            setIsResending(true);

            if (flow === "signup") {
                await requestSignupOtp(phone);
            } else {
                await requestLoginOtp(phone);
            }

            setOtp("");
            setCountdown(RESEND_SECONDS);
            inputRef.current?.focus();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể gửi lại OTP. Vui lòng thử lại.";

            Alert.alert("Gửi lại OTP thất bại", message);
        } finally {
            setIsResending(false);
        }
    }

    return (
        <SafeAreaView
            style={[
                styles.safeArea,
                { backgroundColor: colors.neutral.light.lightest },
            ]}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.content}>
                    <Pressable
                        style={[
                            styles.backButton,
                            { borderColor: colors.highlight.medium },
                        ]}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={18}
                            color={colors.highlight.medium}
                        />
                    </Pressable>

                    <View style={styles.header}>
                        <Text
                            style={[
                                styles.title,
                                { color: colors.neutral.dark.darkest },
                            ]}
                        >
                            Xác thực số điện thoại
                        </Text>

                        <Text
                            style={[
                                styles.subtitle,
                                { color: colors.neutral.dark.light },
                            ]}
                        >
                            Nhập mã {OTP_LENGTH} chữ số được gửi đến điện thoại của bạn
                        </Text>
                    </View>

                    <Pressable
                        style={styles.otpRow}
                        onPress={() => inputRef.current?.focus()}
                    >
                        {otpDigits.map((digit, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.otpBox,
                                    {
                                        borderColor: colors.neutral.light.medium,
                                        backgroundColor:
                                            colors.neutral.light.lightest,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.otpDigit,
                                        { color: colors.neutral.dark.darkest },
                                    ]}
                                >
                                    {digit}
                                </Text>
                            </View>
                        ))}
                    </Pressable>

                    <TextInput
                        ref={inputRef}
                        value={otp}
                        onChangeText={(value) =>
                            setOtp(value.replace(/\D/g, "").slice(0, OTP_LENGTH))
                        }
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        autoComplete="sms-otp"
                        maxLength={OTP_LENGTH}
                        style={styles.hiddenOtpInput}
                        onSubmitEditing={handleVerifyOtp}
                    />

                    <Pressable
                        style={[
                            styles.verifyButton,
                            { backgroundColor: colors.highlight.medium },
                            (otp.length !== OTP_LENGTH || isVerifying) &&
                            styles.buttonDisabled,
                        ]}
                        onPress={handleVerifyOtp}
                        disabled={otp.length !== OTP_LENGTH || isVerifying}
                    >
                        {isVerifying ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.verifyButtonText}>Xác thực OTP</Text>
                        )}
                    </Pressable>

                    <View style={styles.resendRow}>
                        <Text
                            style={[
                                styles.resendText,
                                { color: colors.neutral.dark.darkest },
                            ]}
                        >
                            Không nhận được mã?
                        </Text>

                        {countdown > 0 ? (
                            <Text
                                style={[
                                    styles.resendCountdown,
                                    { color: colors.highlight.medium },
                                ]}
                            >
                                Gửi lại sau {formatCountdown(countdown)}
                            </Text>
                        ) : (
                            <Pressable
                                onPress={handleResendOtp}
                                disabled={isResending}
                            >
                                <Text
                                    style={[
                                        styles.resendLink,
                                        { color: colors.highlight.medium },
                                    ]}
                                >
                                    {isResending ? "Đang gửi..." : "Gửi lại OTP"}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 64,
    },
    backButton: {
        width: 34,
        height: 34,
        borderWidth: 1,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 34,
    },
    header: {
        marginBottom: 28,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        lineHeight: 30,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 12,
        lineHeight: 16,
    },
    otpRow: {
        flexDirection: "row",
        gap: 14,
        marginBottom: 28,
    },
    otpBox: {
        width: 42,
        height: 42,
        borderWidth: 1,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
    },
    otpDigit: {
        fontSize: 18,
        fontWeight: "700",
    },
    hiddenOtpInput: {
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
    },
    verifyButton: {
        height: 46,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.55,
    },
    verifyButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },
    resendRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    resendText: {
        fontSize: 11,
        fontWeight: "600",
    },
    resendCountdown: {
        fontSize: 11,
        fontWeight: "700",
    },
    resendLink: {
        fontSize: 11,
        fontWeight: "700",
    },
});