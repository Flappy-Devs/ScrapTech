import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Onboarding2Screen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Skip Button Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.push("/LoginScreen")}
          >
            <Text style={styles.skipText}>Bỏ qua</Text>
          </TouchableOpacity>
        </View>

        {/* Center content */}
        <View style={styles.centerSection}>
          <View style={styles.illustrationCard}>
            <View style={styles.imageWrapper}>
              <Image
                source={require("@/assets/images/onboarding2.png")}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            <View style={styles.cardBorder} pointerEvents="none" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Giá cả minh bạch</Text>

          {/* Description */}
          <Text style={styles.description}>
            Tra giá phế liệu mới nhất trước khi bán.{"\n"}
            Đảm bảo định giá công bằng, rõ ràng và hoàn toàn không có phí ẩn.
          </Text>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Pagination dots */}
          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/Onboarding3Screen")}
          >
            <Text style={styles.buttonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  header: {
    alignItems: "flex-end",
    paddingTop: 10,
    paddingRight: 16,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: "#c5c6cc",
    fontSize: 16,
    fontWeight: "600",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  illustrationCard: {
    width: 256,
    height: 256,
    backgroundColor: "#fafafa",
    borderRadius: 40,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    marginBottom: 40,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 40,
    overflow: "hidden",
    padding: 2,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 8,
    borderColor: "#ffffff",
    borderRadius: 40,
  },
  title: {
    color: "#171717",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    color: "#737373",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  bottomSection: {
    alignItems: "center",
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e5e5",
  },
  dotActive: {
    width: 32,
    backgroundColor: "#22c55e",
  },
  button: {
    width: SCREEN_WIDTH - 66,
    height: 54,
    backgroundColor: "#22c55e",
    borderRadius: 16.2,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
