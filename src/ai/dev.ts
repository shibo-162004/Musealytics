import { config } from 'dotenv';
config();

import '@/ai/flows/generate-heatmap.ts';
import '@/ai/flows/analyze-visitor-behavior.ts';
import '@/ai/flows/ingest-video-feed.ts';