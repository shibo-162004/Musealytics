"use client";

import type { CSSProperties } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Video } from 'lucide-react';

interface CameraFeedProps {
  name: string;
  imageUrl: string;
  className?: string;
  style?: CSSProperties;
}

export function CameraFeed({ name, imageUrl, className, style }: CameraFeedProps) {
  return (
    <Card className={cn("overflow-hidden shadow-md", className)} style={style}>
      <CardHeader className="flex flex-row items-center justify-between p-2 space-y-0 bg-muted/50">
        <CardTitle className="text-sm font-medium truncate">{name}</CardTitle>
        <Video className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full aspect-video">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Live feed from ${name}`}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 ease-in-out group-hover:scale-105"
              unoptimized={imageUrl.startsWith('https://picsum.photos')} // Useful for dynamic placeholders
              data-ai-hint="security camera"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
              <span>No Signal</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
