import { useState, useRef } from "react";

type ValidatorFn = (value: any) => string | null;

type ValidationSchema<T> = {
    [K in keyof T]?: ValidatorFn;
};

type UseFormProps<T> = {
    initialValues: T;
    validationSchema?: ValidationSchema<T>;
    onSubmit: (values: T) => void;
};

export function useForm<T extends Record<string, any>>({
    initialValues,
    validationSchema = {},
    onSubmit,
}: UseFormProps<T>) {
    const initialRef = useRef(initialValues);

    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<
        Partial<Record<keyof T, string>>
        >({});
    const [isSubmitting, setIsSubmitting] = useState(false);


    const validateField = (name: keyof T, value: any) => {
        const validator = validationSchema[name];
        if (!validator) return null;
        return validator(value);
    };

    const validateForm = () => {
        const newErrors: Partial<Record<keyof T, string>> = {};

        for (const key in validationSchema) {
            const error = validateField(key, values[key]);
            if (error) newErrors[key] = error;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange =
        (name: keyof T) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;

                setValues((prev) => ({ ...prev, [name]: value }));

                if (errors[name]) {
                    setErrors((prev) => ({ ...prev, [name]: undefined }));
                }
            };

    const setFieldValue = (name: keyof T, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    /* Reset entire form */
    const resetForm = () => {
        setValues(initialRef.current);
        setErrors({});
    };

    /* Reset single field */
    const resetField = (name: keyof T) => {
        setValues((prev) => ({
            ...prev,
            [name]: initialRef.current[name],
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return; // prevent double submit

        const isValid = validateForm();
        if (!isValid) return;

        try {
            setIsSubmitting(true);
            await onSubmit(values);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        values,
        errors,
        handleChange,
        handleSubmit,
        setFieldValue,
        resetForm,
        resetField,
        isSubmitting,
    
    };
}