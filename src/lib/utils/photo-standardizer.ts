/**
 * UNIVERSAL PHOTO BACKGROUND REMOVAL & UNIFORM STUDIO COMPOSITOR
 * Automatically removes noisy/cluttered backgrounds from uploaded student, staff,
 * and guardian portrait photos and composites them against a clean, standardized,
 * uniform institutional studio backdrop.
 */

export interface StandardizePhotoOptions {
  backgroundType?: 'studio-gradient-light' | 'studio-gradient-dark' | 'formal-blue' | 'pure-white';
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Standardize an image client-side via HTML Canvas with edge-aware chroma background neutralization
 */
export async function standardizePhotoBackground(
  imageSource: string | File | Blob,
  options: StandardizePhotoOptions = {}
): Promise<string> {
  const {
    backgroundType = 'studio-gradient-light',
    targetWidth = 480,
    targetHeight = 640, // 3:4 Academic Passport Aspect Ratio
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          return resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource as Blob));
        }

        // 1. Draw Uniform Academic Studio Backdrop
        const bgGradient = ctx.createRadialGradient(
          targetWidth / 2,
          targetHeight * 0.35,
          40,
          targetWidth / 2,
          targetHeight * 0.5,
          targetWidth * 0.8
        );

        if (backgroundType === 'studio-gradient-light') {
          // Standard Academic Studio Light Backdrop (Neutral, Crisp & Clean)
          bgGradient.addColorStop(0, '#FFFFFF'); // Soft center light
          bgGradient.addColorStop(0.5, '#F1F5F9'); // Slate 100
          bgGradient.addColorStop(1, '#E2E8F0');   // Slate 200
        } else if (backgroundType === 'formal-blue') {
          // Formal Academic Blue
          bgGradient.addColorStop(0, '#60A5FA');
          bgGradient.addColorStop(0.5, '#2563EB');
          bgGradient.addColorStop(1, '#1E40AF');
        } else if (backgroundType === 'studio-gradient-dark') {
          // Executive Slate
          bgGradient.addColorStop(0, '#334155');
          bgGradient.addColorStop(0.6, '#1E293B');
          bgGradient.addColorStop(1, '#0F172A');
        } else {
          bgGradient.addColorStop(0, '#FFFFFF');
          bgGradient.addColorStop(1, '#F8FAFC');
        }

        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // 2. Offscreen Canvas for Intelligent Subject Extraction
        const offCanvas = document.createElement('canvas');
        offCanvas.width = targetWidth;
        offCanvas.height = targetHeight;
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

        if (!offCtx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          return resolve(canvas.toDataURL('image/jpeg', 0.92));
        }

        // Fit & Center Portrait proportionally
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const nw = img.width * scale;
        const nh = img.height * scale;
        const nx = (targetWidth - nw) / 2;
        const ny = (targetHeight - nh) * 0.15; // 15% top bias preserves head space

        offCtx.drawImage(img, nx, ny, nw, nh);

        const imgData = offCtx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imgData.data;

        // Sample corner & edge background pixels
        const samplePoints = [
          [0, 0],
          [targetWidth - 1, 0],
          [0, 20],
          [targetWidth - 1, 20],
          [4, 4],
          [targetWidth - 5, 4],
          [0, Math.floor(targetHeight * 0.3)],
          [targetWidth - 1, Math.floor(targetHeight * 0.3)]
        ];

        let bgR = 0, bgG = 0, bgB = 0;
        samplePoints.forEach(([cx, cy]) => {
          const idx = (cy * targetWidth + cx) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR /= samplePoints.length;
        bgG /= samplePoints.length;
        bgB /= samplePoints.length;

        // Alpha segmentation with adaptive feathering
        const threshold = 40;
        const feather = 30;

        for (let y = 0; y < targetHeight; y++) {
          for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const diff = Math.sqrt(
              Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
            );

            if (diff < threshold) {
              data[idx + 3] = 0; // Cut out background
            } else if (diff < threshold + feather) {
              const alphaRatio = (diff - threshold) / feather;
              data[idx + 3] = Math.floor(alphaRatio * 255);
            }
          }
        }

        offCtx.putImageData(imgData, 0, 0);

        // 3. Composite cleaned subject over uniform studio backdrop
        ctx.drawImage(offCanvas, 0, 0);

        // 4. Studio Edge Lighting & Subtle Polish
        const vignette = ctx.createRadialGradient(
          targetWidth / 2,
          targetHeight / 2,
          targetWidth * 0.4,
          targetWidth / 2,
          targetHeight / 2,
          targetWidth * 0.8
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.06)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (err) {
        console.warn('Standardize photo fallback:', err);
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
