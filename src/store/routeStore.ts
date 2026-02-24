import { create } from 'zustand';
import { globalRouteIndex } from '../services/spatialIndex';
import type { BusRoute, BusStop } from '../utils/types';

interface RouteStore {
  // 数据存储 - 使用 Map 作为唯一数据源
  routes: Map<string, BusRoute>;
  stops: Map<string, BusStop>;
  
  // 加载状态
  loading: boolean;
  progress: { loaded: number; total: number };
  error: Error | null;
  
  // 查询方法
  getRoute: (id: string) => BusRoute | undefined;
  getRoutes: (ids: string[]) => BusRoute[];
  getAllRoutes: () => BusRoute[];
  getAllStops: () => BusStop[];
  getRoutesByStop: (stopId: string) => BusRoute[];
  
  // 空间查询（内部使用 spatialIndex）
  findRoutesNear: (latlng: [number, number], radius?: number) => BusRoute[];
  
  // 公司筛选查询
  getFilteredRoutes: (companies: Set<string>) => BusRoute[];
  getFilteredStops: (companies: Set<string>) => BusStop[];
  
  // 修改方法
  addRoutes: (routes: BusRoute[]) => void;
  setStops: (stops: BusStop[]) => void;
  setProgress: (loaded: number, total: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clear: () => void;
}

export const useRouteStore = create<RouteStore>((set, get) => ({
  // 初始状态
  routes: new Map(),
  stops: new Map(),
  loading: false,
  progress: { loaded: 0, total: 0 },
  error: null,
  
  // 查询方法实现
  getRoute: (id: string) => {
    return get().routes.get(id);
  },
  
  getRoutes: (ids: string[]) => {
    const routes = get().routes;
    return ids
      .map(id => routes.get(id))
      .filter((route): route is BusRoute => route !== undefined);
  },
  
  getAllRoutes: () => {
    return Array.from(get().routes.values());
  },
  
  getAllStops: () => {
    return Array.from(get().stops.values());
  },
  
  getRoutesByStop: (stopId: string) => {
    const stop = get().stops.get(stopId);
    if (!stop) return [];
    
    const routes = get().routes;
    return stop.routeIds
      .map(id => routes.get(id))
      .filter((route): route is BusRoute => route !== undefined);
  },
  
  // 空间查询 - 委托给 spatialIndex
  findRoutesNear: (latlng: [number, number], radius = 0.001) => {
    const routeIds = globalRouteIndex.findRoutesNear(latlng, radius);
    return get().getRoutes(routeIds);
  },
  
  // 公司筛选查询
  getFilteredRoutes: (companies: Set<string>) => {
    const allRoutes = Array.from(get().routes.values());
    
    // 如果全部公司都选中，直接返回所有路线
    if (companies.size === 4) return allRoutes;
    
    return allRoutes.filter(route => {
      const company = route.company;
      
      // 映射公司到筛选类别
      if (companies.has('KMB') && (company === 'KMB' || company === 'LWB')) {
        return true;
      }
      if (companies.has('CTB') && (company === 'CTB' || company === 'NWFB')) {
        return true;
      }
      if (companies.has('NLB') && company === 'NLB') {
        return true;
      }
      if (companies.has('OTHER') && !['KMB', 'LWB', 'CTB', 'NWFB', 'NLB'].includes(company)) {
        return true;
      }
      
      return false;
    });
  },
  
  getFilteredStops: (companies: Set<string>) => {
    const filteredRoutes = get().getFilteredRoutes(companies);
    const filteredRouteIds = new Set(filteredRoutes.map(r => r.id));
    
    const allStops = Array.from(get().stops.values());
    return allStops.filter(stop => 
      stop.routeIds.some(routeId => filteredRouteIds.has(routeId))
    );
  },
  
  // 修改方法实现
  addRoutes: (routes: BusRoute[]) => {
    set(state => {
      const newRoutes = new Map(state.routes);
      routes.forEach(route => {
        newRoutes.set(route.id, route);
      });
      return { routes: newRoutes };
    });
  },
  
  setStops: (stops: BusStop[]) => {
    set(() => {
      const stopsMap = new Map<string, BusStop>();
      stops.forEach(stop => {
        stopsMap.set(stop.id, stop);
      });
      return { stops: stopsMap };
    });
  },
  
  setProgress: (loaded: number, total: number) => {
    set({ progress: { loaded, total } });
  },
  
  setLoading: (loading: boolean) => {
    set({ loading });
  },
  
  setError: (error: Error | null) => {
    set({ error });
  },
  
  clear: () => {
    set({
      routes: new Map(),
      stops: new Map(),
      loading: false,
      progress: { loaded: 0, total: 0 },
      error: null,
    });
    globalRouteIndex.clear();
  },
}));
