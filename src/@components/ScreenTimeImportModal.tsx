import { useEffect, useRef, useState } from "react";
import { Clock3, ImageUp, Loader2, Cpu, RefreshCw } from "lucide-react";
import { toast } from "react-toast";
import Modal from "./Modal";
import { useParseScreenTimeImageMutation } from "../@store/api/screenTime.api";
import {
  getScreenTimeParseErrorMessage,
  isScreenTimeParserUnavailable,
} from "../@utils/screenTime.utils";

export type ScreenTimeAppDraft = {
  app_name: string;
  minutes: number;
};

interface ScreenTimeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payload: { totalMinutes: number; apps: ScreenTimeAppDraft[] }) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Preprocess image for Tesseract:
//   1. Upscale 3x (Tesseract accuracy drops sharply on small widget screenshots)
//   2. Grayscale (reduces color noise from app icons)
//   3. Invert if dark background (Tesseract prefers dark-on-light)
//   4. Contrast stretch (push values toward 0/255 for crisper glyphs)
const preprocessForOcr = (file: File): Promise<Blob> =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const SCALE = 3;
      const canvas = document.createElement("canvas");
      canvas.width  = img.width  * SCALE;
      canvas.height = img.height * SCALE;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;

      // Sample brightness before converting to grayscale
      let brightnessSum = 0;
      const step = Math.max(1, Math.floor(data.length / (4 * 2000)));
      let count = 0;
      for (let i = 0; i < data.length; i += step * 4) {
        brightnessSum += (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
        count++;
      }
      const avgBrightness = brightnessSum / count;
      const dark = avgBrightness < 128;

      // Convert to grayscale, invert if dark, then contrast-stretch
      for (let i = 0; i < data.length; i += 4) {
        let g = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
        if (dark) g = 255 - g;
        // Contrast stretch: (value - 128) * factor + 128, clamped
        g = Math.max(0, Math.min(255, (g - 128) * 1.6 + 128));
        data[i] = data[i + 1] = data[i + 2] = g;
      }

      ctx.putImageData(imageData, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob ?? file), "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

const minsToLabel = (mins: number) => {
  const safe = Math.max(0, Number(mins) || 0);
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
};

const emptyApps = (): ScreenTimeAppDraft[] =>
  Array.from({ length: 3 }, () => ({ app_name: "", minutes: 0 }));

const padApps = (apps: ScreenTimeAppDraft[]): ScreenTimeAppDraft[] => {
  const out = [...apps.slice(0, 3)];
  while (out.length < 3) out.push({ app_name: "", minutes: 0 });
  return out;
};

// ── OCR text parser ───────────────────────────────────────────────────────────
// Handles standard Android Digital Wellbeing widget format:
//   "2 h" or "2 h 30 m" at top
//   Category rows: "Social   52 m"
//   "Most used apps" header
//   App grid (may be 3-column or stacked): "Drive  Brave  YouTube" / "29 m  23 m  15 m"

const parseScreenTimeText = (rawText: string): { totalMinutes: number; apps: ScreenTimeAppDraft[] } => {
  // Strip bullet dots, icon symbols (® © read from app icons), and carriage returns
  const text = rawText.replace(/[●•·◉○◆▪®©]/g, "").replace(/\r/g, "");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // 1. Total time — scan first 5 lines for "X h [Y m]" or "NNN m"
  let totalMinutes = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const hm = lines[i].match(/(\d+)\s*h\s*(?:(\d+)\s*m)?/i);
    if (hm) { totalMinutes = +hm[1] * 60 + (+(hm[2] ?? 0)); break; }
    const mo = lines[i].match(/^(\d{2,3})\s*m(?:in)?$/i);
    if (mo) { totalMinutes = +mo[1]; break; }
  }

  // 2. Locate "Most used apps" section boundary
  const mostIdx = lines.findIndex((l) => /most\s*used\s*app/i.test(l));
  const appLines  = mostIdx !== -1 ? lines.slice(mostIdx + 1) : [];
  const catLines  = lines.slice(1, mostIdx !== -1 ? mostIdx : undefined);

  const apps: ScreenTimeAppDraft[] = [];

  // Strategy A — single-line grid: "Drive  Brave  YouTube" / "29 m  23 m  15 m"
  for (let i = 0; i < appLines.length - 1 && apps.length === 0; i++) {
    const nameLine = appLines[i];
    const timeLine = appLines[i + 1];
    if (/\d+\s*m/i.test(nameLine)) continue;
    const names = nameLine.split(/\s{2,}/).map((s) => s.trim()).filter((s) => s.length > 1 && !/^\d/.test(s));
    const times = [...timeLine.matchAll(/(\d+)\s*m/gi)].map((m) => +m[1]);
    if (names.length >= 2 && times.length >= 2) {
      for (let j = 0; j < Math.min(names.length, times.length, 3); j++) {
        if (names[j]) apps.push({ app_name: names[j], minutes: times[j] });
      }
    }
  }

  // Strategy A2 — column layout: N name lines then N time lines
  // e.g. "Cre\nBrown\nYoulube\n29m\n23m\n15m" (Android widget grid read top-to-bottom)
  if (apps.length === 0 && appLines.length > 0) {
    const firstTimeIdx = appLines.findIndex((l) => /^\d+\s*m$/i.test(l));
    if (firstTimeIdx > 0) {
      const nameBlock = appLines
        .slice(0, firstTimeIdx)
        .filter((l) => l.length > 1 && !/^\d/.test(l));
      const timeBlock = appLines
        .slice(firstTimeIdx)
        .map((l) => l.match(/^(\d+)\s*m$/i))
        .filter(Boolean)
        .map((m) => +(m![1]));
      if (nameBlock.length >= 1 && timeBlock.length >= 1) {
        const count = Math.min(nameBlock.length, timeBlock.length, 3);
        for (let i = 0; i < count; i++) {
          apps.push({ app_name: nameBlock[i], minutes: timeBlock[i] });
        }
      }
    }
  }

  // Strategy B — stacked: "AppName\n29 m\nAppName\n23 m" or "AppName 29 m"
  if (apps.length === 0) {
    for (let i = 0; i < appLines.length && apps.length < 3; i++) {
      const line = appLines[i];
      if (/most\s*used/i.test(line)) continue;
      const inline = line.match(/^(.+?)\s+(\d+)\s*m$/i);
      if (inline && inline[1].trim().length > 1) {
        apps.push({ app_name: inline[1].trim(), minutes: +inline[2] });
        continue;
      }
      const nextTime = appLines[i + 1]?.match(/^(\d+)\s*m$/i);
      if (nextTime && line.length > 1 && !/^\d/.test(line)) {
        apps.push({ app_name: line, minutes: +nextTime[1] });
        i++;
      }
    }
  }

  // Strategy C — flatten and regex everything in the app section
  if (apps.length === 0 && appLines.length > 0) {
    const flat = appLines.join(" ");
    const re = /([A-Za-z][A-Za-z &]{1,25}?)\s+(\d+)\s*m/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(flat)) !== null && apps.length < 3) {
      const name = m[1].trim();
      if (name.length > 1 && !/most used/i.test(name)) {
        apps.push({ app_name: name, minutes: +m[2] });
      }
    }
  }

  // Fallback — use category lines if still nothing
  if (apps.length === 0) {
    for (const line of catLines) {
      if (apps.length >= 3) break;
      const m = line.match(/^(.+?)\s+(\d+)\s*m$/i);
      if (m && m[1].trim().length > 1) {
        apps.push({ app_name: m[1].trim(), minutes: +m[2] });
      }
    }
  }

  return { totalMinutes, apps: apps.slice(0, 3) };
};

