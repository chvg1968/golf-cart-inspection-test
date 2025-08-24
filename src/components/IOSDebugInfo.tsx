import React, { useState } from "react";
import { isIOS, isSafari, getIOSBrowser } from "../utils/platform";

export const IOSDebugInfo: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);

  if (!isIOS()) return null;

  const debugInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isIOS: isIOS(),
    isSafari: isSafari(),
    browser: getIOSBrowser(),
    maxTouchPoints: navigator.maxTouchPoints,
    hasTouch: 'ontouchstart' in window,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    },
    supports: {
      webkitAppearance: 'WebkitAppearance' in document.documentElement.style,
      createObjectURL: 'URL' in window && 'createObjectURL' in URL,
      fileReader: 'FileReader' in window,
      windowOpen: typeof window.open === 'function'
    }
  };

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-1 rounded text-xs z-50"
        style={{ fontSize: '10px' }}
      >
        iOS Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 max-w-lg w-full max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">iOS Debug Info</h3>
          <button
            onClick={() => setShowDebug(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2 text-xs">
          <div>
            <strong>Browser:</strong> {debugInfo.browser}
          </div>
          <div>
            <strong>Is iOS:</strong> {debugInfo.isIOS ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Is Safari:</strong> {debugInfo.isSafari ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Platform:</strong> {debugInfo.platform}
          </div>
          <div>
            <strong>Max Touch Points:</strong> {debugInfo.maxTouchPoints}
          </div>
          <div>
            <strong>Has Touch:</strong> {debugInfo.hasTouch ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Viewport:</strong> {debugInfo.viewport.width}x{debugInfo.viewport.height} (DPR: {debugInfo.viewport.devicePixelRatio})
          </div>
          
          <div className="mt-4">
            <strong>Feature Support:</strong>
            <ul className="ml-4 mt-1">
              <li>WebKit Appearance: {debugInfo.supports.webkitAppearance ? '✓' : '✗'}</li>
              <li>Object URL: {debugInfo.supports.createObjectURL ? '✓' : '✗'}</li>
              <li>File Reader: {debugInfo.supports.fileReader ? '✓' : '✗'}</li>
              <li>Window Open: {debugInfo.supports.windowOpen ? '✓' : '✗'}</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <strong>User Agent:</strong>
            <div className="bg-gray-100 p-2 rounded text-xs break-all">
              {debugInfo.userAgent}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(JSON.stringify(debugInfo, null, 2));
              alert('Debug info copied to clipboard');
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
          >
            Copy Info
          </button>
          <button
            onClick={() => setShowDebug(false)}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};