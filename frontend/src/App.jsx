import React, { useState } from 'react';
import UploadMedia from './components/UploadMedia';
import MediaGallery from './components/MediaGallery';
import './App.css';

import SignagePlayer from './components/SignagePlayer';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSignage, setShowSignage] = useState(false);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (showSignage) {
    return <SignagePlayer onBack={() => setShowSignage(false)} />;
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Media Management System</h1>
        <button onClick={() => setShowSignage(true)}>▶ Play Signage</button>
      </div>
      <UploadMedia onUploadSuccess={handleUploadSuccess} />
      <hr />
      <MediaGallery refreshTrigger={refreshTrigger} />
    </div>
  );
}

export default App;
