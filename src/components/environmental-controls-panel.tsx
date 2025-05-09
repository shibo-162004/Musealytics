"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Thermometer, Lightbulb, Users } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { cn } from '@/lib/utils';

export function EnvironmentalControlsPanel() {
  const { environmentalSettings, simulatedVisitorDensity } = useAppContext();

  const isAcOn = simulatedVisitorDensity >= environmentalSettings.acThreshold;
  const areLightsAdjusted = simulatedVisitorDensity >= environmentalSettings.lightsThreshold; // Assuming "adjusted" means brighter/on

  const densityPercentage = Math.min((simulatedVisitorDensity / (Math.max(environmentalSettings.acThreshold, environmentalSettings.lightsThreshold, 1) * 1.5)) * 100, 100);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Environmental Controls</CardTitle>
        <CardDescription>Simulated status based on visitor density.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-primary" />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Visitor Density</span>
              <span className="text-sm font-semibold">{simulatedVisitorDensity} visitors</span>
            </div>
            <Progress value={densityPercentage} aria-label={`${densityPercentage}% visitor density`} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className={cn("transition-all", isAcOn ? "bg-accent/20 border-accent" : "bg-muted/50")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Air Conditioning</CardTitle>
              <Thermometer className={cn("w-5 h-5", isAcOn ? "text-accent" : "text-muted-foreground")} />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", isAcOn ? "text-accent-foreground" : "text-foreground")}>
                {isAcOn ? 'ACTIVE' : 'OFF'}
              </div>
              <p className="text-xs text-muted-foreground">
                Threshold: {environmentalSettings.acThreshold} visitors
              </p>
            </CardContent>
          </Card>

          <Card className={cn("transition-all", areLightsAdjusted ? "bg-primary/20 border-primary" : "bg-muted/50")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Gallery Lighting</CardTitle>
              <Lightbulb className={cn("w-5 h-5", areLightsAdjusted ? "text-primary" : "text-muted-foreground")} />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", areLightsAdjusted ? "text-primary-foreground" : "text-foreground")}>
                {areLightsAdjusted ? 'OPTIMIZED' : 'STANDARD'}
              </div>
              <p className="text-xs text-muted-foreground">
                Threshold: {environmentalSettings.lightsThreshold} visitors
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
