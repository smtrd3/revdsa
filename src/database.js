import { openDB } from "idb";

let _db = null;

export async function getDB() {
  if (_db) return _db;

  const db = await openDB("snippets", 1, {
    upgrade: (db) => {
      const store = db.createObjectStore("codeSnippets", {
        keyPath: "id",
        autoIncrement: true,
      });

      store.createIndex("id", "id");
    },
  });

  _db = {
    async getAll() {
      return await db.getAllFromIndex("codeSnippets", "id");
    },
    async get(id) {
      return await db.get("codeSnippets", id);
    },
    async create(snippetData) {
      return await db.add("codeSnippets", snippetData);
    },
    async update(item) {
      const store = db
        .transaction(["codeSnippets"], "readwrite")
        .objectStore("codeSnippets");
      return await store.put(item);
    },
    async delete(id) {
      const store = db
        .transaction(["codeSnippets"], "readwrite")
        .objectStore("codeSnippets");
      return await store.delete(id);
    },
  };

  return _db;
}
