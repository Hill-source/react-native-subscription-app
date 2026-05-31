import { useSignIn } from "@clerk/expo";
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

export default function SignInScreen() {
    const { signIn, errors, fetchStatus } = useSignIn();
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
        await signIn.finalize({
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

        const { error } = await signIn.password({
            emailAddress: email.trim(),
            password,
        });
        if (error) return;

        if (signIn.status === "complete") {
            await goHome();
        } else if (signIn.status === "needs_client_trust") {
            const emailFactor = signIn.supportedSecondFactors.find(
                (factor) => factor.strategy === "email_code"
            );
            if (emailFactor) {
                await signIn.mfa.sendEmailCode();
            }
        }
    };

    const handleVerify = async () => {
        setCodeSubmitted(true);
        if (code.length < 6) return;

        await signIn.mfa.verifyEmailCode({ code });
        if (signIn.status === "complete") {
            await goHome();
        }
    };

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

    if (signIn.status === "needs_client_trust") {
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

                        <Text className="auth-title text-center">Verify your sign-in</Text>
                        <Text className="auth-subtitle">
                            We sent a 6-digit code to {email}. Enter it below to continue.
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
                                        (isFetching || code.length < 6) && "auth-button-disabled"
                                    )}
                                    onPress={handleVerify}
                                    disabled={isFetching || code.length < 6}
                                >
                                    {isFetching ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <Text className="auth-button-text">Verify and sign in</Text>
                                    )}
                                </Pressable>

                                {(errors.raw?.length ?? 0) > 0 && (
                                    <Text className="auth-error">
                                        Something went wrong. Please try again.
                                    </Text>
                                )}

                                <Pressable
                                    className="auth-secondary-button"
                                    onPress={() => signIn.mfa.sendEmailCode()}
                                    disabled={isFetching}
                                >
                                    <Text className="auth-secondary-button-text">
                                        Send a new code
                                    </Text>
                                </Pressable>

                                <Pressable
                                    className="auth-secondary-button"
                                    onPress={() => {
                                        setCode("");
                                        setCodeSubmitted(false);
                                        signIn.reset();
                                    }}
                                    disabled={isFetching}
                                >
                                    <Text className="auth-secondary-button-text">
                                        Start over
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
        errors.fields.identifier?.message ??
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

                    <Text className="auth-title text-center">Welcome back</Text>
                    <Text className="auth-subtitle">
                        Sign in to continue managing your subscriptions
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
                                    placeholder="Enter your password"
                                    placeholderTextColor={colors.mutedForeground}
                                    secureTextEntry
                                    autoComplete="password"
                                    textContentType="password"
                                />
                                {pwError && <Text className="auth-error">{pwError}</Text>}
                            </View>

                            <View className="items-end">
                                <Link href={"/(auth)/forgot-password" as Href}>
                                    <Text className="auth-link">Forgot password?</Text>
                                </Link>
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
                                    <Text className="auth-button-text">Sign in</Text>
                                )}
                            </Pressable>

                            {(errors.raw?.length ?? 0) > 0 && (
                                <Text className="auth-error">
                                    Something went wrong. Please try again.
                                </Text>
                            )}
                        </View>

                        <View className="auth-link-row">
                            <Text className="auth-link-copy">New to MobileApp?</Text>
                            <Link href={"/(auth)/sign-up" as Href}>
                                <Text className="auth-link">Create an account</Text>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
