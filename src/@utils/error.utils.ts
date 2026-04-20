export const ERROR = {
    REQUIRED: (field: string) => `${field} is required`,

    INVALID_EMAIL: "Invalid email format",

    INVALID_NAME: "name must be at least 3 characters and contain only letters",

    INVALID_LAST_NAME: "Last name must be at least 1 character and contain only letters",

    INVALID_USERNAME:
        "name must be at least 3 characters and contain only letters, numbers or underscore",

    INVALID_PASSWORD:
        "Password must contain 8+ characters, uppercase, lowercase, number and special character",
    
    INVALID_PHONE: "Invalid phone number format",

    INVALID_OTP: "Invalid OTP. Please enter the correct code sent to your email.",

    INVALID_AVATAR: "Avatar must be a JPG, PNG or WEBP image under 5MB",

};