"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { VideoOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraFeedProps {
  name: string;
  imageUrl: string; // Fallback image
  className?: string;
  style?: CSSProperties;
}

export function CameraFeed({ name, imageUrl, className, style }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStreamError("Webcam access is not supported by your browser.");
        setHasCameraPermission(false);
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        setStreamError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera for feed ' + name + ':', error);
        let message = 'Could not access camera.';
        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            message = "Camera permission denied. Please enable camera access in your browser settings.";
          } else if (error.name === "NotFoundError") {
            message = "No camera found. Please ensure a camera is connected.";
          } else {
            message = `Error: ${error.message}`;
          }
        }
        setStreamError(message);
        setHasCameraPermission(false);
        // Don't toast for every feed, only if it's a general issue.
        // Specific errors will be shown in the feed card.
      }
    };

    getCameraPermission();

    return () => {
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
      <CardContent className="p-0 aspect-[4/3] relative flex-grow flex items-center justify-center bg-muted">
        {hasCameraPermission === true && !streamError && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline // Important for iOS
          />
        )}
        {(hasCameraPermission === false || streamError) && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
            {imageUrl && !streamError && hasCameraPermission === false && ( // Show placeholder if permission explicitly false but no other stream error
                 <Image
                    src={imageUrl}
                    alt={`${name} placeholder`}
                    layout="fill"
                    objectFit="cover"
                    className="opacity-50"
                  />
            )}
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 p-2">
                <VideoOff className="w-10 h-10 text-destructive-foreground mb-2" />
                <p className="text-xs text-destructive-foreground font-semibold">
                    {streamError || "Camera permission denied or unavailable."}
                </p>
             </div>
          </div>
        )}
        {hasCameraPermission === null && !streamError && (
           <div className="w-full h-full flex flex-col items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground animate-pulse mb-2" />
            <p className="text-xs text-muted-foreground">Accessing camera...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
