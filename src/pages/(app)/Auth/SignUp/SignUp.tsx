import { useState } from "react";
import { useMultiStepForm } from "../../../../@hooks/Form/useMultiStepForm";
import { StepProgressBar } from "../../../../@components/StepProgressBar";
import BasicInfo from "./Steps/BasicInfo";
import ProfileSetup from "./Steps/ProfileSetup";
import OTPVerify from "./Steps/OTP-Verify";
import { create_user_account_mutation } from "../../../../@apis/users";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toast";

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: "basicInfo", label: "Basic Info" },
  { id: "profileSetup", label: "Profile" },
  { id: "otpVerify", label: "Verify" },
] as const;

// ─── Step meta — title + subtitle per step ───────────────────────────────────
const STEP_META = {
  basicInfo: {
    title: "Create your account",
    subtitle: "Join our community of enthusiasts.",
  },
  profileSetup: {
    title: "Set up your profile",
    subtitle: "Let others know who you are.",
  },
  otpVerify: {
    title: "Verify your email",
    subtitle: "One last step before you're in.",
  },
} satisfies Record<
  (typeof STEPS)[number]["id"],
  { title: string; subtitle: string }
>;

// ─────────────────────────────────────────────────────────────────────────────

const SignUp = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentStepIndex, currentStep, nextStep, prevStep, collectedData } =
    useMultiStepForm({
      steps: [...STEPS],
      onComplete: async (allData) => {
        try {
          setIsSubmitting(true);
          const response = await create_user_account_mutation({
            first_name: allData.basicInfo.firstName,
            last_name: allData.basicInfo.lastName,
            email_id: allData.basicInfo.email,
            mobile_no: allData.basicInfo.phone,
            password: allData.basicInfo.password,
            gender: allData.basicInfo.gender,
            // profile_pic: allData.profileSetup.avatar,
            // user_name: allData.profileSetup.username,
          });
          console.log(response);
          if (response) {
            navigate("/auth/login");
          }
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to create user account";
          toast.error(message);
        } finally {
          setIsSubmitting(false);
        }
      },
    });

  const meta = STEP_META[currentStep.id as keyof typeof STEP_META];

  return (
    <div className="bg-bg min-h-screen flex flex-col w-full mx-auto justify-center items-center px-4">
      <div className="mt-20"></div>
      {/* ── Heading ── */}
      <div className="flex flex-col gap-1 mb-6 text-center">
        <div className="text-text-primary text-2xl font-semibold font-inter">
          {meta.title}
        </div>
        <div className="text-text-secondary text-base mt-1">
          {meta.subtitle}
        </div>
      </div>

      {/* ── Decorative gear ── */}
      <div className="absolute bottom-8 right-8 hidden md:block">
        <img src="/gear.png" alt="Gear" className="w-64 h-64 opacity-20" />
      </div>

      {/* ── Card ── */}
      <div className="bg-bg-secondary backdrop-blur-md shadow-xl p-8 rounded-md w-full max-w-2xl flex flex-col gap-6">
        {/* Progress bar */}
        <StepProgressBar
          steps={[...STEPS]}
          currentIndex={currentStepIndex}
          onStepClick={(index) => index < currentStepIndex && prevStep()}
        />

        <div className="h-px w-full bg-border" />

        {/* ── Steps ── */}
        {currentStep.id === "basicInfo" && (
          <BasicInfo
            onStepComplete={(data) => nextStep("basicInfo", data)}
            defaultValues={collectedData.basicInfo}
          />
        )}

        {currentStep.id === "profileSetup" && (
          <ProfileSetup
            onStepComplete={(data) => nextStep("profileSetup", data)}
            onBack={prevStep}
            defaultValues={collectedData.profileSetup}
          />
        )}

        {currentStep.id === "otpVerify" && (
          <OTPVerify
            email={collectedData.basicInfo?.email ?? ""}
            onStepComplete={() => nextStep("otpVerify", {})}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default SignUp;
