import axios from 'axios';
import type { BusRoute, BusStop, StopRouteRelation } from '../utils/types';

const HKBUS_DATA_URL = 'https://hkbus.github.io/hk-bus-crawling/routeFareList.min.json';

interface HKBusData {
  routeList: Record<string, any>;
  stopList: Record<string, any>;
  stopMap?: Record<string, any>;
}

/**
 * 从 hkbus 加载原始数据
 */
export async function loadHKBusData(): Promise<HKBusData> {
  try {
    const response = await axios.get(HKBUS_DATA_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to load HKBus data:', error);
    throw error;
  }
}

/**
 * 转换 hkbus 站点数据为我们的格式
 */
export function convertHKBusStop(stopId: string, hkbusStop: any): BusStop {
  return {
    id: stopId,
    name: {
      en: hkbusStop.name?.en || '',
      zh: hkbusStop.name?.zh || hkbusStop.name?.tc || '',
    },
    coordinates: [hkbusStop.location.lat, hkbusStop.location.lng],
    sequence: 0, // 将在路线中设置
    routeIds: [],  // 将通过索引生成
    routeCount: 0, // 将通过索引生成
  };
}

/**
 * 转换 hkbus 路线数据为我们的格式
 */
export function convertHKBusRoute(routeId: string, hkbusRoute: any): BusRoute | null {
  try {
    // 获取第一个运营公司的站点列表
    const coList = hkbusRoute.co || [];
    const firstCo = coList[0];
    const stops = hkbusRoute.stops?.[firstCo] || [];

    if (stops.length === 0) {
      return null;
    }

    // 创建简化的路径（实际应该使用 waypoints）
    // 这里暂时用站点坐标连线
    const path: GeoJSON.LineString = {
      type: 'LineString',
      coordinates: [], // 需要从 waypoints 获取
    };

    return {
      id: routeId,
      routeNumber: hkbusRoute.route || '',
      direction: hkbusRoute.bound === 'O' ? 'outbound' : 'inbound',
      company: firstCo?.toUpperCase() as any,
      name: {
        en: `${hkbusRoute.orig?.en || ''} - ${hkbusRoute.dest?.en || ''}`,
        zh: `${hkbusRoute.orig?.zh || ''} - ${hkbusRoute.dest?.zh || ''}`,
      },
      origin: hkbusRoute.orig?.zh || hkbusRoute.orig?.en || '',
      destination: hkbusRoute.dest?.zh || hkbusRoute.dest?.en || '',
      path,
      stops: stops.map((stopId: string, index: number) => ({
        id: stopId,
        sequence: index,
      })) as any[], // 需要完整的 BusStop 对象
    };
  } catch (error) {
    console.error(`Failed to convert route ${routeId}:`, error);
    return null;
  }
}

/**
 * 构建站点-路线关系索引
 */
export function buildStopRouteIndex(routes: BusRoute[]): Map<string, string[]> {
  const stopRouteMap = new Map<string, string[]>();

  routes.forEach((route) => {
    route.stops.forEach((stop) => {
      const routeIds = stopRouteMap.get(stop.id) || [];
      if (!routeIds.includes(route.id)) {
        routeIds.push(route.id);
      }
      stopRouteMap.set(stop.id, routeIds);
    });
  });

  return stopRouteMap;
}

/**
 * 更新站点的路线信息
 */
export function updateStopsWithRoutes(
  stops: Map<string, BusStop>,
  stopRouteMap: Map<string, string[]>
): void {
  stopRouteMap.forEach((routeIds, stopId) => {
    const stop = stops.get(stopId);
    if (stop) {
      stop.routeIds = routeIds;
      stop.routeCount = routeIds.length;
    }
  });
}

/**
 * 完整的数据加载和转换流程
 */
export async function loadAndConvertData() {
  console.log('Loading HKBus data...');
  const hkbusData = await loadHKBusData();

  console.log('Converting stops...');
  const stops = new Map<string, BusStop>();
  Object.entries(hkbusData.stopList).forEach(([stopId, stopData]) => {
    stops.set(stopId, convertHKBusStop(stopId, stopData));
  });

  console.log('Converting routes...');
  const routes: BusRoute[] = [];
  Object.entries(hkbusData.routeList).forEach(([routeId, routeData]) => {
    const route = convertHKBusRoute(routeId, routeData);
    if (route) {
      routes.push(route);
    }
  });

  console.log('Building stop-route index...');
  const stopRouteMap = buildStopRouteIndex(routes);
  updateStopsWithRoutes(stops, stopRouteMap);

  console.log(`Loaded ${stops.size} stops and ${routes.length} routes`);

  return {
    stops: Array.from(stops.values()),
    routes,
    stopRouteMap,
  };
}
