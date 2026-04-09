const DB_NAME = 'gymtracker-media';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runTransaction(mode, handler) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    let result;
    try {
      result = handler(store);
    } catch (error) {
      reject(error);
      db.close();
      return;
    }

    transaction.oncomplete = () => {
      resolve(result);
      db.close();
    };
    transaction.onerror = () => {
      reject(transaction.error);
      db.close();
    };
  });
}

export async function getAllPhotos() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve((request.result || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
}

export function replaceAllPhotos(photos) {
  return runTransaction('readwrite', (store) => {
    store.clear();
    photos.forEach((photo) => store.put(photo));
  });
}

export function clearPhotos() {
  return runTransaction('readwrite', (store) => store.clear());
}
