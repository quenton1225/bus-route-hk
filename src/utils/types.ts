import type { BusCompany } from './constants';

// 巴士路线
export interface BusRoute {
  id: string;
  routeNumber: string;
  direction: 'inbound' | 'outbound';
  company: BusCompany;
  name: {
    en: string;
    zh: string;
  };
  origin: string;
  destination: string;
  path: GeoJSON.LineString;
  stops: BusStop[];
  color?: string; // 动态分配的颜色
  serviceHours?: {
    start: string;
    end: string;
  };
  frequency?: {
    peak: number;
    offPeak: number;
  };
}

// 巴士站点
export interface BusStop {
  id: string;
  name: {
    en: string;
    zh: string;
  };
  coordinates: [number, number]; // [纬度, 经度]
  sequence: number;
  routeIds: string[]; // 经过该站的所有路线ID（核心字段）
  routeCount: number; // 经过该站的路线数量
}

// 站点-路线关系（用于快速查询）
export interface StopRouteRelation {
  stopId: string;
  routeId: string;
  sequence: number;
  direction: 'inbound' | 'outbound';
}

// 路线显示状态
export interface RouteDisplay {
  routeId: string;
  color: string;
  visible: boolean;
  highlighted: boolean;
}

// UI状态
export interface UIState {
  activeRoutes: RouteDisplay[];
  selectedStop: string | null;
  hoveredRoute: string | null;
  showStopPanel: boolean;
  showRoutePanel: boolean;
  mapCenter: [number, number];
  mapZoom: number;
}
