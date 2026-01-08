import React, { useEffect, useState, useRef } from 'react';
import { getMediaList } from '../api/api';
import { offlineStorage } from '../utils/offlineStorage';

const SignagePlayer = ({ onBack }) => {
    const [mediaItems, setMediaItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [downloadStatus, setDownloadStatus] = useState('');
    const videoRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchMedia();
        return () => clearTimer();
    }, []);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const { data } = await getMediaList();
            const enabledMedia = data.filter(item => item.is_enabled !== false);

            console.log("Media fetched from server:", data.length, "items");

            // Sync media to IndexedDB
            await syncMediaItems(enabledMedia);

            // Load from storage to get Blob URLs
            const localMedia = await Promise.all(enabledMedia.map(async (item) => {
                const localUrl = await offlineStorage.getMedia(item.id);
                return { ...item, url: localUrl || item.url };
            }));

            setMediaItems(localMedia);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch media, trying offline mode:", err);
            // Fallback to offline items if possible
            const allKeys = await offlineStorage.getAllIds();
            if (allKeys.length > 0) {
                const localItems = await Promise.all(allKeys.map(async (id) => {
                    const localUrl = await offlineStorage.getMedia(id);
                    return { id, url: localUrl, type: id.includes('video') ? 'video' : 'image' }; // Simplified fallback
                }));
                setMediaItems(localItems);
            }
            setLoading(false);
        }
    };

    const syncMediaItems = async (items) => {
        let downloadedCount = 0;
        const total = items.length;

        for (const item of items) {
            const exists = await offlineStorage.hasMedia(item.id);
            if (!exists) {
                try {
                    setDownloadStatus(`Downloading ${downloadedCount + 1}/${total}: ${item.filename || item.id}`);
                    const response = await fetch(item.url);
                    const blob = await response.blob();
                    await offlineStorage.saveMedia(item.id, blob);
                    downloadedCount++;
                    console.log(`[${downloadedCount}/${total}] Downloaded: ${item.filename || item.id}`);
                } catch (e) {
                    console.error(`Failed to download ${item.id}:`, e);
                }
            } else {
                downloadedCount++;
                console.log(`[${downloadedCount}/${total}] Already exists: ${item.filename || item.id}`);
            }
        }

        if (downloadedCount === total) {
            console.log("All media downloads completed successfully!");
            setDownloadStatus('All media synced');
        }
    };

    useEffect(() => {
        if (mediaItems.length === 0) return;

        const currentItem = mediaItems[currentIndex];
        console.log("Playing:", currentItem.id, "Type:", currentItem.type);

        if (currentItem.type === 'image') {
            clearTimer();
            const duration = currentItem.duration || 3000;
            timerRef.current = setTimeout(nextSlide, duration);
        } else if (currentItem.type === 'video') {
            clearTimer();
            if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(e => console.error("Autoplay failed:", e));
            }
        }
    }, [currentIndex, mediaItems]);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    };

    if (loading) return (
        <div className="signage-screen dark">
            <div className="loading-container">
                <p>Loading content...</p>
                <p className="status-text">{downloadStatus}</p>
            </div>
        </div>
    );

    if (mediaItems.length === 0) return <div className="signage-screen dark">No content available. <button onClick={onBack}>Go Back</button></div>;

    const item = mediaItems[currentIndex];

    return (
        <div className="signage-screen">
            <button className="back-btn" onClick={onBack}>Exit</button>

            <div className="media-content">
                {item.type === 'video' ? (
                    <video
                        ref={videoRef}
                        src={item.url}
                        className="fullscreen-media"
                        autoPlay
                        muted
                        onEnded={nextSlide}
                        onError={(e) => {
                            console.error("Video error:", e);
                            nextSlide();
                        }}
                    />
                ) : (
                    <img
                        src={item.url}
                        alt="Signage"
                        className="fullscreen-media"
                    />
                )}
            </div>
        </div>
    );
};

export default SignagePlayer;
