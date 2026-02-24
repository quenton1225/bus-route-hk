import axios from 'axios';
import type { BusRoute, BusStop } from '../utils/types';
import { getRouteFilterType } from '../utils/routeTypeHelper';
import { getCachedWaypoints } from './waypointsCache';

// 开发环境使用代理，生产环境使用直接URL
const isDev = import.meta.env.DEV;
const HKBUS_DATA_URL = isDev 
  ? '/api/hkbus/routeFareList.min.json'
  : 'https://hkbus.github.io/hk-bus-crawling/routeFareList.min.json';

const WAYPOINTS_BASE_URL = isDev
  ? '/api/waypoints'
  : 'https://hkbus.github.io/route-waypoints';

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
  let matchCount = 0;
  let sampleMatches: any[] = [];
  
  console.log(`[Filter Debug] 筛选条件:`, routeNumbers);
  
  Object.entries(routeList).forEach(([routeId, route]: [string, any]) => {
    const routeName = route.route;
    const coList = route.co || [];
    const firstCo = coList[0]?.toUpperCase() || '';
    const shouldInclude = routeNumbers.some(pattern => {
      // 使用 routeTypeHelper 统一判断路线类型
      const filterType = getRouteFilterType(routeName, firstCo);
      
      // 调试：记录前10条匹配
      if (filterType === pattern && sampleMatches.length < 10) {
        sampleMatches.push({ routeName, firstCo, filterType });
      }
      
      return filterType === pattern;
    });
    
    if (shouldInclude) {
      filtered[routeId] = route;
      matchCount++;
    }
  });
  
  console.log(`[Filter Debug] 匹配到 ${matchCount} 条路线`);
  if (sampleMatches.length > 0) {
    console.log(`[Filter Debug] 前几条匹配示例:`, sampleMatches);
  } else {
    console.log(`[Filter Debug] ⚠️ 没有匹配到任何路线！`);
    // 随机采样几条路线看看filterType是什么
    const samples = Object.entries(routeList).slice(0, 20);
    console.log(`[Filter Debug] 随机采样20条路线的filterType:`);
    samples.forEach(([routeId, route]: [string, any]) => {
      const routeName = route.route;
      const coList = route.co || [];
      const firstCo = coList[0]?.toUpperCase() || '';
      const filterType = getRouteFilterType(routeName, firstCo);
      console.log(`  ${routeName} (${firstCo}): ${filterType || 'undefined'}`);
    });
  }
  
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
 * 创建降级路径（当没有 waypoints 时使用站点连线）
 */
function createFallbackPath(stopIds: string[], filteredStops: any): GeoJSON.LineString {
  const coordinates: [number, number][] = [];
  
  stopIds.forEach(stopId => {
    const stopData = filteredStops[stopId];
    if (stopData) {
      coordinates.push([stopData.location.lng, stopData.location.lat]);
    }
  });
  
  return {
    type: 'LineString',
    coordinates,
  };
}

/**
 * 加载指定路线号的数据
 * @param routeNumbers 路线号数组（支持通配符如 'A*'）
 * @param onRouteLoaded 可选回调，每加载完一条路线就调用
 * @param onProgress 可选回调，进度更新
 */
export async function loadRoutesData(
  routeNumbers: string[],
  onRouteLoaded?: (route: BusRoute) => void,
  onProgress?: (loaded: number, total: number) => void
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
  
  // 处理每条路线
  for (const [routeId, routeData] of Object.entries(filteredRoutes) as [string, any][]) {
    const coList = routeData.co || [];
    const firstCo = coList[0];
    const stopIds = routeData.stops?.[firstCo] || [];
    
    if (stopIds.length === 0) {
      loadedCount++;
      if (onProgress) {
        onProgress(loadedCount, totalRoutes);
      }
      continue;
    }
    
    // 跳过没有 gtfsId 的路线，不创建 fallback 路径
    const gtfsId = routeData.gtfsId;
    if (!gtfsId) {
      console.warn(`Skipping route ${routeData.route} (no gtfsId)`);
      loadedCount++;
      if (onProgress) {
        onProgress(loadedCount, totalRoutes);
      }
      continue;
    }
    
    // bound 是一个对象，如 {'ctb': 'I'} 或 {'ctb': 'IO'}
    // 需要从对象中提取方向值，并根据实际方向选择 waypoints
    let boundDirection: 'O' | 'I' = 'I';
    if (routeData.bound && typeof routeData.bound === 'object') {
      const boundValue = Object.values(routeData.bound)[0] as string;
      
      if (boundValue === 'O') {
        boundDirection = 'O';
      } else if (boundValue === 'I') {
        boundDirection = 'I';
      } else if (boundValue === 'IO') {
        // 双向路线：根据起终点名称判断
        // 通常机场/起点在前的是去程(O)，在后的是回程(I)
        const origName = routeData.orig?.en || routeData.orig?.zh || '';
        const destName = routeData.dest?.en || routeData.dest?.zh || '';
        
        // 如果起点包含 "Airport" 或 "機場"，通常是回程(I)
        if (origName.includes('Airport') || origName.includes('機場')) {
          boundDirection = 'I';
        } else if (destName.includes('Airport') || destName.includes('機場')) {
          boundDirection = 'O';
        } else {
          // 默认使用 I
          boundDirection = 'I';
        }
      }
    }
    
    const waypoints = await fetchWaypoints(gtfsId, boundDirection);
    
    // 如果没有 waypoints，跳过该路线
    if (!waypoints || !waypoints.features || waypoints.features.length === 0) {
      console.warn(`Skipping route ${routeData.route} (no waypoints data)`);
      loadedCount++;
      if (onProgress) {
        onProgress(loadedCount, totalRoutes);
      }
      continue;
    }
    
    // 处理 waypoints 数据
    let path: GeoJSON.LineString;
    const geometry = waypoints.features[0].geometry;
    
    if (geometry.type === 'LineString') {
      path = geometry as GeoJSON.LineString;
      console.log(`✓ Loaded waypoints for ${routeData.route}: ${path.coordinates.length} points`);
    } else if (geometry.type === 'MultiLineString') {
      // MultiLineString: 合并所有部分的坐标
      const multiLineCoords = (geometry as GeoJSON.MultiLineString).coordinates;
      const allCoords: [number, number][] = [];
      // 使用循环而不是扩展运算符，避免栈溢出
      multiLineCoords.forEach(lineCoords => {
        for (let i = 0; i < lineCoords.length; i++) {
          allCoords.push(lineCoords[i]);
        }
      });
      path = {
        type: 'LineString',
        coordinates: allCoords,
      };
      console.log(`✓ Loaded waypoints for ${routeData.route}: ${allCoords.length} points (from ${multiLineCoords.length} segments)`);
    } else {
      // 不支持的 geometry type，跳过
      console.warn(`Unsupported geometry type ${geometry.type} for ${routeData.route}, skipping`);
      continue;
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
      .filter((s): s is BusStop => s !== null);
    
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
    loadedCount++;
    
    // 立即通知新路线已加载
    if (onRouteLoaded) {
      onRouteLoaded(routeObject);
    }
    
    // 更新进度
    if (onProgress) {
      onProgress(loadedCount, totalRoutes);
    }
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
