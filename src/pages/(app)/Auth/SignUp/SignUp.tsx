import { useState } from "react";
import { useMultiStepForm } from "../../../../@hooks/Form/useMultiStepForm";
import { StepProgressBar } from "../../../../@components/StepProgressBar";
import BasicInfo from "./Steps/BasicInfo";
import ProfileSetup from "./Steps/ProfileSetup";
import OTPVerify from "./Steps/OTP-Verify";
import { AuthSuccess } from "../../../../@components/AuthSuccess";
import { AuthShell } from "../../../../@components/AuthShell";
import { create_user_account_mutation, upload_image_api } from "../../../../@apis/users";

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
  const [showSuccess, setShowSuccess] = useState(false);

  const { currentStepIndex, currentStep, nextStep, prevStep, collectedData } =
    useMultiStepForm({
      steps: [...STEPS],
      onComplete: async (allData) => {
        try {
          setIsSubmitting(true);

          let profilePicUrl = "";
          if (allData.profileSetup.avatar) {
            profilePicUrl = await upload_image_api(allData.profileSetup.avatar);
          }

          const response = await create_user_account_mutation({
            first_name: allData.basicInfo.firstName,
            last_name: allData.basicInfo.lastName,
            email_id: allData.basicInfo.email,
            mobile_no: allData.basicInfo.phone,
            password: allData.basicInfo.password,
            gender: allData.basicInfo.gender,
            profile_pic: profilePicUrl,
            user_name: allData.profileSetup.username,
          });

          console.log(response);
          if (response) {
            setShowSuccess(true);
            setTimeout(() => {
              navigate("/auth/login");
            }, 2500);
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

  if (showSuccess) {
    return (
      <AuthSuccess
        title="Account Created!"
        subtitle="Your journey with CoreLog begins now. Redirecting to login..."
      />
    );
  }

  return (
    <AuthShell variant="signup" title={meta.title} subtitle={meta.subtitle} wide>
        {/* Progress bar */}
        <StepProgressBar
          steps={[...STEPS]}
          currentIndex={currentStepIndex}
          onStepClick={(index) => index < currentStepIndex && prevStep()}
        />

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
    </AuthShell>
  );
};

export default SignUp;
