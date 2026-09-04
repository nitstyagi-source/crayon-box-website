/**
 * Client-Side IndexedDB Offline Queue Manager
 * Buffers turnstile taps, RFID reads, and barcode scans locally
 * when internet is disconnected.
 */

const DB_NAME = 'CBS_Offline_Attendance_DB';
const STORE_NAME = 'offline_tap_queue';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface QueuedTap {
  id?: number;
  studentId: string;
  studentName: string;
  admissionNo: string;
  deviceZone: string;
  authMethod: string;
  direction: 'IN' | 'OUT';
  timestamp: string;
}

/**
 * Queue a tap locally when offline
 */
export async function queueOfflineTap(tap: Omit<QueuedTap, 'id'>): Promise<boolean> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(tap);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Failed to queue offline tap:', e);
    return false;
  }
}

/**
 * Get count of pending offline taps
 */
export async function getOfflineTapCount(): Promise<number> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const countReq = store.count();
      countReq.onsuccess = () => resolve(countReq.result);
      countReq.onerror = () => reject(countReq.error);
    });
  } catch {
    return 0;
  }
}

/**
 * Flush all offline taps to the server
 */
export async function flushOfflineTaps(): Promise<{ flushedCount: number }> {
  try {
    const db = await openDb();
    const taps: QueuedTap[] = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (taps.length === 0) return { flushedCount: 0 };

    // Send batch to server
    const res = await fetch('/api/mobile/attendance/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchTaps: taps })
    });

    // Clear queue upon success
    const clearTx = db.transaction(STORE_NAME, 'readwrite');
    clearTx.objectStore(STORE_NAME).clear();

    return { flushedCount: taps.length };
  } catch (e) {
    console.error('Error flushing offline taps:', e);
    return { flushedCount: 0 };
  }
}
