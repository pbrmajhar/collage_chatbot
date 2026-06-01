const placeholderParts = ["USER", "PASSWORD", "HOST", "DATABASE"];

export function isDatabaseConfigured() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return false;
  }

  return !placeholderParts.some((part) => databaseUrl.includes(part));
}
