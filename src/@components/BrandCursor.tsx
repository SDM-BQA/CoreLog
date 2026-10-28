import { useEffect, useRef } from "react";

/**
 * Brand cursor: a crosshair ring with a cyan core (the target) that leaves a short
 * trail of log lines behind it (entries stacking up).
 *
 * - Only runs for mouse-like pointers; touch devices keep their normal behaviour.
 * - Over text inputs the real text cursor is shown and this one hides.
 * - With "reduce motion" the trail is skipped and the ring follows the pointer exactly.
 * - Until it mounts (and for everyone it doesn't run for) the CSS arrow in index.css applies.
 */

const TRAIL = 5;
const CLICKABLE =
  'a, button, [role="button"], [role="tab"], summary, label[for], select, input[type="checkbox"], input[type="radio"], input[type="range"], input[type="file"], .cursor-pointer';
const TEXTUAL =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]):not([type="button"]):not([type="submit"]):not([type="color"]), textarea, [contenteditable="true"]';

type Mode = "idle" | "hot" | "off" | "disabled";

export const BrandCursor = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const segRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!finePointer) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = rootRef.current!;
    const head = headRef.current!;
    const ring = ringRef.current!;
    const segs = segRefs.current;

    document.documentElement.classList.add("brand-cursor");

    let mx = -100;
    let my = -100;
    let hx = -100;
    let hy = -100;
    let mode: Mode = "idle";
    let down = false;
    let visible = false;
    let frame = 0;
    const trail = Array.from({ length: TRAIL }, () => ({ x: -100, y: -100 }));

    const setMode = (next: Mode) => {
      mode = next;
      root.dataset.mode = next;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        // snap into place on first move so it doesn't fly in from the corner
        hx = mx;
        hy = my;
        trail.forEach((t) => {
          t.x = mx;
          t.y = my;
        });
        visible = true;
        root.style.opacity = "1";
      }
      const target = e.target as Element | null;
      if (target?.closest(TEXTUAL)) setMode("off");
      else {
        const hot = target?.closest(CLICKABLE) as HTMLElement | null;
        if (!hot) setMode("idle");
        else if (hot.matches(":disabled") || hot.getAttribute("aria-disabled") === "true") setMode("disabled");
        else setMode("hot");
      }
    };

    const onDown = () => {
      down = true;
      root.dataset.down = "true";
    };
    const onUp = () => {
      down = false;
      root.dataset.down = "false";
    };
    const onLeave = () => {
      visible = false;
      root.style.opacity = "0";
    };
    const onEnter = () => {
      if (mx > -50) {
        visible = true;
        root.style.opacity = "1";
      }
    };

    const loop = () => {
      const follow = reduce.matches ? 1 : 0.5;
      hx += (mx - hx) * follow;
      hy += (my - hy) * follow;

      const scale = down ? 0.8 : mode === "hot" ? 0.78 : 1;
      head.style.transform = `translate3d(${hx}px, ${hy}px, 0) scale(${scale})`;
      ring.style.opacity = mode === "off" ? "0" : mode === "disabled" ? "0.45" : "1";

      let px = hx;
      let py = hy;
      for (let i = 0; i < TRAIL; i++) {
        const t = trail[i];
        const seg = segs[i];
        t.x += (px - t.x) * 0.2;
        t.y += (py - t.y) * 0.2;
        if (seg) {
          const dx = px - t.x;
          const dy = py - t.y;
          const dist = Math.hypot(dx, dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          // fade as the trail catches up, so it vanishes when you stop
          const visibleAmt = reduce.matches || mode === "off" ? 0 : Math.min(1, Math.max(0, (dist - 2) / 10));
          seg.style.opacity = String(visibleAmt * (1 - i * 0.17));
          seg.style.transform = `translate3d(${t.x - 7}px, ${t.y - 3}px, 0) rotate(${angle}deg)`;
        }
        px = t.x;
        py = t.y;
      }
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("brand-cursor");
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-mode="idle"
      data-down="false"
      className="brand-cursor-root"
      style={{ opacity: 0 }}
    >
      {Array.from({ length: TRAIL }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            segRefs.current[i] = el;
          }}
          className="brand-cursor-seg"
          style={{ width: 26 - i * 4, background: i < 2 ? "#00f2ff" : i < 4 ? "#4b8bff" : "#3b3bff" }}
        />
      ))}
      <div ref={headRef} className="brand-cursor-head">
        <svg ref={ringRef} className="brand-cursor-ring" width="36" height="36" viewBox="0 0 36 36" fill="none">
          <g stroke="#101022" strokeWidth="4.2" strokeLinecap="round">
            <circle cx="18" cy="18" r="10" />
            <path d="M18 2.500v5M18 28.500v5M2.500 18h5M28.500 18h5" />
          </g>
          <g className="brand-cursor-ring-line" stroke="#00f2ff" strokeWidth="1.8" strokeLinecap="round">
            <circle className="brand-cursor-fill" cx="18" cy="18" r="10" />
            <path d="M18 2.500v5M18 28.500v5M2.500 18h5M28.500 18h5" />
          </g>
        </svg>
        <span className="brand-cursor-core" />
      </div>
    </div>
  );
};
