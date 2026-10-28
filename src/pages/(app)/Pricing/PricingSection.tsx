import { Check, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const FREE = [
  "Movies, series, books, poetry and music logs",
  "Journal with streaks, templates and map",
  "Yearly targets and dashboard",
  "Up to 6 photos per journal entry",
];

const INNER_CIRCLE = [
  "Everything in Free",
  "Reading journey logs: pages, notes, progress streaks",
  "Binge journey logs: episodes, notes, streaks",
  "More than 6 photos per journal entry",
  "Advanced dashboard analytics",
  "Early access to beta tracking tools",
];

export const PricingSection = () => (
  <section id="pricing" className="relative scroll-mt-16 px-6 py-24 md:py-32">
    <div className="mx-auto max-w-4xl">
      <div className="mx-auto mb-14 max-w-xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Pricing</p>
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Start free. Go further when you want to.</h2>
        <p className="mt-4 text-text-secondary">
          Everything you need to build the habit is free. Inner Circle adds deeper logs and extras.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col rounded-3xl border border-border bg-surface p-8">
          <h3 className="text-lg font-semibold">Free</h3>
          <p className="mt-1 text-sm text-text-secondary">For logging everything you love.</p>
          <p className="mt-6 text-4xl font-semibold tracking-tight">$0</p>
          <ul className="mt-7 mb-8 flex-grow space-y-3">
            {FREE.map((f) => (
              <li key={f} className="flex gap-2.5 text-sm text-text-secondary">
                <Check size={16} className="mt-0.5 shrink-0 text-secondary" /> {f}
              </li>
            ))}
          </ul>
          <Link
            to="/auth/signup"
            className="rounded-xl border border-border bg-bg py-3 text-center text-sm font-semibold transition-colors hover:border-border-secondary"
          >
            Get started free
          </Link>
        </div>

        <div className="relative flex flex-col rounded-3xl border border-amber-400/40 bg-gradient-to-b from-amber-500/10 via-surface to-surface p-8">
          <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            <Crown size={11} /> Premium
          </span>
          <h3 className="text-lg font-semibold">Inner Circle</h3>
          <p className="mt-1 text-sm text-text-secondary">For people who log every chapter and episode.</p>
          <p className="mt-6 text-4xl font-semibold tracking-tight">Membership</p>
          <ul className="mt-7 mb-8 flex-grow space-y-3">
            {INNER_CIRCLE.map((f) => (
              <li key={f} className="flex gap-2.5 text-sm text-text-secondary">
                <Check size={16} className="mt-0.5 shrink-0 text-amber-300" /> {f}
              </li>
            ))}
          </ul>
          <Link
            to="/auth/signup"
            className="rounded-xl bg-amber-400 py-3 text-center text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-300"
          >
            Sign up, then join
          </Link>
        </div>
      </div>
    </div>
  </section>
);
