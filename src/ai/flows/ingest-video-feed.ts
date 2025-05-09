// src/ai/flows/ingest-video-feed.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for ingesting multiple CCTV video feeds.
 *
 * - ingestMultipleCCTVFeeds - A function that handles the ingestion of multiple CCTV video feeds.
 * - IngestMultipleCCTVFeedsInput - The input type for the ingestMultipleCCTVFeeds function.
 * - IngestMultipleCCTVFeedsOutput - The return type for the ingestMultipleCCTVFeeds function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IngestMultipleCCTVFeedsInputSchema = z.object({
  cameraFeeds: z.array(
    z.string().describe("A data URI representing a CCTV camera feed. Expected format: 'data:<mimetype>;base64,<encoded_data>'.")
  ).describe('An array of CCTV camera feed data URIs.'),
  arrangementDescription: z.string().optional().describe('Optional description of the gallery arrangement and camera locations.'),
});
export type IngestMultipleCCTVFeedsInput = z.infer<typeof IngestMultipleCCTVFeedsInputSchema>;

const IngestMultipleCCTVFeedsOutputSchema = z.object({
  frameAnalysis: z.array(
    z.object({
      cameraIndex: z.number().describe('The index of the camera feed in the input array.'),
      analysisResult: z.string().describe('The AI analysis result for the corresponding camera feed.'),
    })
  ).describe('An array of analysis results for each camera feed.'),
});
export type IngestMultipleCCTVFeedsOutput = z.infer<typeof IngestMultipleCCTVFeedsOutputSchema>;

export async function ingestMultipleCCTVFeeds(input: IngestMultipleCCTVFeedsInput): Promise<IngestMultipleCCTVFeedsOutput> {
  return ingestMultipleCCTVFeedsFlow(input);
}

const analyzeFramePrompt = ai.definePrompt({
  name: 'analyzeFramePrompt',
  input: {
    schema: z.object({
      cameraFeed: z.string().describe("A data URI representing a CCTV camera feed. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
      arrangementDescription: z.string().optional().describe('Optional description of the gallery arrangement and camera locations.'),
    }),
  },
  output: {
    schema: z.object({
      analysisResult: z.string().describe('The AI analysis result for the camera feed.'),
    }),
  },
  prompt: `You are an AI assistant that analyzes CCTV camera feeds in a museum setting. Analyze the provided camera feed for visitor density, dwell time at exhibits, and any unusual behavior.  If arrangementDescription is provided, take it into account when analyzing the feeds. 

Camera Feed: {{media url=cameraFeed}}

{{#if arrangementDescription}}
Gallery Arrangement Description: {{{arrangementDescription}}}
{{/if}}

Provide a concise analysis of the scene.

Format your response as a JSON object with an "analysisResult" field.`, // add JSON formatting
});

const ingestMultipleCCTVFeedsFlow = ai.defineFlow(
  {
    name: 'ingestMultipleCCTVFeedsFlow',
    inputSchema: IngestMultipleCCTVFeedsInputSchema,
    outputSchema: IngestMultipleCCTVFeedsOutputSchema,
  },
  async input => {
    const analysisResults = await Promise.all(
      input.cameraFeeds.map(async (cameraFeed, index) => {
        const {output} = await analyzeFramePrompt({
          cameraFeed: cameraFeed,
          arrangementDescription: input.arrangementDescription,
        });
        return {
          cameraIndex: index,
          analysisResult: output!.analysisResult,
        };
      })
    );

    return {
      frameAnalysis: analysisResults,
    };
  }
);
