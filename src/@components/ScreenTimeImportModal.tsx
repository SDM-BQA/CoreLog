import { useEffect, useRef, useState } from "react";
import { Clock3, ImageUp, Loader2 } from "lucide-react";
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

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const minsToLabel = (mins: number) => {
  const safeMinutes = Math.max(0, Number(mins) || 0);
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
};

const emptyApps = (): ScreenTimeAppDraft[] =>
  Array.from({ length: 3 }, () => ({ app_name: "", minutes: 0 }));

const normalizeApps = (apps: Array<{ app_name?: string; minutes?: number }> = []) => {
  const topApps = apps
    .map((app) => ({
      app_name: app.app_name?.trim() ?? "",
      minutes: Number(app.minutes) || 0,
    }))
    .filter((app) => app.app_name || app.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 3);

  while (topApps.length < 3) {
    topApps.push({ app_name: "", minutes: 0 });
  }

  return topApps;
};

const ScreenTimeImportModal = ({
  isOpen,
  onClose,
  onAdd,
}: ScreenTimeImportModalProps) => {
  const [uploadName, setUploadName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [apps, setApps] = useState<ScreenTimeAppDraft[]>(emptyApps());
  const [parseNotice, setParseNotice] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parseImage, { isLoading: parsing }] = useParseScreenTimeImageMutation();

  useEffect(() => {
    if (!isOpen) {
      setUploadName("");
      setIsDragging(false);
      setTotalMinutes(0);
      setApps(emptyApps());
      setParseNotice("");
    }
  }, [isOpen]);

  const handleParsedImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      setUploadName(file.name);
      setParseNotice("");
      const image_base64 = await toBase64(file);
      const parsed = await parseImage({ image_base64 }).unwrap();
      const nextApps = normalizeApps(parsed.apps ?? []);
      const fallbackTotal = nextApps.reduce((sum, app) => sum + (Number(app.minutes) || 0), 0);

      setApps(nextApps);
      setTotalMinutes(Number(parsed.total_minutes) || fallbackTotal);
      toast.success("Screen time extracted");
    } catch (error) {
      const message = getScreenTimeParseErrorMessage(error);
      setParseNotice(message);
      if (isScreenTimeParserUnavailable(error)) {
        setApps(emptyApps());
        setTotalMinutes(0);
      }
      toast.error(message);
    }
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleParsedImage(file);
    event.target.value = "";
  };

  const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await handleParsedImage(file);
  };

  const handleAdd = () => {
    const validApps = apps
      .map((app) => ({
        app_name: app.app_name.trim(),
        minutes: Number(app.minutes) || 0,
      }))
      .filter((app) => app.app_name && app.minutes > 0)
      .slice(0, 3);

    const resolvedTotal = totalMinutes > 0
      ? totalMinutes
      : validApps.reduce((sum, app) => sum + app.minutes, 0);

    if (!resolvedTotal && !validApps.length) {
      toast.error("Upload a screenshot or enter app times first");
      return;
    }

    onAdd({
      totalMinutes: resolvedTotal,
      apps: validApps,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Screen Time"
      maxWidth="760px"
      footer={(
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-secondary">
            Upload a screenshot, tweak the values if needed, then insert it into your journal.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={parsing}
              className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-60"
            >
              Insert into journal
            </button>
          </div>
        </div>
      )}
    >
      <div className="space-y-5">
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`block rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-accent bg-accent/10"
              : "border-border bg-bg/50 hover:border-accent/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
          <div className="flex flex-col items-center gap-3">
            {parsing ? (
              <Loader2 size={24} className="animate-spin text-accent" />
            ) : (
              <ImageUp size={24} className="text-accent" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">
                {uploadName || "Drop a screenshot here or click to upload"}
              </p>
              <p className="text-xs text-text-secondary">
                We’ll pull the total screen time and the top 3 apps for you.
              </p>
            </div>
          </div>
        </label>

        {parseNotice && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            {parseNotice}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4">
          <div className="rounded-2xl border border-border bg-bg/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wider">
              <Clock3 size={13} />
              Total Screen Time
            </div>
            <input
              type="number"
              min={0}
              value={totalMinutes}
              onChange={(event) => setTotalMinutes(Number(event.target.value) || 0)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-text-secondary">
              Preview: {minsToLabel(totalMinutes)}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg/50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">Top Apps</p>
                <p className="text-xs text-text-secondary">Edit names or minutes before inserting.</p>
              </div>
            </div>

            <div className="space-y-2">
              {apps.map((app, index) => (
                <div key={index} className="grid grid-cols-[44px_minmax(0,1fr)_110px] gap-2 items-center">
                  <div className="h-10 rounded-xl border border-border bg-surface flex items-center justify-center text-xs font-bold text-text-secondary">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    placeholder={`App ${index + 1}`}
                    value={app.app_name}
                    onChange={(event) => {
                      const next = [...apps];
                      next[index] = { ...next[index], app_name: event.target.value };
                      setApps(next);
                    }}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    min={0}
                    value={app.minutes}
                    onChange={(event) => {
                      const next = [...apps];
                      next[index] = { ...next[index], minutes: Number(event.target.value) || 0 };
                      setApps(next);
                    }}
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
