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
      <div className="py-6 px-2" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
        <h2 className="text-lg font-semibold text-white mb-6 px-4">BEFORE & AFTER PHOTOS</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-2" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
      <h2 className="text-lg font-semibold text-white mb-6 px-4">BEFORE & AFTER PHOTOS</h2>
      
      <div className="grid grid-cols-2 gap-1 h-80">
        {/* Before Photo - Left Side */}
        <div className="flex flex-col h-full">
          <div className="relative flex-1 overflow-hidden group" style={{ backgroundColor: '#232323', borderRadius: '8px' }}>
            {/* Before Label */}
            <div className="absolute top-2 left-2 right-2 z-10">
              <div className="px-3 py-1" style={{ backgroundColor: 'rgba(27, 27, 27, 0.8)', borderRadius: '8px' }}>
                <h3 className="text-white font-medium text-sm">Before</h3>
              </div>
            </div>
            
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 font-medium flex items-center gap-2"
                    style={{ backgroundColor: '#FFFC74', color: '#000000', borderRadius: '8px' }}
                    disabled={uploading === 'before'}
                  >
                    <Upload className="w-4 h-4" />
                    Update
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                {uploading === 'before' ? (
                  <div className="space-y-3">
                    <LoadingSpinner />
                    <p className="text-sm" style={{ color: '#979797' }}>Uploading... {uploadProgress}%</p>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#404040' }}>
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%`, backgroundColor: '#FFFC74' }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-12 h-12 mb-3" style={{ color: '#979797' }} />
                    <p className="mb-3 text-sm" style={{ color: '#979797' }}>
                      Upload a before photo to track your transformation
                    </p>
                    <button
                      onClick={triggerFileInput}
                      className="text-sm flex items-center gap-2 px-4 py-2 transition-colors"
                      style={{ backgroundColor: '#232323', color: '#FFFFFF', border: '1px solid #404040', borderRadius: '8px' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#404040'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#232323'}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Photo Caption */}
          {photos.before && (
            <p className="text-xs mt-2" style={{ color: '#979797' }}>
              Uploaded {formatDate(photos.before.taken_at)}
            </p>
          )}
        </div>

        {/* After Photo - Right Side */}
        <div className="flex flex-col h-full">
          <div className="relative flex-1 overflow-hidden group" style={{ backgroundColor: '#232323', borderRadius: '8px' }}>
            {/* After Label */}
            <div className="absolute top-2 left-2 right-2 z-10">
              <div className="px-3 py-1" style={{ backgroundColor: 'rgba(27, 27, 27, 0.8)', borderRadius: '8px' }}>
                <h3 className="text-white font-medium text-sm">After</h3>
              </div>
            </div>
            
            {photos.after ? (
              <>
                <img
                  src={photos.after.photo_url}
                  alt="After photo"
                  className="w-full h-full object-cover"
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Camera className="w-12 h-12 mb-3" style={{ color: '#979797' }} />
                <p className="mb-3 text-sm" style={{ color: '#979797' }}>
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
          
          {/* Photo Caption */}
          {photos.after && (
            <p className="text-xs mt-2" style={{ color: '#979797' }}>
              Uploaded From Workout {formatDate(photos.after.taken_at)}
            </p>
          )}
        </div>
      </div>

      {/* Progress message */}
      {photos.before && photos.after && (
        <div className="mt-8 pt-4">
          <p className="text-center" style={{ fontSize: '14px', color: '#979797' }}>
            Great job tracking your progress! Keep up the amazing work!
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
