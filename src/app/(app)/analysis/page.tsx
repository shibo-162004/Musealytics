"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { analyzeVisitorBehavior, type AnalyzeVisitorBehaviorInput, type AnalyzeVisitorBehaviorOutput } from '@/ai/flows/analyze-visitor-behavior';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Download } from 'lucide-react';

export default function VisitorAnalysisPage() {
  const [cameraFrameDataUri, setCameraFrameDataUri] = useState<string>('');
  const [cameraLocationDescription, setCameraLocationDescription] = useState<string>('');
  const [exhibitOfInterest, setExhibitOfInterest] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeVisitorBehaviorOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCameraFrameDataUri(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!cameraFrameDataUri) {
      toast({
        title: 'Missing Frame',
        description: 'Please upload a camera frame image.',
        variant: 'destructive',
      });
      return;
    }
    if (!cameraLocationDescription.trim()) {
       toast({
        title: 'Missing Location',
        description: 'Please provide camera location description.',
        variant: 'destructive',
      });
      return;
    }
     if (!exhibitOfInterest.trim()) {
       toast({
        title: 'Missing Exhibit',
        description: 'Please provide the exhibit of interest.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const input: AnalyzeVisitorBehaviorInput = {
        cameraFrameDataUri,
        cameraLocationDescription,
        exhibitOfInterest,
      };
      const result = await analyzeVisitorBehavior(input);
      setAnalysisResult(result);
      toast({
        title: 'Analysis Complete',
        description: 'Visitor behavior analysis successful.',
      });
    } catch (error) {
      console.error('Error analyzing visitor behavior:', error);
      toast({
        title: 'Analysis Failed',
        description: (error as Error).message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const escapeCsvField = (field: string | number | undefined): string => {
    if (field === undefined || field === null) return '';
    const stringField = String(field);
    // Wrap in quotes if it contains comma, quote, or newline
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const handleDownloadCsv = () => {
    if (!analysisResult) return;

    const headers = ['VisitorDensity', 'AverageDwellTimeSeconds', 'EngagementLevel', 'AnonymizedVisitorDataLog'];
    const row = [
      analysisResult.visitorDensity,
      analysisResult.averageDwellTimeSeconds,
      analysisResult.engagementLevel,
      analysisResult.anonymizedVisitorData,
    ].map(escapeCsvField);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + row.join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `visitor_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Downloaded",
      description: "Visitor analysis data has been downloaded.",
    });
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Visitor Behavior Analysis</CardTitle>
        <CardDescription>
          Analyze visitor density, dwell time, and engagement from a single camera frame.
          Please upload an image file (PNG, JPG, WEBP) as a simulated camera frame.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cameraFrame">Camera Frame (Upload Image)</Label>
            <div className="flex items-center justify-center w-full">
                <label
                    htmlFor="cameraFrame"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer border-border hover:bg-accent/10"
                >
                    {cameraFrameDataUri ? (
                        <img src={cameraFrameDataUri} alt="Camera Frame Preview" className="object-contain w-full h-full p-2" />
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX. 800x400px)</p>
                        </div>
                    )}
                    <Input id="cameraFrame" type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isLoading} />
                </label>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cameraLocation">Camera Location Description</Label>
              <Input
                id="cameraLocation"
                value={cameraLocationDescription}
                onChange={(e) => setCameraLocationDescription(e.target.value)}
                placeholder="e.g., Main Hall, near Dinosaur Exhibit"
                disabled={isLoading}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="exhibitName">Exhibit of Interest</Label>
              <Input
                id="exhibitName"
                value={exhibitOfInterest}
                onChange={(e) => setExhibitOfInterest(e.target.value)}
                placeholder="e.g., T-Rex Skeleton"
                disabled={isLoading}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="ml-4 text-lg">Analyzing Behavior...</p>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Analysis Results</h3>
                <Button onClick={handleDownloadCsv} variant="outline" size="sm" disabled={isLoading}>
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle className="text-base">Visitor Density</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{analysisResult.visitorDensity}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Avg. Dwell Time</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{analysisResult.averageDwellTimeSeconds}s</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Engagement Level</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold capitalize">{analysisResult.engagementLevel}</p></CardContent>
              </Card>
            </div>
            <div>
              <h4 className="font-medium">Anonymized Visitor Data Log:</h4>
              <Textarea
                value={analysisResult.anonymizedVisitorData}
                readOnly
                rows={5}
                className="mt-1 text-sm bg-muted/50"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Analyze Behavior
        </Button>
      </CardFooter>
    </Card>
  );
}
