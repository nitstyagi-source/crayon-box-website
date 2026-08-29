/**
 * UNIVERSAL PHOTO BACKGROUND REMOVAL & STUDIO COMPOSITOR
 * Automatically removes noisy/original backgrounds from portrait photos
 * and composites them against a standardized institutional studio backdrop.
 */

export interface StandardizePhotoOptions {
  backgroundType?: 'studio-gradient-dark' | 'studio-gradient-light' | 'formal-blue' | 'pure-white';
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Standardize an image client-side via HTML Canvas with chroma & edge-aware alpha masking
 */
export async function standardizePhotoBackground(
  imageSource: string | File | Blob,
  options: StandardizePhotoOptions = {}
): Promise<string> {
  const {
    backgroundType = 'studio-gradient-dark',
    targetWidth = 400,
    targetHeight = 500,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          return resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource));
        }

        // 1. Draw standardized institutional background gradient
        const bgGradient = ctx.createRadialGradient(
          targetWidth / 2,
          targetHeight * 0.4,
          50,
          targetWidth / 2,
          targetHeight / 2,
          targetWidth * 0.8
        );

        if (backgroundType === 'studio-gradient-dark') {
          bgGradient.addColorStop(0, '#334155'); // Slate 700 highlight
          bgGradient.addColorStop(0.6, '#1E293B'); // Slate 800
          bgGradient.addColorStop(1, '#0F172A'); // Slate 900
        } else if (backgroundType === 'formal-blue') {
          bgGradient.addColorStop(0, '#3B82F6');
          bgGradient.addColorStop(0.7, '#1E40AF');
          bgGradient.addColorStop(1, '#1E3A8A');
        } else if (backgroundType === 'studio-gradient-light') {
          bgGradient.addColorStop(0, '#FFFFFF');
          bgGradient.addColorStop(0.6, '#F1F5F9');
          bgGradient.addColorStop(1, '#E2E8F0');
        } else {
          bgGradient.addColorStop(0, '#FFFFFF');
          bgGradient.addColorStop(1, '#F8FAFC');
        }

        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // 2. Offscreen canvas to extract subject & remove background
        const offCanvas = document.createElement('canvas');
        offCanvas.width = targetWidth;
        offCanvas.height = targetHeight;
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

        if (!offCtx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          return resolve(canvas.toDataURL('image/jpeg', 0.92));
        }

        // Scale & fit portrait proportionally (centered)
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const nw = img.width * scale;
        const nh = img.height * scale;
        const nx = (targetWidth - nw) / 2;
        const ny = targetHeight - nh; // Align to bottom

        offCtx.drawImage(img, nx, ny, nw, nh);

        const imgData = offCtx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imgData.data;

        // Sample corner pixels to detect dominant background colors
        const cornerSamples = [
          [0, 0],
          [targetWidth - 1, 0],
          [0, 10],
          [targetWidth - 1, 10],
          [5, 5],
          [targetWidth - 6, 5],
        ];

        let bgR = 0, bgG = 0, bgB = 0;
        cornerSamples.forEach(([cx, cy]) => {
          const idx = (cy * targetWidth + cx) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR /= cornerSamples.length;
        bgG /= cornerSamples.length;
        bgB /= cornerSamples.length;

        // Segment & feather background
        for (let y = 0; y < targetHeight; y++) {
          for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Color distance to sampled background
            const diff = Math.sqrt(
              Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
            );

            // Edge thresholding & feathering for hair / shoulders
            const threshold = 45;
            const feather = 30;

            if (diff < threshold) {
              // Complete background removal
              data[idx + 3] = 0;
            } else if (diff < threshold + feather) {
              // Smooth soft alpha transition
              const alphaRatio = (diff - threshold) / feather;
              data[idx + 3] = Math.floor(alphaRatio * 255);
            }
          }
        }

        offCtx.putImageData(imgData, 0, 0);

        // 3. Composite cleaned subject over standardized studio background
        ctx.drawImage(offCanvas, 0, 0);

        // 4. Subtle studio rim lighting & vignette
        const vignette = ctx.createRadialGradient(
          targetWidth / 2,
          targetHeight / 2,
          targetWidth * 0.45,
          targetWidth / 2,
          targetHeight / 2,
          targetWidth * 0.75
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.25)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (err) {
        console.warn('Fallback: image standardization error:', err);
        resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource as Blob));
      }
    };

    img.onerror = () => {
      resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource as Blob));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageSource as Blob);
    }
  });
}
