import { ERROR } from "./error.utils";

type Rule = (value: string) => string | null;

export const required = (field: string): Rule => {
    return (value: string) => {
        return !value.trim() ? ERROR.REQUIRED(field) : null;
    }
}

export const matches = (regex: RegExp, errorMessage: string): Rule => {
    return (value: string) => {
        return !regex.test(value.trim()) ? errorMessage : null;
    }
}

export const compose =
    (...rules: Rule[]) =>
        (value: string) => {
            for (const rule of rules) {
                const error = rule(value);
                if (error) return error;
            }
            return null;
        };