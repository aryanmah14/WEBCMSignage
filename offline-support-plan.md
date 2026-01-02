# Offline Support implementation Plan for Digital Signage

This document outlines the proposed architecture for adding offline support to the WEBCM Signage application.

## Overview
To handle scenarios where the signage player loses internet connection, we utilize a Progressive Web App (PWA) approach. This ensures that media content (photos and videos) remains available and playback continues uninterrupted.

## Proposed Architecture

### 1. Storage Strategy: IndexedDB
*   **Media Storage:** Videos and images are stored as `Blobs` in IndexedDB.
*   **Capacity:** IndexedDB supports large storage limits (up to 50% of disk space in many browsers), making it suitable for high-definition video files.
*   **Logic:** The application checks the local database before attempting to fetch from the network.

### 2. Service Worker
*   **App Shell Caching:** Caches HTML, CSS, and JS files.
*   **Network Interception:** Intercepts media requests and serves from IndexedDB when offline.

### 3. Synchronization (Weekly Updates)
*   **Frequency:** Every time the player is launched or once a day.
*   **Process:**
    1.  Fetch the latest media manifest from the server.
    2.  Compare local file IDs with the server manifest.
    3.  Download new media items to IndexedDB.
    4.  Prune (delete) media items that are no longer active on the server.

---

## Technical Details

### Key Files to Create/Modify
- `frontend/src/utils/offlineStorage.js`: Utility for IndexedDB operations.
- `frontend/src/components/SignagePlayer.jsx`: Update to prioritize local Blob URLs.
- `frontend/public/service-worker.js`: Handle asset caching and offline fallback.

### Verification Steps
1.  Enable "Offline Mode" in browser dev tools.
2.  Refresh the signage player.
3.  Ensure all currently cached media continues to play in a loop.
4.  Reconnect and verify that new uploads are synced to the local database.
