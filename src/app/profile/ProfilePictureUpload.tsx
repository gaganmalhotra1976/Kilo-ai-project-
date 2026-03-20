"use client";

import { useState, useRef } from "react";

interface ProfilePictureUploadProps {
  currentImage: string | null;
  onImageChange: (url: string) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function ProfilePictureUpload({ 
  currentImage, 
  onImageChange, 
  label = "Profile Picture",
  size = "md"
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onImageChange(data.url);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      setPreview(currentImage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange("");
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors overflow-hidden relative`}
      >
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Upload</span>
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}

      {preview && !isUploading && (
        <button
          onClick={handleRemove}
          className="text-red-500 text-xs hover:text-red-700"
        >
          Remove
        </button>
      )}

      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
