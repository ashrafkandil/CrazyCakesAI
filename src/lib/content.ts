export type SiteContent = Record<string, string>;

export function text(content: SiteContent, key: string): string {
  const value = content[key];
  if (value === undefined) {
    throw new Error(`Missing content slot "${key}". Run "npm run db:seed".`);
  }
  return value;
}
