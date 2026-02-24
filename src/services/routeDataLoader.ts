import axios from 'axios';
import type { BusRoute, BusStop } from '../utils/types';
import { getRouteFilterType } from '../utils/routeTypeHelper';
import { getCachedWaypoints } from './waypointsCache';

// 开发环境使用代理，生产环境使用支持 CORS 的 data.hkbus.app
const isDev = import.meta.env.DEV;
const HKBUS_DATA_URL = isDev 
  ? '/api/hkbus/routeFareList.min.json'
  : 'https://data.hkbus.app/routeFareList.min.json';

// WAYPOINTS_BASE_URL moved to waypointsCache.ts

let cachedData: any = null;
// waypointsCache 已移至 IndexedDB (waypointsCache.ts)

/**
 * 加载并缓存 HKBus 数据
 */
async function loadHKBusData() {
  if (cachedData) {
    return cachedData;
  }

  try {
    console.log('Fetching HKBus data...');
    const response = await axios.get(HKBUS_DATA_URL);
    cachedData = response.data;
    console.log('HKBus data loaded successfully');
    return cachedData;
  } catch (error) {
    console.error('Failed to load HKBus data:', error);
    throw error;
  }
}

/**
 * 获取路线的 waypoints 数据
 * 现在使用 IndexedDB 缓存，显著提升二次加载速度
 */
async function fetchWaypoints(gtfsId: number, bound: 'O' | 'I'): Promise<GeoJSON.FeatureCollection | null> {
  return getCachedWaypoints(gtfsId, bound);
}

/**
 *  throw error;
  }
}

/**
 * 根据路线号筛选路线
 * 支持通配符，如 'A*' 匹配所有 A+数字 开头的路线
 */
function filterRoutesByNumber(routeList: any, routeNumbers: string[]) {
  const filtered: any = {};
  
  Object.entries(routeList).forEach(([routeId, route]: [string, any]) => {
    const routeName = route.route;
    const coList = route.co || [];
    const firstCo = coList[0]?.toUpperCase() || '';
    const shouldInclude = routeNumbers.some(pattern => {
      const filterType = getRouteFilterType(routeName, firstCo);
      return filterType === pattern;
    });
    
    if (shouldInclude) {
      filtered[routeId] = route;
    }
  });
  
  return filtered;
}

/**
 * 获取路线使用的所有站点
 */
function getStopsForRoutes(routes: any, allStops: any) {
  const stopIds = new Set<string>();
  
  Object.values(routes).forEach((route: any) => {
    const coList = route.co || [];
    coList.forEach((co: string) => {
      const stops = route.stops?.[co] || [];
      stops.forEach((stopId: string) => stopIds.add(stopId));
    });
  });
  
  const filteredStops: any = {};
  stopIds.forEach(stopId => {
    if (allStops[stopId]) {
      filteredStops[stopId] = allStops[stopId];
    }
  });
  
  return filteredStops;
}



/**
 * 加载指定路线号的数据
 * @param routeNumbers 路线号数组（支持通配符如 'A*'）
 * @param onRouteLoaded 可选回调，每加载完一条路线就调用
 * @param onProgress 可选回调，进度更新
 * @param isCancelled 可选函数，返回true表示应该取消加载
 */
