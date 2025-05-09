
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
      } catch (error) {
        console.error(`Error accessing camera for ${name} (ID: ${id}):`, error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: `Could not access camera for ${name}. Please enable camera permissions in your browser settings.`,
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
      }
    };
  }, [id, name, toast]);

  return (
    <Card className={cn("overflow-hidden shadow-md flex flex-col", className)} style={style}>
      <CardHeader className="flex flex-row items-center justify-between p-2 space-y-0 bg-muted/50">
        <CardTitle className="text-sm font-medium truncate">{name}</CardTitle>
        <VideoIcon className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent className="p-0 flex-grow relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline // Important for iOS
        />
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70">
            <Loader2 className="w-8 h-8 mb-2 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Initializing camera...</p>
          </div>
        )}
        {hasCameraPermission === false && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/20 p-2">
             <AlertTriangle className="w-8 h-8 mb-2 text-destructive" />
            <p className="text-sm text-center text-destructive-foreground">Camera access denied or unavailable.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
