import React, { useState } from 'react';
import { uploadMedia } from '../api/api';

const UploadMedia = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await uploadMedia(formData);
            setFile(null);
            // Reset file input
            document.getElementById('fileInput').value = '';
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error(err);
            setError('Failed to upload media');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <h3>Upload Media</h3>
            <form onSubmit={handleUpload}>
                <input
                    id="fileInput"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                />
                <button type="submit" disabled={!file || uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default UploadMedia;
