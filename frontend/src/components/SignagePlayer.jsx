import React, { useEffect, useState, useRef } from 'react';
import { getMediaList } from '../api/api';

const SignagePlayer = ({ onBack }) => {
    const [mediaItems, setMediaItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);
    const timerRef = useRef(null);

    // Configuration

    useEffect(() => {
        fetchMedia();
        return () => clearTimer();
    }, []);

    const fetchMedia = async () => {
        try {
            const { data } = await getMediaList();
            // Filter to only play enabled media
            const enabledMedia = data.filter(item => item.is_enabled !== false);
            console.log("Media fetched:", data);
            console.log("Enabled media for playback:", enabledMedia);
            setMediaItems(enabledMedia);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch media:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mediaItems.length === 0) return;

        // Start playback logic for current item
        const currentItem = mediaItems[currentIndex];
        console.log("Playing:", currentItem);

        if (currentItem.type === 'image') {
            clearTimer();
            const duration = currentItem.duration || 3000;
            console.log(`Setting timer for ${duration}ms`);
            timerRef.current = setTimeout(nextSlide, duration);
        } else if (currentItem.type === 'video') {
            clearTimer();
            // Video auto-play is handled by the video element's onEnded event
            // But we need to ensure it plays
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

    if (loading) return <div className="signage-screen dark">Loading content...</div>;
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
