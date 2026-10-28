import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toast";
import { LockIcon } from "lucide-react";
import { IoMailOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";
import { AuthShell } from "../../../@components/AuthShell";
import { AuthSuccess } from "../../../@components/AuthSuccess";
import { validateEmail, validatePassword } from "../../../@validator/auth.validator";
import { reset_password_mutation, send_password_reset_otp_mutation } from "../../../@apis/users";

const RESEND_SECONDS = 60;

const inputWrap = (hasError: boolean) =>
  `flex items-center px-4 py-3.5 bg-bg/60 rounded-xl gap-2 border transition-all ${
    hasError ? "border-error" : "border-border"
  } focus-within:border-accent focus-within:ring-4 focus-within:ring-primary/20`;

const primaryBtn =
  "group flex items-center justify-center w-full py-3 bg-primary text-text-primary text-sm font-semibold rounded-xl shadow-lg shadow-primary/30 hover:bg-accent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const sendCode = async () => {
    const emailError = validateEmail(email.trim());
    if (emailError) {
      setErrors({ email: emailError });
      return false;
    }
    try {
      setLoading(true);
      await send_password_reset_otp_mutation(email.trim());
      setCooldown(RESEND_SECONDS);
      return true;
    } catch (error) {
      toast.error((error as Error).message || "Failed to send the code");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (await sendCode()) {
      toast.success("If that email is registered, a code is on its way.");
      setStep("reset");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    if (await sendCode()) toast.success("A new code has been sent.");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string | undefined> = {};
    if (otp.length !== 6) next.otp = "Enter the 6-digit code";
    const passwordError = validatePassword(password);
    if (passwordError) next.password = passwordError;
    if (!next.password && confirm !== password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setLoading(true);
      await reset_password_mutation(email.trim(), otp, password);
      setDone(true);
      setTimeout(() => navigate("/auth/login"), 2500);
    } catch (error) {
      toast.error((error as Error).message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthSuccess
        title="Password updated!"
        subtitle="You can now log in with your new password. Redirecting..."
      />
    );
  }

  return (
    <AuthShell
      variant="recover"
      title={step === "email" ? "Forgot your password?" : "Reset your password"}
      subtitle={
        step === "email"
          ? "Enter your email and we'll send you a 6-digit code."
          : `Enter the code we sent to ${email.trim()} and choose a new password.`
      }
    >
      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} noValidate className="flex flex-col gap-6">
          <label htmlFor="email" className="flex flex-col gap-2">
            <span className="text-text-secondary text-sm font-medium">Email</span>
            <div className={inputWrap(!!errors.email)}>
              <IoMailOutline size={18} className="text-text-secondary" />
              <input
                id="email"
                type="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({});
                }}
                className="w-full outline-none bg-transparent text-sm text-text-primary"
                placeholder="name@gmail.com"
                disabled={loading}
              />
            </div>
            {errors.email && <span className="text-text-error text-xs">{errors.email}</span>}
          </label>

          <button type="submit" disabled={loading} className={primaryBtn}>
            {loading ? "Sending..." : "Send reset code"}
            <FaArrowRightLong size={16} className="ml-2 group-hover:translate-x-1 transition-all" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} noValidate className="flex flex-col gap-6">
          <label htmlFor="otp" className="flex flex-col gap-2">
            <span className="text-text-secondary text-sm font-medium">Verification code</span>
            <div className={inputWrap(!!errors.otp)}>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setErrors((p) => ({ ...p, otp: undefined }));
                }}
                className="w-full outline-none bg-transparent text-center text-xl font-semibold tracking-[0.5em] text-text-primary"
                placeholder="------"
                disabled={loading}
              />
            </div>
            {errors.otp && <span className="text-text-error text-xs">{errors.otp}</span>}
          </label>

          <label htmlFor="password" className="flex flex-col gap-2">
            <span className="text-text-secondary text-sm font-medium">New password</span>
            <div className={inputWrap(!!errors.password)}>
              <LockIcon size={18} className="text-text-secondary" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: undefined }));
                }}
                className="flex-1 outline-none bg-transparent text-sm text-text-primary"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
              </button>
            </div>
            {errors.password && <span className="text-text-error text-xs">{errors.password}</span>}
          </label>

          <label htmlFor="confirm" className="flex flex-col gap-2">
            <span className="text-text-secondary text-sm font-medium">Confirm new password</span>
            <div className={inputWrap(!!errors.confirm)}>
              <LockIcon size={18} className="text-text-secondary" />
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setErrors((p) => ({ ...p, confirm: undefined }));
                }}
                className="flex-1 outline-none bg-transparent text-sm text-text-primary"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            {errors.confirm && <span className="text-text-error text-xs">{errors.confirm}</span>}
          </label>

          <button type="submit" disabled={loading} className={primaryBtn}>
            {loading ? "Updating..." : "Update password"}
            <FaArrowRightLong size={16} className="ml-2 group-hover:translate-x-1 transition-all" />
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setErrors({});
              }}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Use a different email
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || loading}
              className="text-blue-300 hover:text-text-primary transition-colors disabled:text-text-secondary/60 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
