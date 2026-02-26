import { AtSign, LockIcon } from "lucide-react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useState } from "react";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string | null>(null); // State to track selected gender

  // Handle gender click
  const handleGenderClick = (gender: string) => {
    setSelectedGender(gender);
  };

  return (
    <div className="bg-bg h-screen flex flex-col w-full mx-auto justify-center items-center">
      <div className="flex flex-col gap-1 mb-5">
        <div className="text-text-primary text-3xl font-bold font-inter ">
          Create your account
        </div>
        <div className="text-text-secondary text-lg mt-2">
          Join our community of enthusiasts.
        </div>
      </div>
      <div className="absolute bottom-8 right-8">
        <img src="/gear.png" alt="Gear" className="w-64 h-64 opacity-20" />
      </div>
      <div className="bg-bg-secondary backdrop-blur-md shadow-2xl p-8 rounded-md w-lg flex flex-col justify-center gap-6">
        {/* form */}
        <div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 justify-between">
              {/* first name */}
              <label htmlFor="fName" className="flex flex-col gap-3">
                <span className="text-text-secondary font-bold">
                  First Name
                </span>
                <div className="flex items-center px-4 py-4 bg-surface rounded-md gap-2 text-text-secondary text-lg border-2 border-border focus-within:border-border-secondary transition-colors relative">
                  <input
                    id="fName"
                    type="text"
                    className="w-full outline-none bg-transparent text-text-primary"
                    placeholder="John"
                  />
                </div>
              </label>

              {/* last name */}
              <label htmlFor="lName" className="flex flex-col gap-3">
                <span className="text-text-secondary font-bold">Last Name</span>
                <div className="flex items-center px-4 py-4 bg-surface rounded-md gap-2 text-text-secondary text-lg border-2 border-border focus-within:border-border-secondary transition-colors relative">
                  <input
                    id="lName"
                    type="text"
                    className="w-full outline-none bg-transparent text-text-primary"
                    placeholder="Doe"
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center gap-2 justify-between">
              {/* mobile */}
              <label htmlFor="email" className="flex flex-col gap-3">
                <span className="text-text-secondary font-bold">
                  Email Address
                </span>
                <div className="flex items-center px-4 py-4 bg-surface rounded-md gap-2 text-text-secondary text-lg border-2 border-border focus-within:border-border-secondary transition-colors relative">
                  <input
                    id="email"
                    type="email"
                    className="w-full outline-none bg-transparent text-text-primary"
                    placeholder="john@example.com"
                  />
                </div>
              </label>

              {/* mobile */}
              <label htmlFor="mobile" className="flex flex-col gap-3">
                <span className="text-text-secondary font-bold">
                  Mobile Number
                </span>
                <div className="flex items-center px-4 py-4 bg-surface rounded-md gap-2 text-text-secondary text-lg border-2 border-border focus-within:border-border-secondary transition-colors relative">
                  <input
                    id="mobile"
                    type="number"
                    className="w-full outline-none bg-transparent text-text-primary"
                    placeholder="+91 1234567890"
                  />
                </div>
              </label>
            </div>

            {/* PASSWORD FIELD */}
            <label htmlFor="password" className="flex flex-col gap-3">
              <span className="flex items-center justify-between text-text-secondary font-bold">
                <span>Password</span>
              </span>
              <div className="flex items-center px-4 py-4 bg-surface rounded-md gap-2 text-text-secondary text-lg border-2 border-border focus-within:border-border-secondary transition-colors relative">
                <LockIcon
                  className="text-text-secondary focus-within:text-surface transition-colors"
                  size={20}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
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
            </label>

            {/* gender */}
            <label htmlFor="gender" className="flex flex-col gap-3">
              <span className="text-text-secondary font-bold">
                Gender Identity
              </span>
              <div className="flex items-center justify-between gap-2">
                {["Male", "Female", "Others", "N/A"].map((gender) => (
                  <div
                    key={gender}
                    onClick={() => handleGenderClick(gender)}
                    className={`flex-1 cursor-pointer px-2 py-1 border border-border rounded text-center text-text-primary hover:bg-accent transition-colors  ${
                      selectedGender === gender
                        ? "bg-accent text-text-primary" // Apply styles for selected gender
                        : "text-text-primary"
                    }`}
                  >
                    {gender}
                  </div>
                ))}
              </div>
            </label>

            {/* LOGIN BUTTON */}
            <Link to="/auth/login/otp-verify" className="w-full">
              <button className="group flex items-center justify-center w-full py-4 bg-primary text-text-primary font-bold rounded-md hover:bg-primary/80 transition-colors cursor-pointer">
                <span className="font-inter">Create Account</span>
                <FaArrowRightLong
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-all"
                />
              </button>
            </Link>
            {/* divider */}
            <div className="h-0.5 w-full bg-border"></div>

            {/* footer */}
            <div className="flex justify-center items-center gap-2">
              <span className="text-text-secondary/60 text-sm">
                Already have an account?{" "}
              </span>
              <Link
                to="/auth/login"
                className="text-accent hover:text-primary text-sm font-bold transition-colors"
              >
                Login to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
