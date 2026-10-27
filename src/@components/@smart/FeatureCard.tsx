import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-surface border border-border rounded-xl px-5 py-4 flex items-center gap-4 hover:border-accent/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-accent" />
      </div>
      <div>
        <p className="text-text-primary text-sm font-semibold">{title}</p>
        <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
