export const getScreenTimeParseErrorMessage = (error: unknown) => {
  const fallback = "Auto extraction is unavailable right now. You can still enter the values manually.";

  if (!error || typeof error !== "object") return fallback;

  const maybeError = error as {
    data?: { errors?: Array<{ message?: string }> };
    error?: string;
    message?: string;
  };

  const gqlMessage = maybeError.data?.errors?.[0]?.message;
  const plainMessage = maybeError.message || maybeError.error;
  const message = gqlMessage || plainMessage || "";

  if (message.includes('Cannot query field "parse_screen_time_image"')) {
    return fallback;
  }

  return "Failed to analyze screenshot. You can still fill in the screen time details manually.";
};

export const isScreenTimeParserUnavailable = (error: unknown) => {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as {
    data?: { errors?: Array<{ message?: string }> };
    error?: string;
    message?: string;
  };

  const gqlMessage = maybeError.data?.errors?.[0]?.message;
  const plainMessage = maybeError.message || maybeError.error || "";
  const message = gqlMessage || plainMessage;

  return message.includes('Cannot query field "parse_screen_time_image"');
};
