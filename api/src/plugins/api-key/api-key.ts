// src/utils/apiKey.ts
export const getApiKey = (req: Request): string | null => {
  // Header minúsculo funciona porque Headers é case-insensitive
  const key = req.headers.get("x-api-key");
  return key && key.trim() !== "" ? key.trim() : null;
};
