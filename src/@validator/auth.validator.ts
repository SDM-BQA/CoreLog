import { ERROR } from "../@utils/error.utils";
import { REGEX } from "../@utils/regex.utils";
import { compose, matches, required } from "../@utils/validate.utils";


export const validateLoginEmail = compose(
    required("Email"),
    matches(REGEX.EMAIL, ERROR.INVALID_EMAIL)
);

export const validateLoginPassword = compose(
    required("Password"),
    matches(REGEX.STRONG_PASSWORD, ERROR.INVALID_PASSWORD)
);