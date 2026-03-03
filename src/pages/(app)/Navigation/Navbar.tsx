import { Link } from "react-router-dom";
import { appConfig } from "../../../@configs/app.config";

const Navbar = () => {
  return (
<div className="bg-bg/50 backdrop-blur-md w-full text-text-primary flex items-center justify-between px-8 py-4 shadow-navbar border-b border-border fixed top-0 left-0 z-50">      
      <Link to="/">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CoreLog Logo" className="w-8 h-8" />
          <span className="text-xl font-inter font-semibold">
            {appConfig.appName}
          </span>
        </div>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="text-text-secondary hover:text-text-primary transition-colors duration-300"
        >
          Features
        </Link>
        <Link
          to="/about"
          className="text-text-secondary hover:text-text-primary transition-colors duration-300"
        >
          Community
        </Link>
        <Link
          to="/contact"
          className="text-text-secondary hover:text-text-primary transition-colors duration-300"
        >
          Pricing
        </Link>
      </div>

      {/* Auth */}
      <div className="flex items-center gap-3">
        <Link
          to="/auth/login"
          className="text-text-secondary hover:bg-surface rounded-lg hover:text-text-primary transition-colors duration-300 px-6 py-2"
        >
          Log in
        </Link>
        <Link
          to="/auth/signup"
          className="bg-primary hover:bg-accent text-text-primary px-6 py-2 rounded-lg transition-colors duration-300"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
