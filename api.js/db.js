// api.js/db.js
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("caritasDB", 1);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pendientes")) {
        db.createObjectStore("pendientes", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

export async function savePendiente(familia) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pendientes", "readwrite");
    const store = tx.objectStore("pendientes");
    const req = store.add(familia);
    req.onsuccess = () => resolve(true);
    req.onerror = e => reject(e.target.error);
  });
}

export async function getPendientes() {
  const db = await openDB();
  return new Promise(resolve => {
    const tx = db.transaction("pendientes", "readonly");
    const store = tx.objectStore("pendientes");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

export async function clearPendiente(id) {
  const db = await openDB();
  return new Promise(resolve => {
    const tx = db.transaction("pendientes", "readwrite");
    const store = tx.objectStore("pendientes");
    store.delete(id);
    tx.oncomplete = () => resolve(true);
  });
}