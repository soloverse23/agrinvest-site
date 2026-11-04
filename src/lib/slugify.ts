/**
 * URL slug without diacritics: `Floarea-soarelui` → `floarea-soarelui`, `Crețești` → `cretesti`.
 * Covers both the comma-below (ș ț) and the legacy cedilla (ş ţ) forms.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
