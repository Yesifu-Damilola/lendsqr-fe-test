import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Banknote,
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  Coins,
  Fan,
  HandCoins,
  Handshake,
  Home,
  Import,
  Percent,
  PiggyBank,
  SlidersHorizontal,
  Smartphone,
  UserCheck,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react";
import type { UserStatus } from "@/types/users";

export const emptyAdvancedFilter = {
  organization: "",
  username: "",
  email: "",
  date: "",
  phone: "",
  status: "" as "" | UserStatus,
};

export type NavEntry = { label: string; icon: LucideIcon; href?: string };

/** Home row — rendered above sectioned nav without a section heading */
export const NAV_DASHBOARD: NavEntry[] = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
];

export const NAV_CUSTOMERS: NavEntry[] = [
  { label: "Users", icon: Users, href: "/dashboard" },
  { label: "Guarantors", icon: UsersRound },
  { label: "Loans", icon: Banknote },
  { label: "Decision Models", icon: Handshake },
  { label: "Savings", icon: PiggyBank },
  { label: "Loan Requests", icon: HandCoins },
  { label: "Whitelist", icon: UserCheck },
  { label: "Karma", icon: BadgeCheck },
];

export const NAV_BUSINESSES: NavEntry[] = [
  { label: "Organization", icon: Briefcase },
  { label: "Loan Products", icon: HandCoins },
  { label: "Savings Products", icon: Building2 },
  { label: "Fees and Charges", icon: Coins },
  { label: "Transactions", icon: Smartphone },
  { label: "Services", icon: Fan },
  { label: "Service Account", icon: UserCog },
  { label: "Settlements", icon: Import },
  { label: "Reports", icon: BarChart3 },
];

export const NAV_SETTINGS: NavEntry[] = [
  { label: "Preferences", icon: SlidersHorizontal },
  { label: "Fees and Pricing", icon: Percent },
  { label: "Audit Logs", icon: ClipboardList },
];
