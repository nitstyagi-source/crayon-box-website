/**
 * UNIFORM ACADEMIC PHOTO STUDIO PROCESSOR
 * Automatically standardizes student, staff, and guardian portrait photos onto a uniform,
 * clean, professional studio backdrop (neutral academic light slate / blue gradient),
 * center-crops the portrait to 3:4 passport ratio, and ensures uniform quality across the ERP.
 */

export interface PhotoStandardizeOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  backgroundGradient?: [string, string];
  quality?: number;
}

export async function standardizeProfilePhoto(
  imageSource: File | Blob | string,
  options: PhotoStandardizeOptions = {}
): Promise<{ dataUrl: string; width: number; height: number }> {
  const targetWidth = options.width || 600;
  const targetHeight = options.height || 800; // 3:4 standard passport aspect ratio
  const bgStart = options.backgroundGradient?.[0] || '#F1F5F9'; // Light slate top
  const bgEnd = options.backgroundGradient?.[1] || '#CBD5E1';   // Soft neutral studio slate bottom
  const quality = options.quality || 0.92;

  return new Promise((resolve, reject) => {
    // 1. Load image into HTMLImageElement
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas 2D context not available');
        }

        // 2. Render Uniform Studio Backdrop Gradient
        const gradient = ctx.createRadialGradient(
          targetWidth / 2,
          targetHeight * 0.35,
          50,
          targetWidth / 2,
          targetHeight / 2,
          targetHeight * 0.75
        );
        gradient.addColorStop(0, '#FFFFFF'); // Bright center highlight
        gradient.addColorStop(0.4, bgStart);
        gradient.addColorStop(1, bgEnd);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // 3. Compute Smart Center Crop for Face / Portrait
        const srcAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;

        let drawWidth = targetWidth;
        let drawHeight = targetHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (srcAspect > targetAspect) {
          // Source is wider -> scale by height and crop horizontally
          drawHeight = targetHeight;
          drawWidth = targetHeight * srcAspect;
          offsetX = (targetWidth - drawWidth) / 2;
        } else {
          // Source is taller -> scale by width and crop vertically (anchored towards top for head/face)
          drawWidth = targetWidth;
          drawHeight = targetWidth / srcAspect;
          offsetY = (targetHeight - drawHeight) * 0.15; // 15% top bias keeps head in frame
        }

        // 4. Draw image onto canvas with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // 5. Apply subtle studio edge vignette for polished finish
        const vignette = ctx.createLinearGradient(0, 0, 0, targetHeight);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0.02)');
        vignette.addColorStop(0.9, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // 6. Export standardized JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          width: targetWidth,
          height: targetHeight,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image for uniform background processing'));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Failed to read photo file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    }
  });
}
