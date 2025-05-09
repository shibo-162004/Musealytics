'use server';
/**
 * @fileOverview Generates a heatmap of visitor activity in the museum.
 *
 * - generateHeatmap - A function that generates a heatmap based on visitor data.
 * - GenerateHeatmapInput - The input type for the generateHeatmap function.
 * - GenerateHeatmapOutput - The return type for the generateHeatmap function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateHeatmapInputSchema = z.object({
  galleryLayout: z
    .string()
    .describe('Description of the gallery layout, including exhibit locations.'),
  visitorData: z
    .string()
    .describe(
      'Visitor data, including timestamps and locations, suitable for heatmap generation.'
    ),
});

export type GenerateHeatmapInput = z.infer<typeof GenerateHeatmapInputSchema>;

const GenerateHeatmapOutputSchema = z.object({
  heatmapDataUri: z
    .string()
    .describe(
      'A data URI containing the generated heatmap image, must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  analysis: z
    .string()
    .describe(
      'An analysis of the heatmap, highlighting popular and underutilized areas.'
    ),
});

export type GenerateHeatmapOutput = z.infer<typeof GenerateHeatmapOutputSchema>;

export async function generateHeatmap(input: GenerateHeatmapInput): Promise<GenerateHeatmapOutput> {
  return generateHeatmapFlow(input);
}

const generateHeatmapPrompt = ai.definePrompt({
  name: 'generateHeatmapPrompt',
  input: {schema: GenerateHeatmapInputSchema},
  output: {schema: GenerateHeatmapOutputSchema},
  prompt: `You are an expert in generating heatmaps for museum visitor data and
  analyzing visitor behavior. Given the gallery layout and visitor data, generate a
  heatmap image and provide an analysis of popular and underutilized areas.

  Gallery Layout: {{{galleryLayout}}}
  Visitor Data: {{{visitorData}}}

  Please generate the heatmap image and provide an analysis of the visitor activity.
  The heatmap should visually represent visitor density and dwell times across
  the gallery.
  {{#if heatmapDataUri}}
  {{media url=heatmapDataUri}}
  {{/if}}`,
});

const generateHeatmapFlow = ai.defineFlow(
  {
    name: 'generateHeatmapFlow',
    inputSchema: GenerateHeatmapInputSchema,
    outputSchema: GenerateHeatmapOutputSchema,
  },
  async input => {
    const {output} = await generateHeatmapPrompt(input);
    return output!;
  }
);
