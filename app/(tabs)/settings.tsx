import { useClerk, useUser } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    const email = user?.primaryEmailAddress?.emailAddress ?? user?.id;

    const handleSignOut = async () => {
        await signOut();
        router.replace("/(auth)/sign-in" as Href);
    };

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <Text className="list-title">Settings</Text>

            <View className="auth-card mt-6">
                <View className="auth-form">
                    <View className="auth-field">
                        <Text className="auth-label">Signed in as</Text>
                        <Text className="auth-helper" numberOfLines={1}>
                            {email}
                        </Text>
                    </View>

                    <Pressable className="auth-button" onPress={handleSignOut}>
                        <Text className="auth-button-text">Sign out</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Settings;
