// src/utils/cache.utils.ts
interface CacheData {
    data: any;
    timestamp: number;
  }
  
  const CACHE_KEY = 'menu_combinaciones';
  const CACHE_TIME = 1000 * 60 * 60; // 1 hora
  
  export const cacheUtils = {
    set: (data: any) => {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    },
  
    get: (): any | null => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp }: CacheData = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_TIME) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return data;
    },
  
    clear: () => {
      localStorage.removeItem(CACHE_KEY);
    }
  };