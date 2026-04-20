import { AiFillApple, AiOutlineDesktop, AiOutlineGlobal } from "react-icons/ai";
import {
  FiMonitor,
  FiFilm,
  FiUsers,
  FiEdit3,
  FiBookOpen,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";
import { Link, Navigate } from "react-router-dom";
import { useAppSelector } from "../../../@store/hooks/store.hooks";
import Navbar from "../Navigation/Navbar";

export const Home = () => {
  const { isAuthenticated } = useAppSelector((state) => state.user);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary font-[Inter] flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative px-6 py-24 md:py-36 flex flex-col items-center justify-center min-h-[85vh] text-center overflow-hidden">
          {/* Glowing Background Glows */}
          <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-secondary/15 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10 max-w-5xl mx-auto space-y-8 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-xs md:text-sm font-semibold text-text-secondary mb-4 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Movies, Books, and Journals in one place
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
              Your Life's Journey, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Beautifully Logged
              </span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              The unified workspace to track your movie marathons, record your
              reading progress, and capture your daily thoughts—all within an
              elegant, intuitive interface.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 w-full sm:w-auto">
              <Link
                to="/auth/signup"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-text-primary font-semibold rounded-xl hover:bg-accent transition-all flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(17,17,212,0.4)]"
              >
                Start Logging For Free <FiArrowRight className="text-xl" />
              </Link>
              <Link
                to="/features"
                className="w-full sm:w-auto px-8 py-4 bg-surface border border-border text-text-primary font-semibold rounded-xl hover:bg-surface/80 transition-all flex items-center justify-center"
              >
                Explore CoreLog
              </Link>
            </div>

            {/* Dashboard Preview Image/Mockup */}
            <div className="mt-20 relative w-full max-w-5xl group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent z-10 h-full w-full bottom-0 left-0" />
              <div className="border border-border rounded-2xl md:rounded-[2rem] overflow-hidden bg-surface p-2 shadow-2xl relative">
                <div className="bg-bg rounded-xl md:rounded-[1.5rem] overflow-hidden border border-border relative aspect-[16/9] flex flex-col items-center justify-start pt-8 relative">
                  {/* Mockup Header */}
                  <div className="w-full px-4 md:px-10 flex items-center gap-4 md:gap-6 border-b border-border/50 pb-4 mb-16 overflow-x-auto">
                    <AiFillApple
                      size={24}
                      className="text-primary flex-shrink-0"
                    />
                    <span className="text-text-primary font-medium tracking-wide hidden sm:block">
                      Dashboard
                    </span>
                    <div className="h-4 w-px bg-border mx-2 hidden sm:block"></div>
                    <span className="text-text-secondary hover:text-text-primary cursor-pointer transition-colors flex items-center gap-2 flex-shrink-0">
                      <FiFilm /> Movies
                    </span>
                    <span className="text-text-secondary hover:text-text-primary cursor-pointer transition-colors flex items-center gap-2 flex-shrink-0">
                      <FiBookOpen /> Books
                    </span>
                    <span className="text-text-secondary hover:text-text-primary cursor-pointer transition-colors flex items-center gap-2 flex-shrink-0">
                      <FiEdit3 /> Journal
                    </span>
                  </div>

                  <span className="text-2xl font-bold text-text-secondary mb-4">
                    Your Central Hub
                  </span>
                  <p className="text-sm md:text-base text-text-secondary/50">
                    Everything you track, in one beautiful place.
                  </p>

                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg/80 via-transparent flex items-end justify-center pb-4 pointer-events-none">
                    <div className="w-1/2 h-1 bg-border rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24 bg-surface/50 border-y border-border relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">
                The Core of Your Digital Life
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                No more scattered notes and apps. CoreLog unifies everything
                that matters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <FiFilm size={28} />,
                  title: "Movie Journey",
                  desc: "Track what you've watched, rate your favorites, and maintain a comprehensive cinematic diary.",
                },
                {
                  icon: <FiBookOpen size={28} />,
                  title: "Reading Progress",
                  desc: "Log your books, track your reading pages, and store your favorite quotes in your personal library.",
                },
                {
                  icon: <FiEdit3 size={28} />,
                  title: "Daily Journal",
                  desc: "Write your daily thoughts, reflections, and milestones in a distraction-free, elegant editor.",
                },
                {
                  icon: <FiMonitor size={28} />,
                  title: "Unified Dashboard",
                  desc: "Visualize your watching, reading, and journaling habits with beautiful interconnected charts.",
                },
                {
                  icon: <AiOutlineDesktop size={28} />,
                  title: "Cross-Platform",
                  desc: "Seamlessly access your logs everywhere—your data syncs instantly across all your devices.",
                },
                {
                  icon: <FiShield size={28} />,
                  title: "Secure & Private",
                  desc: "Your journals and personal logs are yours. We maintain strict privacy and secure encryption practices.",
                },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="p-8 bg-surface rounded-3xl border border-border hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] isolate overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                  <div className="w-14 h-14 bg-bg border border-border text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="relative max-w-4xl mx-auto bg-surface border border-border rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/30 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 blur-[60px] rounded-full pointer-events-none" />

            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 relative z-10">
              Ready to centralize your logs?
            </h2>
            <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto relative z-10">
              Join CoreLog today and start building the ultimate archive of your
              experiences and memories.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link
                to="/auth/signup"
                className="px-8 py-4 bg-primary text-text-primary font-bold rounded-xl hover:bg-accent transition-all hover:scale-105"
              >
                Create Free Account
              </Link>
            </div>
            <p className="mt-6 text-sm text-text-secondary flex items-center justify-center gap-2 relative z-10">
              <FiCheckCircle className="text-secondary" /> Setup takes less than
              a minute.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 font-bold mb-6">
              <AiFillApple size={36} className="text-primary" />
              <span className="text-2xl text-text-primary tracking-tight">
                CoreLog
              </span>
            </div>
            <p className="text-text-secondary max-w-sm mb-6 leading-relaxed">
              The modern, unified way to log your movies, track your reading,
              and write your daily journal. Designed with pixel-perfect
              precision.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-bg border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors cursor-pointer">
                <AiOutlineGlobal size={20} />
              </div>
              <div className="w-10 h-10 rounded-full bg-bg border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors cursor-pointer">
                <FiUsers size={20} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-text-primary font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-text-secondary">
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Books
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Journals
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-text-primary font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-text-secondary">
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  API Docs
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-text-primary font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-text-secondary">
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-text-secondary text-sm gap-4">
          <p>
            &copy; {new Date().getFullYear()} CoreLog Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> All
              systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
