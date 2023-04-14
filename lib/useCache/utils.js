const ONE_DAY_TIME = 24 * 60 * 60 * 1000;

export function dataPackaging(data, expireIn) {
  return {
    content: data,
    timestamp: Date.now(),
    expireTime: expireIn ? Date.now() + expireIn * ONE_DAY_TIME : null,
  }
}

export function dataUnpack(packedData) {
  if (!packedData) return null;
  const {expireTime, content} = packedData;
  if (expireTime) {
    const now = Date.now();
    if (now >= expireTime) {
      return null;
    }
  }
  return content;
}
