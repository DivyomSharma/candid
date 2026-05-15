type CandorLogLevel = "info" | "warn" | "error";

type CandorLogInput = {
  event: string;
  level?: CandorLogLevel;
  error?: unknown;
  context?: Record<string, unknown>;
};

const isDevelopment = process.env.NODE_ENV !== "production";

export function logCandorInternal(input: CandorLogInput) {
  const level = input.level ?? "info";
  const payload: Record<string, unknown> = {
    scope: "candor",
    event: input.event,
    ...input.context,
  };

  if (isDevelopment && input.error) {
    payload.error = serializeError(input.error);
  }

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
}
