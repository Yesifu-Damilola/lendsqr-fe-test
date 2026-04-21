"use client";

import Link from "next/link";
import { ChevronLeft, Star } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDetailQuery } from "@/query/useUserDetailQuery";
import type { UserDetailData, UserStatus } from "@/types/users";
import styles from "./UserDetail.module.scss";

const TABS = [
  "General Details",
  "Documents",
  "Bank Details",
  "Loans",
  "Savings",
  "App and System",
] as const;

const TIER_STARS = 3;

const PERSONAL_FIELDS: {
  label: string;
  pick: (u: UserDetailData) => string;
}[] = [
  { label: "Full name", pick: (u) => u.username },
  { label: "Phone number", pick: (u) => u.phone },
  { label: "Email address", pick: (u) => u.email },
  { label: "BVN", pick: (u) => u.profile.bvn },
  { label: "Gender", pick: (u) => u.profile.gender },
  { label: "Marital status", pick: (u) => u.profile.maritalStatus },
  { label: "Children", pick: (u) => u.profile.children },
  { label: "Type of residence", pick: (u) => u.profile.typeOfResidence },
];

const EDUCATION_FIELDS: {
  label: string;
  pick: (u: UserDetailData) => string;
}[] = [
  { label: "Level of education", pick: (u) => u.profile.educationLevel },
  { label: "Employment status", pick: (u) => u.profile.employmentStatus },
  { label: "Sector of employment", pick: (u) => u.profile.sector },
  { label: "Duration of employment", pick: (u) => u.profile.duration },
  { label: "Office email", pick: (u) => u.profile.officeEmail },
  { label: "Monthly income", pick: (u) => u.profile.monthlyIncome },
  { label: "Loan repayment", pick: (u) => u.profile.loanRepayment },
];

const SOCIAL_FIELDS: {
  label: string;
  pick: (u: UserDetailData) => string;
}[] = [
  { label: "Twitter", pick: (u) => u.profile.twitter },
  { label: "Facebook", pick: (u) => u.profile.facebook },
  { label: "Instagram", pick: (u) => u.profile.instagram },
];

