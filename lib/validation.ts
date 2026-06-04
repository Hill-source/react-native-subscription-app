export const isValidEmail = (value: string): boolean =>
    /^\S+@\S+\.\S+$/.test(value.trim());

export const getPasswordError = (value: string): string | null => {
    if (value.length === 0) return "Password is required";
    if (value.length < 8) return "Use at least 8 characters";
    return null;
};
