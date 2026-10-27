import { useState, useCallback, useEffect } from "react";
import {
  BookLock,
  Fingerprint,
  Delete,
  Shield,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Mail,
  KeyRound,
} from "lucide-react";
import type { JournalLockAPI } from "./useJournalLock";
import { send_journal_pin_reset_otp_mutation, verify_otp_mutation } from "../../../../@apis/users";

const PIN_LENGTH = 4;
const OTP_LENGTH = 6;

type Step = "locked" | "create" | "confirm" | "biometric_offer" | "otp_send" | "otp_verify";

type Props = Pick<
  JournalLockAPI,
  | "hasPin"
  | "hasBiometric"
  | "biometricSupported"
  | "unlock"
  | "unlockWithBiometric"
  | "setupPin"
  | "forceUnlock"
  | "registerBiometric"
  | "resetLock"
> & { userEmail?: string };

const maskEmail = (email: string) => {
  const [u, domain] = email.split("@");
  return `${u.slice(0, Math.min(3, u.length))}***@${domain}`;
};

// ── Dots ─────────────────────────────────────────────────────────────────────
const Dots = ({ filled, total, shaking, success }: { filled: number; total: number; shaking: boolean; success: boolean }) => (
  <div className={`flex items-center gap-3 ${shaking ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`rounded-full border-2 transition-all duration-150 ${total === OTP_LENGTH ? "w-3 h-3" : "w-4 h-4"} ${
        success ? "bg-emerald-500 border-emerald-500 scale-110"
        : i < filled ? "bg-accent border-accent scale-110"
        : "border-border bg-transparent"
      }`} />
    ))}
  </div>
);

// ── Number pad ────────────────────────────────────────────────────────────────
const PAD_KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],["biometric","0","delete"]] as const;

const NumberPad = ({ onDigit, onDelete, onBiometric, showBiometric, biometricLoading, disabled }: {
  onDigit: (d: string) => void; onDelete: () => void; onBiometric: () => void;
  showBiometric: boolean; biometricLoading: boolean; disabled: boolean;
}) => (
  <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
    {PAD_KEYS.flat().map((key) => {
      if (key === "biometric") {
        if (!showBiometric) return <div key="bio-placeholder" />;
        return (
          <button key="biometric" onClick={onBiometric} disabled={disabled || biometricLoading}
            className="flex items-center justify-center h-14 rounded-2xl bg-surface border border-border text-text-secondary hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all active:scale-95 disabled:opacity-50"
            title="Use fingerprint / Face ID">
            {biometricLoading ? <Loader2 size={20} className="animate-spin" /> : <Fingerprint size={22} />}
          </button>
        );
      }
      if (key === "delete") {
        return (
          <button key="delete" onClick={onDelete} disabled={disabled}
            className="flex items-center justify-center h-14 rounded-2xl bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg transition-all active:scale-95 disabled:opacity-40">
            <Delete size={18} />
          </button>
        );
      }
      return (
        <button key={key} onClick={() => onDigit(key)} disabled={disabled}
          className="flex items-center justify-center h-14 rounded-2xl bg-surface border border-border text-text-primary text-xl font-bold hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-all active:scale-95 disabled:opacity-40">
          {key}
        </button>
      );
    })}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const JournalLock = ({
  hasPin, hasBiometric, biometricSupported,
  unlock, unlockWithBiometric, setupPin, forceUnlock,
  registerBiometric, resetLock, userEmail,
}: Props) => {
  const [step,        setStep]        = useState<Step>(hasPin ? "locked" : "create");
  const [inputPin,    setInputPin]    = useState("");
  const [savedPin,    setSavedPin]    = useState("");
  const [error,       setError]       = useState("");
  const [shaking,     setShaking]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [processing,  setProcessing]  = useState(false);
  const [bioLoading,  setBioLoading]  = useState(false);
  const [otpSending,  setOtpSending]  = useState(false);
  const [otpVerifying,setOtpVerifying]= useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const activeLength = step === "otp_verify" ? OTP_LENGTH : PIN_LENGTH;

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  const handleSendOtp = useCallback(async () => {
    if (!userEmail) return;
    setOtpSending(true);
    setError("");
    try {
      await send_journal_pin_reset_otp_mutation(userEmail);
      setInputPin("");
      setStep("otp_verify");
      setResendTimer(60);
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setOtpSending(false);
  }, [userEmail]);

  const handleVerifyOtp = useCallback(async (otp: string) => {
    if (!userEmail) return;
    setOtpVerifying(true);
    setError("");
    try {
      const ok = await verify_otp_mutation(userEmail, otp);
      if (ok) {
        resetLock();
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setInputPin("");
          setSavedPin("");
          setStep("create");
          setOtpVerifying(false);
        }, 700);
      } else {
        triggerShake();
        setError("Incorrect OTP. Try again.");
        setTimeout(() => { setInputPin(""); setOtpVerifying(false); }, 500);
      }
    } catch {
      setError("Could not verify OTP. Please try again.");
      setTimeout(() => { setInputPin(""); setOtpVerifying(false); }, 500);
    }
  }, [userEmail, resetLock, triggerShake]);

  const handleDigit = useCallback(async (d: string) => {
    if (processing || success || otpVerifying) return;
    const next = inputPin + d;
    if (next.length > activeLength) return;
    setInputPin(next);
    setError("");
    if (next.length < activeLength) return;

    if (step === "otp_verify") { await handleVerifyOtp(next); return; }

    setProcessing(true);
    if (step === "locked") {
      const ok = await unlock(next);
      if (!ok) { triggerShake(); setError("Incorrect PIN. Try again."); setTimeout(() => { setInputPin(""); setProcessing(false); }, 500); }
    } else if (step === "create") {
      setSavedPin(next); setInputPin(""); setStep("confirm"); setProcessing(false);
    } else if (step === "confirm") {
      if (next === savedPin) {
        setSuccess(true);
        setTimeout(async () => {
          await setupPin(next);
          if (biometricSupported) {
            setStep("biometric_offer"); setSuccess(false); setInputPin(""); setSavedPin(""); setProcessing(false);
          } else {
            forceUnlock(); setProcessing(false);
          }
        }, 600);
      } else {
        triggerShake(); setError("PINs don't match. Try again.");
        setTimeout(() => { setInputPin(""); setSavedPin(""); setStep("create"); setProcessing(false); }, 600);
      }
    }
  }, [inputPin, processing, success, otpVerifying, step, activeLength, unlock, savedPin, setupPin, biometricSupported, forceUnlock, triggerShake, handleVerifyOtp]);

  const handleDelete = useCallback(() => {
    if (processing || success || otpVerifying) return;
    setInputPin(p => p.slice(0, -1));
    setError("");
  }, [processing, success, otpVerifying]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Backspace") { handleDelete(); return; }
      if (/^\d$/.test(e.key)) handleDigit(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDigit, handleDelete]);

  const handleBiometric = useCallback(async () => {
    if (bioLoading || processing) return;
    setBioLoading(true); setError("");
    const ok = await unlockWithBiometric();
    setBioLoading(false);
    if (!ok) setError("Biometric not recognized. Use your PIN.");
  }, [bioLoading, processing, unlockWithBiometric]);

  const handleRegisterBiometric = useCallback(async () => {
    setBioLoading(true); setError("");
    const ok = await registerBiometric();
    setBioLoading(false);
    if (!ok) setError("Could not register biometric. You can try again later.");
    forceUnlock();
  }, [registerBiometric, forceUnlock]);

  // ── OTP send screen ───────────────────────────────────────────────────────
  if (step === "otp_send") {
    return (
      <div className="bg-bg flex-1 flex items-center justify-center p-6">
        <div className="bg-surface border border-border rounded-3xl p-8 w-full max-w-sm flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Mail size={30} className="text-accent" />
          </div>
          <div className="text-center">
            <h2 className="text-text-primary text-xl font-bold">Forgot your PIN?</h2>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              We'll send a 6-digit reset code to your registered email address.
            </p>
            {userEmail && (
              <p className="text-accent font-bold text-sm mt-2">{maskEmail(userEmail)}</p>
            )}
          </div>
          {error && (
            <p className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 w-full">
              <AlertCircle size={12} className="shrink-0" /> {error}
            </p>
          )}
          <div className="flex flex-col gap-2 w-full">
            <button onClick={handleSendOtp} disabled={otpSending || !userEmail}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-background font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              {otpSending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
              Send Reset Code
            </button>
            <button onClick={() => { setStep("locked"); setError(""); }}
              className="w-full py-3 rounded-xl border border-border text-text-secondary font-medium text-sm hover:text-text-primary transition-colors">
              Back to PIN
            </button>
          </div>
        </div>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
      </div>
    );
  }

  // ── Biometric offer screen ────────────────────────────────────────────────
  if (step === "biometric_offer") {
    return (
      <div className="bg-bg flex-1 flex items-center justify-center p-6">
        <div className="bg-surface border border-border rounded-3xl p-8 w-full max-w-sm flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Fingerprint size={32} className="text-accent" />
          </div>
          <div className="text-center">
            <h2 className="text-text-primary text-xl font-bold">Enable Fingerprint?</h2>
            <p className="text-text-secondary text-sm mt-2">Use your device's biometric sensor for faster access</p>
          </div>
          {error && (
            <p className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 w-full">
              <AlertCircle size={12} className="shrink-0" /> {error}
            </p>
          )}
          <div className="flex flex-col gap-2 w-full">
            <button onClick={handleRegisterBiometric} disabled={bioLoading}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-background font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              {bioLoading ? <Loader2 size={16} className="animate-spin" /> : <Fingerprint size={16} />}
              Enable Fingerprint / Face ID
            </button>
            <button onClick={() => forceUnlock()}
              className="w-full py-3 rounded-xl border border-border text-text-secondary font-medium text-sm hover:text-text-primary transition-colors">
              Skip for Now
            </button>
          </div>
          <p className="text-text-secondary/50 text-[11px] text-center">You can enable this later from journal settings</p>
        </div>
      </div>
    );
  }

  // ── PIN / OTP screens (share the number pad) ──────────────────────────────
  const headings: Record<Step, { title: string; sub: string; icon: React.ReactNode }> = {
    locked:         { title: "Personal Journal",  sub: hasBiometric ? "Use fingerprint or enter your PIN" : "Enter your PIN to unlock",              icon: <BookLock size={30} className="text-accent" /> },
    create:         { title: "Create a PIN",       sub: "Choose a 4-digit PIN to protect your journal",                                              icon: <Shield   size={30} className="text-accent" /> },
    confirm:        { title: "Confirm PIN",        sub: "Enter your PIN again to confirm",                                                            icon: <Shield   size={30} className="text-accent" /> },
    otp_verify:     { title: "Enter Reset Code",   sub: userEmail ? `6-digit code sent to ${maskEmail(userEmail)}` : "Enter the 6-digit code from your email", icon: <KeyRound size={30} className="text-accent" /> },
    otp_send:       { title: "", sub: "", icon: null },
    biometric_offer:{ title: "", sub: "", icon: null },
  };

  const { title, sub, icon } = headings[step];
  const dotLength = step === "otp_verify" ? OTP_LENGTH : PIN_LENGTH;

  return (
    <div className="bg-bg flex-1 flex items-center justify-center p-6">
      <div className="bg-surface border border-border rounded-3xl p-8 w-full max-w-sm flex flex-col items-center gap-7 shadow-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${success ? "bg-emerald-500/15" : "bg-accent/10"}`}>
            {success ? <CheckCircle2 size={32} className="text-emerald-400" /> : icon}
          </div>
          <div className="text-center">
            <h1 className="text-text-primary text-xl font-bold">{title}</h1>
            <p className="text-text-secondary text-sm mt-1">{sub}</p>
          </div>
        </div>

        <Dots filled={inputPin.length} total={dotLength} shaking={shaking} success={success} />

        {error && !success && (
          <p className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 w-full">
            <AlertCircle size={12} className="shrink-0" /> {error}
          </p>
        )}

        <NumberPad
          onDigit={handleDigit}
          onDelete={handleDelete}
          onBiometric={handleBiometric}
          showBiometric={step === "locked" && hasBiometric}
          biometricLoading={bioLoading}
          disabled={processing || success || otpVerifying}
        />

        <div className="flex items-center justify-center gap-6 w-full pt-1 min-h-[20px]">
          {step === "locked" && (
            <button onClick={() => { setStep("otp_send"); setError(""); setInputPin(""); }}
              className="flex items-center gap-1.5 text-xs text-text-secondary/50 hover:text-text-secondary transition-colors">
              <RotateCcw size={11} /> Forgot PIN
            </button>
          )}
          {step === "otp_verify" && (
            <div className="flex items-center gap-3">
              {resendTimer > 0
                ? <span className="text-text-secondary/40 text-xs">Resend in {resendTimer}s</span>
                : <button onClick={handleSendOtp} disabled={otpSending}
                    className="text-xs text-accent hover:underline disabled:opacity-50 flex items-center gap-1">
                    {otpSending && <Loader2 size={11} className="animate-spin" />} Resend Code
                  </button>
              }
              <span className="text-border">·</span>
              <button onClick={() => { setStep("locked"); setError(""); setInputPin(""); }}
                className="text-xs text-text-secondary/50 hover:text-text-secondary transition-colors">
                Back to PIN
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
};

export default JournalLock;
