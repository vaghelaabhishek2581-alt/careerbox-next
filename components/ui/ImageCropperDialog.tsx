"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface ImageCropperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "profile" | "cover";
  targetWidth?: number;
  targetHeight?: number;
  className?: string;
  initialImageUrl?: string;
  onCropped: (file: File) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

export function ImageCropperDialog({
  open,
  onOpenChange,
  type,
  targetWidth,
  targetHeight,
  className,
  initialImageUrl,
  onCropped,
}: ImageCropperDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tab, setTab] = useState<"crop" | "filter" | "adjust">("crop");
  const [rotationDeg, setRotationDeg] = useState(0);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [vignette, setVignette] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("original");
  const filters = [
    { key: "original", label: "Original", values: { brightness: 1, contrast: 1, saturation: 1 } },
    { key: "studio", label: "Studio", values: { brightness: 1.1, contrast: 1.05, saturation: 1.2 } },
    { key: "spotlight", label: "Spotlight", values: { brightness: 1.15, contrast: 1.0, saturation: 0.95 } },
    { key: "prime", label: "Prime", values: { brightness: 1.05, contrast: 1.2, saturation: 1.1 } },
    { key: "classic", label: "Classic", values: { brightness: 1.0, contrast: 1.1, saturation: 0.2 } },
    { key: "edge", label: "Edge", values: { brightness: 1.0, contrast: 1.3, saturation: 1.0 } },
    { key: "luminate", label: "Luminate", values: { brightness: 1.2, contrast: 0.95, saturation: 1.1 } },
  ];

  const TW = targetWidth ?? (type === "cover" ? 1600 : 512);
  const TH = targetHeight ?? (type === "cover" ? 400 : 512);
  const aspect = TW / TH;

  const cleanupImage = useCallback(() => {
    if (imageSrc && imageSrc.startsWith("blob:")) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(null);
    setImageEl(null);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setIsPanning(false);
    setStartPan(null);
    setRotationDeg(0);
    setBrightness(1);
    setContrast(1);
    setSaturation(1);
    setVignette(0);
    setSelectedFilter("original");
    setTab("crop");
  }, [imageSrc]);

  useEffect(() => {
    if (!open) {
      cleanupImage();
    }
  }, [open, cleanupImage]);

  // Lock body scroll when dialog is open to avoid background sticky elements interfering
  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  useEffect(() => {
    if (open && initialImageUrl && !imageEl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      let isMounted = true;
      let src = initialImageUrl;

      // Use proxy for external URLs to avoid CORS issues
      if (initialImageUrl.startsWith("http") || initialImageUrl.startsWith("https")) {
        const isLocal = typeof window !== "undefined" && initialImageUrl.startsWith(window.location.origin);
        if (!isLocal) {
          src = `/api/proxy-image?url=${encodeURIComponent(initialImageUrl)}`;
        }
      }

      img.onload = () => {
        if (!isMounted) return;
        setImageSrc(src);
        setImageEl(img);
        fitImageToCanvas(img);
      };

      img.onerror = (e) => {
        console.error("Failed to load image for cropping", src, e);
      };

      img.src = src;

      return () => {
        isMounted = false;
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [open, initialImageUrl, imageEl]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageEl, scale, offset]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotationDeg, brightness, contrast, saturation, vignette]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      loadFile(file);
    }
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }
  function onDragLeave() {
    setDragOver(false);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      loadFile(file);
    }
  }

  function loadFile(file: File) {
    cleanupImage();
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageSrc(url);
      setImageEl(img);
      fitImageToCanvas(img);
    };
    img.src = url;
  }
  function applyFilterPreset(key: string) {
    const f = filters.find((x) => x.key === key);
    if (!f) return;
    setSelectedFilter(key);
    setBrightness(f.values.brightness);
    setContrast(f.values.contrast);
    setSaturation(f.values.saturation);
  }

  function fitImageToCanvas(img: HTMLImageElement) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const canvasAspect = cw / ch;
    const imgAspect = img.width / img.height;
    let initialScale = 1;

    if (imgAspect > canvasAspect) {
      initialScale = ch / img.height;
    } else {
      initialScale = cw / img.width;
    }
    setScale(initialScale);
    setOffset({ x: 0, y: 0 });
    // draw() will be called by useEffect when state updates
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, cw, ch);

    if (imageEl) {
      ctx.save();
      ctx.translate(cw / 2 + offset.x, ch / 2 + offset.y);
      ctx.scale(scale, scale);
      ctx.rotate((rotationDeg * Math.PI) / 180);
      ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
      ctx.drawImage(imageEl, -imageEl.width / 2, -imageEl.height / 2);
      ctx.filter = "none";
      ctx.restore();
    }

    const cropW = aspect > 1 ? Math.min(cw * 0.9, ch * 0.9 * aspect) : Math.min(ch * 0.9, cw * 0.9 / aspect);
    const cropH = cropW / aspect;
    const cropX = (cw - cropW) / 2;
    const cropY = (ch - cropH) / 2;

    if (vignette > 0) {
      ctx.save();
      if (type === "profile") {
        const r = Math.min(cropW, cropH) / 2;
        ctx.beginPath();
        ctx.arc(cw / 2, ch / 2, r, 0, Math.PI * 2);
        ctx.clip();
        const vg = ctx.createRadialGradient(cw / 2, ch / 2, r * 0.6, cw / 2, ch / 2, r);
        vg.addColorStop(0, `rgba(0,0,0,0)`);
        vg.addColorStop(1, `rgba(0,0,0,${Math.min(0.6, vignette)})`);
        ctx.fillStyle = vg;
        ctx.fillRect(cropX, cropY, cropW, cropH);
      } else {
        ctx.beginPath();
        ctx.rect(cropX, cropY, cropW, cropH);
        ctx.clip();
        const r = Math.hypot(cropW, cropH) / 2;
        const vg = ctx.createRadialGradient(cw / 2, ch / 2, r * 0.6, cw / 2, ch / 2, r);
        vg.addColorStop(0, `rgba(0,0,0,0)`);
        vg.addColorStop(1, `rgba(0,0,0,${Math.min(0.6, vignette)})`);
        ctx.fillStyle = vg;
        ctx.fillRect(cropX, cropY, cropW, cropH);
      }
      ctx.restore();
    }

    ctx.save();
    if (type === "profile") {
      const r = Math.min(cropW, cropH) / 2;
      const path = new Path2D();
      path.rect(0, 0, cw, ch);
      path.arc(cw / 2, ch / 2, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fill(path, "evenodd");
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cw / 2, ch / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, cw, cropY);
      ctx.fillRect(0, cropY + cropH, cw, ch - (cropY + cropH));
      ctx.fillRect(0, cropY, cropX, cropH);
      ctx.fillRect(cropX + cropW, cropY, cw - (cropX + cropW), cropH);
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropW, cropH);
    }
    ctx.restore();
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY;
    const zoomFactor = delta > 0 ? 0.05 : -0.05;
    setScale((s) => Math.max(0.1, Math.min(10, s + zoomFactor)));
  }

  function onMouseDown(e: React.MouseEvent) {
    setIsPanning(true);
    setStartPan({ x: e.clientX, y: e.clientY });
  }
  function onMouseMove(e: React.MouseEvent) {
    if (isPanning && startPan) {
      setOffset((o) => ({ x: o.x + (e.clientX - startPan.x), y: o.y + (e.clientY - startPan.y) }));
      setStartPan({ x: e.clientX, y: e.clientY });
    }
  }
  function onMouseUp() {
    setIsPanning(false);
    setStartPan(null);
  }

  async function handleSave() {
    if (!imageEl || !canvasRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      const cw = canvas.width;
      const ch = canvas.height;

      const cropW = aspect > 1 ? Math.min(cw * 0.9, ch * 0.9 * aspect) : Math.min(ch * 0.9, cw * 0.9 / aspect);
      const exportScale = TW / cropW;

      const out = document.createElement("canvas");
      out.width = TW;
      out.height = TH;
      const octx = out.getContext("2d")!;
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = "high";
      octx.save();
      octx.translate(TW / 2 + offset.x * exportScale, TH / 2 + offset.y * exportScale);
      octx.scale(scale * exportScale, scale * exportScale);
      octx.rotate((rotationDeg * Math.PI) / 180);
      octx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
      octx.drawImage(imageEl, -imageEl.width / 2, -imageEl.height / 2);
      octx.restore();
      if (vignette > 0) {
        octx.save();
        if (type === "profile") {
          const r = Math.min(TW, TH) / 2;
          octx.beginPath();
          octx.arc(TW / 2, TH / 2, r, 0, Math.PI * 2);
          octx.clip();
          const vg = octx.createRadialGradient(TW / 2, TH / 2, r * 0.6, TW / 2, TH / 2, r);
          vg.addColorStop(0, `rgba(0,0,0,0)`);
          vg.addColorStop(1, `rgba(0,0,0,${Math.min(0.6, vignette)})`);
          octx.fillStyle = vg;
          octx.fillRect(0, 0, TW, TH);
        } else {
          const r = Math.hypot(TW, TH) / 2;
          const vg = octx.createRadialGradient(TW / 2, TH / 2, r * 0.6, TW / 2, TH / 2, r);
          vg.addColorStop(0, `rgba(0,0,0,0)`);
          vg.addColorStop(1, `rgba(0,0,0,${Math.min(0.6, vignette)})`);
          octx.fillStyle = vg;
          octx.fillRect(0, 0, TW, TH);
        }
        octx.restore();
      }

      const blob: Blob = await new Promise((resolve) => out.toBlob(resolve as any, "image/jpeg", 0.92));
      const file = new File([blob], `${type}-image.jpg`, { type: "image/jpeg" });
      await onCropped(file);
      onOpenChange(false);
      cleanupImage();
    } finally {
      setIsProcessing(false);
    }
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100000] isolate",
        open ? "pointer-events-auto" : "pointer-events-none",
        className
      )}
      aria-hidden={!open}
    >
      <div className={cn("absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[100000]", open ? "opacity-100" : "opacity-0")} />
      <div className={cn("absolute inset-0 flex items-start sm:items-center justify-center p-4 overflow-y-auto z-[100001]", open ? "opacity-100" : "opacity-0")}> 
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-5xl max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
            <div className="font-semibold text-gray-900">
              {type === "cover" ? "Edit Cover Image" : "Edit Profile Image"}
              <span className="ml-2 text-sm text-gray-500">
                {TW}×{TH}px
              </span>
            </div>
            <button type="button" onClick={() => { onOpenChange(false); cleanupImage(); }} className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            <div className="lg:col-span-2">
              <div
                className={cn(
                  "relative bg-gray-50",
                  dragOver ? "ring-2 ring-blue-600" : "ring-1 ring-slate-200"
                )}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
              >
                <canvas
                  ref={canvasRef}
                  width={1000}
                  height={600}
                  className="w-full h-auto"
                  onWheel={onWheel}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                />
                {!imageEl && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-600">
                    Drag & drop an image here or click “Change photo”
                  </div>
                )}
              </div>
            </div>
            <div className="lg:border-l border-t lg:border-t-0 p-4 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-6">
                  <button className={cn("text-sm", tab === "crop" ? "text-blue-600 font-medium" : "text-gray-600")} onClick={() => setTab("crop")}>Crop</button>
                  <button className={cn("text-sm", tab === "filter" ? "text-blue-600 font-medium" : "text-gray-600")} onClick={() => setTab("filter")}>Filter</button>
                  <button className={cn("text-sm", tab === "adjust" ? "text-blue-600 font-medium" : "text-gray-600")} onClick={() => setTab("adjust")}>Adjust</button>
                </div>
                <button
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border"
                  onClick={() => {
                    setScale(1);
                    setOffset({ x: 0, y: 0 });
                    setRotationDeg(0);
                    setBrightness(1);
                    setContrast(1);
                    setSaturation(1);
                    setVignette(0);
                    setSelectedFilter("original");
                  }}
                >
                  Reset
                </button>
              </div>
              {tab === "crop" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setRotationDeg((d) => d - 90)}>
                      <RotateCcw className="h-4 w-4 mr-2" /> Rotate left
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRotationDeg((d) => d + 90)}>
                      <RotateCw className="h-4 w-4 mr-2" /> Rotate right
                    </Button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-gray-600">Zoom</div>
                      <div className="text-xs text-gray-500">{scale.toFixed(2)}x</div>
                    </div>
                    <input type="range" min={0.1} max={5} step={0.01} value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-gray-600">Straighten</div>
                      <div className="text-xs text-gray-500">{rotationDeg.toFixed(1)}°</div>
                    </div>
                    <input type="range" min={-30} max={30} step={0.5} value={rotationDeg} onChange={(e) => setRotationDeg(parseFloat(e.target.value))} className="w-full" />
                  </div>
                </div>
              )}
              {tab === "filter" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {filters.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => applyFilterPreset(f.key)}
                        className={cn(
                          "flex flex-col items-center gap-2",
                          selectedFilter === f.key ? "text-blue-600" : "text-gray-700"
                        )}
                      >
                        <div
                          className={cn("w-16 h-16 rounded-full border overflow-hidden bg-gray-200")}
                          style={{
                            backgroundImage: imageSrc ? `url(${imageSrc})` : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: `brightness(${f.values.brightness}) contrast(${f.values.contrast}) saturate(${f.values.saturation})`,
                          }}
                        />
                        <span className="text-xs">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {tab === "adjust" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-gray-600">Brightness</div>
                      <div className="text-xs text-gray-500">{Math.round(brightness * 100)}%</div>
                    </div>
                    <input type="range" min={0.5} max={1.5} step={0.01} value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-gray-600">Contrast</div>
                      <div className="text-xs text-gray-500">{Math.round(contrast * 100)}%</div>
                    </div>
                    <input type="range" min={0.5} max={1.5} step={0.01} value={contrast} onChange={(e) => setContrast(parseFloat(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-gray-600">Saturation</div>
                      <div className="text-xs text-gray-500">{Math.round(saturation * 100)}%</div>
                    </div>
                    <input type="range" min={0} max={2} step={0.01} value={saturation} onChange={(e) => setSaturation(parseFloat(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-gray-600">Vignette</div>
                      <div className="text-xs text-gray-500">{Math.round(vignette * 100)}%</div>
                    </div>
                    <input type="range" min={0} max={1} step={0.01} value={vignette} onChange={(e) => setVignette(parseFloat(e.target.value))} className="w-full" />
                  </div>
                </div>
              )}
              <div className="pt-2 mt-2 border-t flex items-center justify-between">
                <div className="flex items-center gap-2"></div>
                <div className="flex items-center gap-2 bg-white"
                  style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
                >
                  <label className="inline-flex items-center px-3 py-2 text-sm bg-white border rounded-md cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Change photo
                    <input type="file" accept="image/*" className="hidden" onChange={onFileInput} />
                  </label>
                  <Button onClick={handleSave} disabled={!imageEl || isProcessing}>
                    {isProcessing ? "Processing..." : type === "cover" ? "Apply" : "Save photo"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}