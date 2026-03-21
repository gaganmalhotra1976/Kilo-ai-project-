"use client";

import { useState, useRef } from "react";

interface ProfilePictureUploadProps {
  currentImage: string | null; // base64 string (no data-url prefix)
  onImageChange: (base64: string) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function ProfilePictureUpload({
  currentImage,
  onImageChange,
  label = "Profile Picture",
  size = "md",
}: ProfilePictureUploadProps) {
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG / PNG)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2 MB");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      // Strip "data:image/jpeg;base64," prefix – store only the raw base64 string
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      onImageChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const imgSrc = currentImage ? `data:image/jpeg;base64,${currentImage}` : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`${sizeClasses[size]} rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors overflow-hidden`}
      >
        {imgSrc ? (
          <img src={imgSrc} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400 px-1">
            <svg className="w-7 h-7 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs leading-tight">Upload</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-red-500 text-xs text-center">{error}</p>}

      {currentImage && (
        <button
          type="button"
          onClick={() => onImageChange("")}
          className="text-red-500 text-xs hover:text-red-700"
        >
          Remove
        </button>
      )}

      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
