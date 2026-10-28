import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Flame } from "lucide-react";
import { appConfig } from "../@configs/app.config";

type Variant = "login" | "signup" | "recover";

const BRAND: Record<
  Variant,
  { headline: ReactNode; points: string[]; topLink: { text: string; label: string; to: string } }
> = {
  login: {
    headline: (
      <>
        Pick up right where{" "}
        <span className="bg-gradient-to-r from-blue-300 via-accent to-secondary bg-clip-text text-transparent">
          you left off
        </span>
      </>
    ),
    points: [
      "Your streaks, targets and logs are waiting",
      "Movies, series, books, music, poetry and journal in one place",
      "Lock your journal with a PIN or biometrics",
    ],
    topLink: { text: "New to CoreLog?", label: "Create an account", to: "/auth/signup" },
  },
  signup: {
    headline: (
      <>
        Start your log in{" "}
        <span className="bg-gradient-to-r from-blue-300 via-accent to-secondary bg-clip-text text-transparent">
          under a minute
        </span>
      </>
    ),
    points: [
      "Free to start, no credit card needed",
      "Track everything you watch, read, hear and write",
      "Daily streaks and yearly targets that keep you going",
    ],
    topLink: { text: "Already have an account?", label: "Log in", to: "/auth/login" },
  },
  recover: {
    headline: (
      <>
        Locked out?{" "}
        <span className="bg-gradient-to-r from-blue-300 via-accent to-secondary bg-clip-text text-transparent">
          It happens
        </span>
      </>
    ),
    points: [
      "We email you a 6-digit code",
      "The code works for 10 minutes and only once",
      "Your logs stay exactly as you left them",
    ],
    topLink: { text: "Remembered it?", label: "Back to log in", to: "/auth/login" },
  },
};

type AuthShellProps = {
  variant: Variant;
  title: string;
  subtitle: string;
  /** Wider form column, used by multi-field forms like sign up */
  wide?: boolean;
  children: ReactNode;
};

export const AuthShell = ({ variant, title, subtitle, wide = false, children }: AuthShellProps) => {
  const brand = BRAND[variant];

  return (
    <div className="relative flex min-h-screen bg-bg text-text-primary">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden w-[42%] max-w-xl shrink-0 overflow-hidden border-r border-border bg-surface/40 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:pb-12 lg:pt-0">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/40 blur-[120px]" />
          <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-secondary/10 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 80% 70% at 0% 0%, #000 30%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 0% 0%, #000 30%, transparent 100%)",
            }}
          />
        </div>

        <Link to="/" className="relative inline-flex h-16 items-center gap-2.5 self-start">
          <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
          <span className="text-lg font-semibold tracking-tight">{appConfig.appName}</span>
        </Link>

        <div className="relative">
          <h2 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight">
            {brand.headline}
          </h2>
          <ul className="mt-8 space-y-3.5">
            {brand.points.map((p) => (
              <li key={p} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/25">
                  <Check size={12} className="text-blue-300" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative preview (sample data) */}
        <div aria-hidden="true" className="relative select-none">
          <div className="w-[85%] rounded-2xl border border-border bg-bg/70 p-4 shadow-2xl shadow-black/40 backdrop-blur">
            <p className="mb-3 text-xs font-semibold">Recently added</p>
            <div className="grid grid-cols-4 gap-2.5">
              {["interstellar", "blade-runner", "dark-knight", "inception"].map((n) => (
                <img
                  key={n}
                  src={`/posters/${n}.png`}
                  alt=""
                  className="aspect-[2/3] w-full rounded-md border border-border object-cover"
                />
              ))}
            </div>
          </div>
          <div className="ml-auto mt-3 flex w-[62%] items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-2xl shadow-black/40">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
              <Flame size={18} className="text-orange-400" />
            </span>
            <div>
              <p className="text-sm font-semibold">14 day streak</p>
              <p className="text-[11px] text-text-secondary">Keep it going today</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Form column */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="absolute -top-32 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-primary/25 blur-[110px]" />
        </div>

        {/* Top bar */}
        <header className="relative flex h-16 items-center justify-between gap-4 border-b border-border/60 px-5 sm:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <span className="inline-flex items-center gap-2.5 lg:hidden">
              <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
              <span className="font-semibold tracking-tight text-text-primary">{appConfig.appName}</span>
            </span>
            <span className="hidden items-center gap-1.5 lg:inline-flex">
              <ArrowLeft size={15} /> Back to home
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-text-secondary sm:inline">{brand.topLink.text}</span>
            <Link
              to={brand.topLink.to}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-border-secondary"
            >
              {brand.topLink.label}
            </Link>
          </div>
        </header>

        <main className="relative flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-10">
          <div className={`w-full ${wide ? "max-w-xl" : "max-w-md"}`}>
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-2 text-text-secondary">{subtitle}</p>
            </div>

            <div className="flex flex-col gap-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};