// ── Component ─────────────────────────────────────────────────────────────────

const ScreenTimeImportModal = ({
  isOpen,
  onClose,
  onAdd,
}: ScreenTimeImportModalProps) => {
  const [uploadName, setUploadName]   = useState("");
  const [uploadFile, setUploadFile]   = useState<File | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [apps, setApps]               = useState<ScreenTimeAppDraft[]>(emptyApps());
  const [notice, setNotice]           = useState<{ text: string; type: "info" | "warn" | "error" } | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [rawOcrText, setRawOcrText]   = useState("");
  const [showRaw, setShowRaw]         = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parseImage, { isLoading: isServerParsing }] = useParseScreenTimeImageMutation();

  const isProcessing = isOcrRunning || isServerParsing;

  useEffect(() => {
    if (!isOpen) {
      setUploadName(""); setUploadFile(null);
      setIsDragging(false); setTotalMinutes(0);
      setApps(emptyApps()); setNotice(null);
      setOcrProgress(0); setIsOcrRunning(false);
      setRawOcrText(""); setShowRaw(false);
    }
  }, [isOpen]);

  // ── Primary: Tesseract.js OCR ─────────────────────────────────────────────
  const runOcr = async (file: File) => {
    setIsOcrRunning(true);
    setOcrProgress(0);
    setNotice(null);
    try {
      const { createWorker, PSM } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });
      // PSM 11 = sparse text: finds text anywhere on page without assuming layout order.
      // This is better than the default (PSM 3) for widget screenshots with scattered text.
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });

      const processedBlob = await preprocessForOcr(file);
      const { data: { text } } = await worker.recognize(processedBlob);
      await worker.terminate();

      setRawOcrText(text);

      const { totalMinutes: total, apps: parsedApps } = parseScreenTimeText(text);

      if (!total && parsedApps.length === 0) {
        setNotice({ text: "OCR couldn't find screen time data. Check the raw text below or try the AI fallback.", type: "warn" });
        setShowRaw(true);
        return;
      }

      // Hours-vs-minutes heuristic
      const appsSum = parsedApps.reduce((s, a) => s + a.minutes, 0);
      let resolvedTotal = total;
      if (total > 0 && total < 24 && appsSum > total * 5) {
        resolvedTotal = total * 60;
        setNotice({ text: `Total detected as ${total}h — converted to ${resolvedTotal} min. Edit if incorrect.`, type: "info" });
      } else if (!total && appsSum > 0) {
        resolvedTotal = appsSum;
      }

      setTotalMinutes(resolvedTotal);
      setApps(padApps(parsedApps));
      toast.success("Screen time extracted");
    } catch {
      setNotice({ text: "OCR failed. Try the AI fallback below.", type: "error" });
    } finally {
      setIsOcrRunning(false);
      setOcrProgress(0);
    }
  };

  // ── Fallback: server-side AI ──────────────────────────────────────────────
  const runServerFallback = async () => {
    if (!uploadFile) return;
    setNotice(null);
    try {
      const image_base64 = await toBase64(uploadFile);
      const parsed = await parseImage({ image_base64 }).unwrap();

      const appSource = (parsed.apps ?? []).length > 0
        ? parsed.apps
        : (parsed.categories ?? []).map((c: { name: string; minutes: number }) => ({
            app_name: c.name, minutes: c.minutes,
          }));

      const nextApps = padApps(
        appSource
          .map((a: { app_name?: string; minutes?: number }) => ({ app_name: a.app_name?.trim() ?? "", minutes: Number(a.minutes) || 0 }))
          .filter((a: ScreenTimeAppDraft) => a.app_name || a.minutes > 0)
          .sort((a: ScreenTimeAppDraft, b: ScreenTimeAppDraft) => b.minutes - a.minutes)
          .slice(0, 3)
      );

      const appsSum = nextApps.reduce((s: number, a: ScreenTimeAppDraft) => s + a.minutes, 0);
      let totalMins = Number(parsed.total_minutes) || 0;
      if (totalMins > 0 && totalMins < 24 && appsSum > totalMins * 5) {
        totalMins = totalMins * 60;
        setNotice({ text: `AI detected total as ${parsed.total_minutes}h — converted to ${totalMins} min.`, type: "info" });
      }

      setApps(nextApps);
      setTotalMinutes(totalMins || appsSum);
      toast.success("Screen time extracted via AI");
    } catch (error) {
      const message = getScreenTimeParseErrorMessage(error);
      setNotice({ text: message, type: "error" });
      if (isScreenTimeParserUnavailable(error)) {
        setApps(emptyApps());
        setTotalMinutes(0);
      }
      toast.error(message);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    setUploadName(file.name);
    setUploadFile(file);
    await runOcr(file);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFile(file);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const handleAdd = () => {
    const validApps = apps
      .map((a) => ({ app_name: a.app_name.trim(), minutes: Number(a.minutes) || 0 }))
      .filter((a) => a.app_name && a.minutes > 0)
      .slice(0, 3);
    const resolvedTotal = totalMinutes > 0 ? totalMinutes : validApps.reduce((s, a) => s + a.minutes, 0);
    if (!resolvedTotal && !validApps.length) { toast.error("Upload a screenshot or enter app times first"); return; }
    onAdd({ totalMinutes: resolvedTotal, apps: validApps });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Screen Time"
      maxWidth="760px"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-secondary">
            Upload a screenshot, tweak the values if needed, then insert.
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleAdd} disabled={isProcessing} className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-60">
              Insert into journal
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">

        {/* Upload zone */}
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`block rounded-2xl border-2 border-dashed px-5 py-7 text-center transition-colors cursor-pointer ${
            isDragging ? "border-accent bg-accent/10" : "border-border bg-bg/50 hover:border-accent/50"
          }`}
        >
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
          <div className="flex flex-col items-center gap-3">
            {isOcrRunning ? (
              <>
                <Cpu size={24} className="text-accent animate-pulse" />
                <div className="w-full max-w-[200px] space-y-1.5">
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
                  </div>
                  <p className="text-xs text-text-secondary">Reading image… {ocrProgress}%</p>
                </div>
              </>
            ) : isServerParsing ? (
              <>
                <Loader2 size={24} className="animate-spin text-accent" />
                <p className="text-xs text-text-secondary">Analyzing with AI…</p>
              </>
            ) : (
              <>
                <ImageUp size={24} className="text-accent" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-text-primary">
                    {uploadName || "Drop a screenshot here or click to upload"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Reads your screen time screenshot directly — free, no API needed.
                  </p>
                </div>
              </>
            )}
          </div>
        </label>

        {/* Notice */}
        {notice && (
          <div className={`rounded-2xl border px-4 py-3 text-xs flex items-start gap-2 ${
            notice.type === "info"  ? "border-blue-500/20 bg-blue-500/10 text-blue-300" :
            notice.type === "warn"  ? "border-amber-500/20 bg-amber-500/10 text-amber-200" :
                                      "border-rose-500/20 bg-rose-500/10 text-rose-300"
          }`}>
            <span className="flex-1">{notice.text}</span>
            {(notice.type === "warn" || notice.type === "error") && uploadFile && (
              <button
                type="button"
                onClick={runServerFallback}
                disabled={isProcessing}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/15 text-accent font-semibold hover:bg-accent/25 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={11} /> Try AI
              </button>
            )}
          </div>
        )}

        {/* Raw OCR text — collapsible, helps debug parser misses */}
        {rawOcrText && (
          <div className="rounded-2xl border border-border bg-bg/40 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRaw((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              <span>Raw OCR text {showRaw ? "▲" : "▼"}</span>
              <span className="text-text-secondary/40 font-normal">what Tesseract read</span>
            </button>
            {showRaw && (
              <pre className="px-4 pb-4 text-[11px] text-text-secondary/70 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto custom-scrollbar border-t border-border">
                {rawOcrText}
              </pre>
            )}
          </div>
        )}

        {/* Values */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4">
          <div className="rounded-2xl border border-border bg-bg/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wider">
              <Clock3 size={13} /> Total Screen Time
            </div>
            <input
              type="number" min={0} value={totalMinutes}
              onChange={(e) => setTotalMinutes(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-text-secondary">Preview: {minsToLabel(totalMinutes)}</p>
          </div>

          <div className="rounded-2xl border border-border bg-bg/50 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Top Apps</p>
              <p className="text-xs text-text-secondary">Edit names or minutes before inserting.</p>
            </div>
            <div className="space-y-2">
              {apps.map((app, i) => (
                <div key={i} className="grid grid-cols-[44px_minmax(0,1fr)_110px] gap-2 items-center">
                  <div className="h-10 rounded-xl border border-border bg-surface flex items-center justify-center text-xs font-bold text-text-secondary">
                    {i + 1}
                  </div>
                  <input
                    type="text" placeholder={`App ${i + 1}`} value={app.app_name}
                    onChange={(e) => { const n = [...apps]; n[i] = { ...n[i], app_name: e.target.value }; setApps(n); }}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                  />
                  <input
                    type="number" min={0} value={app.minutes}
                    onChange={(e) => { const n = [...apps]; n[i] = { ...n[i], minutes: Number(e.target.value) || 0 }; setApps(n); }}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default ScreenTimeImportModal;
