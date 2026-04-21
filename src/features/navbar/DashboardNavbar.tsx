"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  profileFromSession,
  readAuthSessionFromStorage,
} from "@/lib/authSessionStorage";
import navbarStyles from "./DashboardNavbar.module.scss";

export type DashboardNavbarProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

const DashboardNavbar = ({
  sidebarOpen,
  onToggleSidebar,
  searchQuery,
  onSearchQueryChange,
}: DashboardNavbarProps) => {
  const [profile, setProfile] = useState<{
    displayName: string;
    initials: string;
  } | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setProfile(profileFromSession(readAuthSessionFromStorage()));
    });
  }, []);

  const displayName = profile?.displayName ?? "Account";
  const initials = profile?.initials ?? "?";

  return (
    <div className={navbarStyles.root}>
      <header className={navbarStyles.topbar}>
        <div className={navbarStyles.topbarStart}>
          <button
            type="button"
            className={navbarStyles.menuBtn}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            onClick={onToggleSidebar}
          >
            {sidebarOpen ? (
              <X size={20} strokeWidth={2} />
            ) : (
              <Menu size={20} strokeWidth={2} />
            )}
          </button>
          <Link
            href="/dashboard"
            className={navbarStyles.topbarLogo}
            aria-label="Dashboard home"
          >
            <Image
              className={navbarStyles.logoImg}
              src="/logo.svg"
              alt="lendsqr"
              width={138}
              height={28}
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </Link>
        </div>

        <form
          className={navbarStyles.searchBlock}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label className={navbarStyles.searchField}>
            <span className={navbarStyles.visuallyHidden}>
              Search for anything
            </span>
            <input
              type="search"
              name="query"
              placeholder="Search for anything"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              aria-label="Search"
            />
          </label>
          <button
            type="submit"
            className={navbarStyles.searchSubmit}
            aria-label="Submit search"
          >
            <Search size={18} strokeWidth={2.25} aria-hidden />
          </button>
        </form>

        <div className={navbarStyles.topbarActions}>
          <a href="#" className={navbarStyles.docsLink}>
            Docs
          </a>
          <button
            type="button"
            className={navbarStyles.iconBtn}
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={2} aria-hidden />
            <span className={navbarStyles.iconBtnBadge} aria-hidden />
          </button>
          <button
            type="button"
            className={navbarStyles.profileBtn}
            aria-label={`Account menu for ${displayName}`}
          >
            <span className={navbarStyles.profileAvatar} aria-hidden>
              {initials}
            </span>
            <span className={navbarStyles.profileName}>{displayName}</span>
            <ChevronDown
              className={navbarStyles.profileBtnChevron}
              size={16}
              strokeWidth={2}
              aria-hidden
            />
          </button>
        </div>
      </header>
    </div>
  );
};

export default DashboardNavbar;
