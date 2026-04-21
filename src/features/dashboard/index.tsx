"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { emptyAdvancedFilter } from "@/constants/dashboard";
import { USERS_FULL_TABLE_FETCH_LIMIT } from "@/queryOptions/usersQueryOptions";
import { useUsersQuery } from "@/query/useUsersQuery";
import type { UserRow, UserStatus } from "@/types/users";
import DashboardWrapper from "./DashboardWrapper";
import { DashboardFilter } from "./DashboardFilter";
import { DashboardSummaryStats } from "./DashboardSummaryStats";
import { DashboardUserTable } from "./DashboardUserTable";
import styles from "./Dashboard.module.scss";
import { TablePagination } from "../pagination/TablePagination";

function sameCalendarDay(isoDate: string, dateJoined: string) {
  const parsed = new Date(dateJoined);
  if (Number.isNaN(parsed.getTime())) return true;
  const [y, m, d] = isoDate.split("-").map(Number);
  return (
    parsed.getFullYear() === y &&
    parsed.getMonth() === m - 1 &&
    parsed.getDate() === d
  );
}

const SEARCH_DEBOUNCE_MS = 350;

/** Rows per page for the users table (local mock API serves 500 records). */
const USERS_TABLE_PAGE_SIZE = 100;

const Dashboard = () => {
  const [query, setQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(USERS_TABLE_PAGE_SIZE);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(query.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, UserStatus>
  >({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState(emptyAdvancedFilter);
  const [appliedFilter, setAppliedFilter] = useState(emptyAdvancedFilter);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);

  const fApplied = appliedFilter;
  const hasAdvancedFilters =
    fApplied.organization.trim() !== "" ||
    fApplied.username.trim() !== "" ||
    fApplied.email.trim() !== "" ||
    fApplied.phone.trim() !== "" ||
    fApplied.date !== "" ||
    fApplied.status !== "";

  const filterPanelRef = useRef<HTMLDivElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const tableSectionRef = useRef<HTMLElement>(null);
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [filterPanelStyle, setFilterPanelStyle] = useState<CSSProperties>({});
  const rowMenuRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const usersQuery = useUsersQuery({
    searchQuery: debouncedSearch,
    page,
    pageSize,
    fetchAll: hasAdvancedFilters,
  });

  /** Full list for summary cards + organization filter; shares cache with `usersQuery` when `fetchAll` is on. */
  const usersMetaQuery = useUsersQuery({
    searchQuery: debouncedSearch,
    page: 1,
    pageSize: USERS_FULL_TABLE_FETCH_LIMIT,
    fetchAll: true,
  });

  const users: UserRow[] = (usersQuery.data?.items ?? []).map((u) => ({
    ...u,
    status: statusOverrides[u.id] ?? u.status,
  }));

  const metaItems = usersMetaQuery.data?.items;
  const statsReady = Boolean(usersMetaQuery.data);

  const metaItemsWithStatusOverrides: UserRow[] | null = metaItems
    ? metaItems.map((u) => ({
        ...u,
        status: statusOverrides[u.id] ?? u.status,
      }))
    : null;

  const orgSource =
    metaItems && metaItems.length > 0 ? metaItems : users;
  const uniqueOrganizations = [
    ...new Set(orgSource.map((u) => u.organization)),
  ].sort();

  const summaryTotalUsers =
    usersMetaQuery.data?.total ?? usersQuery.data?.total ?? null;
  const summaryActiveUsers = statsReady
    ? (metaItemsWithStatusOverrides?.filter((u) => u.status === "active")
        .length ?? 0)
    : null;
  const summaryUsersWithLoans = statsReady
    ? (metaItems?.filter((u) => u.hasLoan === true).length ?? 0)
    : null;
  const summaryUsersWithSavings = statsReady
    ? (metaItems?.filter((u) => u.hasSavings === true).length ?? 0)
    : null;

  let filteredUsers = users;
  if (fApplied.organization.trim()) {
    const o = fApplied.organization.trim().toLowerCase();
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.organization.toLowerCase() === o ||
        u.organization.toLowerCase().includes(o),
    );
  }
  if (fApplied.username.trim()) {
    const s = fApplied.username.trim().toLowerCase();
    filteredUsers = filteredUsers.filter((u) =>
      u.username.toLowerCase().includes(s),
    );
  }
  if (fApplied.email.trim()) {
    const s = fApplied.email.trim().toLowerCase();
    filteredUsers = filteredUsers.filter((u) =>
      u.email.toLowerCase().includes(s),
    );
  }
  if (fApplied.phone.trim()) {
    filteredUsers = filteredUsers.filter((u) =>
      u.phone.includes(fApplied.phone.trim()),
    );
  }
  if (fApplied.date) {
    filteredUsers = filteredUsers.filter((u) =>
      sameCalendarDay(fApplied.date, u.dateJoined),
    );
  }
  if (fApplied.status) {
    filteredUsers = filteredUsers.filter((u) => u.status === fApplied.status);
  }

  const totalItems = hasAdvancedFilters
    ? filteredUsers.length
    : (usersQuery.data?.total ?? 0);

  const pageCount = Math.max(
    1,
    Math.ceil(Math.max(0, totalItems) / pageSize),
  );

  const safePage = Math.min(Math.max(1, page), pageCount);

  const pagedUsers = hasAdvancedFilters
    ? filteredUsers.slice(
        (safePage - 1) * pageSize,
        (safePage - 1) * pageSize + pageSize,
      )
    : filteredUsers;

  const closeFilterPanel = () => {
    setFilterOpen(false);
    setFilterPanelStyle({});
  };

  useEffect(() => {
    if (!filterOpen && openRowMenuId === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilterOpen(false);
        setFilterPanelStyle({});
        setOpenRowMenuId(null);
      }
    };

    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("[data-dashboard-filter-trigger]")) return;

      const t = e.target as Node;
      if (
        filterOpen &&
        filterPanelRef.current &&
        !filterPanelRef.current.contains(t)
      ) {
        setFilterOpen(false);
        setFilterPanelStyle({});
      }
      if (openRowMenuId) {
        const wrap = rowMenuRefs.current.get(openRowMenuId);
        if (wrap && !wrap.contains(t)) setOpenRowMenuId(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [filterOpen, openRowMenuId]);

  useLayoutEffect(() => {
    if (!filterOpen) return;

    const panelWidth = 320;
    const insetRight = 8;
    const gap = 8;

    const updatePosition = () => {
      const trigger = filterTriggerRef.current;
      const section = tableSectionRef.current;
      const tableEl = tableRef.current;
      if (!trigger || !section) return;

      const br = trigger.getBoundingClientRect();
      const sr = section.getBoundingClientRect();
      const top = br.bottom - sr.top + gap;
      // Align panel left edge with the table’s left border (tracks horizontal scroll).
      let left = tableEl
        ? tableEl.getBoundingClientRect().left - sr.left
        : br.left - sr.left;
      const maxPanel = Math.min(panelWidth, sr.width - insetRight);
      const maxLeft = Math.max(0, sr.width - maxPanel - insetRight);
      left = Math.min(Math.max(left, 0), maxLeft);
      setFilterPanelStyle({ top, left, width: maxPanel });
    };

    updatePosition();

    const wrap = tableWrapRef.current;
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    wrap?.addEventListener("scroll", updatePosition, { passive: true });

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      wrap?.removeEventListener("scroll", updatePosition);
    };
  }, [filterOpen, pagedUsers, usersQuery.isLoading]);

  const openFilterPanel = () => {
    setFilterDraft({ ...appliedFilter });
    setFilterOpen(true);
    setOpenRowMenuId(null);
  };

  const resetFilters = () => {
    setFilterDraft({ ...emptyAdvancedFilter });
    setAppliedFilter({ ...emptyAdvancedFilter });
    setPage(1);
  };

  const applyFilters = () => {
    setAppliedFilter({ ...filterDraft });
    closeFilterPanel();
    setPage(1);
  };

  return (
    <DashboardWrapper searchQuery={query} onSearchQueryChange={setQuery}>
      <h1 className={styles.pageTitle}>Users</h1>

      <DashboardSummaryStats
        totalUsers={summaryTotalUsers}
        activeUsers={summaryActiveUsers}
        usersWithLoans={summaryUsersWithLoans}
        usersWithSavings={summaryUsersWithSavings}
      />

      <section
        ref={tableSectionRef}
        className={styles.tableSection}
        aria-labelledby="users-table-heading"
      >
        <DashboardFilter
          open={filterOpen}
          panelRef={filterPanelRef}
          panelStyle={filterPanelStyle}
          filterDraft={filterDraft}
          setFilterDraft={setFilterDraft}
          uniqueOrganizations={uniqueOrganizations}
          onReset={resetFilters}
          onApply={applyFilters}
        />

        <DashboardUserTable
          usersQuery={usersQuery}
          pagedUsers={pagedUsers}
          filterOpen={filterOpen}
          onOpenFilterPanel={openFilterPanel}
          filterTriggerRef={filterTriggerRef}
          tableWrapRef={tableWrapRef}
          tableRef={tableRef}
          openRowMenuId={openRowMenuId}
          setOpenRowMenuId={setOpenRowMenuId}
          setFilterOpen={(open) => {
            if (open) setFilterOpen(true);
            else closeFilterPanel();
          }}
          rowMenuRefs={rowMenuRefs}
          onBlacklistUser={(userId) =>
            setStatusOverrides((prev) => ({ ...prev, [userId]: "blacklisted" }))
          }
          onActivateUser={(userId) =>
            setStatusOverrides((prev) => ({ ...prev, [userId]: "active" }))
          }
        />
      </section>

      {/* Pagination */}
      <TablePagination
        page={safePage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        disabled={usersQuery.isLoading}
      />
    </DashboardWrapper>
  );
};

export default Dashboard;
