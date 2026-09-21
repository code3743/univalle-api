export function slugify(text: string): string {
  let slug = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "");

  while (slug.endsWith("-")) {
    slug = slug.slice(0, -1);
  }

  return slug;
}
