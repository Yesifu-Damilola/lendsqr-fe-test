import { Calendar, ChevronDown } from "lucide-react";
import type { CSSProperties, Dispatch, RefObject, SetStateAction } from "react";
import { emptyAdvancedFilter } from "@/constants/dashboard";
import type { UserStatus } from "@/types/users";
import styles from "./Dashboard.module.scss";

type AdvancedFilter = typeof emptyAdvancedFilter;

type DashboardFilterProps = {
  open: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  /** Inline position for the panel (anchored to the table filter trigger). */
  panelStyle?: CSSProperties;
  filterDraft: AdvancedFilter;
  setFilterDraft: Dispatch<SetStateAction<AdvancedFilter>>;
  uniqueOrganizations: string[];
  onReset: () => void;
  onApply: () => void;
};

export function DashboardFilter({
  open,
  panelRef,
  panelStyle,
  filterDraft,
  setFilterDraft,
  uniqueOrganizations,
  onReset,
  onApply,
}: DashboardFilterProps) {
  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className={styles.filterPanel}
      style={panelStyle}
      role="dialog"
      aria-modal="false"
      aria-labelledby="users-filter-heading"
    >
        <h2 id="users-filter-heading" className={styles.filterPanelTitle}>
          Filter users
        </h2>
        <div className={styles.filterFields}>
          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Organization</span>
            <span className={styles.filterSelectWrap}>
              <select
                value={filterDraft.organization}
                onChange={(e) =>
                  setFilterDraft((d) => ({
                    ...d,
                    organization: e.target.value,
                  }))
                }
                aria-label="Organization"
              >
                <option value="">All organizations</option>
                {uniqueOrganizations.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={styles.filterSelectChevron}
                aria-hidden
              />
            </span>
          </label>
          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Username</span>
            <input
              type="text"
              value={filterDraft.username}
              onChange={(e) =>
                setFilterDraft((d) => ({
                  ...d,
                  username: e.target.value,
                }))
              }
              placeholder="Username"
              className={styles.filterInput}
            />
          </label>
          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Email</span>
            <input
              type="email"
              value={filterDraft.email}
              onChange={(e) =>
                setFilterDraft((d) => ({ ...d, email: e.target.value }))
              }
              placeholder="Email"
              className={styles.filterInput}
            />
          </label>
          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Date</span>
            <span className={styles.filterDateWrap}>
              <input
                type="date"
                value={filterDraft.date}
                onChange={(e) =>
                  setFilterDraft((d) => ({ ...d, date: e.target.value }))
                }
                aria-label="Date joined"
                className={styles.filterInput}
              />
              <Calendar
                size={16}
                strokeWidth={2}
                className={styles.filterDateIcon}
                aria-hidden
              />
            </span>
          </label>
          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Phone number</span>
            <input
              type="text"
              value={filterDraft.phone}
              onChange={(e) =>
                setFilterDraft((d) => ({ ...d, phone: e.target.value }))
              }
              placeholder="Phone number"
              className={styles.filterInput}
            />
          </label>
          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Status</span>
            <span className={styles.filterSelectWrap}>
              <select
                value={filterDraft.status}
                onChange={(e) =>
                  setFilterDraft((d) => ({
                    ...d,
                    status: (e.target.value || "") as "" | UserStatus,
                  }))
                }
                aria-label="Status"
              >
                <option value="">Any status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={styles.filterSelectChevron}
                aria-hidden
              />
            </span>
          </label>
        </div>
        <div className={styles.filterActions}>
          <button
            type="button"
            className={styles.filterResetBtn}
            onClick={onReset}
          >
            Reset
          </button>
          <button
            type="button"
            className={styles.filterSubmitBtn}
            onClick={onApply}
          >
            Filter
          </button>
        </div>
    </div>
  );
}
