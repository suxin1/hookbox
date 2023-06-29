const ONE_DAY_TIME = 1000;

export function dataPackaging(data, expireIn) {
  return {
    content: data,
    timestamp: Date.now(),
    expireTime: expireIn ? Date.now() + expireIn * ONE_DAY_TIME : null,
  };
}

export function dataUnpack(packedData) {
  if (!packedData) return null;
  const { expireTime, content } = packedData;
  if (expireTime) {
    const now = Date.now();
    if (now >= expireTime) {
      return null;
    }
  }
  return content;
}

export class MemoryStorage {
  __data__ = {};

  getItem(key) {
    return this.__data__[key] || null;
  }

  setItem(key, data) {
    this.__data__[key] = data;
  }

  removeItem(key) {
    delete this.__data__[key];
  }
}

class Cache {
  storage = null;
  key = null;

  constructor(type, key) {
    this.key = key + "_CACHE";

    switch (type) {
      case 1:
        this.storage = new MemoryStorage();
        break;
      case 2:
        this.storage = sessionStorage;
        break;
      case 3:
        this.storage = localStorage;
        break;
      default:
        this.storage = new MemoryStorage();
    }

    this.update = this.update.bind(this);
    this.clear = this.clear.bind(this);
  }

  set(data, expireDay) {
    let packed = dataPackaging(data, expireDay);
    this.storage.setItem(this.key, JSON.stringify(packed));
  }

  get() {
    return dataUnpack(JSON.parse(this.storage.getItem(this.key)));
  }

  update(data) {
    let unpacked = dataUnpack(JSON.parse(this.storage.getItem(this.key)));
    unpacked.content = data;
    this.storage.setItem(this.key, JSON.stringify(unpacked));
  }

  clear() {
    this.storage.removeItem(this.key);
  }
}

export default Cache;
