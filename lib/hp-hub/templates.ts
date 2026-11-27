/** Fills {{placeholders}} in outreach request templates. Unknown placeholders are left as-is. */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key: string) => (key in vars ? vars[key] : m));
}
