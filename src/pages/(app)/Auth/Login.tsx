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
  validateLoginEmail,
  validateLoginPassword,
} from "../../../@validator/auth.validator";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = () => {
    const emailError = validateLoginEmail(email);
    const passwordError = validateLoginPassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError ?? undefined,
        password: passwordError ?? undefined,
      });
      return;
    }

    console.log("Valid form");
  };

  return (
    <div className="bg-bg h-screen flex flex-col items-center justify-center">
      <div className="absolute bottom-8 right-8">
        <img src="/gear.png" alt="Gear" className="w-64 h-64 opacity-20" />
      </div>{" "}
      <div className="bg-bg-secondary backdrop-blur-md  shadow-2xl p-8 rounded-md w-lg flex flex-col justify-center gap-6">
        <div>
          <div className="text-text-primary text-3xl font-bold font-inter">
            Welcome Back
          </div>
          <div className="text-text-secondary text-lg mt-2">
            Enter your credentials to access your activity dashboard.
          </div>
        </div>
        {/* form */}
        <div>
          <div className="flex flex-col gap-6">
            {/* EMAIL FIELD */}
            <label htmlFor="email" className="flex flex-col gap-3">
              <span className="text-text-secondary font-bold">
                EMAIL OR USERNAME
              </span>
              <div className={`flex items-center px-4 py-4 bg-surface rounded-md gap-2 text-text-secondary text-lg border-2 border-border focus-within:border-border-secondary transition-all relative ${errors.email ? "border-error" : ""}`}>
                <IoPersonOutline
                  className="text-text-secondary focus-within:text-surface transition-colors"
                  size={20}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className="w-full outline-none bg-transparent text-text-primary"
                  placeholder="name@gmail.com"
                />
              </div>
              {errors.email && (
                <span className="text-text-error text-sm mt-1">
                  {errors.email}
                </span>
              )}
            </label>

            {/* PASSWORD FIELD */}
            <label htmlFor="password" className="flex flex-col gap-3">
              <span className="flex items-center justify-between text-text-secondary font-bold">
                <span>PASSWORD</span>
                <Link to="/" className="text-sm text-accent hover:text-primary">
                  Forgot Password?
                </Link>
              </span>
              <div className={`flex items-center px-4 py-4 bg-surface rounded-md gap-2 text-text-secondary text-lg border-2 border-border focus-within:border-border-secondary transition-alll relative ${errors.password ? "border-error" : ""}`}>
                <LockIcon
                  className="text-text-secondary focus-within:text-surface transition-colors"
                  size={20}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  className="flex-1 outline-none bg-transparent text-text-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="p-1 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IoEyeOffOutline
                      className="text-text-secondary hover:text-text-primary transition-colors"
                      size={20}
                    />
                  ) : (
                    <IoEyeOutline
                      className="text-text-secondary hover:text-text-primary transition-colors"
                      size={20}
                    />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-text-error text-sm mt-1">
                  {errors.password}
                </span>
              )}
            </label>

            {/* REMEMBER ME */}
            <label
              htmlFor="remember"
              className="flex items-center gap-2 text-text-secondary cursor-pointer"
            >
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 accent-primary rounded-lg"
              />
              <span className="text-lg select-none">Keep me signed in</span>
            </label>

            {/* LOGIN BUTTON */}
            <button
              className="group flex items-center justify-center w-full py-4 bg-primary text-text-primary font-bold rounded-md hover:bg-primary/80 transition-colors cursor-pointer"
              onClick={handleSubmit}
            >
              <span className="font-inter">Sign In</span>
              <FaArrowRightLong
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-all"
              />
            </button>
            {/* divider */}
            <div className="h-0.5 w-full bg-border"></div>

            {/* footer */}
            <div className="flex justify-center items-center  gap-2">
              <span className="text-text-secondary/60 text-sm">
                Don't have an account?{" "}
              </span>
              <Link
                to="/auth/register"
                className="text-accent hover:text-primary text-sm font-bold transition-colors"
              >
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
