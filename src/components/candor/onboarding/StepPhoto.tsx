"use client";

import { useRef, useState } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import { OnboardingData } from "./OnboardingWizard";

export function StepPhoto({
  data,
  updateData,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(data.coverUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Target dimensions for a reasonable file size, maintaining aspect ratio
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress to WebP at 0.8 quality
        const dataUrl = canvas.toDataURL("image/webp", 0.8);
        setPreview(dataUrl);
        updateData({ coverUrl: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-md text-center flex flex-col items-center">
      <h2 className="text-3xl font-light tracking-tight text-foreground/90">
        show your vibe
      </h2>
      <p className="mt-2 text-sm font-light text-foreground-secondary mb-8">
        upload a photo to use as your profile backdrop
      </p>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative group cursor-pointer overflow-hidden rounded-[2rem] w-full aspect-[3/4] max-h-[400px] border border-white/10 bg-card/20 hover:bg-card/40 transition-colors flex items-center justify-center mb-8"
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Profile" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-background/50 backdrop-blur-sm transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
            <ImageIcon className="w-8 h-8 mb-4" />
            <span className="font-light">tap to select image</span>
          </div>
        )}
      </div>

      <div className="flex w-full items-center justify-between mt-auto">
        <Button variant="ghost" className="rounded-full px-6" onClick={onBack}>
          back
        </Button>
        <Button
          className="rounded-full bg-accent px-8 text-primary-foreground hover:bg-accent/90"
          onClick={onNext}
        >
          {preview ? "looks good" : "skip"}
        </Button>
      </div>
    </div>
  );
}
