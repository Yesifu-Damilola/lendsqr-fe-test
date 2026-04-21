import type { ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./Dashboard.module.scss";
import {
  StatIconLoanDocument,
  StatIconSavingsStacks,
  StatIconUsersThree,
  StatIconUsersTwo,
} from "./DashboardSummaryStatIcons";

type StatIconComponent = ComponentType<{ className?: string }>;

type StatDef = {
  label: string;
  valueKey: "users" | "active" | "loans" | "savings";
  Icon: StatIconComponent;
  tone: "users" | "active" | "loans" | "savings";
};

const STATS: StatDef[] = [
  { label: "Users", valueKey: "users", Icon: StatIconUsersTwo, tone: "users" },
  {
    label: "Active users",
    valueKey: "active",
    Icon: StatIconUsersThree,
    tone: "active",
  },
  {
    label: "Users with loans",
    valueKey: "loans",
    Icon: StatIconLoanDocument,
    tone: "loans",
  },
  {
    label: "Users with savings",
    valueKey: "savings",
    Icon: StatIconSavingsStacks,
    tone: "savings",
  },
];

const STAT_TONE_CLASS: Record<StatDef["tone"], string> = {
  users: styles.statIconUsers,
  active: styles.statIconActive,
  loans: styles.statIconLoans,
  savings: styles.statIconSavings,
};

function formatStatValue(n: number) {
  return n.toLocaleString("en-US");
}

export type DashboardSummaryStatsProps = {
  totalUsers: number | null;
  activeUsers: number | null;
  usersWithLoans: number | null;
  usersWithSavings: number | null;
};

export function DashboardSummaryStats({
  totalUsers,
  activeUsers,
  usersWithLoans,
  usersWithSavings,
}: DashboardSummaryStatsProps) {
  const values = {
    users: totalUsers,
    active: activeUsers,
    loans: usersWithLoans,
    savings: usersWithSavings,
  };

  const summaryPending = STATS.some((s) => values[s.valueKey] === null);

  return (
    <section
      className={styles.stats}
      aria-label="Summary statistics"
      aria-busy={summaryPending}
    >
      {STATS.map((s) => {
        const raw = values[s.valueKey];
        const Icon = s.Icon;
        return (
          <article key={s.label} className={styles.statCard}>
            <div
              className={`${styles.statIconWrap} ${STAT_TONE_CLASS[s.tone]}`}
            >
              <Icon className={styles.statIconSvg} />
            </div>
            <div className={styles.statBody}>
              <p className={styles.statLabel}>{s.label}</p>
              {raw === null ? (
                <Skeleton className={styles.statValueSkeleton} />
              ) : (
                <p className={styles.statValue}>{formatStatValue(raw)}</p>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
