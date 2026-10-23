import React, { useRef, useState } from 'react';
import { Camera, Upload, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { compressImage } from '../../lib/imageCompression';
import { useToast } from '../../context/ToastContext';

interface ImageUploadProps {
  currentUrl?: string;
  fallbackInitials: string;
  onUpload: (file: File) => Promise<boolean | void>;
  label?: string;
  size?: 'md' | 'lg';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentUrl,
  fallbackInitials,
  onUpload,
  label = 'Change Photo',
  size = 'lg',
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 15MB before compression)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      // Compress immediately on client-side
      const compressed = await compressImage(file, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.8,
        mimeType: 'image/jpeg',
      });

      setPreview(compressed.dataUrl);
      setCompressionInfo(
        `${compressed.formattedOriginalSize} → ${compressed.formattedCompressedSize} (${compressed.savedPercent}% saved)`
      );

      await onUpload(compressed.file);
      setUploadSuccess(true);
      toast.success('Photo updated successfully.');
      setTimeout(() => {
        setUploadSuccess(false);
        setCompressionInfo(null);
      }, 4500);
    } catch (err) {
      console.error(err);
      // Fallback: upload raw file if compression encountered error
      try {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        await onUpload(file);
        setUploadSuccess(true);
        toast.success('Photo updated successfully.');
      } catch (err2) {
        toast.error('Failed to upload image. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const dimensions = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-xl';

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <div
          className={`${dimensions} rounded-full bg-[#00A86B] text-white font-bold flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-800 shadow-md relative`}
        >
          {preview || currentUrl ? (
            <img
              src={preview || currentUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{fallbackInitials}</span>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow cursor-pointer"
          title="Upload image"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#1E2330] hover:bg-gray-200 dark:hover:bg-[#2A3142] px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          {label}
        </button>
        
        {compressionInfo && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1 mt-1">
            <Zap className="w-3 h-3 text-amber-500" />
            Optimized: {compressionInfo}
          </span>
        )}

        {uploadSuccess && !compressionInfo && (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Photo updated
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
