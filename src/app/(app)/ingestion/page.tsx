"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ingestMultipleCCTVFeeds, type IngestMultipleCCTVFeedsInput, type IngestMultipleCCTVFeedsOutput } from '@/ai/flows/ingest-video-feed';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import { DEFAULT_NUM_CAMERAS } from '@/lib/constants';

export default function VideoIngestionPage() {
  const [cameraFeedsData, setCameraFeedsData] = useState<string[]>(Array(DEFAULT_NUM_CAMERAS).fill(''));
  const [arrangementDescription, setArrangementDescription] = useState<string>('');
  const [ingestionResult, setIngestionResult] = useState<IngestMultipleCCTVFeedsOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFeedsData = [...cameraFeedsData];
        newFeedsData[index] = e.target?.result as string;
        setCameraFeedsData(newFeedsData);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    setIngestionResult(null);

    const validFeeds = cameraFeedsData.filter(feed => feed.startsWith('data:image'));
    if (validFeeds.length === 0) {
      toast({
        title: 'No Valid Feeds',
        description: 'Please upload at least one valid image feed.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const input: IngestMultipleCCTVFeedsInput = {
        cameraFeeds: validFeeds,
        arrangementDescription: arrangementDescription || undefined,
      };
      const result = await ingestMultipleCCTVFeeds(input);
      setIngestionResult(result);
      toast({
        title: 'Ingestion Successful',
        description: `Analyzed ${result.frameAnalysis.length} camera feeds.`,
      });
    } catch (error) {
      console.error('Error ingesting video feeds:', error);
      toast({
        title: 'Ingestion Failed',
        description: (error as Error).message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Video Feed Ingestion</CardTitle>
        <CardDescription>
          Upload screen captures from CCTV displays or parallel video feeds for AI analysis.
          Please upload image files (PNG, JPG, WEBP) as simulated camera frames.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="arrangementDescription">Gallery Arrangement Description (Optional)</Label>
          <Textarea
            id="arrangementDescription"
            value={arrangementDescription}
            onChange={(e) => setArrangementDescription(e.target.value)}
            placeholder="Describe gallery layout and camera positions..."
            rows={3}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-4">
          <Label>Camera Feeds (Upload Images)</Label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cameraFeedsData.map((feedData, index) => (
              <div key={index} className="space-y-1">
                <Label htmlFor={`feed-${index}`} className="text-sm">Camera {index + 1}</Label>
                 <div className="flex items-center justify-center w-full">
                    <label
                        htmlFor={`feed-${index}`}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-border hover:bg-accent/10"
                    >
                        {feedData ? (
                            <img src={feedData} alt={`Preview ${index + 1}`} className="object-contain w-full h-full p-1" />
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-1 text-xs text-muted-foreground">
                                    Click to upload
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
                            </div>
                        )}
                        <Input id={`feed-${index}`} type="file" className="hidden" onChange={(e) => handleFileChange(index, e)} accept="image/*" disabled={isLoading} />
                    </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="ml-4 text-lg">Processing Feeds...</p>
          </div>
        )}

        {ingestionResult && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ingestion Results</h3>
            <div className="p-4 space-y-2 border rounded-md max-h-96 overflow-y-auto bg-muted/30">
              {ingestionResult.frameAnalysis.map((analysis, index) => (
                <div key={index} className="p-3 border rounded-md bg-background">
                  <p className="font-medium">Camera {analysis.cameraIndex + 1} Analysis:</p>
                  <p className="text-sm text-muted-foreground">{analysis.analysisResult}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Process Feeds
        </Button>
      </CardFooter>
    </Card>
  );
}
