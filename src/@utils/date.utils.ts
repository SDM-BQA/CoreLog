/** Parses any date value the API might return: ms timestamp string, ISO string, or YYYY-MM-DD */
export const parseDate = (val?: string | number | null): Date | null => {
  if (val == null || val === "") return null;
  const num = Number(val);
  const d = isNaN(num) ? new Date(val as string) : new Date(num);
  return isNaN(d.getTime()) ? null : d;
};

/** Formats a date value for display in IST: "23 Apr 2024" */
export const formatDate = (val?: string | number | null): string => {
  const d = parseDate(val);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", { 
    day: "numeric", 
    month: "short", 
    year: "numeric",
    timeZone: "Asia/Kolkata" 
  });
};

/** Formats a date value for full display in IST: "Tue, 23 Apr 2024, 5:30 PM" */
export const formatDateTime = (val?: string | number | null): string => {
  const d = parseDate(val);
  if (!d) return "—";
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });
};

/** Formats only the day/month for calendar views in IST: "23 Apr" */
export const formatDayMonth = (val?: string | number | null): string => {
  const d = parseDate(val);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", { 
    day: "numeric", 
    month: "short",
    timeZone: "Asia/Kolkata" 
  });
};

/** Converts a date value to YYYY-MM-DD for use in <input type="date"> */
export const toDateInput = (val?: string | number | null): string => {
  const d = parseDate(val);
  if (!d) return "";
  // We use local date parts for input to avoid UTC shift if only the date was intended
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Converts a YYYY-MM-DD date input value to an ISO string for the API. Returns undefined if empty. */
export const toISO = (val?: string | null): string | undefined => {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};
