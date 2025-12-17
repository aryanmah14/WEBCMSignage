import React, { useEffect, useState } from 'react';
import { getMediaList, deleteMedia } from '../api/api';

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
            alert('Failed to delete media');
        }
    };

    return (
        <div className="gallery-section">
            <h3>Library</h3>
            {loading ? <p>Loading content...</p> : (
                <div className="media-grid">
                    {mediaList.map((item) => (
                        <div key={item.id} className="media-card">
                            {item.type === 'video' ? (
                                <video src={item.url} controls className="media-preview" />
                            ) : (
                                <img src={item.url} alt="Uploaded" className="media-preview" />
                            )}

                            <div className="card-actions">
                                <span className="tag-badge">{item.type}</span>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(item.id)}
                                    title="Delete"
                                >
                                    🗑️ Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    {mediaList.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No media uploaded yet.</p>}
                </div>
            )}
        </div>
    );
};

export default MediaGallery;
