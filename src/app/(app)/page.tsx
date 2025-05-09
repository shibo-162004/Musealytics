"use client";

import { GalleryLayout } from '@/components/gallery-layout';
import { HeatmapDisplay } from '@/components/heatmap-display';
import { EnvironmentalControlsPanel } from '@/components/environmental-controls-panel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <HeatmapDisplay />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Live Camera Feeds</CardTitle>
          <CardDescription>Real-time (simulated) view from gallery cameras.</CardDescription>
        </CardHeader>
        <CardContent>
          <GalleryLayout />
        </CardContent>
      </Card>

      <EnvironmentalControlsPanel />
    </div>
  );
}
