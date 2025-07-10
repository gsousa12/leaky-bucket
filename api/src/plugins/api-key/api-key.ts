export const getApiKey = (req: Request): string | null => {
  const key = req.headers.get("x-api-key");
  return key && key.trim() !== "" ? key.trim() : null;
};
