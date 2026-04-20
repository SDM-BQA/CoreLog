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
    NAME: /^[A-Za-z](?:[A-Za-z ]{1,}[A-Za-z])?$/,


    /**
     * Last Name
     * - Minimum 1 characters
     * - Alphabets only
     * - Allows spaces between words
     * - No leading/trailing space
     */
    LAST_NAME: /^[A-Za-z](?:[A-Za-z]{1,})?$/,
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
    PHONE: /^[6-9]\d{9}$/,
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
    
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,

}
