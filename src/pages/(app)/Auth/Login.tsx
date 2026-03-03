import { LockIcon } from "lucide-react";
import {
  IoPersonOutline,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  validateEmail,
  validatePassword,
} from "../../../@validator/auth.validator";
import { useForm } from "../../../@hooks/Form/useForm";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    isSubmitting,
  } = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: {
      email: validateEmail,
      password: validatePassword,
    },
    onSubmit: async (values) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 5000);
      });
      console.log("Login valid", values);
      resetForm();
    },
  });

  return (
    <div className="bg-bg min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute bottom-8 right-8 hidden md:block">
        <img src="/gear.png" alt="Gear" className="w-64 h-64 opacity-20" />
      </div>

      <div className="bg-bg-secondary backdrop-blur-md shadow-xl p-8 rounded-md w-full max-w-md flex flex-col gap-6">
        <div>
          <div className="text-text-primary text-2xl font-semibold font-inter">
            Welcome Back
          </div>
          <div className="text-text-secondary text-base mt-1">
            Enter your credentials to access your dashboard.
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* EMAIL FIELD */}
            <label htmlFor="email" className="flex flex-col gap-2">
              <span className="text-text-secondary text-sm font-medium">
                Email
              </span>
              <div
                className={`flex items-center px-4 py-3 bg-surface rounded-md gap-2 border transition-all ${
                  errors.email ? "border-error" : "border-border"
                } focus-within:border-border-secondary`}
              >
                <IoPersonOutline size={18} className="text-text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange("email")}
                  className="w-full outline-none bg-transparent text-sm text-text-primary"
                  placeholder="name@gmail.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <span className="text-text-error text-xs">{errors.email}</span>
              )}
            </label>

            {/* PASSWORD FIELD */}
            <label htmlFor="password" className="flex flex-col gap-2">
              <span className="flex items-center justify-between text-sm font-medium text-text-secondary">
                <span>Password</span>
                <Link to="/" className="text-xs text-accent hover:text-primary">
                  Forgot Password?
                </Link>
              </span>
              <div
                className={`flex items-center px-4 py-3 bg-surface rounded-md gap-2 border transition-all ${
                  errors.password ? "border-error" : "border-border"
                } focus-within:border-border-secondary`}
              >
                <LockIcon size={18} className="text-text-secondary" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange("password")}
                  className="flex-1 outline-none bg-transparent text-sm text-text-primary"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="p-1"
                  onClick={() => setShowPassword(!showPassword)}
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

            {/* REMEMBER ME */}
            <label
              htmlFor="remember"
              className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer"
            >
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 accent-primary rounded"
                disabled={isSubmitting}
              />
              <span className="select-none">Keep me signed in</span>
            </label>

            {/* LOGIN BUTTON */}
            <button
              className="group flex items-center justify-center w-full py-3 bg-primary text-text-primary text-sm font-semibold rounded-md hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
              <FaArrowRightLong
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-all"
              />
            </button>

            <div className="h-px w-full bg-border"></div>

            <div className="flex justify-center items-center gap-2 text-sm">
              <span className="text-text-secondary/60">
                Don't have an account?
              </span>
              <Link
                to="/auth/signup"
                className="text-accent hover:text-primary font-medium transition-colors cursor-pointer"
              >
                Create one
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
