'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { getBeforeAfterPhotos, uploadProgressPhoto, formatDate } from '@/lib/progress';
import { ProgressPhoto } from '@/types';
import LoadingSpinner from './LoadingSpinner';
import OptimizedImage from './OptimizedImage';
import { useDebounce, apiCache } from '@/lib/performance';

interface BeforeAfterComparisonProps {
  userId: string;
}

const BeforeAfterComparisonOptimized = memo(({ userId }: BeforeAfterComparisonProps) => {
  const [photos, setPhotos] = useState<{
    before: ProgressPhoto | null;
    after: ProgressPhoto | null;
  }>({ before: null, after: null });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const beforeInputRef = useRef<HTMLInputElement>(null);

  // Memoized fetch function with caching
  const fetchPhotos = useCallback(async () => {
    if (!userId) return;
    
    const cacheKey = `progress-photos-${userId}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      setPhotos(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getBeforeAfterPhotos(userId);
      setPhotos(data);
      
      // Cache for 5 minutes
      apiCache.set(cacheKey, data, 5);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Debounced fetch to prevent excessive API calls
  const debouncedFetch = useDebounce(fetchPhotos, 300);

  useEffect(() => {
    debouncedFetch();
  }, [debouncedFetch]);

  // Optimized file upload with progress tracking
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file || !userId) return;

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

    try {
      setUploading('before');
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadProgressPhoto(userId, file, 'before');
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        // Invalidate cache and refresh photos
        apiCache.delete(`progress-photos-${userId}`);
        await fetchPhotos();
        
        // Reset file input
        if (beforeInputRef.current) {
          beforeInputRef.current.value = '';
        }
      } else {
        alert(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(null);
      setUploadProgress(0);
    }
  }, [userId, fetchPhotos]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const triggerFileUpload = useCallback(() => {
    beforeInputRef.current?.click();
  }, []);

  if (loading) {
    return (
      <div className="bg-card-dark border border-border-color rounded-lg p-6">
        <h2 className="text-heading mb-4">PROGRESS PHOTOS</h2>
        <div className="flex items-center justify-center h-80">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-dark border border-border-color rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-heading">PROGRESS PHOTOS</h2>
        <button
          onClick={triggerFileUpload}
          disabled={uploading !== null}
          className="text-yellow-400 hover:text-yellow-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 h-80">
        {/* Before Photo */}
        <div className="flex flex-col h-full">
          <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden relative">
            {photos.before ? (
              <OptimizedImage
                src={photos.before.photo_url}
                alt="Before photo"
                className="w-full h-full object-cover"
                width={300}
                height={400}
                lazy={true}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <Camera size={32} className="mb-2" />
                <span className="text-sm">Before Photo</span>
                {uploading === 'before' && (
                  <div className="mt-2 w-full px-4">
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-center mt-1">{uploadProgress}%</div>
                  </div>
                )}
              </div>
            )}
            
            {photos.before && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                Before
              </div>
            )}
          </div>
          
          {photos.before && (
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-400">
                {formatDate(photos.before.taken_at)}
              </div>
            </div>
          )}
        </div>

        {/* After Photo */}
        <div className="flex flex-col h-full">
          <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden relative">
            {photos.after ? (
              <OptimizedImage
                src={photos.after.photo_url}
                alt="After photo"
                className="w-full h-full object-cover"
                width={300}
                height={400}
                lazy={true}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <Camera size={32} className="mb-2" />
                <span className="text-sm">After Photo</span>
                <span className="text-xs mt-1">Coming Soon</span>
              </div>
            )}
            
            {photos.after && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                After
              </div>
            )}
          </div>
          
          {photos.after && (
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-400">
                {formatDate(photos.after.taken_at)}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Hidden file input */}
      <input
        ref={beforeInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
});

BeforeAfterComparisonOptimized.displayName = 'BeforeAfterComparisonOptimized';

export default BeforeAfterComparisonOptimized;
