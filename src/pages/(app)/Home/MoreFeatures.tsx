import type { ReactNode } from "react";
import { BarChart3, BookOpen, Lock, Music, ScrollText, Timer, type LucideIcon } from "lucide-react";

// Decorative previews use sample data only.

const Tile = ({
  icon: Icon,
  color,
  bg,
  title,
  desc,
  span,
  children,
}: {
  icon: LucideIcon;
  color: string;
  bg: string;
  title: string;
  desc: string;
  span: string;
  children: ReactNode;
}) => (
  <div
    className={`flex flex-col overflow-hidden rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-border-secondary sm:p-7 ${span}`}
  >
    <div className="mb-5 flex items-center gap-3">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
        <Icon size={18} className={color} />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="max-w-md text-balance text-sm leading-relaxed text-text-secondary">{desc}</p>
    <div aria-hidden="true" className="mt-6 flex-1 select-none">
      {children}
    </div>
  </div>
);

export const MoreFeatures = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
    <Tile
      icon={BookOpen}
      color="text-emerald-400"
      bg="bg-emerald-500/10"
      title="Books"
      desc="From wishlist to finished, with covers, ratings and reading progress."
      span="md:col-span-3"
    >
      <div className="flex flex-col gap-2.5">
        {[
          { t: "Atomic Habits", p: 72 },
          { t: "The Alchemist", p: 35 },
        ].map((b) => (
          <div key={b.t} className="rounded-xl border border-border bg-bg/60 p-3">
            <div className="mb-2 flex justify-between text-xs">
              <span className="font-medium text-text-primary">{b.t}</span>
              <span className="text-text-secondary">{b.p}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${b.p}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Tile>

    <Tile
      icon={Music}
      color="text-rose-400"
      bg="bg-rose-500/10"
      title="Music"
      desc="Save songs and albums, and build playlists for every mood."
      span="md:col-span-3"
    >
      <div className="flex flex-col gap-2.5">
        {[
          { t: "Late Night Drive", n: "12 songs", h: ["h-2", "h-4", "h-3", "h-5"] },
          { t: "Rainy Day", n: "8 songs", h: ["h-3", "h-5", "h-2", "h-4"] },
        ].map((p) => (
          <div key={p.t} className="flex items-center gap-3 rounded-xl border border-border bg-bg/60 p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15">
              <span className="flex h-5 items-end gap-0.5">
                {p.h.map((h, i) => (
                  <span key={i} className={`w-1 rounded-sm bg-rose-400 ${h}`} />
                ))}
              </span>
            </span>
            <div>
              <p className="text-sm font-medium text-text-primary">{p.t}</p>
              <p className="text-xs text-text-secondary">{p.n}</p>
            </div>
          </div>
        ))}
      </div>
    </Tile>

    <Tile
      icon={ScrollText}
      color="text-amber-400"
      bg="bg-amber-500/10"
      title="Poetry"
      desc="Compose poems, tag the mood and keep a collection you are proud of."
      span="md:col-span-2"
    >
      <div className="rounded-xl border border-border bg-bg/60 p-4">
        <p className="font-serif text-sm italic leading-relaxed text-text-primary">
          &ldquo;The rain keeps its own time,
          <br />
          and so do I.&rdquo;
        </p>
        <span className="mt-3 inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
          Reflective
        </span>
      </div>
    </Tile>

    <Tile
      icon={Timer}
      color="text-orange-400"
      bg="bg-orange-500/10"
      title="Screen time"
      desc="Import your screen-time data and see where your hours really go."
      span="md:col-span-2"
    >
      <div className="rounded-xl border border-border bg-bg/60 p-4">
        <div className="flex h-16 items-end gap-1.5">
          {[40, 65, 50, 85, 60, 95, 45].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-orange-400/70" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mt-2 flex text-[10px] text-text-secondary">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="flex-1 text-center">
              {d}
            </span>
          ))}
        </div>
      </div>
    </Tile>

    <Tile
      icon={BarChart3}
      color="text-indigo-400"
      bg="bg-indigo-500/10"
      title="Reports"
      desc="Charts and summaries across every category, in one place."
      span="md:col-span-2"
    >
      <div className="flex items-center gap-4 rounded-xl border border-border bg-bg/60 p-4">
        <div
          className="relative h-16 w-16 shrink-0 rounded-full"
          style={{
            background:
              "conic-gradient(#3b82f6 0 38%, #8b5cf6 38% 50%, #10b981 50% 67%, #f59e0b 67% 76%, #ec4899 76% 100%)",
          }}
        >
          <div className="absolute inset-2.5 rounded-full bg-surface" />
        </div>
        <div className="space-y-1 text-[11px] text-text-secondary">
          <p>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-blue-500" />
            Movies 38%
          </p>
          <p>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Books 17%
          </p>
          <p>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-pink-500" />
            Journal 24%
          </p>
        </div>
      </div>
    </Tile>

    {/* Privacy banner */}
    <div className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/20 via-surface to-surface p-6 sm:p-7 md:col-span-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/25">
          <Lock size={20} className="text-accent" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">Private by default</h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-text-secondary">
            Your logs are yours. Passwords are securely hashed, every connection uses HTTPS, and your
            journal can be locked behind a PIN or biometrics.
          </p>
        </div>
      </div>
      <ul className="flex flex-wrap gap-2 text-xs font-medium text-text-secondary">
        {["Hashed passwords", "HTTPS everywhere", "PIN & biometric lock"].map((t) => (
          <li key={t} className="rounded-full border border-border bg-bg/60 px-3 py-1.5">
            {t}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
