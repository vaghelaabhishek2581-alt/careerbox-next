import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import InstituteDashboardUI from "@/components/institute/dashboard/DashboardUI";
import Link from "next/link";
import PublishToggle from "@/components/PublishToggle";
import AdminInstitute from "@/src/models/AdminInstitute";
import Institute from "@/src/models/Institute";
import { connectToDatabase } from "@/lib/db/mongodb";

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
  await connectToDatabase();
  const userId = session.user?.id || (session as any)?.userId;
  let institute = null as any;
  let account = null as any;
  try {
    institute = await AdminInstitute.findOne({ userIds: userId })
      .select("_id slug")
      .lean()
      .exec();
  } catch {}
  try {
    account = await Institute.findOne({ userId })
      .select("_id publicProfileId")
      .lean()
      .exec();
  } catch {}
  return (
    <>
      <div className="flex items-center justify-between px-4 sm:px-6 -mx-4 sm:-mx-6 mb-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Publish Status</span>
          {(institute?._id || account?._id) && (
            <PublishToggle
              instituteId={String(institute?._id || account?._id)}
            />
          )}
        </div>
        <Link
          href={`/admin/institutes/${encodeURIComponent(institute?.slug || "")}`}
          className="text-sm text-blue-600 underline"
        >
          Manage Institute
        </Link>
      </div>
      <InstituteDashboardUI />
    </>
  );
}
