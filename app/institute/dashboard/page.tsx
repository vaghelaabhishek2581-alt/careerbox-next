import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import InstituteDashboardUI from "@/components/institute/dashboard/DashboardUI";

export const metadata: Metadata = {
  title: "Institute Dashboard",
  description: "Manage your institute profile and activities",
};

export default async function InstituteDashboardPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (!session.user?.roles?.includes("institute") &&
      !session.user?.roles?.includes("admin"))
  ) {
    redirect("/unauthorized");
  }
  return <InstituteDashboardUI />;
}
