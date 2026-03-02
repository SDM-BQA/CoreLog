/**
 * Centralized Regex Utility
 * All regex patterns are exported as constants
 * All validators are pure reusable functions
 */

export const REGEX = {
    /**
     * Name
     * - Minimum 3 characters
     * - Alphabets only
     * - Allows spaces between words
     * - No leading/trailing space
     */
    NAME: /^[A-Za-z](?:[A-Za-z ]{1, }[A-Za-z])?$/,

    /**
     * Email
     * - Standard email validation
     * - Supports subdomains
     */
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,

    /**
     * Phone (India-focused but flexible)
     * - 10 digits
     * - Optional +91
     * - Optional space or dash
     */
    PHONE: /^(?:\+91[\s]?)?[6-9]\d{9}$/,
    /**
     * Strong Password
     * - Minimum 8 characters
     * - At least 1 uppercase
     * - At least 1 lowercase
     * - At least 1 digit
     * - At least 1 special character
     */
    STRONG_PASSWORD:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/,

}


/**
 * Validation Helpers
 */

export const validateName = (value: string): boolean => {
    return REGEX.NAME.test(value.trim())
}

export const validateEmail = (value: string): boolean => {
    return REGEX.EMAIL.test(value.trim())
}

export const validatePhone = (value: string): boolean => {
    return REGEX.PHONE.test(value.trim())
}

export const validatePassword = (value: string): boolean => {
    return REGEX.STRONG_PASSWORD.test(value.trim())
}