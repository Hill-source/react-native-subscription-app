import { useAuth, useSignUp } from "@clerk/expo";
import { clsx } from "clsx";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { getPasswordError, isValidEmail } from "@/lib/validation";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignUpScreen() {
    const { signUp, errors, fetchStatus } = useSignUp();
    const { isSignedIn } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [codeSubmitted, setCodeSubmitted] = useState(false);

    const isFetching = fetchStatus === "fetching";
    const emailInvalid = submitted && !isValidEmail(email);
    const passwordError = submitted ? getPasswordError(password) : null;
    const canSubmit = email.length > 0 && password.length > 0 && !isFetching;

    const goHome = async () => {
        await signUp.finalize({
            navigate: ({ session, decorateUrl }) => {
                if (session?.currentTask) {
                    return;
                }
                const url = decorateUrl("/");
                router.replace(url as Href);
            },
        });
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        if (!isValidEmail(email) || getPasswordError(password)) return;

        const { error } = await signUp.password({
            emailAddress: email.trim(),
            password,
        });
        if (error) return;

        await signUp.verifications.sendEmailCode();
    };

    const handleVerify = async () => {
        setCodeSubmitted(true);
        if (code.length < 6) return;

        await signUp.verifications.verifyEmailCode({ code });
        if (signUp.status === "complete") {
            await goHome();
        }
    };

    if (signUp.status === "complete" || isSignedIn) {
        return null;
    }

    const renderBrand = () => (
        <View className="auth-brand-block">
            <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">M</Text>
                </View>
                <View>
                    <Text className="auth-wordmark">MobileApp</Text>
                    <Text className="auth-wordmark-sub">Smart Subscriptions</Text>
                </View>
            </View>
        </View>
    );

    const isVerifyStep =
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address") &&
        signUp.missingFields.length === 0;

    if (isVerifyStep) {
        const codeError =
            errors.fields.code?.message ??
            (codeSubmitted && code.length < 6 ? "Enter the 6-digit code" : null);

        return (
            <SafeAreaView className="auth-safe-area">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="flex-1"
                >
                    <ScrollView
                        className="auth-scroll"
                        contentContainerClassName="auth-content"
                        keyboardShouldPersistTaps="handled"
                    >
                        {renderBrand()}

                        <Text className="auth-title text-center">Check your email</Text>
                        <Text className="auth-subtitle">
                            We sent a 6-digit code to {email}. Enter it below to confirm your
                            account.
                        </Text>

                        <View className="auth-card">
                            <View className="auth-form">
                                <View className="auth-field">
                                    <Text className="auth-label">Verification code</Text>
                                    <TextInput
                                        className={clsx(
                                            "auth-input",
                                            codeError && "auth-input-error"
                                        )}
                                        value={code}
                                        onChangeText={setCode}
                                        placeholder="123456"
                                        placeholderTextColor={colors.mutedForeground}
                                        keyboardType="numeric"
                                        maxLength={6}
                                        autoFocus
                                    />
                                    {codeError && (
                                        <Text className="auth-error">{codeError}</Text>
                                    )}
                                </View>

                                <Pressable
                                    className={clsx(
                                        "auth-button",
                                        (isFetching || code.length < 6) &&
                                            "auth-button-disabled"
                                    )}
                                    onPress={handleVerify}
                                    disabled={isFetching || code.length < 6}
                                >
                                    {isFetching ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <Text className="auth-button-text">Verify email</Text>
                                    )}
                                </Pressable>

                                {(errors.raw?.length ?? 0) > 0 && (
                                    <Text className="auth-error">
                                        Something went wrong. Please try again.
                                    </Text>
                                )}

                                <Pressable
                                    className="auth-secondary-button"
                                    onPress={() => signUp.verifications.sendEmailCode()}
                                    disabled={isFetching}
                                >
                                    <Text className="auth-secondary-button-text">
                                        Send a new code
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    const identifierError =
        errors.fields.emailAddress?.message ??
        (emailInvalid ? "Enter a valid email address" : null);
    const pwError = errors.fields.password?.message ?? passwordError;

    return (
        <SafeAreaView className="auth-safe-area">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1"
            >
                <ScrollView
                    className="auth-scroll"
                    contentContainerClassName="auth-content"
                    keyboardShouldPersistTaps="handled"
                >
                    {renderBrand()}

                    <Text className="auth-title text-center">Create your account</Text>
                    <Text className="auth-subtitle">
                        Track and manage all your subscriptions in one place
                    </Text>

                    <View className="auth-card">
                        <View className="auth-form">
                            <View className="auth-field">
                                <Text className="auth-label">Email</Text>
                                <TextInput
                                    className={clsx(
                                        "auth-input",
                                        identifierError && "auth-input-error"
                                    )}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="you@example.com"
                                    placeholderTextColor={colors.mutedForeground}
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    keyboardType="email-address"
                                    textContentType="emailAddress"
                                />
                                {identifierError && (
                                    <Text className="auth-error">{identifierError}</Text>
                                )}
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Password</Text>
                                <TextInput
                                    className={clsx(
                                        "auth-input",
                                        pwError && "auth-input-error"
                                    )}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Create a password"
                                    placeholderTextColor={colors.mutedForeground}
                                    secureTextEntry
                                    autoComplete="password-new"
                                    textContentType="newPassword"
                                />
                                {pwError ? (
                                    <Text className="auth-error">{pwError}</Text>
                                ) : (
                                    <Text className="auth-helper">At least 8 characters</Text>
                                )}
                            </View>

                            <Pressable
                                className={clsx(
                                    "auth-button",
                                    !canSubmit && "auth-button-disabled"
                                )}
                                onPress={handleSubmit}
                                disabled={!canSubmit}
                            >
                                {isFetching ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <Text className="auth-button-text">Create account</Text>
                                )}
                            </Pressable>

                            {(errors.raw?.length ?? 0) > 0 && (
                                <Text className="auth-error">
                                    Something went wrong. Please try again.
                                </Text>
                            )}

                            {/* Clerk bot protection — required for sign-up */}
                            <View nativeID="clerk-captcha" />
                        </View>

                        <View className="auth-link-row">
                            <Text className="auth-link-copy">Already have an account?</Text>
                            <Link href={"/(auth)/sign-in" as Href}>
                                <Text className="auth-link">Sign in</Text>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
