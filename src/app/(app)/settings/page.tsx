"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/contexts/app-context';
import type { CameraConfig } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Save, RotateCcw } from 'lucide-react';
import { getDefaultCameraLayout, defaultEnvironmentalSettings } from '@/lib/constants';

export default function SettingsPage() {
  const { 
    cameraLayout, 
    setCameraLayout, 
    environmentalSettings, 
    setEnvironmentalSettings,
    simulatedVisitorDensity,
    setSimulatedVisitorDensity
  } = useAppContext();
  const { toast } = useToast();

  // Local state for editing before saving to context
  const [editableLayout, setEditableLayout] = useState<CameraConfig[]>(JSON.parse(JSON.stringify(cameraLayout)));
  const [editableEnvSettings, setEditableEnvSettings] = useState({...environmentalSettings});
  const [editableSimulatedDensity, setEditableSimulatedDensity] = useState(simulatedVisitorDensity);

  const handleLayoutChange = (index: number, field: keyof CameraConfig, value: string | number) => {
    const newLayout = [...editableLayout];
    if (field === 'name' && typeof value === 'string') {
      newLayout[index][field] = value;
    } else if (typeof value === 'string' && !isNaN(parseInt(value))) {
       // Ensure numeric fields are numbers
      (newLayout[index] as any)[field] = parseInt(value);
    } else if (typeof value === 'number') {
      (newLayout[index] as any)[field] = value;
    }
    setEditableLayout(newLayout);
  };
  
  const resetCameraLayout = () => {
    const defaultLayout = getDefaultCameraLayout();
    setEditableLayout(JSON.parse(JSON.stringify(defaultLayout))); // Deep copy
    setCameraLayout(defaultLayout); // Update context immediately
    toast({ title: "Camera Layout Reset", description: "Camera layout has been reset to default." });
  };

  const saveCameraLayout = () => {
    // Add validation if necessary
    setCameraLayout(editableLayout);
    toast({ title: "Camera Layout Saved", description: "Your camera layout settings have been updated." });
  };
  
  const resetEnvSettings = () => {
    setEditableEnvSettings({...defaultEnvironmentalSettings});
    setEnvironmentalSettings(defaultEnvironmentalSettings);
    setEditableSimulatedDensity(5); // Reset simulated density too
    setSimulatedVisitorDensity(5);
    toast({ title: "Environmental Settings Reset", description: "Environmental settings have been reset to default." });
  };

  const saveEnvSettings = () => {
    setEnvironmentalSettings(editableEnvSettings);
    setSimulatedVisitorDensity(editableSimulatedDensity);
    toast({ title: "Environmental Settings Saved", description: "Your environmental control settings have been updated." });
  };

  return (
    <Tabs defaultValue="cameraLayout" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="cameraLayout">Camera Layout</TabsTrigger>
        <TabsTrigger value="environmentalControls">Environmental Controls</TabsTrigger>
      </TabsList>

      <TabsContent value="cameraLayout">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Camera Layout Configuration</CardTitle>
            <CardDescription>
              Arrange camera feeds to match your museum's gallery layout. Define grid position (X, Y) and span.
              Grid is 0-indexed. Max 5 columns by default, adjust spans accordingly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {editableLayout.map((cam, index) => (
              <Card key={cam.id} className="p-4">
                <CardTitle className="mb-2 text-md">Camera {cam.id + 1}: {cam.name}</CardTitle>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  <div>
                    <Label htmlFor={`camName-${index}`}>Name</Label>
                    <Input id={`camName-${index}`} value={cam.name} onChange={(e) => handleLayoutChange(index, 'name', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor={`camX-${index}`}>Grid X</Label>
                    <Input id={`camX-${index}`} type="number" value={cam.x} onChange={(e) => handleLayoutChange(index, 'x', e.target.value)} min="0" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor={`camY-${index}`}>Grid Y</Label>
                    <Input id={`camY-${index}`} type="number" value={cam.y} onChange={(e) => handleLayoutChange(index, 'y', e.target.value)} min="0" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor={`camColSpan-${index}`}>Col Span</Label>
                    <Input id={`camColSpan-${index}`} type="number" value={cam.colSpan} onChange={(e) => handleLayoutChange(index, 'colSpan', e.target.value)} min="1" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor={`camRowSpan-${index}`}>Row Span</Label>
                    <Input id={`camRowSpan-${index}`} type="number" value={cam.rowSpan} onChange={(e) => handleLayoutChange(index, 'rowSpan', e.target.value)} min="1" className="mt-1" />
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={resetCameraLayout}><RotateCcw className="w-4 h-4 mr-2" /> Reset to Default</Button>
            <Button onClick={saveCameraLayout}><Save className="w-4 h-4 mr-2" /> Save Layout</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="environmentalControls">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Environmental Control Settings</CardTitle>
            <CardDescription>Set visitor density thresholds for simulated AC and lighting adjustments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <Label htmlFor="acThreshold" className="text-base">Air Conditioning Threshold ({editableEnvSettings.acThreshold} visitors)</Label>
              <Slider
                id="acThreshold"
                min={0}
                max={100}
                step={1}
                value={[editableEnvSettings.acThreshold]}
                onValueChange={(value) => setEditableEnvSettings(prev => ({ ...prev, acThreshold: value[0] }))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="lightsThreshold" className="text-base">Lighting Adjustment Threshold ({editableEnvSettings.lightsThreshold} visitors)</Label>
              <Slider
                id="lightsThreshold"
                min={0}
                max={100}
                step={1}
                value={[editableEnvSettings.lightsThreshold]}
                onValueChange={(value) => setEditableEnvSettings(prev => ({ ...prev, lightsThreshold: value[0] }))}
                className="mt-2"
              />
            </div>
             <div>
              <Label htmlFor="simulatedDensity" className="text-base">Simulated Visitor Density ({editableSimulatedDensity} visitors)</Label>
              <Slider
                id="simulatedDensity"
                min={0}
                max={100} // Or a higher sensible max for simulation
                step={1}
                value={[editableSimulatedDensity]}
                onValueChange={(value) => setEditableSimulatedDensity(value[0])}
                className="mt-2"
              />
              <p className="mt-1 text-sm text-muted-foreground">Adjust this to see environmental controls react on the dashboard.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={resetEnvSettings}><RotateCcw className="w-4 h-4 mr-2" /> Reset to Default</Button>
            <Button onClick={saveEnvSettings}><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
