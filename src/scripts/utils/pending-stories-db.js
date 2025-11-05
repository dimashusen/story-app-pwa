// IndexedDB untuk menyimpan cerita yang pending (offline)
const DB_NAME = 'storyverse-pending-db';
const DB_VERSION = 1;
const STORE_NAME = 'pending-stories';

const PendingStoriesDB = {
  // Buka database
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Buat object store jika belum ada
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  },

  // Simpan cerita pending
  async addPendingStory(storyData) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const pendingStory = {
        ...storyData,
        timestamp: Date.now(),
        status: 'pending'
      };

      const request = store.add(pendingStory);
      
      request.onsuccess = () => {
        console.log('Cerita berhasil disimpan untuk upload nanti:', request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  // Ambil semua cerita pending
  async getAllPendingStories() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  // Hapus cerita pending setelah berhasil diupload
  async deletePendingStory(id) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Cerita pending berhasil dihapus:', id);
        resolve();
      };
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  // Update status cerita pending
  async updatePendingStoryStatus(id, status) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const story = getRequest.result;
        if (story) {
          story.status = status;
          const updateRequest = store.put(story);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Story not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  // Hitung jumlah cerita pending
  async getPendingCount() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  }
};

export default PendingStoriesDB;