export async function loadRoutesData(
  routeNumbers: string[],
  onRouteLoaded?: (route: BusRoute) => void,
  onProgress?: (loaded: number, total: number) => void,
  isCancelled?: () => boolean
) {
  const data = await loadHKBusData();
  
  console.log(`Filtering routes: ${routeNumbers.join(', ')}`);
  
  const filteredRoutes = filterRoutesByNumber(data.routeList, routeNumbers);
  const filteredStops = getStopsForRoutes(filteredRoutes, data.stopList);
  
  const routes: BusRoute[] = [];
  const stops: BusStop[] = [];
  const stopRouteMap = new Map<string, string[]>();
  
  const totalRoutes = Object.keys(filteredRoutes).length;
  let loadedCount = 0;
  
  // 初始化进度
  if (onProgress) {
    onProgress(0, totalRoutes);
  }
  
  // 并发加载配置
  const CONCURRENT_LIMIT = 10;
  const routeEntries = Object.entries(filteredRoutes) as [string, any][];
  
  // 批量并发处理路线
  for (let i = 0; i < routeEntries.length; i += CONCURRENT_LIMIT) {
    // 检查是否已取消
    if (isCancelled && isCancelled()) {
      console.log('Loading cancelled by user');
      break;
    }
    
    const batch = routeEntries.slice(i, i + CONCURRENT_LIMIT);
    
    await Promise.all(batch.map(async ([routeId, routeData]) => {
      // 再次检查取消状态
      if (isCancelled && isCancelled()) return;
      
      const coList = routeData.co || [];
      const firstCo = coList[0];
      const stopIds = routeData.stops?.[firstCo] || [];
      
      if (stopIds.length === 0) {
        loadedCount++;
        if (onProgress) onProgress(loadedCount, totalRoutes);
        return;
      }
      
      // 跳过没有 gtfsId 的路线
      const gtfsId = routeData.gtfsId;
      if (!gtfsId) {
        loadedCount++;
        if (onProgress) onProgress(loadedCount, totalRoutes);
        return;
      }
      
      // 确定路线方向
      let boundDirection: 'O' | 'I' = 'I';
      if (routeData.bound && typeof routeData.bound === 'object') {
        const boundValue = Object.values(routeData.bound)[0] as string;
        
        if (boundValue === 'O') {
          boundDirection = 'O';
        } else if (boundValue === 'I') {
          boundDirection = 'I';
        } else if (boundValue === 'IO') {
          const origName = routeData.orig?.en || routeData.orig?.zh || '';
          const destName = routeData.dest?.en || routeData.dest?.zh || '';
          
          if (origName.includes('Airport') || origName.includes('機場')) {
            boundDirection = 'I';
          } else if (destName.includes('Airport') || destName.includes('機場')) {
            boundDirection = 'O';
          } else {
            boundDirection = 'I';
          }
        }
      }
      
      const waypoints = await fetchWaypoints(gtfsId, boundDirection);
      
      // 如果没有 waypoints，跳过该路线
      if (!waypoints || !waypoints.features || waypoints.features.length === 0) {
        loadedCount++;
        if (onProgress) onProgress(loadedCount, totalRoutes);
        return;
      }
      
      // 处理 waypoints 数据
      let path: GeoJSON.LineString;
      const geometry = waypoints.features[0].geometry;
      
      if (geometry.type === 'LineString') {
        path = geometry as GeoJSON.LineString;
      } else if (geometry.type === 'MultiLineString') {
        // MultiLineString: 合并所有部分的坐标
        const multiLineCoords = (geometry as GeoJSON.MultiLineString).coordinates;
        const allCoords: [number, number][] = [];
        // 使用循环而不是扩展运算符，避免栈溢出
        multiLineCoords.forEach(lineCoords => {
          for (let i = 0; i < lineCoords.length; i++) {
            allCoords.push(lineCoords[i] as [number, number]);
          }
        });
        path = {
          type: 'LineString',
          coordinates: allCoords,
        };
      } else {
        // 不支持的 geometry type，跳过
        loadedCount++;
        if (onProgress) onProgress(loadedCount, totalRoutes);
        return;
      }
      
      // 创建路线站点数组
      const routeStops: BusStop[] = stopIds
        .map((stopId: string, index: number) => {
          const stopData = filteredStops[stopId];
          if (!stopData) return null;
          
          // 记录站点-路线关系
          const routeList = stopRouteMap.get(stopId) || [];
          if (!routeList.includes(routeId)) {
            routeList.push(routeId);
          }
          stopRouteMap.set(stopId, routeList);
          
          return {
            id: stopId,
            name: {
              en: stopData.name?.en || '',
              zh: stopData.name?.zh || '',
            },
            coordinates: [stopData.location.lat, stopData.location.lng],
            sequence: index,
            routeIds: [],
            routeCount: 0,
          };
        })
        .filter((s: BusStop | null): s is BusStop => s !== null);
      
      // 创建路线对象
      const routeObject: BusRoute = {
        id: routeId,
        routeNumber: routeData.route || '',
        direction: routeData.bound === 'O' ? 'outbound' : 'inbound',
        company: (firstCo?.toUpperCase() || 'KMB') as any,
        name: {
          en: `${routeData.orig?.en || ''} → ${routeData.dest?.en || ''}`,
          zh: `${routeData.orig?.zh || ''} → ${routeData.dest?.zh || ''}`,
        },
        origin: routeData.orig?.zh || routeData.orig?.en || '',
        destination: routeData.dest?.zh || routeData.dest?.en || '',
        path,
        stops: routeStops,
      };
      
      routes.push(routeObject);
      
      // 立即通知新路线已加载
      if (onRouteLoaded) {
        onRouteLoaded(routeObject);
      }
      
      // 更新进度
      loadedCount++;
      if (onProgress) {
        onProgress(loadedCount, totalRoutes);
      }
    }));
  }
  
  // 转换站点
  Object.entries(filteredStops).forEach(([stopId, stopData]: [string, any]) => {
    stops.push({
      id: stopId,
      name: {
        en: stopData.name?.en || '',
        zh: stopData.name?.zh || '',
      },
      coordinates: [stopData.location.lat, stopData.location.lng],
      sequence: 0,
      routeIds: stopRouteMap.get(stopId) || [],
      routeCount: (stopRouteMap.get(stopId) || []).length,
    });
  });
  
  // 清空所有路线的 stops 数组以减少内存占用
  // 因为运行时通过 stop.routeIds 查询，不再需要 route.stops
  routes.forEach(route => {
    route.stops = [];
  });
  
  console.log(`✓ Data loaded and optimized: ${routes.length} routes, ${stops.length} stops`);
  
  return {
    routes,
    stops,
    stopRouteMap,
  };
}



/**
 * 根据站点ID查询经过该站的所有路线
 */
export function getRoutesByStop(stopId: string, routes: BusRoute[]): BusRoute[] {
  return routes.filter(route => 
    route.stops.some(stop => stop.id === stopId)
  );
}
