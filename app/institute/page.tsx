import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export default async function InstituteDashboard() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/auth/signin");
  }

  // Redirect to unauthorized if user doesn't have 'institute' or 'admin' role
  if (
    !session.user?.roles?.includes("institute") &&
    !session.user?.roles?.includes("admin")
  ) {
    redirect("/unauthorized");
  }

  // Handle admin users
  if (session.user?.roles?.includes("admin")) {
    // Admins should be redirected to the main institute management page
    redirect("/admin/institutes");
  }

  // Handle institute users
  const user = session.user as typeof session.user & {
    ownedOrganizations?: string[];
  };
  const instituteId = user.ownedOrganizations?.[0];

  if (instituteId) {
    redirect(`/institute/dashboard`);
  } else {
    // If user with institute role doesn't have an associated institute, redirect to create one
    redirect("/user/register-institute");
  }
}
