
import { openDB } from 'idb';

const DB_NAME = 'business-hub-files';
const STORE_NAME = 'files';

export const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('projectId', 'projectId', { unique: false });
            }
        },
    });
};

export const saveFile = async (file, projectId, category = 'general') => {
    const db = await initDB();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const fileData = {
        id,
        projectId,
        name: file.name,
        type: file.type,
        size: file.size,
        category, // New field for categorization (contract, invoice, etc.)
        data: file, // Storing the Blob/File object directly
        createdAt: new Date().toISOString(),
    };
    await db.add(STORE_NAME, fileData);
    return fileData;
};

export const getProjectFiles = async (projectId) => {
    const db = await initDB();
    return db.getAllFromIndex(STORE_NAME, 'projectId', projectId);
};

export const deleteFile = async (fileId) => {
    const db = await initDB();
    await db.delete(STORE_NAME, fileId);
};

export const getFile = async (fileId) => {
    const db = await initDB();
    return db.get(STORE_NAME, fileId);
}
