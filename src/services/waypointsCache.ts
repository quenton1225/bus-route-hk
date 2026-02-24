import localforage from 'localforage';
import axios from 'axios';

// 创建专用的 waypoints 缓存存储
const waypointsStore = localforage.createInstance({
  name: 'busRouteHK',
  storeName: 'waypoints',
  description: 'Cache for route waypoints data'
});

const isDev = import.meta.env.DEV;
const WAYPOINTS_BASE_URL = isDev
  ? '/api/waypoints'
  : 'https://hkbus.github.io/route-waypoints';

/**
 * 获取 waypoints 数据（带缓存）
 * @param gtfsId 路线的 GTFS ID
 * @param bound 方向 'O' 或 'I'
 * @returns GeoJSON FeatureCollection 或 null
 */
export async function getCachedWaypoints(
  gtfsId: number,
  bound: 'O' | 'I'
): Promise<GeoJSON.FeatureCollection | null> {
  const cacheKey = `${gtfsId}-${bound}`;
  
  try {
    // 1. 尝试从缓存读取
    const cached = await waypointsStore.getItem<GeoJSON.FeatureCollection>(cacheKey);
    if (cached) {
      console.log(`✓ Cache hit for waypoints ${cacheKey}`);
      return cached;
    }
    
    // 2. 缓存未命中，从网络获取
    console.log(`⟳ Fetching waypoints ${cacheKey} from network`);
    const url = `${WAYPOINTS_BASE_URL}/${gtfsId}-${bound}.json`;
    const response = await axios.get<GeoJSON.FeatureCollection>(url);
    
    // 3. 存入缓存
    await waypointsStore.setItem(cacheKey, response.data);
    console.log(`✓ Cached waypoints ${cacheKey}`);
    
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch waypoints ${cacheKey}:`, error);
    return null;
  }
}

/**
 * 清除所有 waypoints 缓存
 */
export async function clearWaypointsCache(): Promise<void> {
  await waypointsStore.clear();
  console.log('Waypoints cache cleared');
}

/**
 * 获取缓存统计信息
 */
export async function getCacheStats(): Promise<{ keys: string[]; size: number }> {
  const keys = await waypointsStore.keys();
  return {
    keys,
    size: keys.length
  };
}
