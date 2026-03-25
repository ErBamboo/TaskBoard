export function buildAdminUrl(
  parameters: Record<string, string | null | undefined>,
) {
  const searchParameters = new URLSearchParams();

  for (const [key, value] of Object.entries(parameters)) {
    if (value) {
      searchParameters.set(key, value);
    }
  }

  const search = searchParameters.toString();
  return search ? `/admin?${search}` : "/admin";
}
