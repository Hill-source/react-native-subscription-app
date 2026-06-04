import { SplashScreen, Stack } from "expo-router";
import "@/global.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { PostHogProvider } from "posthog-react-native";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
}

export default function RootLayout() {
    const [fontsloaded] = useFonts({
        "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
        "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
        "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
        "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
        "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
        "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    });

    useEffect(() => {
        if (fontsloaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsloaded]);

    if (!fontsloaded) {
        return null;
    }

    return (
        <PostHogProvider
            apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY!}
            options={{ host: process.env.EXPO_PUBLIC_POSTHOG_HOST }}
        >
            <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
                <Stack screenOptions={{ headerShown: false }} />
            </ClerkProvider>
        </PostHogProvider>
    );
}
