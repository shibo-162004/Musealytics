
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Video, Users, Settings, BarChart3, Thermometer, Lightbulb } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    title: 'Video Ingestion',
    href: '/ingestion',
    icon: Video,
    label: 'Ingestion',
  },
  {
    title: 'Visitor Analysis',
    href: '/analysis',
    icon: Users,
    label: 'Analysis',
  },
   {
    title: 'Heatmap Generation',
    href: '/heatmap',
    icon: BarChart3,
    label: 'Heatmap',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    label: 'Settings',
  },
];

export const APP_NAME = "Musealytics";

export interface CameraConfig {
  id: number;
  name: string;
  streamUrl?: string; // Placeholder for future use (e.g., IP cameras), not used for local webcam feeds
  x: number; // Grid column start (0-indexed)
  y: number; // Grid row start (0-indexed)
  colSpan: number;
  rowSpan: number;
}

export interface EnvironmentalSettings {
  acThreshold: number;
  lightsThreshold: number;
}

export const DEFAULT_NUM_CAMERAS = 10;

export const getDefaultCameraLayout = (): CameraConfig[] => Array.from({ length: DEFAULT_NUM_CAMERAS }, (_, i) => ({
  id: i,
  name: `Camera ${i + 1}`,
  // streamUrl: `https://picsum.photos/seed/${i + 1}/400/300`, // Not used by live CameraFeed
  x: i % 5, // Default 2 rows of 5
  y: Math.floor(i / 5),
  colSpan: 1,
  rowSpan: 1,
}));

export const defaultEnvironmentalSettings: EnvironmentalSettings = {
  acThreshold: 20,
  lightsThreshold: 10,
};

export const MOCK_GALLERY_LAYOUT_DESC = "Main hall with three large exhibits (A, B, C) in the center, surrounded by smaller displays along the walls. Entrance on the south, exit on the north.";
export const MOCK_VISITOR_DATA_DESC = "Visitor data from 2024-07-26, 10:00-12:00. High traffic around Exhibit B, moderate at Exhibit A, low at Exhibit C. Average dwell time at Exhibit B: 5 minutes.";

export const ICONS = {
  LayoutDashboard,
  Video,
  Users,
  Settings,
  BarChart3,
  Thermometer,
  Lightbulb,
};
