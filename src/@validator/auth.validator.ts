import { ERROR } from "../@utils/error.utils";
import { REGEX } from "../@utils/regex.utils";
import { compose, matches, required } from "../@utils/validate.utils";

export const validateName = compose(
    required("Name"),
    matches(REGEX.NAME, ERROR.INVALID_USERNAME)
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