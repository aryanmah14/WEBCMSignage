import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const uploadMedia = (formData) => API.post('/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});

export const getMediaList = () => API.get('/media-list');

export const deleteMedia = (id) => API.delete(`/media/${id}`);

export default API;