function TierStars({ filled }: { filled: number }) {
  const n = Math.min(TIER_STARS, Math.max(0, filled));
  return (
    <div
      className={styles.tierStars}
      aria-label={`${n} of ${TIER_STARS} tier stars`}
    >
      {Array.from({ length: TIER_STARS }, (_, i) => (
        <Star
          key={i}
          size={22}
          strokeWidth={1.75}
          className={i < n ? styles.tierStarFilled : styles.tierStarEmpty}
          aria-hidden
          fill={i < n ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

type TabId = (typeof TABS)[number];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function DetailField({
  label,
  valuesLoading,
  children,
}: {
  label: string;
  valuesLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>
        {valuesLoading ? (
          <Skeleton className={styles.skeletonFieldValue} aria-hidden />
        ) : (
          children
        )}
      </span>
    </div>
  );
}

type UserDetailProps = {
  userId: string;
};

const UserDetail = ({ userId }: UserDetailProps) => {
  const userDetailQuery = useUserDetailQuery(userId);
  const [tab, setTab] = useState<TabId>("General Details");
  const [statusOverride, setStatusOverride] = useState<UserStatus | null>(null);

  const { isLoading, isError, data: sourceUser } = userDetailQuery;
  const user = sourceUser
    ? { ...sourceUser, status: statusOverride ?? sourceUser.status }
    : null;

  const awaitingDetail = isLoading && !isError;

  return (
    <div className={styles.root}>
      <div className={styles.backRow}>
        <Link href="/dashboard" className={styles.backLink}>
          <ChevronLeft size={20} strokeWidth={2} aria-hidden />
          Back to Users
        </Link>
      </div>

      <div className={styles.pageTitleRow}>
        <h1 className={styles.pageTitle}>User Details</h1>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBlacklist}
            disabled={!user}
            onClick={() => setStatusOverride("blacklisted")}
          >
            Blacklist User
          </button>
          <button
            type="button"
            className={styles.actionActivate}
            disabled={!user}
            onClick={() => setStatusOverride("active")}
          >
            Activate User
          </button>
        </div>
      </div>

      <article className={styles.headerCard}>
        <div className={styles.summaryRow}>
          {user ? (
            <>
              <div className={styles.identity}>
                <div className={styles.avatar} aria-hidden>
                  {initials(user.username)}
                </div>
                <div className={styles.identityText}>
                  <p className={styles.name}>{user.username}</p>
                  <p className={styles.userCode}>{user.profile.userCode}</p>
                </div>
              </div>
              <div className={styles.tierBlock}>
                <span className={styles.tierLabel}>{user.profile.tierLabel}</span>
                <TierStars filled={user.profile.tierLevel} />
              </div>
              <div className={styles.bankBlock}>
                <span className={styles.bankAmount}>
                  {user.profile.amountGuaranteed}
                </span>
                <span className={styles.bankMeta}>
                  {user.profile.accountNumber}/{user.profile.bankName}
                </span>
              </div>
            </>
          ) : awaitingDetail ? (
            <>
              <div className={styles.identity}>
                <div className={styles.avatar} aria-hidden>
                  {initials("")}
                </div>
                <div className={styles.identityText}>
                  <Skeleton className={styles.skeletonName} />
                  <Skeleton className={styles.skeletonUserCode} />
                </div>
              </div>
              <div className={styles.tierBlock}>
                <Skeleton className={styles.skeletonTierLabel} />
                <TierStars filled={0} />
              </div>
              <div className={styles.bankBlock}>
                <Skeleton className={styles.skeletonBankAmount} />
                <Skeleton className={styles.skeletonBankMeta} />
              </div>
            </>
          ) : (
            <p
              className={
                isError ? styles.headerInlineMessageError : styles.headerInlineMessage
              }
            >
              {isError
                ? "Unable to load this user profile."
                : "User not found."}
            </p>
          )}
        </div>

        <hr className={styles.divider} />

        <div
          className={styles.tabs}
          role="tablist"
          aria-label="User profile sections"
        >
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </article>

      {isError ? (
        <div className={styles.panel}>
          <div className={styles.detailCard}>
            <p className={styles.queryError}>
              Could not fetch user details. Check your mock endpoint and try again.
            </p>
          </div>
        </div>
      ) : !user && !isLoading ? (
        <div className={styles.panel}>
          <div className={styles.detailCard}>
            <p className={styles.queryError}>User not found.</p>
          </div>
        </div>
      ) : tab === "General Details" ? (
        <div
          className={styles.panel}
          aria-busy={awaitingDetail ? true : undefined}
        >
          <div className={styles.detailCard}>
            <section
              className={styles.section}
              aria-labelledby="personal-heading"
            >
              <h2 id="personal-heading" className={styles.sectionTitle}>
                Personal Information
              </h2>
              <div className={styles.grid}>
                {PERSONAL_FIELDS.map(({ label, pick }) => (
                  <DetailField
                    key={label}
                    label={label}
                    valuesLoading={awaitingDetail}
                  >
                    {user ? pick(user) : null}
                  </DetailField>
                ))}
              </div>
            </section>

            <section className={styles.section} aria-labelledby="edu-heading">
              <h2 id="edu-heading" className={styles.sectionTitle}>
                Education and Employment
              </h2>
              <div className={styles.grid}>
                {EDUCATION_FIELDS.map(({ label, pick }) => (
                  <DetailField
                    key={label}
                    label={label}
                    valuesLoading={awaitingDetail}
                  >
                    {user ? pick(user) : null}
                  </DetailField>
                ))}
              </div>
            </section>

            <section
              className={styles.section}
              aria-labelledby="social-heading"
            >
              <h2 id="social-heading" className={styles.sectionTitle}>
                Socials
              </h2>
              <div className={styles.grid}>
                {SOCIAL_FIELDS.map(({ label, pick }) => (
                  <DetailField
                    key={label}
                    label={label}
                    valuesLoading={awaitingDetail}
                  >
                    {user ? pick(user) : null}
                  </DetailField>
                ))}
              </div>
            </section>

            {awaitingDetail ? (
              <section
                className={styles.section}
                aria-labelledby="guarantor-heading-loading"
              >
                <h2
                  id="guarantor-heading-loading"
                  className={styles.sectionTitle}
                >
                  Guarantor
                </h2>
                <div className={styles.grid}>
                  <DetailField
                    label="Full name"
                    valuesLoading
                  >
                    {null}
                  </DetailField>
                  <DetailField label="Phone number" valuesLoading>
                    {null}
                  </DetailField>
                  <DetailField label="Email address" valuesLoading>
                    {null}
                  </DetailField>
                  <DetailField label="Relationship" valuesLoading>
                    {null}
                  </DetailField>
                </div>
              </section>
            ) : user ? (
              user.profile.guarantors.map((g, index) => (
                <section
                  key={`${g.fullName}-${g.email}-${index}`}
                  className={styles.section}
                  aria-labelledby={`guarantor-heading-${index}`}
                >
                  <h2
                    id={`guarantor-heading-${index}`}
                    className={styles.sectionTitle}
                  >
                    Guarantor
                  </h2>
                  <div className={styles.grid}>
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Full name</span>
                      <span className={styles.fieldValue}>{g.fullName}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Phone number</span>
                      <span className={styles.fieldValue}>{g.phone}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Email address</span>
                      <span className={styles.fieldValue}>{g.email}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Relationship</span>
                      <span className={styles.fieldValue}>{g.relationship}</span>
                    </div>
                  </div>
                </section>
              ))
            ) : null}
          </div>
        </div>
      ) : (
        <div className={styles.panel}>
          <div className={styles.detailCard}>
            <section className={styles.section}>
              <p className={styles.placeholder}>
                {awaitingDetail ? (
                  <>
                    {tab} — loading user details…
                  </>
                ) : user ? (
                  <>
                    {tab} for {user.username} — connect your API or expand mock
                    data to show this section.
                  </>
                ) : null}
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
