import { FiCheckCircle, FiHeart, FiCoffee, FiSmile } from "react-icons/fi";
import Navbar from "../Navigation/Navbar";
import { Link } from "react-router-dom";

export const Pricing = () => {
  return (
    <div className="min-h-screen bg-bg text-text-primary font-[Inter] flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <section className="relative px-6 py-12 md:py-24 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Background Glows */}
          <div className="absolute top-0 right-1/4 w-[30vw] h-[30vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-[25vw] h-[25vw] bg-secondary/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-xs md:text-sm font-semibold text-text-secondary mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            100% Transparent
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary mb-6">
            Simple,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Ridiculous
            </span>{" "}
            Pricing
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-16">
            We spent all our time building CoreLog and completely forgot to
            integrate Stripe. Oh well, our loss is your gain!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
            {/* The "Basic" Plan */}
            <div className="p-8 bg-surface rounded-3xl border border-border flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors">
              <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center justify-center gap-2">
                <FiSmile className="text-text-secondary" /> The "Basic" Plan
              </h3>
              <div className="text-5xl font-extrabold my-6">
                $0
                <span className="text-lg text-text-secondary font-medium">
                  /mo
                </span>
              </div>
              <p className="text-text-secondary mb-8">
                For people who like free things, which is everyone.
              </p>

              <ul className="text-left space-y-4 mb-8 flex-grow">
                {[
                  "Unlimited Movies logged",
                  "Unlimited Books tracked",
                  "Unlimited Journal entries",
                  "Zero hidden fees",
                ].map((ft, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-text-secondary"
                  >
                    <FiCheckCircle className="text-primary flex-shrink-0" />{" "}
                    {ft}
                  </li>
                ))}
              </ul>

              <Link
                to="/auth/signup"
                className="w-full py-4 bg-bg border border-border text-text-primary font-bold rounded-xl hover:bg-bg/80 transition-colors"
              >
                Get Basic
              </Link>
            </div>

            {/* The "Pro" Plan */}
            <div className="p-8 bg-surface rounded-3xl border-2 border-primary relative flex flex-col transform md:-translate-y-4 shadow-[0_0_40px_rgba(17,17,212,0.15)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center justify-center gap-2">
                <FiHeart className="text-secondary" /> The "Pro" Plan
              </h3>
              <div className="text-5xl font-extrabold my-6">
                $0
                <span className="text-lg text-text-secondary font-medium">
                  /mo
                </span>
              </div>
              <p className="text-text-secondary mb-8">
                Literally the exact same thing as the Basic plan, but makes you
                feel cooler.
              </p>

              <ul className="text-left space-y-4 mb-8 flex-grow">
                {[
                  "Everything in Basic",
                  "Still no credit card required",
                  "We honestly don't have a payment processor",
                  "Feel 100% more professional",
                ].map((ft, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-text-secondary"
                  >
                    <FiCheckCircle className="text-secondary flex-shrink-0" />{" "}
                    {ft}
                  </li>
                ))}
              </ul>

              <Link
                to="/auth/signup"
                className="w-full py-4 bg-primary text-text-primary font-bold rounded-xl hover:bg-accent transition-colors shadow-lg"
              >
                Go Pro for Free
              </Link>
            </div>

            {/* The "Enterprise" Plan */}
            <div className="p-8 bg-surface rounded-3xl border border-border flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors">
              <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center justify-center gap-2">
                <FiCoffee className="text-amber-500" /> "Enterprise"
              </h3>
              <div className="text-5xl font-extrabold my-6">
                $0
                <span className="text-lg text-text-secondary font-medium">
                  /mo
                </span>
              </div>
              <p className="text-text-secondary mb-8">
                If you insist on giving us money, just buy us a coffee instead
                maybe?
              </p>

              <ul className="text-left space-y-4 mb-8 flex-grow">
                {[
                  "Everything in Pro",
                  "The warm fuzzy feeling of gratitude",
                  "You can pretend you sponsor us",
                  "Still includes all features",
                ].map((ft, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-text-secondary"
                  >
                    <FiCheckCircle className="text-primary flex-shrink-0" />{" "}
                    {ft}
                  </li>
                ))}
              </ul>

              <button
                onClick={() =>
                  alert(
                    "We don't actually have a tip jar yet! Just enjoy the app. 😊",
                  )
                }
                className="w-full py-4 bg-bg border border-border text-text-primary font-bold rounded-xl hover:bg-bg/80 transition-colors"
              >
                Contact Sales (Us)
              </button>
            </div>
          </div>

          <div className="mt-24 p-8 border border-border rounded-2xl bg-surface/50 max-w-3xl w-full flex flex-col sm:flex-row items-center gap-6 text-left">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center flex-shrink-0">
              <FiCheckCircle size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-text-primary mb-2">
                Wait, is it seriously free?
              </h4>
              <p className="text-text-secondary leading-relaxed">
                Yes! There are no subscriptions, no paywalls, no trial periods,
                and no hidden fees. We believe keeping your thoughts and lists
                centralized should be accessible to everyone. Enjoy CoreLog!
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
