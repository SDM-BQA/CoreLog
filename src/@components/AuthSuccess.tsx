import { CheckCircle2 } from "lucide-react";

type AuthSuccessProps = {
  title: string;
  subtitle: string;
};

export const AuthSuccess = ({ title, subtitle }: AuthSuccessProps) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
        {/* Animated Checkmark */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative bg-primary text-text-primary p-4 rounded-full shadow-lg shadow-primary/20">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-text-primary text-3xl font-bold tracking-tight">
            {title}
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-surface rounded-full overflow-hidden mt-4">
          <div className="h-full bg-primary animate-progress-loading" />
        </div>
      </div>
    </div>
  );
};
