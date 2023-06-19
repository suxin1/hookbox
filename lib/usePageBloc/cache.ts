export default {
  __data__: {},
  getItem(key) {
    return this.__data__[key] || null;
  },
  setItem(key, data) {
    this.__data__[key] = data;
  },
  removeItem(key) {
    delete this.__data__[key];
  },
};
