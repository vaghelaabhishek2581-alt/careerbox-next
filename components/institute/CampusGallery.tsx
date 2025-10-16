'use client'

import React, { useState } from 'react';
import { Lightbox } from '@/components/ui/Lightbox';
import Image from 'next/image';

interface MediaItem {
  mediaUrl?: string;
  thumbUrl?: string;
  title?: string;
  url?: string; // for videos
  thumbnail?: string; // for videos
}

interface CampusGalleryProps {
  photos: MediaItem[];
  videos: MediaItem[];
}

export function CampusGallery({ photos = [], videos = [] }: CampusGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const openLightbox = (media: MediaItem, type: 'image' | 'video') => {
    setSelectedMedia(media);
    setMediaType(type);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedMedia(null);
    setMediaType(null);
  };

  const normalizedPhotos = (Array.isArray(photos) ? photos : []).map(p => ({
    ...p,
    thumbUrl: p.thumbUrl || p.mediaUrl,
    mediaUrl: p.mediaUrl || p.thumbUrl,
  })).filter(p => p.thumbUrl);

  const normalizedVideos = (Array.isArray(videos) ? videos : []).map(v => ({
    ...v,
    thumbUrl: v.thumbnail || '',
    mediaUrl: v.url,
  })).filter(v => v.thumbUrl && v.mediaUrl);

  return (
    <div>
      {/* Photo Gallery */}
      {normalizedPhotos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Campus Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {normalizedPhotos.map((photo, index) => (
              <div key={index} className="cursor-pointer" onClick={() => openLightbox(photo, 'image')}>
                <Image
                  src={photo.thumbUrl!}
                  alt={photo.title || `Campus photo ${index + 1}`}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Gallery */}
      {normalizedVideos.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-4">Campus Videos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {normalizedVideos.map((video, index) => (
              <div key={index} className="cursor-pointer relative" onClick={() => openLightbox(video, 'video')}>
                 <Image
                  src={video.thumbUrl!}
                  alt={video.title || `Campus video ${index + 1}`}
                  width={400}
                  height={250}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <Lightbox isOpen={lightboxOpen} onClose={closeLightbox}>
        {selectedMedia && (
          <div>
            {mediaType === 'image' && selectedMedia.mediaUrl && (
              <Image
                src={selectedMedia.mediaUrl}
                alt={selectedMedia.title || 'Campus media'}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain"
              />
            )}
            {mediaType === 'video' && selectedMedia.mediaUrl && (
              <iframe
                width="560"
                height="315"
                src={selectedMedia.mediaUrl.includes('youtube.com/embed') ? selectedMedia.mediaUrl : `https://www.youtube.com/embed/${selectedMedia.mediaUrl.split('v=')[1]}`}
                title={selectedMedia.title || 'Campus Video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className='w-[80vw] h-[80vh] max-w-4xl'
              ></iframe>
            )}
          </div>
        )}
      </Lightbox>
    </div>
  );
}
