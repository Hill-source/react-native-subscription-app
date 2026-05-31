export const formatCurrency = (amount: number, currency: string = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    // Fallback to a simple formatting if Intl fails or currency is invalid
    return `${currency === "USD" ? "$" : currency} ${amount.toFixed(2)}`;
  }
};
