
"use client";

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Video as VideoIcon, AlertTriangle, Loader2 } from 'lucide-react'; // Renamed Video to VideoIcon to avoid conflict
import { useToast } from '@/hooks/use-toast';

interface CameraFeedProps {
  id: number; // Unique ID for the camera
  name: string;
  className?: string;
  style?: CSSProperties;
}

export function CameraFeed({ id, name, className, style }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      setIsLoading(true);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia is not supported in this browser.');
        toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description: `Camera access (getUserMedia) is not supported by your browser for ${name}.`,
        });
        setHasCameraPermission(false);
        setIsLoading(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error: unknown) {
        const err = error as Error;
        console.error(`Error accessing camera for ${name} (ID: ${id}):`, err);
        setHasCameraPermission(false);
        
        let description = `Could not access camera for ${name}. Please enable camera permissions in your browser settings.`;
        if (err.name === 'NotReadableError' || err.name === 'AbortError' || err.message.toLowerCase().includes('allocate') || err.message.toLowerCase().includes('in use')) {
          description = `Camera for ${name} might be busy, used by another app, or a hardware issue occurred. Please ensure it's available and permissions are granted. (Error: ${err.name})`;
        } else if (err.name === 'NotFoundError') {
          description = `No camera was found for ${name}. Please ensure a camera is connected and enabled.`;
        } else if (err.name === 'NotAllowedError') {
          description = `Permission to use the camera for ${name} was denied. Please enable camera permissions in your browser settings.`;
        }

        toast({
          variant: 'destructive',
          title: `Camera Access Issue for ${name}`,
          description: description,
        });
      } finally {
        setIsLoading(false);
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: Stop video tracks when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null; // Explicitly release the stream
      }
    };
  }, [id, name, toast]);

  return (
    <Card className={cn("overflow-hidden shadow-md flex flex-col", className)} style={style}>
      <CardHeader className="flex flex-row items-center justify-between p-2 space-y-0 bg-muted/50">
        <CardTitle className="text-sm font-medium truncate">{name}</CardTitle>
        <VideoIcon className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent className="p-0 flex-grow relative min-h-[100px]"> {/* Added min-h for consistency */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline // Important for iOS
          onLoadedData={() => setIsLoading(false)} // Refined loading state
          onError={(e) => { // Basic video element error handling
            console.error(`Video element error for ${name}:`, e);
            setIsLoading(false);
            setHasCameraPermission(false); // Assume permission/access issue on video error
             toast({
              variant: 'destructive',
              title: `Video Playback Error for ${name}`,
              description: 'The camera stream could not be played. The device might be disconnected or in use.',
            });
          }}
        />
        {isLoading && hasCameraPermission !== false && ( // Show loader only if permission not explicitly denied
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
            <Loader2 className="w-8 h-8 mb-2 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Initializing {name}...</p>
          </div>
        )}
        {hasCameraPermission === false && ( // Simplified condition: if permission is false, show error
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/20 p-2 text-center">
             <AlertTriangle className="w-8 h-8 mb-2 text-destructive" />
            <p className="text-xs font-semibold text-destructive-foreground">Camera unavailable for {name}.</p>
            <p className="text-xs text-destructive-foreground/80">Check permissions or if in use.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

