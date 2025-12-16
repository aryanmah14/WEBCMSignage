import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust if backend port changes
});

export const uploadMedia = (formData) => API.post('/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});

export const getMediaList = () => API.get('/media-list');

export const deleteMedia = (id) => API.delete(`/media/${id}`);

export default API;
