"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { buildPaginationItems } from "./buildPaginationItems";
import styles from "./TablePagination.module.scss";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export type TablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  disabled?: boolean;
};

export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: TablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const items = buildPaginationItems(safePage, pageCount);

  const clamp = (p: number) => Math.max(1, Math.min(pageCount, p));

  return (
    <footer className={styles.root} aria-label="Table pagination">
      <div className={styles.left}>
        <span className={styles.range} aria-live="polite">
          Showing{" "}
          <strong className={styles.rangeStrong}>
            <span className={styles.perPageWrap}>
              <label className={styles.pageSize}>
                <select
                  value={String(pageSize)}
                  disabled={disabled}
                  onChange={(e) => {
                    onPageSizeChange(Number(e.target.value));
                  }}
                  aria-label="Rows per page"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  aria-hidden
                  className={styles.pageSizeChevron}
                />
              </label>
            </span>
          </strong>{" "}
          out of <strong className={styles.rangeStrong}>{totalItems}</strong>
        </span>
      </div>

      <nav className={styles.nav} aria-label="Page navigation">
        <button
          type="button"
          className={styles.pageArrow}
          disabled={disabled || safePage <= 1}
          aria-label="Previous page"
          onClick={() => onPageChange(clamp(safePage - 1))}
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
        {items.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className={styles.pageEllipsis}>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`${styles.pageNum} ${p === safePage ? styles.pageNumCurrent : ""}`}
              aria-current={p === safePage ? "page" : undefined}
              disabled={disabled}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className={styles.pageArrow}
          disabled={disabled || safePage >= pageCount}
          aria-label="Next page"
          onClick={() => onPageChange(clamp(safePage + 1))}
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </nav>
    </footer>
  );
}
