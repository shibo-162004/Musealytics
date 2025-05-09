"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { generateHeatmap, type GenerateHeatmapInput, type GenerateHeatmapOutput } from '@/ai/flows/generate-heatmap';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { MOCK_GALLERY_LAYOUT_DESC, MOCK_VISITOR_DATA_DESC } from '@/lib/constants';

export function HeatmapDisplay() {
  const [galleryLayout, setGalleryLayout] = useState<string>(MOCK_GALLERY_LAYOUT_DESC);
  const [visitorData, setVisitorData] = useState<string>(MOCK_VISITOR_DATA_DESC);
  const [heatmapResult, setHeatmapResult] = useState<GenerateHeatmapOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const [currentPlaceholderSeed, setCurrentPlaceholderSeed] = useState<string>(`heatmap-${Date.now()}`);

  const handleGenerateHeatmap = async () => {
    setIsLoading(true);
    setHeatmapResult(null);
    try {
      const input: GenerateHeatmapInput = { galleryLayout, visitorData };
      const result = await generateHeatmap(input);
      
      // Check if AI returned a valid image URI, otherwise prepare placeholder
      if (!result.heatmapDataUri || !result.heatmapDataUri.startsWith('data:image')) {
        const newSeed = `heatmap-${Date.now()}`;
        setCurrentPlaceholderSeed(newSeed); // Update seed for a new placeholder image
        result.heatmapDataUri = `https://picsum.photos/seed/${newSeed}/800/600`; // Use updated seed
         toast({
          title: "Displaying Placeholder Heatmap",
          description: "A placeholder image is being used for the heatmap visualization.",
          variant: "default",
        });
      }
      setHeatmapResult(result);
      if (result.analysis && result.analysis.toLowerCase().includes("error generating heatmap")) {
         toast({
            title: "Heatmap Generation Issue",
            description: "There was an issue generating the heatmap. Displaying partial results.",
            variant: "destructive"
        });
      } else {
        toast({
            title: "Heatmap Generated",
            description: "Visitor activity heatmap and analysis complete.",
        });
      }
    } catch (error) {
      console.error("Error generating heatmap:", error);
      const newSeed = `heatmap-${Date.now()}`;
      setCurrentPlaceholderSeed(newSeed);
      setHeatmapResult({
        heatmapDataUri: `https://picsum.photos/seed/${newSeed}/800/600`,
        analysis: "Failed to generate heatmap. Displaying placeholder. " + ((error as Error).message || "An unexpected error occurred.")
      });
      toast({
        title: "Error Generating Heatmap",
        description: (error as Error).message || "An unexpected error occurred. Displaying placeholder.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-generate a default heatmap on initial load for demo purposes
  useEffect(() => {
    handleGenerateHeatmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <Card className="shadow-lg" data-ai-hint="heatmap analytics">
      <CardHeader>
        <CardTitle>Gallery Activity Heatmap</CardTitle>
        <CardDescription>Visualize visitor engagement and identify popular zones using AI-generated heatmaps.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="galleryLayoutDesc">Gallery Layout Description</Label>
            <Textarea
              id="galleryLayoutDesc"
              value={galleryLayout}
              onChange={(e) => setGalleryLayout(e.target.value)}
              placeholder="Describe the gallery layout, exhibit locations..."
              rows={4}
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="visitorDataDesc">Visitor Data Description</Label>
            <Textarea
              id="visitorDataDesc"
              value={visitorData}
              onChange={(e) => setVisitorData(e.target.value)}
              placeholder="Describe visitor data, timestamps, locations..."
              rows={4}
              className="mt-1"
              disabled={isLoading}
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="ml-4 text-lg">Generating Heatmap...</p>
          </div>
        )}

        {heatmapResult && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generated Heatmap</h3>
            <div className="relative w-full overflow-hidden border rounded-md aspect-video bg-muted">
              {heatmapResult.heatmapDataUri ? (
                <Image
                  src={heatmapResult.heatmapDataUri}
                  alt="Visitor Activity Heatmap"
                  layout="fill"
                  objectFit="contain"
                  key={heatmapResult.heatmapDataUri.startsWith('https://picsum.photos') ? currentPlaceholderSeed : 'ai-heatmap'} // Force re-render for placeholder
                />
              ) : (
                 <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                    Heatmap image is not available.
                 </div>
              )}
            </div>
            <h3 className="text-lg font-semibold">Analysis</h3>
            <p className="p-4 text-sm border rounded-md bg-secondary/30 text-secondary-foreground whitespace-pre-wrap">
              {heatmapResult.analysis}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateHeatmap} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {heatmapResult ? 'Regenerate Heatmap' : 'Generate Heatmap'}
        </Button>
      </CardFooter>
    </Card>
  );
}
