import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Sparkles, Laugh } from "lucide-react";
import Modal from "./Modal";
import { send_inner_circle_otp_mutation, verify_inner_circle_otp_mutation } from "../@apis/users";
import { useAppDispatch, useAppSelector } from "../@store/hooks/store.hooks";
import { update_user } from "../@store/slices/user/user.slice";

interface PremiumFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureMessage: string;
}

const PremiumFeatureModal = ({
  isOpen,
  onClose,
  featureTitle = "Inner Circle Feature",
  featureMessage,
}: PremiumFeatureModalProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const registeredEmail = user?.email_id || "";
  const [email, setEmail] = useState(registeredEmail);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isActive = user?.plan === "inner_circle";

  useEffect(() => {
    setEmail(registeredEmail);
  }, [registeredEmail]);

  const handleSendOtp = async () => {
    const normalized = email.trim().toLowerCase();
    setError("");
    if (!registeredEmail) {
      setError("No registered email found for this account.");
      return;
    }
    try {
      setLoading(true);
      await send_inner_circle_otp_mutation(normalized);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send Inner Circle OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalized = email.trim().toLowerCase();
    setError("");
    if (!registeredEmail || otp.trim().length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      const status = await verify_inner_circle_otp_mutation(normalized, otp.trim());
      dispatch(
        update_user({
          plan: status.plan,
          inner_circle_email: status.email || undefined,
          inner_circle_started_at: status.started_at || undefined,
          inner_circle_expires_at: status.expires_at || undefined,
        }),
      );
      setOtp("");
      setOtpSent(false);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to verify Inner Circle OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={featureTitle}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Maybe later
          </button>
          {isActive ? (
            <Link
              to="/dashboard/settings?tab=inner_circle"
              onClick={onClose}
              className="bg-emerald-500/90 hover:bg-emerald-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl"
            >
              Manage Membership
            </Link>
          ) : !otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? "Sending..." : "Send Inner Circle OTP"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? "Verifying..." : "Activate Membership"}
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="bg-gradient-to-br from-amber-500/10 via-surface to-accent/10 border border-amber-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
            <Crown size={15} className="text-amber-400" />
            Inner Circle Membership
          </div>
          <p className="text-text-secondary text-sm leading-relaxed mt-3">{featureMessage}</p>
          <div className="mt-4 pt-4 border-t border-border/60">
            <p className="text-3xl font-black text-text-primary leading-none">
              $0<span className="text-base text-text-secondary font-medium">/month</span>
            </p>
            <p className="text-xs text-text-secondary mt-2">
              Early access pricing: free while we roll this out.
            </p>
            <div className="mt-3 text-xs text-text-secondary space-y-1.5">
              <p className="flex items-center gap-1.5"><Sparkles size={12} className="text-accent" /> Unlock premium tracking features</p>
              <p className="flex items-center gap-1.5"><Laugh size={12} className="text-accent" /> 100% more main-character energy</p>
            </div>
          </div>
        </div>

        {!isActive && (
          <div className="bg-bg border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-text-secondary">
              <span className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[10px]">1</span>
              Send OTP to your registered email
              {otpSent && <span className="ml-auto text-emerald-400 font-bold">Done</span>}
            </div>
            <div>
              <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full mt-1 bg-surface/60 border border-border rounded-xl py-2.5 px-4 text-sm text-text-secondary cursor-not-allowed"
              />
            </div>
            {otpSent && (
              <div className="pt-1 border-t border-border/60">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-text-secondary mb-2">
                  <span className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[10px]">2</span>
                  Enter OTP to activate membership
                </div>
                <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full mt-1 bg-surface border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
            )}
            {error && (
              <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PremiumFeatureModal;
