export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  source: 'local' | 'archive' | 'curated' | 'radio';
  favorite: boolean;
  addedAt: number;
  blob?: Blob;
  filename?: string;
  lyrics?: string;
  sourceUrl?: string;
  licenseUrl?: string;
  mood?: string;
  instrumental?: boolean;
  lyricOffset?: number;
  live?: boolean;
}

let database: Promise<IDBDatabase> | undefined;
function openLibrary() {
  return database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('sakura-music-library', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('tracks', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readLibrary(): Promise<MusicTrack[]> {
  const db = await openLibrary();
  return new Promise((resolve, reject) => {
    const request = db.transaction('tracks').objectStore('tracks').getAll();
    request.onsuccess = () => resolve((request.result as MusicTrack[]).sort((a,b) => a.addedAt - b.addedAt).map(track => ({ ...track, src: track.blob ? URL.createObjectURL(track.blob) : track.src })));
    request.onerror = () => reject(request.error);
  });
}
export async function writeTrack(track: MusicTrack) {
  const db = await openLibrary();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('tracks', 'readwrite');
    transaction.objectStore('tracks').put({ ...track, src: track.source === 'local' ? '' : track.src });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
export async function deleteTrack(id: string) {
  const db = await openLibrary();
  return new Promise<void>((resolve,reject) => {
    const transaction = db.transaction('tracks','readwrite');
    transaction.objectStore('tracks').delete(id);
    transaction.oncomplete=()=>resolve();
    transaction.onerror=()=>reject(transaction.error);
  });
}
