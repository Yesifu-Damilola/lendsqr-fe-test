import type { Metadata } from "next";
import Dashboard from "@/features/dashboard";

export const metadata: Metadata = {
  title: "lendsqr | Dashboard",
  description: "Lendsqr admin dashboard",
};

export default function DashboardPage() {
  return <Dashboard />;
}
