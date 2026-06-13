import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../@store/hooks/store.hooks";
import { get_full_image_url } from "../../../../@utils/api.utils";
import { useForm } from "../../../../@hooks/Form/useForm";
import {
  validateName,
  validateLastName,
  validatePhone,
  validateGender,
  validateAvatar
} from "../../../../@validator/auth.validator";
import {
  update_user_account_mutation,
  upload_image_api,
  get_inner_circle_status_query,
  send_inner_circle_otp_mutation,
  verify_inner_circle_otp_mutation,
  cancel_inner_circle_membership_mutation,
  type InnerCircleStatus,
} from "../../../../@apis/users";
import { update_user } from "../../../../@store/slices/user/user.slice";
import { toast } from "react-toast";
import { useJournalLock } from "../journal/useJournalLock";
import Modal from "../../../../@components/Modal";
import { useJournalTemplates } from "../../../../@hooks/useJournalTemplates";
import {
  getJournalTemplatePlaceholders,
  humanizeJournalTemplatePlaceholder,
} from "../../../../@utils/journalTemplates.utils";

import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Lock,
  ChevronRight,
  BookLock,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  KeyRound,
  Crown,
  Sparkles,
  Pencil,
} from "lucide-react";

// ── PIN OTP input (4 boxes) ───────────────────────────────────────────────────
const PinInput = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => {
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handleInput = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = value.split("").slice(0, 4);
    arr[i] = ch;
    const next = arr.join("").slice(0, 4);
    onChange(next);
    if (ch && i < 3) refs[i + 1].current?.focus();
  };

  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">{label}</label>
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => handleInput(i, e)}
            onKeyDown={(e) => handleKey(i, e)}
            disabled={disabled}
            className="w-12 h-12 text-center text-lg font-bold bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors disabled:opacity-40"
          />
        ))}
      </div>
    </div>
  );
};

