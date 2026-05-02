/** Parses any date value the API might return: ms timestamp string, ISO string, or YYYY-MM-DD */
export const parseDate = (val?: string | number | null): Date | null => {
  if (val == null || val === "") return null;
  const num = Number(val);
  const d = isNaN(num) ? new Date(val as string) : new Date(num);
  return isNaN(d.getTime()) ? null : d;
};

/** Formats a date value for display: "23 Apr 2024" */
export const formatDate = (val?: string | number | null): string => {
  const d = parseDate(val);
  return d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
};

/** Converts a date value to YYYY-MM-DD for use in <input type="date"> */
export const toDateInput = (val?: string | number | null): string => {
  const d = parseDate(val);
  return d ? d.toISOString().split("T")[0] : "";
};

/** Converts a YYYY-MM-DD date input value to an ISO string for the API. Returns undefined if empty. */
export const toISO = (val?: string | null): string | undefined => {
  if (!val) return undefined;
  return new Date(val).toISOString();
};
