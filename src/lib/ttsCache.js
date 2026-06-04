const DB_NAME = 'bj-tts'
const STORE = 'clips'
const MAX_ENTRIES = 250

let dbPromise = null

function openDB() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2)
    req.onupgradeneeded = (e) => {
      const db = req.result
      // v2: wipe any v1 store that may contain stale non-audio blobs
      if (e.oldVersion < 2 && db.objectStoreNames.contains(STORE)) {
        db.deleteObjectStore(STORE)
      }
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'k' }).createIndex('t', 't')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => {
      dbPromise = null
      reject(req.error)
    }
  })
  return dbPromise
}

export async function getCached(key) {
  try {
    const db = await openDB()
    return await new Promise((resolve) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key)
      req.onsuccess = () => resolve(req.result?.blob ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export async function setCached(key, blob) {
  try {
    const db = await openDB()

    const count = await new Promise((resolve) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).count()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(0)
    })

    if (count >= MAX_ENTRIES) {
      await new Promise((resolve) => {
        const tx = db.transaction(STORE, 'readwrite')
        const cursor = tx.objectStore(STORE).index('t').openCursor()
        let deleted = 0
        cursor.onsuccess = (e) => {
          const c = e.target.result
          if (c && deleted < 30) {
            c.delete()
            deleted++
            c.continue()
          }
        }
        tx.oncomplete = resolve
        tx.onerror = resolve
      })
    }

    await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put({ k: key, blob, t: Date.now() })
      tx.oncomplete = resolve
      tx.onerror = resolve
    })
  } catch {
    // Cache write failure is non-fatal
  }
}
