import { ERROR } from "../@utils/error.utils";
import { REGEX } from "../@utils/regex.utils";
import { compose, matches, required } from "../@utils/validate.utils";

export const validateName = compose(
    required("Name"),
    matches(REGEX.NAME, ERROR.INVALID_USERNAME)
);

export const validateLastName = compose(
    required("Last Name"),
    matches(REGEX.LAST_NAME, ERROR.INVALID_LAST_NAME)
);

export const validateEmail = compose(
    required("Email"),
    matches(REGEX.EMAIL, ERROR.INVALID_EMAIL)
);

export const validatePhone = compose(
    required("Phone"),
    matches(REGEX.PHONE, ERROR.INVALID_PHONE)
);

export const validatePassword = compose(
    required("Password"),
    matches(REGEX.STRONG_PASSWORD, ERROR.INVALID_PASSWORD)
);

export const validateGender = (value: string | null) => {
    if (!value) return "Please select a gender";
    return null;
};

export const validateAvatar = (value: File | null) => {
    if (!value) return null;
    if (value.size > 5 * 1024 * 1024) return ERROR.INVALID_AVATAR;
    if (!["image/jpeg", "image/png", "image/webp"].includes(value.type))
        return ERROR.INVALID_AVATAR;
    return null;
};

export const validateUsername = compose(
    required("Username"),
    matches(
        REGEX.USERNAME,
        ERROR.INVALID_USERNAME
    ),
);
