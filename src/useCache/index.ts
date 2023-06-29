/**
 * Simple Cache
 * Cache level:
 *    1: Memory
 *    2: Session Storage
 *    3: Local Storage
 */
import {useEffect, useState, useMemo} from "react";

import Cache from "../utils/cache";

function useCache(name, getter, level = 1, expireIn, forceUpdate = false, dependencies = []) {
  const cache = useMemo(() => new Cache(level, name), [level, name]);

  const [data, setData] = useState(cache.get());

  useEffect(() => {
    if (!data || forceUpdate) {
      getter().then((res) => {
        cache.set(res, expireIn);
        setData(res);
      });
    }
  }, dependencies);

  return [data, cache.clear, cache.update];
}

export default useCache;
