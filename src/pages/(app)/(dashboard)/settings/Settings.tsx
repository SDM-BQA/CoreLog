import { useState, useEffect, useRef } from "react";
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
import { update_user_account_mutation, upload_image_api } from "../../../../@apis/users";
import { update_user } from "../../../../@store/slices/user/user.slice";
import { toast } from "react-toast";

import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Lock,
  ChevronRight
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

  // Keep form in sync when user data is revalidated/loaded
  useEffect(() => {
    if (user) {
      setFieldValue("firstName", user.first_name);
      setFieldValue("lastName", user.last_name);
      setFieldValue("phone", user.mobile_no || "");
      setFieldValue("gender", user.gender || "male");
    }
  }, [user]);

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

  const settingsOptions = [
    { id: "profile", label: "Profile", icon: User, description: "Manage your personal information and public profile" },
    { id: "appearance", label: "Appearance", icon: Palette, description: "Customise how CoreLog looks and feels on your device" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Choose what updates and alerts you want to receive" },
    { id: "privacy", label: "Privacy & Security", icon: Shield, description: "Control your data and manage security settings" },
    { id: "data", label: "Data Management", icon: Database, description: "Export your data or manage your cloud storage" },
  ];

  return (
    <div className="bg-bg flex-1 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-10">
        
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-text-primary text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-text-secondary text-sm">Manage your account preferences and application settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {settingsOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveTab(option.id)}
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

          {/* Settings Content Area */}
          <div className="lg:col-span-8">
            <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col gap-8 shadow-sm">
              
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
                      <p className="text-text-secondary text-xs mt-1">Free Tier Member • @{user?.user_name}</p>
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

              {activeTab !== "profile" && (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                   <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                      <Lock size={32} />
                   </div>
                   <div>
                     <h3 className="text-text-primary font-bold">{settingsOptions.find(o => o.id === activeTab)?.label} placeholder</h3>
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