const Settings = () => {
  const formatDateDDMMYYYY = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [innerCircleStatus, setInnerCircleStatus] = useState<InnerCircleStatus | null>(null);
  const [innerCircleEmail, setInnerCircleEmail] = useState(user?.email_id || "");
  const [innerCircleOtp, setInnerCircleOtp] = useState("");
  const [innerCircleOtpSent, setInnerCircleOtpSent] = useState(false);
  const [innerCircleLoading, setInnerCircleLoading] = useState(false);
  const [innerCircleError, setInnerCircleError] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelOtp, setCancelOtp] = useState("");
  const [cancelOtpSent, setCancelOtpSent] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useJournalTemplates(user?._id);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "",
    content: "",
  });

  // ── Journal lock ──────────────────────────────────────────────────────────
  const journalLock = useJournalLock();
  const [lockPanel, setLockPanel] = useState<"none" | "change" | "remove">("none");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin]         = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [lockError, setLockError]   = useState("");
  const [lockLoading, setLockLoading] = useState(false);
  const [bioLoading, setBioLoading]   = useState(false);

  const closeLockPanel = useCallback(() => {
    setLockPanel("none");
    setCurrentPin(""); setNewPin(""); setConfirmPin(""); setLockError("");
  }, []);

  const handleChangePin = useCallback(async () => {
    if (currentPin.length < 4) return setLockError("Enter your current 4-digit PIN.");
    if (newPin.length < 4)     return setLockError("Enter a new 4-digit PIN.");
    if (newPin !== confirmPin)  return setLockError("New PINs don't match.");
    if (newPin === currentPin)  return setLockError("New PIN must be different from current PIN.");
    setLockLoading(true);
    setLockError("");
    const ok = await journalLock.changePin(currentPin, newPin);
    setLockLoading(false);
    if (ok) { toast.success("PIN changed successfully!"); closeLockPanel(); }
    else    { setLockError("Current PIN is incorrect."); setCurrentPin(""); }
  }, [currentPin, newPin, confirmPin, journalLock, closeLockPanel]);

  const handleRemoveLock = useCallback(async () => {
    if (currentPin.length < 4) return setLockError("Enter your current 4-digit PIN to confirm.");
    setLockLoading(true);
    setLockError("");
    const ok = await journalLock.changePin(currentPin, currentPin); // verify PIN
    setLockLoading(false);
    if (ok) { journalLock.resetLock(); toast.success("Journal lock removed."); closeLockPanel(); }
    else    { setLockError("Incorrect PIN."); setCurrentPin(""); }
  }, [currentPin, journalLock, closeLockPanel]);

  const handleToggleBiometric = useCallback(async () => {
    setBioLoading(true);
    if (journalLock.hasBiometric) {
      journalLock.removeBiometric();
      toast.success("Fingerprint removed.");
    } else {
      const ok = await journalLock.registerBiometric();
      if (ok) toast.success("Fingerprint registered!");
      else    toast.error("Could not register fingerprint. Try again.");
    }
    setBioLoading(false);
  }, [journalLock]);

  const resetTemplateForm = useCallback(() => {
    setEditingTemplateId(null);
    setTemplateForm({ name: "", category: "", content: "" });
  }, []);

  const handleSaveJournalTemplate = useCallback(async () => {
    const name = templateForm.name.trim();
    const content = templateForm.content.trim();

    if (!name) {
      toast.error("Template name is required.");
      return;
    }

    if (!content) {
      toast.error("Template content is required.");
      return;
    }

    try {
      if (editingTemplateId) {
        await updateTemplate(editingTemplateId, templateForm);
        toast.success("Journal template updated.");
      } else {
        await createTemplate(templateForm);
        toast.success("Journal template created.");
      }

      resetTemplateForm();
    } catch (error: any) {
      toast.error(error?.data || error?.message || "Failed to save journal template.");
    }
  }, [createTemplate, editingTemplateId, resetTemplateForm, templateForm, updateTemplate]);

  const startEditingTemplate = useCallback((template: { id: string; name: string; category?: string; content: string }) => {
    setEditingTemplateId(template.id);
    setTemplateForm({
      name: template.name,
      category: template.category || "",
      content: template.content,
    });
  }, []);

  const templatePlaceholders = getJournalTemplatePlaceholders(templateForm.content);

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldValue,
  } = useForm({
    initialValues: {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      phone: user?.mobile_no || "",
      gender: user?.gender || "male",
    },
    validationSchema: {
      firstName: validateName,
      lastName: validateLastName,
      phone: validatePhone,
      gender: validateGender,
    },
    onSubmit: async (formValues) => {
      if (!user?._id) return;
      try {
        const response = await update_user_account_mutation(user._id, {
          first_name: formValues.firstName,
          last_name: formValues.lastName,
          mobile_no: formValues.phone,
          gender: formValues.gender,
        });

        if (response) {
          dispatch(update_user(response));
          toast.success("Profile updated successfully!");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to update profile");
      }
    },
  });

  const refreshInnerCircleStatus = useCallback(async () => {
    try {
      const status = await get_inner_circle_status_query();
      setInnerCircleStatus(status);
      setInnerCircleEmail(status.email || user?.email_id || "");
      setInnerCircleError("");
    } catch (error: any) {
      setInnerCircleError(error.message || "Failed to fetch Inner Circle status.");
    }
  }, [user?.email_id]);

  // Keep form in sync when user data is revalidated/loaded
  useEffect(() => {
    if (user) {
      setFieldValue("firstName", user.first_name);
      setFieldValue("lastName", user.last_name);
      setFieldValue("phone", user.mobile_no || "");
      setFieldValue("gender", user.gender || "male");
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      refreshInnerCircleStatus();
    }
  }, [user?._id, refreshInnerCircleStatus]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?._id) return;

    const error = validateAvatar(file);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const imageUrl = await upload_image_api(file);
      
      const response = await update_user_account_mutation(user._id, {
        profile_pic: imageUrl
      });

      if (response) {
        dispatch(update_user(response));
        toast.success("Profile picture updated!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendInnerCircleOtp = async () => {
    const email = (user?.email_id || "").trim().toLowerCase();
    setInnerCircleError("");
    if (!email) {
      setInnerCircleError("No registered email found for this account.");
      return;
    }

    try {
      setInnerCircleLoading(true);
      await send_inner_circle_otp_mutation(email);
      setInnerCircleOtpSent(true);
      toast.success("OTP sent. Check your email.");
    } catch (error: any) {
      setInnerCircleError(error.message || "Failed to send OTP.");
    } finally {
      setInnerCircleLoading(false);
    }
  };

  const handleVerifyInnerCircleOtp = async () => {
    const email = (user?.email_id || "").trim().toLowerCase();
    setInnerCircleError("");
    if (!email || innerCircleOtp.trim().length !== 6) {
      setInnerCircleError("Enter 6-digit OTP.");
      return;
    }

    try {
      setInnerCircleLoading(true);
      const status = await verify_inner_circle_otp_mutation(email, innerCircleOtp.trim());
      setInnerCircleStatus(status);
      setInnerCircleOtp("");
      setInnerCircleOtpSent(false);
      dispatch(update_user({
        plan: status.plan,
        inner_circle_email: status.email || undefined,
        inner_circle_started_at: status.started_at || undefined,
        inner_circle_expires_at: status.expires_at || undefined,
      }));
      toast.success(status.days_left > 30 ? "Inner Circle renewed for 1 month!" : "Welcome to Inner Circle!");
    } catch (error: any) {
      setInnerCircleError(error.message || "Failed to verify OTP.");
    } finally {
      setInnerCircleLoading(false);
    }
  };

  const handleSendCancelOtp = async () => {
    const email = (user?.email_id || "").trim().toLowerCase();
    setCancelError("");
    if (!email) {
      setCancelError("No registered email found.");
      return;
    }
    try {
      setInnerCircleLoading(true);
      await send_inner_circle_otp_mutation(email);
      setCancelOtpSent(true);
    } catch (error: any) {
      setCancelError(error.message || "Failed to send OTP.");
    } finally {
      setInnerCircleLoading(false);
    }
  };

  const handleCancelInnerCircle = async () => {
    const email = (user?.email_id || "").trim().toLowerCase();
    try {
      if (cancelOtp.trim().length !== 6) {
        setCancelError("Enter a valid 6-digit OTP.");
        return;
      }
      setInnerCircleLoading(true);
      const status = await cancel_inner_circle_membership_mutation(email, cancelOtp.trim());
      setInnerCircleStatus(status);
      setInnerCircleOtp("");
      setInnerCircleOtpSent(false);
      setCancelOtp("");
      setCancelOtpSent(false);
      setInnerCircleError("");
      setCancelError("");
      setCancelModalOpen(false);
      dispatch(update_user({
        plan: status.plan,
        inner_circle_started_at: undefined,
        inner_circle_expires_at: undefined,
      }));
      toast.success("Inner Circle membership cancelled.");
    } catch (error: any) {
      setInnerCircleError(error.message || "Failed to cancel membership.");
    } finally {
      setInnerCircleLoading(false);
    }
  };

  const settingsOptions = [
    { id: "profile", label: "Profile", icon: User, description: "Manage your personal information and public profile" },
    { id: "journal_templates", label: "Journal Templates", icon: Sparkles, description: "Create reusable personal templates for journal entries" },
    { id: "inner_circle", label: "Inner Circle", icon: Crown, description: "Activate and renew your Inner Circle membership" },
    { id: "appearance", label: "Appearance", icon: Palette, description: "Customise how CoreLog looks and feels on your device" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Choose what updates and alerts you want to receive" },
    { id: "privacy", label: "Privacy & Security", icon: Shield, description: "Control your data and manage security settings" },
    { id: "data", label: "Data Management", icon: Database, description: "Export your data or manage your cloud storage" },
  ];

  return (
    <div className="bg-bg flex-1 overflow-hidden">
      <div className="h-full w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="space-y-1 shrink-0">
          <h1 className="text-text-primary text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-text-secondary text-sm">Manage your account preferences and application settings.</p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-4 lg:min-h-0">
            <div className="flex flex-col gap-2 lg:sticky lg:top-6">
              {settingsOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setActiveTab(option.id);
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("tab", option.id);
                      return next;
                    });
                  }}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all border ${
                    activeTab === option.id 
                      ? "bg-accent/10 border-accent/20 text-text-primary shadow-sm" 
                      : "bg-surface border-border hover:border-accent/40 text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeTab === option.id ? "bg-accent text-background" : "bg-bg text-text-secondary"} transition-colors`}>
                    <option.icon size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{option.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-60 leading-tight line-clamp-1">{option.description}</p>
                  </div>
                  {activeTab === option.id && <ChevronRight size={16} className="ml-auto mt-1 text-accent" />}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content Area */}
          <div className="lg:col-span-8 min-h-0">
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 flex flex-col gap-8 shadow-sm h-full min-h-0 overflow-y-auto custom-scrollbar">
              
              {activeTab === "profile" && (
                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                      {user?.profile_pic ? (
                        <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-accent/20 transition-transform group-hover:scale-95">
                          <img 
                            src={get_full_image_url(user.profile_pic)} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-accent/20 rounded-3xl flex items-center justify-center text-accent text-3xl font-bold border-2 border-accent/20 transition-transform group-hover:scale-95">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                      )}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-background/60 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-text-primary text-xl font-bold">
                        {user?.first_name} {user?.last_name}
                      </h2>
                      <p className="text-text-secondary text-xs mt-1">
                        {innerCircleStatus?.is_active ? "Inner Circle Member" : "Free Tier Member"} • @{user?.user_name}
                      </p>
                      <button 
                        type="button" 
                        onClick={handleAvatarClick}
                        disabled={isUploadingAvatar}
                        className="text-accent text-xs font-bold hover:underline mt-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                    <div className="space-y-2">
                      <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">First Name</label>
                      <input 
                        type="text" 
                        value={values.firstName} 
                        onChange={handleChange("firstName")}
                        className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors ${errors.firstName ? 'border-error' : 'border-border'}`} 
                      />
                      {errors.firstName && <p className="text-text-error text-[10px] pl-1">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">Last Name</label>
                      <input 
                        type="text" 
                        value={values.lastName} 
                        onChange={handleChange("lastName")}
                        className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors ${errors.lastName ? 'border-error' : 'border-border'}`} 
                      />
                      {errors.lastName && <p className="text-text-error text-[10px] pl-1">{errors.lastName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">Username (Locked)</label>
                      <input 
                        type="text" 
                        value={user?.user_name || ""} 
                        disabled
                        className="w-full bg-bg/50 border border-border rounded-xl py-2.5 px-4 text-sm text-text-secondary/60 cursor-not-allowed opacity-70" 
                      />
                    </div>
                    <div className="space-y-2">
                    <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">Email Address (Locked)</label>
                      <input 
                        type="email" 
                        value={user?.email_id || ""} 
                        disabled
                        className="w-full bg-bg/50 border border-border rounded-xl py-2.5 px-4 text-sm text-text-secondary/60 cursor-not-allowed opacity-70" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">Mobile Number</label>
                      <input 
                        type="text" 
                        value={values.phone} 
                        onChange={handleChange("phone")}
                        className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors ${errors.phone ? 'border-error' : 'border-border'}`} 
                      />
                      {errors.phone && <p className="text-text-error text-[10px] pl-1">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">Gender</label>
                      <select 
                        value={values.gender} 
                        onChange={handleChange("gender")}
                        className={`w-full bg-bg border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors appearance-none ${errors.gender ? 'border-error' : 'border-border'}`}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="N/A">N/A</option>
                      </select>
                      {errors.gender && <p className="text-text-error text-[10px] pl-1">{errors.gender}</p>}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-background px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all active:scale-95"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "journal_templates" && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h2 className="text-text-primary text-lg font-bold">Journal Templates</h2>
                    <p className="text-text-secondary text-sm mt-1">
                      Create reusable writing patterns with placeholders like <span className="text-text-primary font-semibold">{"{pages}"}</span> and <span className="text-text-primary font-semibold">{"{book}"}</span>.
                    </p>
                  </div>

                  <div className="bg-bg border border-border rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-text-primary text-sm font-bold">
                          {editingTemplateId ? "Edit Template" : "Create Template"}
                        </p>
                        <p className="text-text-secondary text-xs mt-1">
                          Use curly braces for placeholders. Example: `Today I read till {"{pages}"} pages of {"{book}"}.`
                        </p>
                      </div>
                      {editingTemplateId && (
                        <button
                          type="button"
                          onClick={resetTemplateForm}
                          className="text-text-secondary text-xs font-semibold hover:text-text-primary transition-colors"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Template Name</label>
                        <input
                          type="text"
                          value={templateForm.name}
                          onChange={(e) => setTemplateForm((current) => ({ ...current, name: e.target.value }))}
                          placeholder="Reading update"
                          className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Category</label>
                        <input
                          type="text"
                          value={templateForm.category}
                          onChange={(e) => setTemplateForm((current) => ({ ...current, category: e.target.value }))}
                          placeholder="Reading"
                          className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-4 items-start">
                      <div className="space-y-1.5">
                        <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Template Content</label>
                        <textarea
                          rows={6}
                          value={templateForm.content}
                          onChange={(e) => setTemplateForm((current) => ({ ...current, content: e.target.value }))}
                          placeholder="Today I read till {pages} pages of the book {book}."
                          className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors resize-y"
                        />
                      </div>

                      <div className="rounded-xl border border-border bg-surface/60 p-3 h-full">
                        <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-2">Detected Placeholders</p>
                        <div className="flex flex-wrap gap-2">
                          {templatePlaceholders.length > 0 ? templatePlaceholders.map((placeholder) => (
                            <span key={placeholder} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
                              {humanizeJournalTemplatePlaceholder(placeholder)}
                            </span>
                          )) : (
                            <span className="text-text-secondary text-xs">No placeholders detected. Add tokens like {"{pages}"} or {"{book}"}.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleSaveJournalTemplate}
                        className="bg-accent hover:bg-accent/90 text-background px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                      >
                        {editingTemplateId ? "Update Template" : "Save Template"}
                      </button>
                      {editingTemplateId && (
                        <button
                          type="button"
                          onClick={resetTemplateForm}
                          className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary border border-border transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-bg border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-text-primary text-sm font-bold">Saved Templates</p>
                        <p className="text-text-secondary text-xs mt-1">
                          {templates.length} template{templates.length === 1 ? "" : "s"} ready to insert into your journal.
                        </p>
                      </div>
                    </div>

                    {templates.length === 0 ? (
                      <div className="border border-dashed border-border rounded-2xl p-8 text-center">
                        <p className="text-text-primary text-sm font-bold">No templates yet</p>
                        <p className="text-text-secondary text-xs mt-2">
                          Create your first personalized journal template and it will appear in the journal editor.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {templates.map((template: { id: string; name: string; category?: string; content: string }) => {
                          const placeholders = getJournalTemplatePlaceholders(template.content);

                          return (
                            <div key={template.id} className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-text-primary text-sm font-bold break-words">{template.name}</p>
                                    {template.category && (
                                      <span className="px-2 py-0.5 rounded-full bg-bg border border-border text-text-secondary text-[10px] font-semibold uppercase tracking-wide">
                                        {template.category}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-text-secondary text-xs mt-2 whitespace-pre-line break-words line-clamp-4">{template.content}</p>
                                </div>
                              </div>

                              {placeholders.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {placeholders.map((placeholder) => (
                                    <span key={placeholder} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[11px] font-medium">
                                      {humanizeJournalTemplatePlaceholder(placeholder)}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => startEditingTemplate(template)}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors text-xs font-semibold"
                                >
                                  <Pencil size={13} />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await deleteTemplate(template.id);
                                      if (editingTemplateId === template.id) resetTemplateForm();
                                      toast.success("Journal template deleted.");
                                    } catch (error: any) {
                                      toast.error(error?.data || error?.message || "Failed to delete journal template.");
                                    }
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-semibold"
                                >
                                  <Trash2 size={13} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "inner_circle" && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h2 className="text-text-primary text-lg font-bold">Inner Circle</h2>
                    <p className="text-text-secondary text-sm mt-1">Activate one month access, then renew monthly via OTP.</p>
                  </div>
                  <div className="bg-bg border border-border rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="text-text-primary text-sm font-bold">Membership Status</p>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${innerCircleStatus?.is_active ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-text-secondary border-border bg-surface"}`}>
                        {innerCircleStatus?.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-surface border border-border rounded-xl p-3">
                        <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Plan</p>
                        <p className="text-text-primary text-sm font-bold mt-1">{innerCircleStatus?.is_active ? "Inner Circle" : "Free"}</p>
                      </div>
                      <div className="bg-surface border border-border rounded-xl p-3">
                        <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Days Left</p>
                        <p className="text-text-primary text-sm font-bold mt-1">{innerCircleStatus?.days_left ?? 0}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-surface border border-border rounded-xl p-3">
                        <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Started At</p>
                        <p className="text-text-primary text-xs font-semibold mt-1">{formatDateDDMMYYYY(innerCircleStatus?.started_at)}</p>
                      </div>
                      <div className="bg-surface border border-border rounded-xl p-3">
                        <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Expires At</p>
                        <p className="text-text-primary text-xs font-semibold mt-1">{formatDateDDMMYYYY(innerCircleStatus?.expires_at)}</p>
                      </div>
                    </div>
                  </div>
                  {innerCircleStatus?.is_active ? (
                    <div className="bg-bg border border-border rounded-2xl p-5 flex flex-col gap-4">
                      <p className="text-text-primary text-sm font-bold">Manage Membership</p>
                      <p className="text-text-secondary text-xs">
                        Your Inner Circle membership is active. You can cancel it anytime.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCancelModalOpen(true)}
                        disabled={innerCircleLoading}
                        className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 disabled:opacity-50 text-rose-400 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors w-fit"
                      >
                        Cancel Membership
                      </button>
                      {innerCircleError && (
                        <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                          {innerCircleError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-bg border border-border rounded-2xl p-5 flex flex-col gap-4">
                      <p className="text-text-primary text-sm font-bold">Join the Inner Circle</p>
                      <p className="text-text-secondary text-xs">Enter your email, receive OTP, and verify to activate for 30 days.</p>
                      <div className="space-y-2">
                        <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">Email</label>
                        <input
                          type="email"
                          value={innerCircleEmail}
                          disabled
                          className="w-full bg-surface/60 border border-border rounded-xl py-2.5 px-4 text-sm text-text-secondary cursor-not-allowed"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendInnerCircleOtp}
                        disabled={innerCircleLoading}
                        className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-background px-5 py-2.5 rounded-xl text-sm font-bold transition-colors w-fit"
                      >
                        {innerCircleLoading ? "Sending..." : "Become Inner Circle"}
                      </button>
                      {innerCircleOtpSent && (
                        <div className="space-y-2">
                          <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">OTP</label>
                          <input
                            type="text"
                            value={innerCircleOtp}
                            onChange={(e) => setInnerCircleOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyInnerCircleOtp}
                            disabled={innerCircleLoading || innerCircleOtp.length !== 6}
                            className="bg-emerald-500/90 hover:bg-emerald-500 disabled:opacity-50 text-background px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                          >
                            {innerCircleLoading ? "Verifying..." : "Verify & Activate"}
                          </button>
                        </div>
                      )}
                      {innerCircleError && (
                        <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                          {innerCircleError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Modal
                isOpen={cancelModalOpen}
                onClose={() => {
                  setCancelModalOpen(false);
                  setCancelOtp("");
                  setCancelOtpSent(false);
                  setCancelError("");
                }}
                title="Confirm Membership Cancellation"
                footer={
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setCancelModalOpen(false);
                        setCancelOtp("");
                        setCancelOtpSent(false);
                        setCancelError("");
                      }}
                      className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Keep Membership
                    </button>
                    {!cancelOtpSent ? (
                      <button
                        onClick={handleSendCancelOtp}
                        disabled={innerCircleLoading}
                        className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all"
                      >
                        {innerCircleLoading ? "Sending..." : "Send OTP"}
                      </button>
                    ) : (
                      <button
                        onClick={handleCancelInnerCircle}
                        disabled={innerCircleLoading || cancelOtp.length !== 6}
                        className="bg-rose-500/90 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all"
                      >
                        {innerCircleLoading ? "Cancelling..." : "Confirm Cancel"}
                      </button>
                    )}
                  </div>
                }
              >
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    This will deactivate your Inner Circle membership immediately. To continue, verify OTP sent to your registered email.
                  </p>
                  <div>
                    <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">Registered Email</label>
                    <input
                      type="email"
                      value={user?.email_id || ""}
                      disabled
                      className="w-full mt-1 bg-surface/60 border border-border rounded-xl py-2.5 px-4 text-sm text-text-secondary cursor-not-allowed"
                    />
                  </div>
                  {cancelOtpSent && (
                    <div>
                      <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">OTP</label>
                      <input
                        type="text"
                        value={cancelOtp}
                        onChange={(e) => setCancelOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className="w-full mt-1 bg-surface border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>
                  )}
                  {cancelError && (
                    <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                      {cancelError}
                    </p>
                  )}
                </div>
              </Modal>

              {/* ── Privacy & Security ── */}
              {activeTab === "privacy" && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h2 className="text-text-primary text-lg font-bold">Privacy &amp; Security</h2>
                    <p className="text-text-secondary text-sm mt-1">Manage your journal lock and biometric access.</p>
                  </div>

                  {/* Journal Lock card */}
                  <div className="bg-bg border border-border rounded-2xl overflow-hidden">

                    {/* Header row */}
                    <div className="flex items-center gap-4 p-5 border-b border-border">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <BookLock size={18} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-text-primary text-sm font-bold">Journal Lock</p>
                        <p className="text-text-secondary text-xs mt-0.5">Protect your journal entries with a PIN</p>
                      </div>
                      {journalLock.hasPin ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                          <CheckCircle2 size={11} /> Enabled
                        </span>
                      ) : (
                        <span className="text-text-secondary/50 text-xs bg-surface border border-border px-3 py-1 rounded-full">
                          Not set up
                        </span>
                      )}
                    </div>

                    {journalLock.hasPin ? (
                      <>
                        {/* Change PIN row */}
                        <button
                          onClick={() => { closeLockPanel(); setLockPanel(lockPanel === "change" ? "none" : "change"); }}
                          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface/50 transition-colors border-b border-border text-left"
                        >
                          <KeyRound size={15} className="text-text-secondary shrink-0" />
                          <span className="flex-1 text-sm text-text-primary">Change PIN</span>
                          <ChevronRight size={14} className={`text-text-secondary transition-transform ${lockPanel === "change" ? "rotate-90" : ""}`} />
                        </button>

                        {/* Change PIN panel */}
                        {lockPanel === "change" && (
                          <div className="px-5 py-5 border-b border-border bg-surface/30 flex flex-col gap-4">
                            <PinInput label="Current PIN" value={currentPin} onChange={v => { setCurrentPin(v); setLockError(""); }} disabled={lockLoading} />
                            <PinInput label="New PIN"     value={newPin}     onChange={v => { setNewPin(v);     setLockError(""); }} disabled={lockLoading} />
                            <PinInput label="Confirm New PIN" value={confirmPin} onChange={v => { setConfirmPin(v); setLockError(""); }} disabled={lockLoading} />
                            {lockError && (
                              <p className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                                <AlertCircle size={12} /> {lockError}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={handleChangePin}
                                disabled={lockLoading || currentPin.length < 4 || newPin.length < 4 || confirmPin.length < 4}
                                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-background px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                              >
                                {lockLoading && <Loader2 size={13} className="animate-spin" />}
                                Save New PIN
                              </button>
                              <button onClick={closeLockPanel} className="px-5 py-2.5 rounded-xl text-sm text-text-secondary border border-border hover:text-text-primary transition-colors">
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Fingerprint row — only when device supports it */}
                        {journalLock.biometricSupported && (
                          <button
                            onClick={handleToggleBiometric}
                            disabled={bioLoading}
                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface/50 transition-colors border-b border-border text-left disabled:opacity-60"
                          >
                            <Fingerprint size={15} className="text-text-secondary shrink-0" />
                            <span className="flex-1 text-sm text-text-primary">Fingerprint / Face ID</span>
                            {bioLoading ? (
                              <Loader2 size={14} className="animate-spin text-text-secondary" />
                            ) : journalLock.hasBiometric ? (
                              <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                                <CheckCircle2 size={11} /> On
                              </span>
                            ) : (
                              <span className="text-text-secondary/50 text-xs">Off</span>
                            )}
                          </button>
                        )}

                        {/* Remove lock row */}
                        <button
                          onClick={() => { closeLockPanel(); setLockPanel(lockPanel === "remove" ? "none" : "remove"); }}
                          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-rose-500/5 transition-colors text-left"
                        >
                          <Trash2 size={15} className="text-rose-400 shrink-0" />
                          <span className="flex-1 text-sm text-rose-400">Remove Lock</span>
                          <ChevronRight size={14} className={`text-rose-400/60 transition-transform ${lockPanel === "remove" ? "rotate-90" : ""}`} />
                        </button>

                        {/* Remove lock panel */}
                        {lockPanel === "remove" && (
                          <div className="px-5 py-5 bg-rose-500/5 flex flex-col gap-4">
                            <p className="text-text-secondary text-xs">Enter your current PIN to confirm removing the journal lock.</p>
                            <PinInput label="Current PIN" value={currentPin} onChange={v => { setCurrentPin(v); setLockError(""); }} disabled={lockLoading} />
                            {lockError && (
                              <p className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                                <AlertCircle size={12} /> {lockError}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={handleRemoveLock}
                                disabled={lockLoading || currentPin.length < 4}
                                className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                              >
                                {lockLoading && <Loader2 size={13} className="animate-spin" />}
                                Remove Lock
                              </button>
                              <button onClick={closeLockPanel} className="px-5 py-2.5 rounded-xl text-sm text-text-secondary border border-border hover:text-text-primary transition-colors">
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="px-5 py-5 flex flex-col gap-3">
                        <p className="text-text-secondary text-sm">No PIN set up yet. Go to your journal to set one up.</p>
                        <a href="/dashboard/journal" className="inline-flex items-center gap-2 text-accent text-sm font-bold hover:underline">
                          <BookLock size={14} /> Set up Journal Lock
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Other placeholder tabs ── */}
              {activeTab !== "profile" && activeTab !== "privacy" && activeTab !== "inner_circle" && activeTab !== "journal_templates" && (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    <Lock size={32} />
                  </div>
                  <div>
                    <h3 className="text-text-primary font-bold">{settingsOptions.find(o => o.id === activeTab)?.label}</h3>
                    <p className="text-text-secondary text-sm mt-1">This section is currently under development.</p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
