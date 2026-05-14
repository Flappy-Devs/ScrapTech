import type { ImageSourcePropType } from "react-native";

export type OnboardingItem = {
	id: string;
	title: string;
	description: string;
	image: ImageSourcePropType;
};

export const onboardingData: OnboardingItem[] = [
	{
		id: "1",
		title: "Đặt lịch thu gom dễ dàng",
		description: "Chủ động hẹn giờ thu gom phù hợp. \n Nhân viên của chúng tôi sẽ đến thu mua tận nhà.",
		image: require("@/assets/images/onboarding-1.png"),
	},
	{
		id: "2",
		title: "Giá cả minh bạch",
		description: "Tra giá phế liệu mới nhất trước khi bán. \n Đảm bảo định giá công bằng, rõ ràng và hoàn toàn không có phí ẩn.",
		image: require("@/assets/images/onboarding-2.png"),
	},
	{
		id: "3",
		title: "Sạch nhà, Xanh đất nước",
		description: "Phân loại rác, tái chế phế liệu. \n Chung tay bảo vệ môi trường cho những thế hệ mai sau.",
		image: require("@/assets/images/onboarding-3.png"),
	},
];