export const ERROR = {
    REQUIRED: (field: string) => `${field} is required`,

    INVALID_EMAIL: "Invalid email format",

    INVALID_USERNAME:
        "name must be at least 3 characters and contain only letters, numbers or underscore",

    INVALID_PASSWORD:
        "Password must contain 8+ characters, uppercase, lowercase, number and special character",
    
    INVALID_PHONE: "Invalid phone number format",
};