/**
 * High-performance client-side image compression utility.
 * Drastically reduces photo sizes (e.g., 5MB - 12MB phone camera photos down to ~80KB - 180KB)
 * using HTML5 Canvas with bilinear downscaling and quality optimization.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.75)
  mimeType?: 'image/jpeg' | 'image/webp';
}

export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  savedPercent: number;
  formattedOriginalSize: string;
  formattedCompressedSize: string;
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Compresses an image File or Blob in the browser before network upload or local storage.
 */
export async function compressImage(
  file: File | Blob,
  options: ImageCompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.76,
    mimeType = 'image/jpeg',
  } = options;

  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));

      img.onload = () => {
        let { width, height } = img;

        // Calculate proportional scale down
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get 2D canvas context'));
          return;
        }

        // Enable high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill background white for JPEGs (handles transparent PNGs nicely)
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas blob generation failed'));
              return;
            }

            const fileName =
              file instanceof File
                ? file.name.replace(/\.[^/.]+$/, '') + '.jpg'
                : 'compressed_image.jpg';

            const compressedFile = new File([blob], fileName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            const compressedSizeBytes = blob.size;
            const savedPercent =
              originalSizeBytes > 0
                ? Math.max(
                    0,
                    Math.round(
                      ((originalSizeBytes - compressedSizeBytes) /
                        originalSizeBytes) *
                        100
                    )
                  )
                : 0;

            resolve({
              file: compressedFile,
              dataUrl,
              originalSizeBytes,
              compressedSizeBytes,
              savedPercent,
              formattedOriginalSize: formatBytes(originalSizeBytes),
              formattedCompressedSize: formatBytes(compressedSizeBytes),
            });
          },
          mimeType,
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
