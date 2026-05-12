import React, { useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Exact SVG paths from FE mẫu
const svgPaths = {
  p74e0f00: "M158.336 72.9199C158.336 47.646 152.9 31.5342 146.405 17.4837C139.807 24.3827 132.934 29.3664 123.627 33.3854C111.748 38.5143 96.0547 41.9937 72.4306 46.5528C72.3877 46.561 72.3435 46.5698 72.3004 46.5772C59.4225 48.7776 47.8408 55.745 39.8541 66.084C31.8687 76.4229 28.0615 89.3886 29.1851 102.404C30.3098 115.419 36.2852 127.539 45.9251 136.356C55.5648 145.171 68.1652 150.042 81.2278 150.003H81.2522L85.0038 149.906C123.683 147.824 158.336 113.869 158.336 72.9199ZM170.836 72.9199C170.836 122.314 128.095 162.489 81.2603 162.495L81.2685 162.503C65.068 162.552 49.4405 156.51 37.4859 145.576C25.5323 134.643 18.1199 119.618 16.7258 103.478C15.3324 87.3379 20.063 71.2631 29.9664 58.4424C39.8425 45.6576 54.1471 37.0342 70.0624 34.2806C93.9383 29.673 108.258 26.407 118.671 21.9108C128.649 17.6022 135.173 12.1006 143.052 2.33075L143.589 1.74481C144.912 0.475602 146.738 -0.163247 148.586 0.0358284C150.701 0.264062 152.558 1.55944 153.51 3.46193C162.042 20.5276 170.836 39.7047 170.836 72.9199Z",
  p1e8d2680: "M0 164.587C0 136.554 17.5765 114.362 47.3714 108.459C56.6857 106.611 66.342 102.708 74.7314 98.2048C83.1706 93.6745 89.9024 88.763 93.4977 85.1677C95.9385 82.7269 99.8948 82.7269 102.336 85.1677C104.776 87.6084 104.776 91.5648 102.336 94.0055C97.5976 98.7435 89.7421 104.329 80.6396 109.216C71.4888 114.128 60.6471 118.562 49.7965 120.715C25.7588 125.478 12.5 142.619 12.5 164.587C12.5 168.038 9.70178 170.837 6.25 170.837C2.79822 170.837 0 168.038 0 164.587Z",
};

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/Onboarding1Screen");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.content} 
        onPress={() => router.push("/Onboarding1Screen")}
      >
        <View style={styles.centerContainer}>
          {/* Leaf Icon */}
          <View style={styles.leafContainer}>
            <Svg 
              width="150" 
              height="150" 
              viewBox="0 0 170.836 170.837" 
              fill="none"
            >
              <Path d={svgPaths.p74e0f00} fill="#22C55E" />
              <Path d={svgPaths.p1e8d2680} fill="#22C55E" />
            </Svg>
          </View>

          {/* App Name */}
          <Text style={styles.appName}>ScrapTech</Text>
        </View>

        {/* Footer text */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Ứng dụng bởi FlappyDev</Text>
        </View>
      </TouchableOpacity>
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  leafContainer: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    marginTop: 32,
    color: "#22c55e",
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
  },
  footerContainer: {
    paddingBottom: 40,
  },
  footerText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.09,
  },
});
