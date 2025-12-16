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
        <div className="gallery-container">
            <h3>Media Gallery</h3>
            {loading ? <p>Loading...</p> : (
                <div className="media-grid">
                    {mediaList.map((item) => (
                        <div key={item.id} className="media-card">
                            {item.type === 'video' ? (
                                <video src={item.url} controls width="100%" />
                            ) : (
                                <img src={item.url} alt="Uploaded" width="100%" />
                            )}
                            <button
                                className="delete-btn"
                                onClick={() => handleDelete(item.id)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                    {mediaList.length === 0 && <p>No media found.</p>}
                </div>
            )}
        </div>
    );
};

export default MediaGallery;
