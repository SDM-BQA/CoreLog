import { LockIcon } from "lucide-react";
import {
  IoPersonOutline,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login_user_account_mutation } from "../../../@apis/users";
import { toast } from "react-toast";

import {
  validateEmail,
  validatePassword,
} from "../../../@validator/auth.validator";
import { useForm } from "../../../@hooks/Form/useForm";
import { useAppDispatch } from "../../../@store/hooks/store.hooks";
import { set_user } from "../../../@store/slices/user/user.slice";
import { AuthSuccess } from "../../../@components/AuthSuccess";
import { AuthShell } from "../../../@components/AuthShell";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loginUser, setLoginUser] = useState<string | null>(null);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
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
      try {
        const response = await login_user_account_mutation({
          email_id: values.email,
          password: values.password,
          keep_signed_in: keepSignedIn,
        });

        if (response) {
          // 1. Store User and Tokens in Redux (State & Persistance)
          dispatch(
            set_user({
              user: response.user,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              keepSignedIn,
            })
          );

          setLoginUser(response.user.first_name);

          // 2. Redirect to Dashboard
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000); // 2s for the animation to play
        }
      } catch (error) {
        toast.error((error as Error).message || "Failed to login");
      }
    },
  });

  if (loginUser) {
    return (
      <AuthSuccess
        title={`Welcome back, ${loginUser}!`}
        subtitle="Setting up your personal dashboard..."
      />
    );
  }

  return (
    <AuthShell variant="login" title="Welcome back" subtitle="Enter your credentials to access your dashboard.">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* EMAIL FIELD */}
            <label htmlFor="email" className="flex flex-col gap-2">
              <span className="text-text-secondary text-sm font-medium">
                Email
              </span>
              <div
                className={`flex items-center px-4 py-3.5 bg-bg/60 rounded-xl gap-2 border transition-all ${
                  errors.email ? "border-error" : "border-border"
                } focus-within:border-accent focus-within:ring-4 focus-within:ring-primary/20`}
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
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-blue-300 hover:text-text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </span>
              <div
                className={`flex items-center px-4 py-3.5 bg-bg/60 rounded-xl gap-2 border transition-all ${
                  errors.password ? "border-error" : "border-border"
                } focus-within:border-accent focus-within:ring-4 focus-within:ring-primary/20`}
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
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-4 h-4 accent-primary rounded"
                disabled={isSubmitting}
              />
              <span className="select-none">Keep me signed in</span>
            </label>

            {/* LOGIN BUTTON */}
            <button
              className="group flex items-center justify-center w-full py-3 bg-primary text-text-primary text-sm font-semibold rounded-xl shadow-lg shadow-primary/30 hover:bg-accent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
              <FaArrowRightLong
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-all"
              />
            </button>
          </div>
        </form>
    </AuthShell>
  );
};

export default Login;
