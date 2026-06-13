export interface JournalSavedTemplate {
  id: string;
  name: string;
  content: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalTemplateDraft {
  name: string;
  content: string;
  category?: string;
}

const STORAGE_PREFIX = "corelog_journal_templates_v1";
const PLACEHOLDER_PATTERN = /\{([a-zA-Z0-9_ -]+)\}/g;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const safeUserKey = (userId?: string) => userId?.trim() || "guest";

export const getJournalTemplatesStorageKey = (userId?: string) =>
  `${STORAGE_PREFIX}:${safeUserKey(userId)}`;

export const loadJournalTemplates = (userId?: string): JournalSavedTemplate[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getJournalTemplatesStorageKey(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is JournalSavedTemplate =>
        Boolean(item && typeof item.id === "string" && typeof item.name === "string" && typeof item.content === "string"),
      )
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  } catch {
    return [];
  }
};

export const saveJournalTemplates = (userId: string | undefined, templates: JournalSavedTemplate[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getJournalTemplatesStorageKey(userId), JSON.stringify(templates));
};

export const clearJournalTemplates = (userId?: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getJournalTemplatesStorageKey(userId));
};

export const getJournalTemplatePlaceholders = (content: string) => {
  const seen = new Set<string>();
  const placeholders: string[] = [];

  for (const match of content.matchAll(PLACEHOLDER_PATTERN)) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    if (seen.has(raw)) continue;
    seen.add(raw);
    placeholders.push(raw);
  }

  return placeholders;
};

export const humanizeJournalTemplatePlaceholder = (placeholder: string) =>
  placeholder
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const renderJournalTemplateContent = (content: string, values: Record<string, string>) =>
  content.replace(PLACEHOLDER_PATTERN, (_, key: string) => values[key.trim()] ?? "");

export const journalTemplateTextToHtml = (content: string) => {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  return normalized
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => escapeHtml(line))
        .join("<br>");
      return `<p>${lines || "<br>"}</p>`;
    })
    .join("");
};
