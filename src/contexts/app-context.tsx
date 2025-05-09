"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CameraConfig, EnvironmentalSettings } from '@/lib/constants';
import { getDefaultCameraLayout, defaultEnvironmentalSettings, DEFAULT_NUM_CAMERAS } from '@/lib/constants';

interface AppContextType {
  cameraLayout: CameraConfig[];
  setCameraLayout: Dispatch<SetStateAction<CameraConfig[]>>;
  environmentalSettings: EnvironmentalSettings;
  setEnvironmentalSettings: Dispatch<SetStateAction<EnvironmentalSettings>>;
  simulatedVisitorDensity: number;
  setSimulatedVisitorDensity: Dispatch<SetStateAction<number>>;
  isMobile: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [cameraLayout, setCameraLayout] = useState<CameraConfig[]>(getDefaultCameraLayout());
  const [environmentalSettings, setEnvironmentalSettings] = useState<EnvironmentalSettings>(defaultEnvironmentalSettings);
  const [simulatedVisitorDensity, setSimulatedVisitorDensity] = useState<number>(5); // Default mock density
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Load saved settings from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('cameraLayout');
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        if (Array.isArray(parsedLayout) && parsedLayout.length === DEFAULT_NUM_CAMERAS) {
           setCameraLayout(parsedLayout);
        } else {
            // If data is malformed or wrong number of cameras, reset to default
            setCameraLayout(getDefaultCameraLayout());
            localStorage.setItem('cameraLayout', JSON.stringify(getDefaultCameraLayout()));
        }
      } catch (error) {
        console.error("Failed to parse camera layout from localStorage", error);
        setCameraLayout(getDefaultCameraLayout());
      }
    }

    const savedEnvSettings = localStorage.getItem('environmentalSettings');
    if (savedEnvSettings) {
       try {
        const parsedSettings = JSON.parse(savedEnvSettings);
        // Basic validation for settings
        if (typeof parsedSettings.acThreshold === 'number' && typeof parsedSettings.lightsThreshold === 'number') {
            setEnvironmentalSettings(parsedSettings);
        } else {
            setEnvironmentalSettings(defaultEnvironmentalSettings);
            localStorage.setItem('environmentalSettings', JSON.stringify(defaultEnvironmentalSettings));
        }
      } catch (error) {
        console.error("Failed to parse environmental settings from localStorage", error);
        setEnvironmentalSettings(defaultEnvironmentalSettings);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('cameraLayout', JSON.stringify(cameraLayout));
  }, [cameraLayout]);

  useEffect(() => {
    localStorage.setItem('environmentalSettings', JSON.stringify(environmentalSettings));
  }, [environmentalSettings]);


  return (
    <AppContext.Provider value={{
      cameraLayout,
      setCameraLayout,
      environmentalSettings,
      setEnvironmentalSettings,
      simulatedVisitorDensity,
      setSimulatedVisitorDensity,
      isMobile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}
