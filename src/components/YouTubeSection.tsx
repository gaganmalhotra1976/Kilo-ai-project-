"use client";

import { useState } from "react";
import Image from "next/image";

interface YouTubeVideo {
  id: number;
  title: string;
  videoId: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface YouTubeSectionProps {
  videos: YouTubeVideo[];
}

function getYouTubeThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function getYouTubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

export default function YouTubeSection({ videos }: YouTubeSectionProps) {
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);

  if (!videos || videos.length === 0) return null;

  return (
    <section className="bg-gray-50 py-12 sm:py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            From Our YouTube Channel
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Watch our latest videos on home vaccination, health tips, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-200 overflow-hidden">
                <Image
                  src={getYouTubeThumbnail(video.videoId)}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 mb-1">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-gray-500 text-xs sm:text-sm line-clamp-2">{video.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* YouTube channel link */}
        <div className="text-center mt-8 sm:mt-10">
          <a
            href="https://www.youtube.com/@thevaccinepanda"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-red-500 text-red-600 font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-full hover:bg-red-50 transition-colors text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Visit Our YouTube Channel
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
              aria-label="Close video"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Video embed */}
            <div className="aspect-video">
              <iframe
                src={getYouTubeEmbedUrl(activeVideo.videoId)}
                title={activeVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {/* Video title */}
            <div className="p-4 bg-gray-900">
              <h3 className="text-white font-semibold text-sm sm:text-base">{activeVideo.title}</h3>
              {activeVideo.description && (
                <p className="text-gray-400 text-xs sm:text-sm mt-1">{activeVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
