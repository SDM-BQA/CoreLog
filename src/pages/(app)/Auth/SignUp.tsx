import { LockIcon } from "lucide-react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "../../../@hooks/Form/useForm";
import {
  validateEmail,
  validateName,
  validatePassword,
  validateGender,
  validatePhone,
} from "../../../@validator/auth.validator";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const handleGenderClick = (gender: string) => {
    setSelectedGender(gender);
    setFieldValue("gender", gender);
  };

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    isSubmitting,
    resetForm,
  } = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      gender: null as string | null,
    },
    validationSchema: {
      firstName: validateName,
      lastName: validateName,
      email: validateEmail,
      phone: validatePhone,
      password: validatePassword,
      gender: validateGender,
    },
    onSubmit: async (values) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 5000);
      });
      console.log("Signup valid", values);
      resetForm();
    },
  });

  return (
    <div className="bg-bg min-h-screen flex flex-col w-full mx-auto justify-center items-center px-4">
      <div className="flex flex-col gap-1 mb-6 text-center">
        <div className="text-text-primary text-2xl font-semibold font-inter">
          Create your account
        </div>
        <div className="text-text-secondary text-base mt-1">
          Join our community of enthusiasts.
        </div>
      </div>

      <div className="absolute bottom-8 right-8 hidden md:block">
        <img src="/gear.png" alt="Gear" className="w-64 h-64 opacity-20" />
      </div>

      <div className="bg-bg-secondary backdrop-blur-md shadow-xl p-8 rounded-md w-full max-w-2xl flex flex-col justify-center gap-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* FIRST & LAST NAME */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-text-secondary text-sm font-medium">
                  First Name
                </span>
                <div className="flex items-center px-4 py-3 bg-surface rounded-md border border-border focus-within:border-border-secondary transition-colors">
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
                <div className="flex items-center px-4 py-3 bg-surface rounded-md border border-border focus-within:border-border-secondary transition-colors">
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
                  <span className="text-text-error text-xs">
                    {errors.lastName}
                  </span>
                )}
              </label>
            </div>

            {/* EMAIL & PHONE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-text-secondary text-sm font-medium">
                  Email Address
                </span>
                <div className="flex items-center px-4 py-3 bg-surface rounded-md border border-border focus-within:border-border-secondary transition-colors">
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
                  <span className="text-text-error text-xs">
                    {errors.email}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-text-secondary text-sm font-medium">
                  Phone Number
                </span>
                <div className="flex items-center px-4 py-3 bg-surface rounded-md border border-border focus-within:border-border-secondary transition-colors">
                  <input
                    type="tel"
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full outline-none bg-transparent text-sm text-text-primary"
                    placeholder="9876543210"
                    value={values.phone}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, "");
                      if (onlyDigits.length <= 10) {
                        setFieldValue("phone", onlyDigits);
                      }
                    }}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.phone && (
                  <span className="text-text-error text-xs">
                    {errors.phone}
                  </span>
                )}
              </label>
            </div>

            {/* PASSWORD */}
            <label className="flex flex-col gap-2">
              <span className="text-text-secondary text-sm font-medium">
                Password
              </span>
              <div className="flex items-center px-4 py-3 bg-surface rounded-md gap-2 border border-border focus-within:border-border-secondary transition-colors">
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1"
                >
                  {showPassword ? (
                    <IoEyeOffOutline size={18} />
                  ) : (
                    <IoEyeOutline size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-text-error text-xs">
                  {errors.password}
                </span>
              )}
            </label>

            {/* GENDER */}
            <label className="flex flex-col gap-2">
              <span className="text-text-secondary text-sm font-medium">
                Gender Identity
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {["Male", "Female", "Others", "N/A"].map((gender) => (
                  <div
                    key={gender}
                    onClick={() => !isSubmitting && handleGenderClick(gender)}
                    className={`px-2 py-2 border border-border rounded text-center transition-colors ${
                      selectedGender === gender
                        ? "bg-primary text-text-primary"
                        : isSubmitting
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-accent cursor-pointer"
                    }`}
                  >
                    {gender}
                  </div>
                ))}
              </div>
              {errors.gender && (
                <span className="text-text-error text-xs">{errors.gender}</span>
              )}
            </label>

            {/* SUBMIT */}
            <button
              type="submit"
              className="group flex items-center justify-center w-full py-3 bg-primary text-text-primary text-sm font-semibold rounded-md hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
              <FaArrowRightLong
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-all"
              />
            </button>

            <div className="h-px w-full bg-border"></div>

            <div className="flex justify-center items-center gap-2 text-sm">
              <span className="text-text-secondary/60">
                Already have an account?
              </span>
              <Link
                to="/auth/login"
                className="text-accent hover:text-primary font-medium transition-colors cursor-pointer"
              >
                Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
