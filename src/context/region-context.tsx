
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Region = 'UK' | 'EU';

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  // Set default region to 'UK'
  const [region, setRegionState] = useState<Region>('UK');

  useEffect(() => {
    // Load region from local storage on initial render
    const storedRegion = localStorage.getItem('verse3-region') as Region | null;
    if (storedRegion && ['UK', 'EU'].includes(storedRegion)) {
      setRegionState(storedRegion);
    }
  }, []);

  const setRegion = (newRegion: Region) => {
    // Save region to local storage and update state
    localStorage.setItem('verse3-region', newRegion);
    setRegionState(newRegion);
  };

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
