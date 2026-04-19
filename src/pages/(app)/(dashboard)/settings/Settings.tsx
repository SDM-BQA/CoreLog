import { useState } from "react";
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
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-accent/20 rounded-3xl flex items-center justify-center text-accent text-3xl font-bold border-2 border-accent/20">
                      JS
                    </div>
                    <div>
                      <h2 className="text-text-primary text-xl font-bold">John Smith</h2>
                      <p className="text-text-secondary text-xs mt-1">Free Tier Member • Joined April 2026</p>
                      <button className="text-accent text-xs font-bold hover:underline mt-2">Change Avatar</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                    <div className="space-y-2">
                      <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">Full Name</label>
                      <input type="text" defaultValue="John Smith" className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest pl-1">Email Address</label>
                      <input type="email" defaultValue="john@example.com" className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <button className="bg-accent hover:bg-accent/90 text-background px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all active:scale-95">
                      Save Changes
                    </button>
                  </div>
                </div>
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
