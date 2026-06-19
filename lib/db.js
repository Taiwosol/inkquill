import Dexie from 'dexie';

export const db = new Dexie('InkQuill');
db.version(2).stores({
  notes: 'id, title, content, updatedAt, syncedAt, tags'
}).upgrade(tx => {
  // Add tags field to existing notes
  return tx.notes.toCollection().modify(note => {
    note.tags = note.tags || [];
  });
});
