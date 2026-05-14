import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_COMPLETED_KEY = "onboarding_completed";

export async function getHasCompletedOnboarding(): Promise<boolean> {
	try {
		const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
		return value === "true";
	} catch (error) {
		console.error("Failed to read onboarding status:", error);
		return false;
	}
}

export async function setHasCompletedOnboarding(): Promise<void> {
	try {
		await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
	} catch (error) {
		console.error("Failed to save onboarding status:", error);
		throw error;
	}
}