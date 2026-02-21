/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import React, { useEffect, useRef } from 'react';
import { SceneManager } from './three/SceneManager';
import UIOverlay from './components/UIOverlay';
import { useStore } from './store/useStore';
import { Web3Provider } from './components/Web3Provider';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<SceneManager | null>(null);

  useEffect(() => {
    useStore.getState().initSocket();
    if (canvasRef.current && !managerRef.current) {
      managerRef.current = new SceneManager(canvasRef.current);
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.dispose();
        managerRef.current = null;
      }
    };
  }, []);

  return (
    <Web3Provider>
      <div className="relative w-screen h-screen bg-white overflow-hidden">
        {/* Three.js Container */}
        <div ref={canvasRef} className="absolute inset-0 w-full h-full" />
        
        {/* UI Layer */}
        <UIOverlay />
      </div>
    </Web3Provider>
  );
};

export default App;
