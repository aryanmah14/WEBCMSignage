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
            <h3 className="upload-title">Upload New Content</h3>
            <form onSubmit={handleUpload}>
                <div className="file-input-wrapper">
                    <button type="button" className="btn-upload">
                        {file ? file.name : 'Choose File...'}
                    </button>
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                    />
                    <button type="submit" className="btn-submit" disabled={!file || uploading}>
                        {uploading ? 'Uploading...' : 'Upload Media'}
                    </button>
                </div>
            </form>
            {error && <p style={{ color: 'var(--danger)', marginTop: '10px' }}>{error}</p>}
        </div>
    );
};

export default UploadMedia;
