import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

const OTPVerifyPage = () => {
  const [timeLeft, setTimeLeft] = useState(59);
  const inputs = Array.from({ length: 6 }).map(() =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRef<HTMLInputElement>(null),
  );

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    nextInput: React.RefObject<HTMLInputElement | null> | undefined,
    prevInput: React.RefObject<HTMLInputElement | null> | undefined,
  ) => {
    const value = e.target.value;

    // If the input length is 1, move to the next input
    if (value.length === 1 && nextInput) {
      nextInput.current?.focus();
    }

    // If the input length is 0 (deleting), move to the previous input
    if (value.length === 0 && prevInput) {
      prevInput.current?.focus();
    }

    // Prevent entering more than one digit
    if (value.length > 1) {
      e.target.value = value.slice(0, 1); // Keep only the first digit
    }
  };

  // time
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1) {
          clearInterval(interval); // Stop the interval when the timer reaches 0
          return 0;
        }
        return prevTimeLeft - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-bg flex flex-col items-center justify-center font-inter gap-8">
      <div className="flex flex-col items-center gap-4">
        <p className="text-4xl font-bold">Verify your account</p>
        <p className="text-text-secondary text-xl">
          We've sent a 6-digit code to{" "}
          <span className="font-semibold text-primary">example@gmail.com</span>
        </p>
      </div>

      <div className="bg-bg-secondary backdrop-blur-md shadow-2xl p-8 rounded-md w-lg flex flex-col justify-center gap-8 border border-border">
        {/* OTP input */}
        <div className="flex items-center justify-between">
          {inputs.map((inputRef, index) => {
            // Get the next and previous input references
            const prevInput = inputs[index - 1];
            const nextInput = inputs[index + 1];

            return (
              <input
                key={index}
                type="number"
                className="w-16 h-18 border border-text-secondary rounded-lg text-center"
                placeholder="*"
                max="9"
                min="0"
                ref={inputRef}
                onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInput(e, nextInput, prevInput)
                }
              />
            );
          })}
        </div>
        <Link to="/dashboard">
          <button className="group flex items-center justify-center w-full py-4 bg-primary text-text-primary font-bold rounded-md hover:bg-primary/80 transition-colors cursor-pointer">
            <span className="font-inter">Verify account</span>
            <FaArrowRightLong
              size={18}
              className="ml-2 group-hover:translate-x-1 transition-all"
            />
          </button>
        </Link>
        {/* Timer Section */}
        <div className="flex justify-center">
          <span className="flex items-center justify-center gap-2 bg-slate-800 text-slate-200 py-2 px-3 rounded-lg w-56">
            <Clock />
            {`Resend Code in: 00:${String(timeLeft).padStart(2, "0")}`}
          </span>
        </div>

        <p className="text-text-secondary text-lg text-center">
          Didn't receive the code?{" "}
          <Link
            to={"/"}
            className={` transition-colors ${
              timeLeft > 0
                ? "font-bolder pointer-events-none opacity-90 cursor-not-allowed text-primary"
                : "text-accent hover:text-primary"
            }`}
            tabIndex={timeLeft > 0 ? -1 : 0}
            aria-disabled={timeLeft > 0}
            onClick={() => setTimeLeft(59)}
          >
            Resend Code
          </Link>
        </p>
      </div>

      <Link
        to={"/auth/signup"}
        className="text-text-secondary text-sm text-center flex items-center group hover:text-text-primary transition-colors gap-2"
      >
        <FaArrowLeftLong size={18} className="ml-2" />
        Back to Sign Up
      </Link>
    </div>
  );
};

export default OTPVerifyPage;
