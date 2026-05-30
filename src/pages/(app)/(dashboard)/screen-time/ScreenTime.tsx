import { useMemo, useState } from "react";
import { BarChart3, Clock3, ImageUp, Loader2, Save, Trash2 } from "lucide-react";
import {
  useDeleteScreenTimeEntryMutation,
  useGetScreenTimeEntriesQuery,
  useGetScreenTimeSummaryQuery,
  useParseScreenTimeImageMutation,
  useSaveScreenTimeEntryMutation,
} from "../../../../@store/api/screenTime.api";
import { toast } from "react-toast";
import CalendarInput from "../../../../@components/@ui/CalendarInput";

type AppUsage = { app_name: string; minutes: number };
type CategoryUsage = { name: string; minutes: number };

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const minsToLabel = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
};

const getLocalDateInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ScreenTime = () => {
  const [entryDate, setEntryDate] = useState(getLocalDateInputValue());
  const [rawText, setRawText] = useState("");
  const [categories, setCategories] = useState<CategoryUsage[]>([]);
  const [apps, setApps] = useState<AppUsage[]>([]);
  const [parsedTotalMinutes, setParsedTotalMinutes] = useState(0);
  const [uploadName, setUploadName] = useState("");

  const { data: summary, isLoading: summaryLoading } = useGetScreenTimeSummaryQuery({});
  const { data: entries, isLoading: entriesLoading } = useGetScreenTimeEntriesQuery({});
  const [parseImage, { isLoading: parsing }] = useParseScreenTimeImageMutation();
  const [saveEntry, { isLoading: saving }] = useSaveScreenTimeEntryMutation();
  const [deleteEntry, { isLoading: deleting }] = useDeleteScreenTimeEntryMutation();

  const totalMinutes = useMemo(() => apps.reduce((sum, a) => sum + (Number(a.minutes) || 0), 0), [apps]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadName(file.name);
      const image_base64 = await toBase64(file);
      const parsed = await parseImage({ image_base64 }).unwrap();
      setRawText(parsed.raw_text ?? "");
      setCategories(parsed.categories ?? []);
      setApps(parsed.apps ?? []);
      setParsedTotalMinutes(Number(parsed.total_minutes) || 0);
      toast.success("Screenshot analyzed");
    } catch {
      toast.error("Failed to analyze screenshot");
    } finally {
      e.target.value = "";
    }
  };

  const onSave = async () => {
    const validCategories = categories
      .map((c) => ({ name: c.name.trim(), minutes: Number(c.minutes) }))
      .filter((c) => c.name && c.minutes > 0);
    const validApps = apps
      .map((a) => ({ app_name: a.app_name.trim(), minutes: Number(a.minutes) }))
      .filter((a) => a.app_name && a.minutes > 0);
    if (!validApps.length && !validCategories.length) {
      toast.error("No valid usage found");
      return;
    }
    try {
      await saveEntry({
        entry_date: entryDate,
        categories: validCategories,
        apps: validApps,
        raw_text: rawText,
        total_minutes: parsedTotalMinutes > 0 ? parsedTotalMinutes : undefined,
      }).unwrap();
      toast.success("Screen-time entry saved");
    } catch {
      toast.error("Failed to save entry");
    }
  };

  const onDelete = async (date: string) => {
    try {
      await deleteEntry({ entry_date: date }).unwrap();
      toast.success("Deleted entry");
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="bg-bg flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary text-2xl font-black">Screen Time</h1>
          <p className="text-text-secondary text-sm">Upload screenshot, auto-parse usage, save day-wise trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Average / day</p>
          <p className="text-xl font-black text-text-primary mt-1">
            {summaryLoading ? "..." : minsToLabel(summary?.avg_daily_minutes ?? 0)}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Most used app</p>
          <p className="text-xl font-black text-text-primary mt-1">{summary?.most_used_app ?? "-"}</p>
          <p className="text-xs text-text-secondary mt-1">{minsToLabel(summary?.most_used_app_minutes ?? 0)}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary">Tracked days</p>
          <p className="text-xl font-black text-text-primary mt-1">{summary?.total_days ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-text-primary font-bold flex items-center gap-2"><ImageUp size={16} /> Upload & Parse</h2>
            <div className="w-[180px]">
              <CalendarInput
                value={entryDate}
                onChange={setEntryDate}
                max={getLocalDateInputValue()}
              />
            </div>
          </div>

          <label className="w-full border border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary">
            {parsing ? <Loader2 size={16} className="animate-spin" /> : <ImageUp size={16} />}
            <span className="text-sm">{uploadName || "Choose screenshot image"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary">Parsed Categories</p>
            </div>
            <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {categories.map((c, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_90px_28px] gap-2">
                  <input
                    value={c.name}
                    onChange={(e) => setCategories((prev) => prev.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))}
                    className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary"
                  />
                  <input
                    type="number"
                    min={0}
                    value={c.minutes}
                    onChange={(e) => setCategories((prev) => prev.map((x, i) => (i === idx ? { ...x, minutes: Number(e.target.value) } : x)))}
                    className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary"
                  />
                  <button type="button" onClick={() => setCategories((prev) => prev.filter((_, i) => i !== idx))} className="border border-border rounded-lg text-text-secondary hover:text-error">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary flex items-center gap-1"><Clock3 size={12} /> Parsed Apps</p>
              <p className="text-xs text-text-secondary">Total: {minsToLabel(totalMinutes)}</p>
            </div>
            <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {apps.map((app, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_90px_28px] gap-2">
                  <input
                    value={app.app_name}
                    onChange={(e) => setApps((prev) => prev.map((x, i) => (i === idx ? { ...x, app_name: e.target.value } : x)))}
                    className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary"
                  />
                  <input
                    type="number"
                    min={0}
                    value={app.minutes}
                    onChange={(e) => setApps((prev) => prev.map((x, i) => (i === idx ? { ...x, minutes: Number(e.target.value) } : x)))}
                    className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary"
                  />
                  <button type="button" onClick={() => setApps((prev) => prev.filter((_, i) => i !== idx))} className="border border-border rounded-lg text-text-secondary hover:text-error">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setCategories((prev) => [...prev, { name: "", minutes: 0 }])} className="px-3 py-2 border border-border rounded-lg text-xs text-text-secondary hover:text-text-primary">
              Add Category
            </button>
            <button type="button" onClick={() => setApps((prev) => [...prev, { app_name: "", minutes: 0 }])} className="px-3 py-2 border border-border rounded-lg text-xs text-text-secondary hover:text-text-primary">
              Add Row
            </button>
            <button type="button" disabled={saving || parsing} onClick={onSave} className="ml-auto px-4 py-2 bg-accent text-white rounded-lg text-sm font-bold disabled:opacity-60 inline-flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Day
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="text-text-primary font-bold flex items-center gap-2 mb-3"><BarChart3 size={16} /> Daily Entries</h2>
          {entriesLoading ? (
            <div className="text-text-secondary text-sm">Loading entries...</div>
          ) : !entries?.length ? (
            <div className="text-text-secondary text-sm">No entries yet.</div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto custom-scrollbar pr-1">
              {entries.map((entry: any) => (
                <div key={entry._id} className="border border-border rounded-xl p-3 bg-bg/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-text-primary">{entry.entry_date}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-text-secondary">{minsToLabel(entry.total_minutes)}</p>
                      <button type="button" disabled={deleting} onClick={() => onDelete(entry.entry_date)} className="text-text-secondary hover:text-error">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    {(entry.categories ?? []).slice(0, 3).map((c: any) => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{c.name}</span>
                        <span className="text-text-primary font-semibold">{minsToLabel(c.minutes)}</span>
                      </div>
                    ))}
                    {(entry.apps ?? []).slice(0, 5).map((a: any) => (
                      <div key={a.app_name} className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{a.app_name}</span>
                        <span className="text-text-primary font-semibold">{minsToLabel(a.minutes)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenTime;
