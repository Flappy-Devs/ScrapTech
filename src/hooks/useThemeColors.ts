import { useMemo } from "react";

export function useThemeColors() {
    const lightTheme = useMemo(() => {
        return {
            highlight: {
                darkest: "#14532D",
                dark: "#15803D",
                medium: "#22C55E",
                light: "#86EFAC",
                lightest: "#DCFCE7",
            },
            neutral: {
                light: {
                    darkest: "#C5C6CC",
                    dark: "#D4D6DD",
                    medium: "#E8E9F1",
                    light: "#F8F9FE",
                    lightest: "#FFFFFF",
                },
                dark: {
                    darkest: "#1E1E1E",
                    dark: "#2F3036",
                    medium: "#494A50",
                    light: "#8F9098",
                    lightest: "#71727A",
                }
            },
            success: {
                dark: "#298267",
                medium: "#3AC0A0",
                light: "#E7F4E8",
            },
            warning: {
                dark: "#E86339",
                medium: "#FFB37C",
                light: "#FFF4E4",
            },
            error: {
                dark: "#ED3241",
                medium: "#FF616D",
                light: "#FFE2E5",
            },
        }
    }, []);

    return lightTheme;
}
