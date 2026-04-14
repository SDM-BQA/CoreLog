import { LayoutDashboard, Home } from "lucide-react";
import ErrorImg from "/404.png";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 md:p-6">
      <div className="flex flex-col items-center justify-center w-full max-w-md md:max-w-xl">
        <img
          src={ErrorImg}
          alt="404 Error"
          className="w-48 md:w-64 h-auto mb-6 md:mb-8"
        />
        <div className="bg-surface flex flex-col justify-center items-center border border-border w-full rounded-3xl p-8 md:p-12 shadow-[0_20px_30px_-10px_rgba(0,0,0,0.3)] text-center relative overflow-hidden">
          {/* Soft background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <h1 className="font-inter font-bold text-text-primary text-2xl md:text-3xl mb-4 relative z-10">
            Lost in the Cultural Void?
          </h1>
          <p className="text-text-secondary text-sm md:text-base max-w-[85%] md:max-w-sm mb-8 relative z-10 leading-relaxed">
            It looks like the page you are looking for has moved to another
            dimension. Let's get you back to the action.
          </p>

          <div className="flex flex-col sm:flex-row w-full items-center justify-center gap-3 md:gap-4 relative z-10">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-accent transition-all duration-200 text-text-primary font-medium w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm"
            >
              <LayoutDashboard size={18} />
              Return to Dashboard
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-bg hover:bg-bg/60 transition-all duration-200 border border-border text-text-primary font-medium w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm"
            >
              <Home size={18} />
              Go Home
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center text-text-secondary mt-8 text-xs md:text-sm gap-x-4 gap-y-2">
          <Link to="#" className="hover:text-text-primary transition-colors">
            Contact Support
          </Link>
          <span className="hidden sm:inline opacity-30">·</span>
          <Link to="#" className="hover:text-text-primary transition-colors">
            View All Activities
          </Link>
          <span className="hidden sm:inline opacity-30">·</span>
          <Link to="#" className="hover:text-text-primary transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
