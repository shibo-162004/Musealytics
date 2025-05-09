
"use client";

import { CameraFeed } from '@/components/camera-feed'; // Corrected import path
import type { CameraConfig } from '@/lib/constants';
import { useAppContext } from '@/contexts/app-context';
import { cn } from '@/lib/utils';

export function GalleryLayout() {
  const { cameraLayout } = useAppContext();

  // Determine grid size dynamically
  let maxCols = 0;
  let maxRows = 0;
  cameraLayout.forEach(cam => {
    if (cam.x + cam.colSpan > maxCols) maxCols = cam.x + cam.colSpan;
    if (cam.y + cam.rowSpan > maxRows) maxRows = cam.y + cam.rowSpan;
  });
  
  // Fallback to a default if layout is empty or results in zero dimensions
  if (maxCols === 0) maxCols = 5; // Default to 5 columns if layout is somehow empty
  if (maxRows === 0) maxRows = 2; // Default to 2 rows

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${maxRows}, minmax(150px, auto))`, // Ensure rows have a min height and can grow
      }}
    >
      {cameraLayout.map((cam) => (
        <CameraFeed
          key={cam.id}
          id={cam.id}
          name={cam.name}
          // imageUrl is no longer needed as CameraFeed handles live stream
          className={cn("min-h-[150px]")} // Ensure minimum height
          style={{
            gridColumn: `${cam.x + 1} / span ${cam.colSpan}`,
            gridRow: `${cam.y + 1} / span ${cam.rowSpan}`,
          }}
        />
      ))}
    </div>
  );
}
