import type { Metadata } from "next";
import DashboardWrapper from "@/features/dashboard/DashboardWrapper";
import UserDetail from "@/features/users/UserDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: "User details",
    description: "Profile and account information for a user.",
  };
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <DashboardWrapper>
      <UserDetail userId={id} />
    </DashboardWrapper>
  );
};
