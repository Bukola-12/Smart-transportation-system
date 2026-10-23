import { createClient } from '@supabase/supabase-js';
import { compressImage } from './imageCompression';

export const SUPABASE_URL = 'https://igrgmnjtmjmtzhdurbdp.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlncmdtbmp0bWptdHpoZHVyYmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2OTcwOTgsImV4cCI6MjEwODI3MzA5OH0.1P9SM2Ms07IGGbNX-yez7BhMIBJR-68niswKWUq11LI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Upload an image file to Supabase storage with automatic client-side compression
 * and resilient base64 fallback.
 * Compresses files up to 98% smaller before upload to save bandwidth and storage.
 */
export async function uploadImage(
  file: File,
  bucket: 'avatars' | 'vehicles' | 'locations' | string = 'avatars'
): Promise<string> {
  let fileToUpload: File = file;
  let compressedDataUrl: string | null = null;

  // 1. Client-side compression for efficiency & speed
  try {
    const isAvatar = bucket === 'avatars';
    const compressed = await compressImage(file, {
      maxWidth: isAvatar ? 500 : 1280,
      maxHeight: isAvatar ? 500 : 1280,
      quality: isAvatar ? 0.8 : 0.75,
      mimeType: 'image/jpeg',
    });
    fileToUpload = compressed.file;
    compressedDataUrl = compressed.dataUrl;
    console.log(
      `[ImageCompression] ${file.name}: ${compressed.formattedOriginalSize} → ${compressed.formattedCompressedSize} (${compressed.savedPercent}% saved)`
    );
  } catch (compErr) {
    console.warn('[ImageCompression] Fallback to raw file due to compression issue:', compErr);
  }

  // 2. Try Supabase Storage
  try {
    const fileExt = 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Supabase storage upload error or bucket unconfigured, using compressed base64 fallback:', err);
  }

  // 3. Resilient fallback: return the tiny compressed base64 data URL
  if (compressedDataUrl) {
    return compressedDataUrl;
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(fileToUpload);
  });
}
