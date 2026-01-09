"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export function RecentApplications() {
  const { applications, loading } = useSelector((state: RootState) => state.applications);

  const source: any = applications;
  const list = Array.isArray(source) ? source : Array.isArray(source?.applications) ? source.applications : [];
  const latest = list.slice(0, 5);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Recent Applications
          </CardTitle>
          <Badge variant="outline" className="text-xs">Last 30 Days</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-sm text-gray-500">Loading applications...</div>
        )}

        {!loading && latest.length === 0 && (
          <div className="text-sm text-gray-500">No recent applications yet.</div>
        )}

        {!loading && latest.length > 0 && (
          <div className="space-y-3">
            {latest.map((app: any) => (
              <div key={app._id} className="flex items-center justify-between border rounded-md p-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {app.type.toUpperCase()} Application
                  </div>
                  <div className="text-xs text-gray-500">
                    Submitted {new Date(app.submittedAt || app.appliedAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs capitalize">{app.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
