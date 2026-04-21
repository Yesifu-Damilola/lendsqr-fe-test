"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { Eye, ListFilter, MoreVertical, UserCheck, UserX } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRow, UserStatus } from "@/types/users";
import styles from "./Dashboard.module.scss";

function formatStatus(status: UserStatus) {
  if (status === "blacklisted") return "Blacklisted";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const STATUS_STYLE: Record<UserStatus, string> = {
  active: styles.statusActive,
  inactive: styles.statusInactive,
  pending: styles.statusPending,
  blacklisted: styles.statusBlacklisted,
};

const TABLE_SKELETON_ROWS = 8;

export type DashboardUserTableProps = {
  usersQuery: Pick<UseQueryResult, "isLoading" | "isError" | "error">;
  pagedUsers: UserRow[];
  filterOpen: boolean;
  onOpenFilterPanel: () => void;
  filterTriggerRef: RefObject<HTMLButtonElement | null>;
  tableWrapRef: RefObject<HTMLDivElement | null>;
  tableRef: RefObject<HTMLTableElement | null>;
  openRowMenuId: string | null;
  setOpenRowMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  setFilterOpen: (open: boolean) => void;
  rowMenuRefs: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
  onBlacklistUser: (userId: string) => void;
  onActivateUser: (userId: string) => void;
};

export function DashboardUserTable({
  usersQuery,
  pagedUsers,
  filterOpen,
  onOpenFilterPanel,
  filterTriggerRef,
  tableWrapRef,
  tableRef,
  openRowMenuId,
  setOpenRowMenuId,
  setFilterOpen,
  rowMenuRefs,
  onBlacklistUser,
  onActivateUser,
}: DashboardUserTableProps) {
  return (
    <div
      className={styles.tableWrap}
      ref={tableWrapRef}
      aria-busy={usersQuery.isLoading}
    >
      {usersQuery.isError && (
        <p className={styles.queryError}>
          {usersQuery.error?.message ??
            "Could not fetch users from mock API. Check your endpoint setup."}
        </p>
      )}
      <table ref={tableRef} className={styles.table}>
        <caption id="users-table-heading" className={styles.visuallyHidden}>
          User directory
        </caption>
        <thead>
          <tr>
            {(
              [
                "Organization",
                "Username",
                "Email",
                "Phone number",
                "Date joined",
                "Status",
              ] as const
            ).map((label) => (
              <th key={label} scope="col" className={styles.th}>
                <span className={styles.thInner}>
                  <span>{label}</span>
                  {label === "Organization" ? (
                    <button
                      ref={filterTriggerRef}
                      type="button"
                      className={styles.thFilter}
                      aria-label={`Filter ${label}`}
                      aria-expanded={filterOpen}
                      data-dashboard-filter-trigger
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenFilterPanel();
                      }}
                    >
                      <ListFilter size={14} strokeWidth={2} aria-hidden />
                    </button>
                  ) : (
                    <span
                      className={`${styles.thFilter} ${styles.thFilterNonInteractive}`}
                      aria-hidden
                    >
                      <ListFilter size={14} strokeWidth={2} />
                    </span>
                  )}
                </span>
              </th>
            ))}
            <th scope="col" className={`${styles.th} ${styles.thActions}`}>
              <span className={styles.visuallyHidden}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {usersQuery.isLoading &&
            Array.from({ length: TABLE_SKELETON_ROWS }, (_, row) => (
              <tr key={`sk-${row}`} className={styles.tr}>
                <td className={styles.td}>
                  <Skeleton
                    className={`${styles.tableSkeletonCell} ${styles.tableSkeletonOrg}`}
                  />
                </td>
                <td className={styles.td}>
                  <Skeleton
                    className={`${styles.tableSkeletonCell} ${styles.tableSkeletonUser}`}
                  />
                </td>
                <td className={styles.td}>
                  <Skeleton
                    className={`${styles.tableSkeletonCell} ${styles.tableSkeletonEmail}`}
                  />
                </td>
                <td className={styles.td}>
                  <Skeleton
                    className={`${styles.tableSkeletonCell} ${styles.tableSkeletonPhone}`}
                  />
                </td>
                <td className={styles.td}>
                  <Skeleton
                    className={`${styles.tableSkeletonCell} ${styles.tableSkeletonDate}`}
                  />
                </td>
                <td className={styles.td}>
                  <Skeleton
                    className={`${styles.tableSkeletonCell} ${styles.tableSkeletonStatus}`}
                  />
                </td>
                <td className={`${styles.td} ${styles.tdActions}`}>
                  <Skeleton
                    className={`${styles.tableSkeletonCell} ${styles.tableSkeletonAction}`}
                  />
                </td>
              </tr>
            ))}
          {!usersQuery.isLoading &&
            !usersQuery.isError &&
            pagedUsers.length === 0 && (
              <tr>
                <td className={styles.emptyRow} colSpan={7}>
                  No users match your filters.
                </td>
              </tr>
            )}
          {!usersQuery.isLoading &&
            pagedUsers.map((user) => (
              <tr key={user.id} className={styles.tr}>
                <td className={styles.td}>{user.organization}</td>
                <td className={styles.td}>{user.username}</td>
                <td className={styles.td}>{user.email}</td>
                <td className={styles.td}>{user.phone}</td>
                <td className={styles.td}>{user.dateJoined}</td>
                <td className={styles.td}>
                  <span
                    className={`${styles.status} ${STATUS_STYLE[user.status]}`}
                  >
                    {formatStatus(user.status)}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.tdActions}`}>
                  <div
                    className={styles.rowMenuWrap}
                    ref={(el) => {
                      if (el) rowMenuRefs.current.set(user.id, el);
                      else rowMenuRefs.current.delete(user.id);
                    }}
                  >
                    <button
                      type="button"
                      className={styles.rowMenuBtn}
                      aria-label="Row actions"
                      aria-expanded={openRowMenuId === user.id}
                      onClick={() => {
                        setOpenRowMenuId((id) =>
                          id === user.id ? null : user.id,
                        );
                        setFilterOpen(false);
                      }}
                    >
                      <MoreVertical size={18} strokeWidth={2} />
                    </button>
                    {openRowMenuId === user.id && (
                      <div className={styles.rowMenu} role="menu">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          className={styles.rowMenuItem}
                          role="menuitem"
                          onClick={() => setOpenRowMenuId(null)}
                        >
                          <Eye size={16} strokeWidth={2} aria-hidden />
                          View details
                        </Link>
                        <button
                          type="button"
                          className={styles.rowMenuItem}
                          role="menuitem"
                          onClick={() => {
                            onBlacklistUser(user.id);
                            setOpenRowMenuId(null);
                          }}
                        >
                          <UserX size={16} strokeWidth={2} aria-hidden />
                          Blacklist user
                        </button>
                        <button
                          type="button"
                          className={styles.rowMenuItem}
                          role="menuitem"
                          onClick={() => {
                            onActivateUser(user.id);
                            setOpenRowMenuId(null);
                          }}
                        >
                          <UserCheck size={16} strokeWidth={2} aria-hidden />
                          Activate user
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
