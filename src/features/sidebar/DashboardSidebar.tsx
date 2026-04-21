"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ChevronDown } from "lucide-react";
import { useState, Fragment } from "react";
import {
  NAV_BUSINESSES,
  NAV_CUSTOMERS,
  NAV_DASHBOARD,
  NAV_SETTINGS,
  type NavEntry,
} from "@/constants/dashboard";
import styles from "./DashboardSidebar.module.scss";

export type DashboardSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const DashboardSidebar = ({ open, onClose }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState("Users");

  const effectiveHighlight =
    pathname?.startsWith("/dashboard/users") ? "Users" : activeNav;

  const renderNavItem = (item: NavEntry) => {
    const isActive = effectiveHighlight === item.label;
    const className = `${styles.navItem} ${isActive ? styles.navItemActive : ""}`;

    if (item.href) {
      return (
        <Link
          key={item.label}
          href={item.href}
          className={className}
          onClick={() => {
            setActiveNav(item.label);
            onClose();
          }}
        >
          <item.icon size={18} strokeWidth={2} aria-hidden />
          <span>{item.label}</span>
        </Link>
      );
    }

    return (
      <button
        key={item.label}
        type="button"
        className={className}
        onClick={() => {
          setActiveNav(item.label);
          onClose();
        }}
      >
        <item.icon size={18} strokeWidth={2} aria-hidden />
        <span>{item.label}</span>
      </button>
    );
  };

  const renderNavGroup = (title: string, items: NavEntry[]) => (
    <div className={styles.navGroup}>
      <div className={styles.navSectionLabel}>{title}</div>
      {items.map((item) => renderNavItem(item))}
    </div>
  );

  return (
    <Fragment>
      <button
        type="button"
        className={`${styles.sidebarBackdrop} ${open ? styles.isVisible : ""}`}
        aria-label="Close menu"
        onClick={onClose}
      />

      <aside className={`${styles.sidebar} ${open ? styles.isOpen : ""}`}>
        <button type="button" className={styles.orgSwitch}>
          <span className={styles.orgSwitchMain}>
            <Briefcase size={18} strokeWidth={2} aria-hidden />
            <span>Switch Organization</span>
          </span>
          <ChevronDown size={16} strokeWidth={2} aria-hidden />
        </button>

        <nav className={styles.nav} aria-label="Main">
          <div className={styles.navTop}>{NAV_DASHBOARD.map((item) => renderNavItem(item))}</div>
          {renderNavGroup("Customers", NAV_CUSTOMERS)}
          {renderNavGroup("Businesses", NAV_BUSINESSES)}
          {renderNavGroup("Settings", NAV_SETTINGS)}
        </nav>
      </aside>
    </Fragment>
  );
};

export default DashboardSidebar;
