"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppDispatch, RootState } from "@/lib/redux/store";
import {
  fetchInstitutePublishStatus,
  updateInstitutePublishStatus,
  selectPublishState,
} from "@/lib/redux/slices/institutePublishSlice";

export default function PublishToggle({ instituteId }: { instituteId: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const publish = useSelector(selectPublishState);

  useEffect(() => {
    if (instituteId) dispatch(fetchInstitutePublishStatus(instituteId));
  }, [instituteId, dispatch]);

  const disabledByLock = false;
  const canToggle = true;

  return (
    <div className="flex items-center gap-3">
      <Badge
        className={
          publish.published
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }
      >
        {publish.published ? "Published" : "Unpublished"}
      </Badge>
      <Switch
        checked={publish.published}
        disabled={publish.loading}
        onCheckedChange={(v: boolean) => {
          if (!instituteId) return;
          dispatch(updateInstitutePublishStatus({ slug: instituteId, published: v }));
        }}
      />
      {publish.error && (
        <span className="text-xs text-red-600">{publish.error}</span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => instituteId && dispatch(fetchInstitutePublishStatus(instituteId))}
        disabled={publish.loading}
      >
        Refresh
      </Button>
    </div>
  );
}
