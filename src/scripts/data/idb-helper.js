// File: src/scripts/data/idb-helper.js
import { openDB } from 'idb';

const DB_NAME = 'storyverse-db';
const STORE_NAME = 'favorite-stories';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
  },
});

const FavoriteStoryIdb = {
  async putStory(story) { return (await dbPromise).put(STORE_NAME, story); },
  async getStory(id) { return (await dbPromise).get(STORE_NAME, id); },
  async getAllStories() { return (await dbPromise).getAll(STORE_NAME); },
  async deleteStory(id) { return (await dbPromise).delete(STORE_NAME, id); },
};

export default FavoriteStoryIdb;