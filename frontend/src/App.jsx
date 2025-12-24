import React, { useState } from 'react';
import UploadMedia from './components/UploadMedia';
import MediaGallery from './components/MediaGallery';
import './App.css';

import SignagePlayer from './components/SignagePlayer';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSignage, setShowSignage] = useState(false);

  // Auto-start signage if 'mode=player' is in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'player') {
      setShowSignage(true);
      console.log("[Auto-Start] Mode 'player' detected. Bypassing manual entry.");
    }
  }, []);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEnterSignage = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
    setShowSignage(true);
  };

  const handleExitSignage = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
    setShowSignage(false);
  };

  if (showSignage) {
    return <SignagePlayer onBack={handleExitSignage} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Media Signage</h1>
        <button className="btn-primary" onClick={handleEnterSignage}>
          ▶ Play Signage
        </button>
      </header>

      <UploadMedia onUploadSuccess={handleUploadSuccess} />
      <hr />
      <MediaGallery refreshTrigger={refreshTrigger} />
    </div>
  );
}

export default App;
