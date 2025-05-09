'use server';

/**
 * @fileOverview AI-powered video analytics system for museums.
 *
 * - analyzeVisitorBehavior - A function that handles the visitor density and dwell time analysis.
 * - AnalyzeVisitorBehaviorInput - The input type for the analyzeVisitorBehavior function.
 * - AnalyzeVisitorBehaviorOutput - The return type for the analyzeVisitorBehavior function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeVisitorBehaviorInputSchema = z.object({
  cameraFrameDataUri: z
    .string()
    .describe(
      "A frame captured from a museum's CCTV camera, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  cameraLocationDescription: z
    .string()
    .describe('The description of the camera location in the museum.'),
  exhibitOfInterest: z.string().describe('The name of the exhibit of interest.'),
});
export type AnalyzeVisitorBehaviorInput = z.infer<typeof AnalyzeVisitorBehaviorInputSchema>;

const AnalyzeVisitorBehaviorOutputSchema = z.object({
  visitorDensity: z
    .number()
    .describe('The number of visitors detected in the camera frame.'),
  averageDwellTimeSeconds: z
    .number()
    .describe(
      'The estimated average dwell time in seconds of visitors at the specified exhibit, based on the camera frame analysis.'
    ),
  engagementLevel: z
    .string()
    .describe(
      'A qualitative assessment of visitor engagement at the exhibit (e.g., low, medium, high) based on density and dwell time.'
    ),
  anonymizedVisitorData: z
    .string()
    .describe(
      'Anonymized data log including date, time, camera location, dwell time, and estimated age/gender (if available).'
    ),
});
export type AnalyzeVisitorBehaviorOutput = z.infer<typeof AnalyzeVisitorBehaviorOutputSchema>;

export async function analyzeVisitorBehavior(
  input: AnalyzeVisitorBehaviorInput
): Promise<AnalyzeVisitorBehaviorOutput> {
  return analyzeVisitorBehaviorFlow(input);
}

const analyzeVisitorBehaviorPrompt = ai.definePrompt({
  name: 'analyzeVisitorBehaviorPrompt',
  input: {schema: AnalyzeVisitorBehaviorInputSchema},
  output: {schema: AnalyzeVisitorBehaviorOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing visitor behavior in museums using CCTV camera footage.

  You will receive a frame from a CCTV camera, its location description, and the exhibit of interest. Your task is to analyze the visitor density and estimate the dwell time at the specified exhibit.

  Based on the analysis, determine the visitor density, estimate the average dwell time in seconds, and provide a qualitative assessment of visitor engagement (low, medium, high).

  Also, generate an anonymized data log including date, time, camera location, dwell time, and estimated age/gender (if available).

  Museum Location Description: {{{cameraLocationDescription}}}
  Exhibit of Interest: {{{exhibitOfInterest}}}
  Camera Frame: {{media url=cameraFrameDataUri}}

  Considerations:
  - High visitor density and long dwell times indicate high engagement.
  - Low visitor density and short dwell times indicate low engagement.
  - Use the camera frame and location description to accurately estimate density and dwell time.
  - Anonymize all visitor data to protect privacy.
  `,
});

const analyzeVisitorBehaviorFlow = ai.defineFlow(
  {
    name: 'analyzeVisitorBehaviorFlow',
    inputSchema: AnalyzeVisitorBehaviorInputSchema,
    outputSchema: AnalyzeVisitorBehaviorOutputSchema,
  },
  async input => {
    const {output} = await analyzeVisitorBehaviorPrompt(input);
    return output!;
  }
);
