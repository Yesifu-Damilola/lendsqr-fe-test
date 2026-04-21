export type PaginationItem = number | "ellipsis";

/**
 * Builds compact page number controls with ellipses (e.g. 1, 2, 3, …, 15, 16).
 */
export function buildPaginationItems(
  currentPage: number,
  pageCount: number,
): PaginationItem[] {
  if (pageCount < 1) return [1];
  if (pageCount === 1) return [1];
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(pageCount);
  pages.add(currentPage);
  pages.add(currentPage - 1);
  pages.add(currentPage + 1);
  for (let i = 2; i <= 3; i++) pages.add(i);
  for (let i = pageCount - 2; i <= pageCount; i++) pages.add(i);

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  const out: PaginationItem[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev > 0 && p - prev > 1) out.push("ellipsis");
    out.push(p);
    prev = p;
  }
  return out;
}
