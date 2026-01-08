import { openDB } from 'idb';

const DB_NAME = 'SignageOfflineDB';
const STORE_NAME = 'media';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
        }
    },
});

export const offlineStorage = {
    async saveMedia(id, blob) {
        const db = await dbPromise;
        await db.put(STORE_NAME, blob, id);
    },

    async getMedia(id) {
        const db = await dbPromise;
        const blob = await db.get(STORE_NAME, id);
        if (!blob) return null;
        return URL.createObjectURL(blob);
    },

    async hasMedia(id) {
        const db = await dbPromise;
        const count = await db.count(STORE_NAME, id);
        return count > 0;
    },

    async getAllIds() {
        const db = await dbPromise;
        return db.getAllKeys(STORE_NAME);
    },

    async deleteMedia(id) {
        const db = await dbPromise;
        await db.delete(STORE_NAME, id);
    }
};
