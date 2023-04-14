import {dataPackaging, dataUnpack} from "./utils";

const memoryStorage = {
  __data__: {},
  getItem(key) {
    return this.__data__[key];
  },
  setItem(key, data) {
    this.__data__[key] = data;
  },
  removeItem(key) {
    delete this.__data__[key];
  }
}

class Cache {
  storage;
  key;

  constructor(type, key) {
    this.key = key + "_CACHE";

    switch (type) {
      case 1:
        this.storage = memoryStorage;
        break;
      case 2:
        this.storage = sessionStorage;
        break;
      case 3:
        this.storage = localStorage;
        break;
      default:
        this.storage = memoryStorage;
    }

    this.update = this.update.bind(this);
    this.clear = this.clear.bind(this);
  }

  set(data, expireDay) {
    let packed = dataPackaging(data, expireDay);
    this.storage.setItem(this.key, JSON.stringify(packed));
  }

  get() {
    return dataUnpack(JSON.parse(this.storage.getItem(this.key)))
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
