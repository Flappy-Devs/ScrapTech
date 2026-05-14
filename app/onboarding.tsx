import { useRef, useState } from "react";
import {
	Dimensions,
	FlatList,
	Image,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { router } from "expo-router";

import {
	onboardingData,
	type OnboardingItem,
} from "@/src/features/onboarding/onboarding-data";
import { useOnboardingStore } from "@/src/store/useOnboardingStore";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
	const flatListRef = useRef<FlatList<OnboardingItem>>(null);
	const [currentIndex, setCurrentIndex] = useState(0);

    const { completeOnboarding } = useOnboardingStore();

	const isLastSlide = currentIndex === onboardingData.length - 1;

	function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
		const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
		setCurrentIndex(newIndex);
	}

	function handleNext() {
		if (!isLastSlide) {
			flatListRef.current?.scrollToIndex({
				index: currentIndex + 1,
				animated: true,
			});
		}
	}

	async function handleFinish() {
		await completeOnboarding();
		router.replace("/(auth)/login");
	}

	async function handleSkip() {
		await completeOnboarding();
		router.replace("/(auth)/login");
	}

	function renderItem({ item }: { item: OnboardingItem }) {
		return (
			<View style={styles.slide}>
				<View style={styles.topBar}>
					<Pressable onPress={handleSkip}>
						<Text style={styles.skipText}>Bỏ qua</Text>
					</Pressable>
				</View>

				<View style={styles.content}>
					<Image
						source={item.image}
						style={styles.image}
						resizeMode="contain"
					/>

					<Text style={styles.title}>{item.title}</Text>

					<Text style={styles.description}>{item.description}</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				ref={flatListRef}
				data={onboardingData}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onMomentumScrollEnd={handleScroll}
			/>

			<View style={styles.footer}>
				<View style={styles.pagination}>
					{onboardingData.map((_, index) => (
						<View
							key={index}
							style={[
								styles.dot,
								index === currentIndex && styles.activeDot,
							]}
						/>
					))}
				</View>

				<Pressable
					style={styles.button}
					onPress={isLastSlide ? handleFinish : handleNext}
				>
					<Text style={styles.buttonText}>
						{isLastSlide ? "Bắt đầu" : "Tiếp tục"}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},

	slide: {
		width,
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 54,
	},

	topBar: {
		alignItems: "flex-end",
	},

	skipText: {
		fontSize: 14,
		color: "#9CA3AF",
		fontWeight: "500",
	},

	content: {
		flex: 1,
		alignItems: "center",
		paddingTop: 80,
	},

	image: {
		width: 220,
		height: 220,
		marginBottom: 28,
        borderRadius: 50
	},

	title: {
		fontSize: 20,
		fontWeight: "800",
		color: "#111827",
		textAlign: "center",
		marginBottom: 12,
	},

	description: {
		maxWidth: 300,
		fontSize: 14,
		lineHeight: 21,
		color: "#6B7280",
		textAlign: "center",
	},

	footer: {
		paddingHorizontal: 24,
		paddingBottom: 34,
	},

	pagination: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 22,
		gap: 6,
	},

	dot: {
		width: 6,
		height: 6,
		borderRadius: 999,
		backgroundColor: "#D1D5DB",
	},

	activeDot: {
		width: 20,
		backgroundColor: "#16A34A",
	},

	button: {
		height: 52,
		borderRadius: 8,
		backgroundColor: "#16A34A",
		alignItems: "center",
		justifyContent: "center",
	},

	buttonText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#FFFFFF",
	},
});