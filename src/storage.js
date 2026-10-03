const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '..', 'data');
const storeFile = path.join(dataDir, 'store.json');

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(storeFile)) {
    fs.writeFileSync(storeFile, JSON.stringify({ products: {}, vouchCount: 0 }, null, 2));
  }
}

function readStore() {
  ensureStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
    return {
      products: parsed.products || {},
      vouchCount: Number(parsed.vouchCount || 0)
    };
  } catch {
    const fresh = { products: {}, vouchCount: 0 };
    fs.writeFileSync(storeFile, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2));
}

module.exports = { readStore, writeStore };
