'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { getBeforeAfterPhotos, uploadProgressPhoto, formatDate } from '@/lib/progress';
import { ProgressPhoto } from '@/types';
import LoadingSpinner from './LoadingSpinner';

interface BeforeAfterComparisonProps {
  userId: string;
}

export default function BeforeAfterComparison({ userId }: BeforeAfterComparisonProps) {
  const [photos, setPhotos] = useState<{
    before: ProgressPhoto | null;
    after: ProgressPhoto | null;
  }>({ before: null, after: null });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const beforeInputRef = useRef<HTMLInputElement>(null);

  // Function to fetch photos from database
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const data = await getBeforeAfterPhotos(userId);
      setPhotos(data);
      // console.log('Photos fetched:', data); // Debug log
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPhotos();
    }
  }, [userId]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading('before');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadProgressPhoto(userId, file, 'before');
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.photoUrl) {
        // Refresh photos from database to ensure consistency
        await fetchPhotos();
        console.log('Photo uploaded successfully and data refreshed');
      } else {
        alert(result.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(null);
      setUploadProgress(0);
    }
  };

  const triggerFileInput = () => {
    beforeInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Before & After Photos</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Camera className="w-5 h-5" />
        Before & After Photos
      </h2>
      
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* Before Photo - Left Side */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-center text-blue-400">Before</h3>
          <div className="relative aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden group">
            {photos.before ? (
              <>
                <img
                  src={photos.before.photo_url}
                  alt="Before photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={triggerFileInput}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-gray-900 px-3 py-2 rounded-lg font-medium flex items-center gap-2"
                    disabled={uploading === 'before'}
                  >
                    <Upload className="w-4 h-4" />
                    Update
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-xs text-white bg-black bg-opacity-50 rounded px-2 py-1">
                  {formatDate(photos.before.taken_at)}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                {uploading === 'before' ? (
                  <div className="space-y-3">
                    <LoadingSpinner />
                    <p className="text-sm text-gray-400">Uploading... {uploadProgress}%</p>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-400 mb-3 text-sm">
                      Upload a before photo to track your transformation
                    </p>
                    <button
                      onClick={triggerFileInput}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* After Photo - Right Side */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-center text-green-400">After</h3>
          <div className="relative aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden group">
            {photos.after ? (
              <>
                <img
                  src={photos.after.photo_url}
                  alt="After photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 text-xs text-white bg-black bg-opacity-50 rounded px-2 py-1">
                  <div className="flex justify-between items-center">
                    <span>{formatDate(photos.after.taken_at)}</span>
                    <span className="text-yellow-400 text-xs">From workout</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Camera className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-400 mb-3 text-sm">
                  Your latest workout photo will appear here automatically
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Take a photo during your next workout to see your progress!
                </p>
                <a
                  href="/workout"
                  className="btn-secondary text-sm flex items-center gap-2 hover:bg-gray-600 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Start Workout
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress message */}
      {photos.before && photos.after && (
        <div className="mt-6 p-4 bg-primary bg-opacity-10 border border-primary border-opacity-20 rounded-lg">
          <p className="text-center text-primary font-medium">
            🎉 Great job tracking your progress! Keep up the amazing work!
          </p>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={beforeInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

    </div>
  );
}
