import { FaArrowRightLong } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { send_otp_mutation, verify_otp_mutation } from "../../../../../@apis/users";
import { toast } from "react-toast";


type Props = {
  email: string;
  onStepComplete: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
};

const OTPVerify = ({ email, onStepComplete, onBack, isSubmitting = false }: Props) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(59);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const inputs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  // Timer
  useEffect(() => {
    if (timeLeft === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Initial OTP Request
  useEffect(() => {
    const initOTP = async () => {
      try {
        setIsSendingOTP(true);
        const success = await send_otp_mutation(email);
        if (success) {
          toast.success("OTP sent to your email!");
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
      } catch (error) {
        toast.error("An error occurred while sending OTP.");
      } finally {
        setIsSendingOTP(false);
      }
    };
    initOTP();
  }, [email]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const val = e.target.value.replace(/\D/g, ""); // digits only
    if (!val && val !== "") return;

    const updated = [...otp];
    updated[index] = val.slice(-1); // keep last digit only
    setOtp(updated);
    setOtpError(null);

    if (val && index < 5) inputs[index + 1].current?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = Array(6).fill("");
    pasted.split("").forEach((char, i) => (updated[i] = char));
    setOtp(updated);
    // focus last filled or last box
    const focusIndex = Math.min(pasted.length, 5);
    inputs[focusIndex].current?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    
    try {
      const isValid = await verify_otp_mutation(email, code);
      if (isValid) {
        onStepComplete();
      } else {
        setOtpError("Invalid or expired OTP. Please try again.");
        toast.error("Verification failed.");
      }
    } catch (error) {
      toast.error("An error occurred during verification.");
    }
  };


  const handleResend = async () => {
    if (timeLeft > 0 || isSendingOTP) return;
    try {
      setIsSendingOTP(true);
      setOtp(Array(6).fill(""));
      setOtpError(null);
      
      const success = await send_otp_mutation(email);
      if (success) {
        setTimeLeft(59);
        toast.success("A new OTP has been sent!");
        inputs[0].current?.focus();
      } else {
        toast.error("Failed to resend OTP.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsSendingOTP(false);
    }
  };


  const isFilled = otp.every((d) => d !== "");

  return (
    <div className="flex flex-col gap-6">

      {/* Email hint */}
      <p className="text-text-secondary text-sm text-center">
        We've sent a 6-digit code to{" "}
        <span className="text-primary font-semibold">{email}</span>
      </p>

      {/* OTP BOXES */}
      <div className="flex items-center justify-between gap-2">
        {inputs.map((ref, index) => (
          <input
            key={index}
            ref={ref}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index]}
            disabled={isSubmitting || isSendingOTP}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`
              w-full aspect-square max-w-[52px] text-center text-lg font-semibold
              bg-surface border rounded-md outline-none text-text-primary
              transition-colors
              ${otpError
                ? "border-text-error"
                : otp[index]
                  ? "border-primary"
                  : "border-border focus:border-border-secondary"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          />
        ))}
      </div>

      {otpError && (
        <span className="text-text-error text-xs -mt-3">{otpError}</span>
      )}

      {/* VERIFY BUTTON */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={isSubmitting || isSendingOTP || !isFilled}
        className="group flex items-center justify-center w-full py-3 bg-primary text-text-primary text-sm font-semibold rounded-md hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Verifying..." : isSendingOTP ? "Sending OTP..." : "Verify Account"}
        <FaArrowRightLong
          size={16}
          className="ml-2 group-hover:translate-x-1 transition-all"
        />
      </button>

      {/* TIMER */}
      <div className="flex justify-center">
        <span className="flex items-center gap-2 bg-surface border border-border text-text-secondary text-xs py-2 px-4 rounded-md">
          <Clock size={14} />
          {timeLeft > 0
            ? `Resend code in 00:${String(timeLeft).padStart(2, "0")}`
            : "You can now resend the code"}
        </span>
      </div>

      <div className="h-px w-full bg-border" />

      {/* RESEND + BACK */}
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={timeLeft > 0 || isSubmitting || isSendingOTP}
          className={`transition-colors font-medium ${
            timeLeft > 0 || isSendingOTP
              ? "text-text-secondary/40 cursor-not-allowed"
              : "text-accent hover:text-primary"
          }`}
        >
          {isSendingOTP ? "Sending..." : "Resend Code"}
        </button>
      </div>

    </div>
  );
};

export default OTPVerify;