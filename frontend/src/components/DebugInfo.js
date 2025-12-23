'use client';

import { useState } from 'react';

export default function DebugInfo() {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded text-xs"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="text-xs space-y-1">
        <div>
          <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'undefined'}
        </div>
        <div>
          <strong>Socket URL:</strong> {process.env.NEXT_PUBLIC_SOCKET_URL || 'undefined'}
        </div>
        <div>
          <strong>Environment:</strong> {process.env.NODE_ENV || 'undefined'}
        </div>
        <div>
          <strong>Full Login URL:</strong> {(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/auth/login'}
        </div>
      </div>
    </div>
  );
}