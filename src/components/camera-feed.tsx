
"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { VideoOff, AlertTriangle } from 'lucide-react';
// Removed useToast as it's not used in this revised version for individual feed errors.
// General permission issues might be handled at a higher level or via a global notification system if needed.

interface CameraFeedProps {
  name: string;
  imageUrl: string; // Fallback image for error states
  className?: string;
  style?: CSSProperties;
}

export function CameraFeed({ name, imageUrl, className, style }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); // null: pending, true: granted, false: denied/error
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          setStreamError("Webcam access is not supported by your browser.");
          setHasCameraPermission(false);
        }
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (isMounted) {
          setHasCameraPermission(true);
          setStreamError(null);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (error) {
        console.error('Error accessing camera for feed ' + name + ':', error);
        if (isMounted) {
          let message = 'Could not access camera.';
          if (error instanceof Error) {
            if (error.name === "NotAllowedError") {
              message = "Permission denied. Please enable camera access in browser settings.";
            } else if (error.name === "NotFoundError") {
              message = "No camera found. Ensure a camera is connected and enabled.";
            } else {
              // More generic errors like OverconstrainedError, TypeError, etc.
              message = `Camera error: ${error.message}`;
            }
          }
          setStreamError(message);
          setHasCameraPermission(false);
        }
      }
    };

    getCameraPermission();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [name]);

  return (
    <Card className={cn("overflow-hidden shadow-lg flex flex-col", className)} style={style} data-ai-hint="live security camera">
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-medium truncate">{name}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 aspect-[4/3] relative flex-grow flex items-center justify-center bg-muted overflow-hidden">
        {hasCameraPermission === true && !streamError && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline // Essential for iOS and inline playback
          />
        )}
        {hasCameraPermission === null && !streamError && ( // Loading state
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
            <AlertTriangle className="w-10 h-10 text-muted-foreground animate-pulse mb-2" />
            <p className="text-xs text-muted-foreground">Accessing camera...</p>
          </div>
        )}
        {(hasCameraPermission === false || streamError) && ( // Error state
          <>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={`${name} placeholder background`}
                layout="fill"
                objectFit="cover"
                className="opacity-30 pointer-events-none" // Dimmed and non-interactive
                priority={false} // Not critical for LCP
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center z-10">
              <VideoOff className="w-12 h-12 text-destructive-foreground mb-3" />
              <p className="text-sm text-destructive-foreground font-semibold">
                {streamError || "Camera access failed or was denied."}
              </p>
              {(streamError?.includes("Permission denied") || streamError?.includes("NotAllowedError")) && (
                 <p className="text-xs text-destructive-foreground/80 mt-1">
                    Please check browser permissions.
                 </p>
              )}
               {(streamError?.includes("No camera found") || streamError?.includes("NotFoundError")) && (
                 <p className="text-xs text-destructive-foreground/80 mt-1">
                    Ensure a camera is connected.
                 </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
