/**
 * Simple Cache
 * Cache level:
 *    1: Memory
 *    2: Session Storage
 *    3: Local Storage
 */
import { useEffect, useState, useMemo } from "react";

import Cache from "../utils/cache";

function useCache(name, getter, level = 1, expireDays) {
  const cache = useMemo(() => new Cache(level, name), [level, name]);

  const [data, setData] = useState(cache.get());

  useEffect(() => {
    if (!data) {
      getter().then((res) => {
        cache.set(res, expireDays);
        setData(res);
      });
    }
  }, []);

  return [data, cache.update, cache.clear];
}

export default useCache;
