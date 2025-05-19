
"use client";

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Not used directly in UI, toast is used
import { cn } from '@/lib/utils';
import { Video as VideoIcon, AlertTriangle, Loader2 } from 'lucide-react';
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
  const [errorType, setErrorType] = useState<string | null>(null); // To store a classified error type
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      setIsLoading(true);
      setHasCameraPermission(null); // Reset permission status on new attempt
      setErrorType(null); // Reset error type

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn(`getUserMedia is not supported in this browser for ${name}.`);
        toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description: `Camera access (getUserMedia) is not supported by your browser for ${name}.`,
        });
        setHasCameraPermission(false);
        setErrorType('unsupported');
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
        const err = error as Error & { code?: number; name?: string; message?: string }; 
        setHasCameraPermission(false);
        
        let toastTitle = `Camera Access Issue for ${name}`;
        let toastDescription = `Could not access camera for ${name}. Please enable camera permissions in your browser settings.`;
        let classifiedErrorType = 'generic';
        let logAsWarning = false; 

        if (err.name === 'NotFoundError' || (err.message && err.message.toLowerCase().includes('device not found'))) {
          toastDescription = `No camera was found for ${name}. Please ensure a camera is connected and enabled.`;
          classifiedErrorType = 'notFound';
          logAsWarning = true; 
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          toastDescription = `Permission to use the camera for ${name} was denied. Please enable camera permissions in your browser settings.`;
          classifiedErrorType = 'permissionDenied';
          logAsWarning = true; 
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError' || (err.message && (err.message.toLowerCase().includes('allocate') || err.message.toLowerCase().includes('in use') || err.message.toLowerCase().includes('busy'))) || err.name === 'OverconstrainedError') {
          toastTitle = `Camera Busy or Allocation Failed for ${name}`;
          toastDescription = `Failed to access camera for ${name}. It might be in use by another application, another camera feed in this app, or a hardware issue occurred. Browsers often limit access to a single physical camera to one stream at a time. (Error: ${err.name})`;
          classifiedErrorType = 'busyOrAllocation';
          logAsWarning = false; // Changed to false to log as console.error
        } else if (err.name === 'AbortError') {
           toastDescription = `Camera access for ${name} was aborted. This can happen if the device is disconnected or a concurrent operation interfered. (Error: ${err.name})`;
           classifiedErrorType = 'aborted';
           logAsWarning = true;
        } else { 
           console.error(`Unexpected error accessing camera for ${name} (ID: ${id}): ${err.name} - ${err.message}` + (err.code ? ` Code: ${err.code}` : ''));
           toastDescription = `An unexpected error occurred while trying to access camera ${name}: ${err.message || 'Unknown error'} (Error: ${err.name || 'Unknown name'})`;
           classifiedErrorType = 'unknown';
        }
        
        setErrorType(classifiedErrorType); 

        if (classifiedErrorType !== 'unknown') { 
            if (logAsWarning) {
                console.warn(`Camera access issue for ${name} (ID: ${id}) - Type: ${classifiedErrorType}, Name: ${err.name || 'N/A'}, Message: ${err.message || 'N/A'}` + (err.code ? `, Code: ${err.code}` : ''));
            } else {
                console.error(`Error accessing camera for ${name} (ID: ${id}) - Type: ${classifiedErrorType}, Name: ${err.name || 'N/A'}, Message: ${err.message || 'N/A'}` + (err.code ? `, Code: ${err.code}` : ''));
            }
        }
        
        toast({
          variant: 'destructive',
          title: toastTitle,
          description: toastDescription,
        });
      } finally {
        setIsLoading(false);
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
        });
        videoRef.current.srcObject = null; 
      }
    };
  }, [id, name, toast]); 

  const getInCardErrorMessage = () => {
    switch (errorType) {
      case 'notFound':
        return "No camera found.";
      case 'permissionDenied':
        return "Permission denied.";
      case 'busyOrAllocation':
        return "Camera in use or allocation failed.";
      case 'aborted':
        return "Access aborted.";
      case 'unsupported':
        return "Browser unsupported.";
      case 'playbackError':
        return "Video playback error.";
      case 'unknown':
        return "Unknown error.";
      default:
        return "Camera unavailable. Check permissions or if in use by another app.";
    }
  };

  return (
    <Card className={cn("overflow-hidden shadow-md flex flex-col", className)} style={style}>
      <CardHeader className="flex flex-row items-center justify-between p-2 space-y-0 bg-muted/50">
        <CardTitle className="text-sm font-medium truncate">{name}</CardTitle>
        <VideoIcon className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent className="p-0 flex-grow relative min-h-[150px] md:min-h-[100px]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline 
          onLoadedData={() => {
            if (hasCameraPermission) setIsLoading(false); 
          }}
          onPlay={() => { 
             if (hasCameraPermission) setIsLoading(false);
          }}
          onError={(e) => {
            console.warn(`Video element error for ${name} (ID: ${id}):`, e); 
            if (hasCameraPermission !== false) { 
                setErrorType('playbackError');
                setHasCameraPermission(false); 
                setIsLoading(false);
                toast({
                    variant: 'destructive',
                    title: `Video Playback Error for ${name}`,
                    description: 'The camera stream could not be played or was interrupted. The device might be disconnected or became unavailable.',
                });
            }
          }}
        />
        {isLoading && hasCameraPermission !== false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
            <Loader2 className="w-8 h-8 mb-2 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Initializing {name}...</p>
          </div>
        )}
        {hasCameraPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/20 p-2 text-center">
             <AlertTriangle className="w-8 h-8 mb-2 text-destructive" />
            <p className="text-xs font-semibold text-destructive-foreground">{name}: {getInCardErrorMessage()}</p>
            {errorType === 'busyOrAllocation' && <p className="text-xs text-destructive-foreground/80">Try closing other apps/tabs using the camera, or check if another feed here is using it.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
