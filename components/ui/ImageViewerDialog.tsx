"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X, Eye, Edit2, Camera, Square, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface ImageViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "profile" | "cover";
  imageUrl?: string | null;
  showActions?: boolean;
  onEdit: () => void;
  onUpdatePhoto: () => void;
  onDelete?: () => Promise<void> | void;
  className?: string;
}

export function ImageViewerDialog({
  open,
  onOpenChange,
  type,
  imageUrl,
  showActions = true,
  onEdit,
  onUpdatePhoto,
  onDelete,
  className,
}: ImageViewerDialogProps) {
  const title = type === "cover" ? "Cover photo" : "Profile photo";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9998]",
        open ? "pointer-events-auto" : "pointer-events-none",
        className
      )}
      aria-hidden={!open}
    >
      <div
        className={cn("absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity", open ? "opacity-100" : "opacity-0")}
        onClick={() => onOpenChange(false)}
      />
      <div className={cn("absolute inset-0 flex items-start sm:items-center justify-center p-4 overflow-y-auto", open ? "opacity-100" : "opacity-0")}>
        <div
          className="bg-[#1f2937] text-white rounded-2xl shadow-xl border border-slate-700 w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto"
           style={{
             paddingTop: "max(1rem, env(safe-area-inset-top))",
             paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
           }}
         >
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-slate-700 sticky top-0 bg-[#1f2937] z-10"
            style={{
              paddingRight: "max(1rem, env(safe-area-inset-right))",
              paddingTop: "max(0.75rem, env(safe-area-inset-top))",
            }}
          >
            <div className="font-semibold text-lg">
              {title}
            </div>
            <button
              aria-label="Close"
              type="button"
              onClick={() => onOpenChange(false)}
              className="close-dialog-button rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-4 py-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm">
                <Eye className="h-4 w-4" />
                Anyone
              </div>
            </div>

            <div className="flex justify-center mb-6">
              {imageUrl ? (
                <div
                  className={cn(
                    "relative flex items-center justify-center bg-black/50 rounded-xl overflow-hidden",
                    type === "profile"
                      ? "max-w-[90vw] sm:max-w-3xl max-h-[70vh]"
                      : "max-w-[90vw] sm:max-w-5xl max-h-[70vh]"
                  )}
                >
                  <img src={imageUrl} alt="" className="max-w-full max-h-[70vh] object-contain" />
                </div>
              ) : (
                <div className="text-sm text-slate-300">{type === "profile" ? "No profile photo" : "No cover image"}</div>
              )}
            </div>

            {showActions && (
              <div className="border-t border-slate-700 px-4 pt-4 bg-[#1f2937]"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="justify-start text-white hover:bg-white/10" onClick={onEdit}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {/* <Button variant="ghost" className="justify-start text-white hover:bg-white/10" onClick={onUpdatePhoto}>
                      <Camera className="h-4 w-4 mr-2" />
                      Update photo
                    </Button>
                    <Button variant="ghost" className="justify-start text-white hover:bg-white/10">
                      <Square className="h-4 w-4 mr-2" />
                      Frames
                    </Button> */}
                  </div>
                  <div className="flex items-center">
                    <Button variant="ghost" className="justify-start text-red-300 hover:text-red-200 hover:bg-red-500/10" onClick={onDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
