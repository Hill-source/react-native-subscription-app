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

type Step = "request" | "verify";

export default function ForgotPasswordScreen() {
    const { signIn, errors, fetchStatus } = useSignIn();
    const router = useRouter();

    const [step, setStep] = useState<Step>("request");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [resetSubmitted, setResetSubmitted] = useState(false);

    const isFetching = fetchStatus === "fetching";

    const emailInvalid = emailSubmitted && !isValidEmail(email);
    const passwordError = resetSubmitted ? getPasswordError(newPassword) : null;
    const codeInvalid = resetSubmitted && code.length < 6;

    const canRequest = email.length > 0 && !isFetching;
    const canReset =
        code.length === 6 &&
        newPassword.length > 0 &&
        !getPasswordError(newPassword) &&
        !isFetching;

    const goHome = async () => {
        await signIn.finalize({
            navigate: ({ session, decorateUrl }) => {
                if (session?.currentTask) return;
                const url = decorateUrl("/");
                router.replace(url as Href);
            },
        });
    };

    const handleRequest = async () => {
        setEmailSubmitted(true);
        if (!isValidEmail(email)) return;

        const created = await signIn.create({ identifier: email.trim() });
        if (created.error) return;

        const sent = await signIn.resetPasswordEmailCode.sendCode();
        if (sent.error) return;

        setStep("verify");
    };

    const handleReset = async () => {
        setResetSubmitted(true);
        if (code.length < 6 || getPasswordError(newPassword)) return;

        const verified = await signIn.resetPasswordEmailCode.verifyCode({ code });
        if (verified.error) return;

        const submitted = await signIn.resetPasswordEmailCode.submitPassword({
            password: newPassword,
        });
        if (submitted.error) return;

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

    if (step === "verify") {
        const codeError =
            errors.fields.code?.message ??
            (codeInvalid ? "Enter the 6-digit code" : null);
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

                        <Text className="auth-title text-center">Set a new password</Text>
                        <Text className="auth-subtitle">
                            We sent a 6-digit code to {email}. Enter it and choose a new
                            password.
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

                                <View className="auth-field">
                                    <Text className="auth-label">New password</Text>
                                    <TextInput
                                        className={clsx(
                                            "auth-input",
                                            pwError && "auth-input-error"
                                        )}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        placeholder="Create a new password"
                                        placeholderTextColor={colors.mutedForeground}
                                        secureTextEntry
                                        autoComplete="password-new"
                                        textContentType="newPassword"
                                    />
                                    {pwError ? (
                                        <Text className="auth-error">{pwError}</Text>
                                    ) : (
                                        <Text className="auth-helper">
                                            At least 8 characters
                                        </Text>
                                    )}
                                </View>

                                <Pressable
                                    className={clsx(
                                        "auth-button",
                                        !canReset && "auth-button-disabled"
                                    )}
                                    onPress={handleReset}
                                    disabled={!canReset}
                                >
                                    {isFetching ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={colors.primary}
                                        />
                                    ) : (
                                        <Text className="auth-button-text">
                                            Reset password
                                        </Text>
                                    )}
                                </Pressable>

                                {(errors.raw?.length ?? 0) > 0 && (
                                    <Text className="auth-error">
                                        Something went wrong. Please try again.
                                    </Text>
                                )}

                                <Pressable
                                    className="auth-secondary-button"
                                    onPress={() => signIn.resetPasswordEmailCode.sendCode()}
                                    disabled={isFetching}
                                >
                                    <Text className="auth-secondary-button-text">
                                        Send a new code
                                    </Text>
                                </Pressable>
                            </View>

                            <View className="auth-link-row">
                                <Text className="auth-link-copy">Wrong email?</Text>
                                <Pressable
                                    onPress={() => {
                                        setStep("request");
                                        setCode("");
                                        setNewPassword("");
                                        setResetSubmitted(false);
                                    }}
                                >
                                    <Text className="auth-link">Start over</Text>
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

                    <Text className="auth-title text-center">Reset your password</Text>
                    <Text className="auth-subtitle">
                        Enter your email and we'll send you a code to reset your password
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

                            <Pressable
                                className={clsx(
                                    "auth-button",
                                    !canRequest && "auth-button-disabled"
                                )}
                                onPress={handleRequest}
                                disabled={!canRequest}
                            >
                                {isFetching ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <Text className="auth-button-text">Send reset code</Text>
                                )}
                            </Pressable>

                            {(errors.raw?.length ?? 0) > 0 && (
                                <Text className="auth-error">
                                    Something went wrong. Please try again.
                                </Text>
                            )}
                        </View>

                        <View className="auth-link-row">
                            <Text className="auth-link-copy">Remembered your password?</Text>
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
