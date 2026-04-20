/**
 * Converts a string to Sentence case.
 * Example: "USER NOT FOUND" -> "User not found"
 */
export const toSentenceCase = (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
