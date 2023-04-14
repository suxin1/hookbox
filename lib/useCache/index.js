/**
 * Simple Cache
 * Cache level:
 *    1: Memory
 *    2: Session Storage
 *    3: Local Storage
 */
import {useEffect, useState} from "react";

import Cache from "./cache";

function useCache(name, getter, level = 1, expireDays) {
  const cache = new Cache(level, name);

  const [data, setData] = useState(cache.get());

  useEffect(async () => {
    if (!data) {
      const res = await getter();

      cache.set(res, expireDays);
      setData(res);
    }
  }, []);

  return [data, cache.update, cache.clear];
}

export default useCache;
