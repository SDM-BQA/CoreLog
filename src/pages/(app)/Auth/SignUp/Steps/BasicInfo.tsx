import { CheckIcon, LockIcon } from "lucide-react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";
import { useState } from "react";
import { check_email_exists_query } from "../../../../../@apis/users";
import { toast } from "react-toast";

import {
  validateEmail,
  validateGender,
  validateLastName,
  validateName,
  validatePassword,
  validatePhone,
} from "../../../../../@validator/auth.validator";
import { useForm } from "../../../../../@hooks/Form/useForm";

const PASSWORD_RULES = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "A number", test: (v: string) => /\d/.test(v) },
  { label: "A special character", test: (v: string) => /[@$!%*?&#^()_\-+=]/.test(v) },
];

type BasicInfoValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  gender: string | null;
};

type Props = {
  onStepComplete: (data: BasicInfoValues) => void;
  defaultValues?: Partial<BasicInfoValues>; // pre-fills if user navigates back
};

const BasicInfo = ({ onStepComplete, defaultValues }: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = useForm<BasicInfoValues>({
    initialValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      password: defaultValues?.password ?? "",
      gender: defaultValues?.gender ?? null,
    },
    validationSchema: {
      firstName: validateName,
      lastName: validateLastName,
      email: validateEmail,
      phone: validatePhone,
      password: validatePassword,
      gender: validateGender,
    },
    onSubmit: async (values) => {
      try {
        const email = values.email.trim();
        const exists = await check_email_exists_query(email);
        if (exists) {
          toast.error("This email is already registered. Please use another one or login.");
          return;
        }
        onStepComplete({ ...values, email });
      } catch (error) {
        console.log(error);
        toast.error("An error occurred during email validation.");
      }
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        {/* FIRST & LAST NAME */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-text-secondary text-sm font-medium">
              First Name
            </span>
            <div className="flex items-center px-4 py-3.5 bg-bg/60 rounded-xl border border-border focus-within:border-accent focus-within:ring-4 focus-within:ring-primary/20 transition-colors">
              <input
                type="text"
                className="w-full outline-none bg-transparent text-sm text-text-primary"
                placeholder="John"
                value={values.firstName}
                onChange={handleChange("firstName")}
                disabled={isSubmitting}
              />
            </div>
            {errors.firstName && (
              <span className="text-text-error text-xs">
                {errors.firstName}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-text-secondary text-sm font-medium">
              Last Name
            </span>
            <div className="flex items-center px-4 py-3.5 bg-bg/60 rounded-xl border border-border focus-within:border-accent focus-within:ring-4 focus-within:ring-primary/20 transition-colors">
              <input
                type="text"
                className="w-full outline-none bg-transparent text-sm text-text-primary"
                placeholder="Doe"
                value={values.lastName}
                onChange={handleChange("lastName")}
                disabled={isSubmitting}
              />
            </div>
            {errors.lastName && (
              <span className="text-text-error text-xs">{errors.lastName}</span>
            )}
          </label>
        </div>

        {/* EMAIL & PHONE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-text-secondary text-sm font-medium">
              Email Address
            </span>
            <div className="flex items-center px-4 py-3.5 bg-bg/60 rounded-xl border border-border focus-within:border-accent focus-within:ring-4 focus-within:ring-primary/20 transition-colors">
              <input
                type="email"
                className="w-full outline-none bg-transparent text-sm text-text-primary"
                placeholder="john@example.com"
                value={values.email}
                onChange={handleChange("email")}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <span className="text-text-error text-xs">{errors.email}</span>
            )}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-text-secondary text-sm font-medium">
              Phone Number
            </span>
            <div className="flex items-center px-4 py-3.5 bg-bg/60 rounded-xl border border-border focus-within:border-accent focus-within:ring-4 focus-within:ring-primary/20 transition-colors">
              <input
                type="tel"
                maxLength={10}
                inputMode="numeric"
                className="w-full outline-none bg-transparent text-sm text-text-primary"
                placeholder="9876543210"
                value={values.phone}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, "");
                  if (onlyDigits.length <= 10)
                    setFieldValue("phone", onlyDigits);
                }}
                disabled={isSubmitting}
              />
            </div>
            {errors.phone && (
              <span className="text-text-error text-xs">{errors.phone}</span>
            )}
          </label>
        </div>

        {/* PASSWORD */}
        <label className="flex flex-col gap-2">
          <span className="text-text-secondary text-sm font-medium">
            Password
          </span>
          <div className="flex items-center px-4 py-3.5 bg-bg/60 rounded-xl gap-2 border border-border focus-within:border-accent focus-within:ring-4 focus-within:ring-primary/20 transition-colors">
            <LockIcon size={18} className="text-text-secondary" />
            <input
              type={showPassword ? "text" : "password"}
              className="flex-1 outline-none bg-transparent text-sm text-text-primary"
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange("password")}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="p-1 text-text-secondary hover:text-text-primary transition-colors"
            >
              {showPassword ? (
                <IoEyeOffOutline size={18} />
              ) : (
                <IoEyeOutline size={18} />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-text-error text-xs">{errors.password}</span>
          )}
          {values.password.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1">
              {PASSWORD_RULES.map(({ label, test }) => {
                const ok = test(values.password);
                return (
                  <li
                    key={label}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      ok ? "text-emerald-400" : "text-text-secondary/60"
                    }`}
                  >
                    <CheckIcon size={12} className={ok ? "" : "opacity-30"} />
                    {label}
                  </li>
                );
              })}
            </ul>
          )}
        </label>

        {/* GENDER */}
        <div className="flex flex-col gap-2">
          <span className="text-text-secondary text-sm font-medium" id="gender-label">
            Gender Identity
          </span>
          <div
            role="radiogroup"
            aria-labelledby="gender-label"
            className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm"
          >
            {["Male", "Female", "Others", "N/A"].map((gender) => {
              const selected = values.gender === gender;
              return (
                <button
                  key={gender}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={isSubmitting}
                  onClick={() => setFieldValue("gender", gender)}
                  className={`px-2 py-2.5 border rounded-lg text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    selected
                      ? "bg-primary border-primary text-text-primary font-medium"
                      : "bg-bg/60 border-border text-text-secondary hover:border-border-secondary hover:text-text-primary cursor-pointer"
                  }`}
                >
                  {gender}
                </button>
              );
            })}
          </div>
          {errors.gender && (
            <span className="text-text-error text-xs">{errors.gender}</span>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex items-center justify-center w-full py-3 bg-primary text-text-primary text-sm font-semibold rounded-xl shadow-lg shadow-primary/30 hover:bg-accent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Validating..." : "Continue"}
          <FaArrowRightLong
            size={16}
            className="ml-2 group-hover:translate-x-1 transition-all"
          />
        </button>
      </div>
    </form>
  );
};

export default BasicInfo;
