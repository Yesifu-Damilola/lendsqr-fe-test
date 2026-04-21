"use client";

import { useState, type ReactNode } from "react";
import styles from "./Dashboard.module.scss";
import DashboardNavbar from "../navbar/DashboardNavbar";
import DashboardSidebar from "../sidebar/DashboardSidebar";

type DashboardWrapperProps = {
  children: ReactNode;
  /** When set, the top search bar is controlled by the parent (e.g. users table filtering). */
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
};

const DashboardWrapper = ({
  children,
  searchQuery,
  onSearchQueryChange,
}: DashboardWrapperProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [internalQuery, setInternalQuery] = useState("");

  const query = searchQuery !== undefined ? searchQuery : internalQuery;
  const setQuery = onSearchQueryChange ?? setInternalQuery;

  return (
    <div className={styles.shell}>
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={styles.workspace}>
        <DashboardNavbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          searchQuery={query}
          onSearchQueryChange={setQuery}
        />

        <div className={styles.body}>
          <main className={styles.main}>
            <div className={styles.content}>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardWrapper;
