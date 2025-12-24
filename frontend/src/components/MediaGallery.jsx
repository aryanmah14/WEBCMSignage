import React, { useEffect, useState } from 'react';
import { getMediaList, deleteMedia, toggleMediaStatus, updateMediaDuration } from '../api/api';

const MediaGallery = ({ refreshTrigger }) => {
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const { data } = await getMediaList();
            setMediaList(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, [refreshTrigger]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await deleteMedia(id);
            fetchMedia(); // Refresh list
        } catch (err) {
            alert('Failed to delete media', err);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleMediaStatus(id);
            fetchMedia(); // Refresh list to reflect status changes
        } catch (err) {
            console.error('Failed to toggle status:', err);
            alert('Failed to update status');
        }
    };

    const handleDurationChange = async (id, newDuration) => {
        try {
            // Convert seconds to ms for backend
            const ms = parseInt(newDuration) * 1000;
            if (isNaN(ms) || ms < 1000) return; // Min 1s
            await updateMediaDuration(id, ms);
            fetchMedia();
        } catch (err) {
            console.error('Failed to update duration:', err);
        }
    };

    return (
        <div className="gallery-section">
            <h3>Library</h3>
            {loading ? <p>Loading content...</p> : (
                <div className="media-grid">
                    {mediaList.map((item) => (
                        <div key={item.id} className={`media-card ${!item.is_enabled ? 'media-disabled' : ''}`}>
                            {item.type === 'video' ? (
                                <video src={item.url} controls className="media-preview" />
                            ) : (
                                <img src={item.url} alt="Uploaded" className="media-preview" />
                            )}

                            <div className="card-actions">
                                <span className={`status-badge ${item.is_enabled ? 'enabled' : 'disabled'}`}>
                                    {item.is_enabled ? 'Enabled' : 'Disabled'}
                                </span>
                                <button
                                    className={`toggle-btn ${item.is_enabled ? 'btn-disable' : 'btn-enable'}`}
                                    onClick={() => handleToggleStatus(item.id)}
                                    title={item.is_enabled ? 'Disable' : 'Enable'}
                                >
                                    {item.is_enabled ? '🚫 Disable' : '✅ Enable'}
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(item.id)}
                                    title="Delete"
                                >
                                    🗑️ Remove
                                </button>
                            </div>

                            {item.type === 'image' && (
                                <div className="duration-settings">
                                    <label>Duration (sec):</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        defaultValue={item.duration / 1000 || 3}
                                        onBlur={(e) => handleDurationChange(item.id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleDurationChange(item.id, e.target.value);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {mediaList.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No media uploaded yet.</p>}
                </div>
            )}
        </div>
    );
};

export default MediaGallery;
