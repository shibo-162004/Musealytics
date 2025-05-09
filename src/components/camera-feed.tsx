"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CameraFeedProps {
  name: string;
  imageUrl: string;
  className?: string;
}

export function CameraFeed({ name, imageUrl, className }: CameraFeedProps) {
  return (
    <Card className={cn("overflow-hidden shadow-lg", className)} data-ai-hint="museum interior">
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-medium truncate">{name}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 aspect-[4/3] relative">
        <Image
          src={imageUrl}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 ease-in-out hover:scale-105"
        />
      </CardContent>
    </Card>
  );
}
