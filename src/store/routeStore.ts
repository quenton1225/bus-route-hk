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
  getFilteredRoutes: (companies: string[]) => BusRoute[];
  getFilteredStops: (companies: string[]) => BusStop[];
  
  // 修改方法
  addRoutes: (routes: BusRoute[]) => void;
  setStops: (stops: BusStop[]) => void;
  setProgress: (loaded: number, total: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clear: () => void;
}

// 缓存机制 - 避免重复计算（仅缓存路线，站点总是重新计算）
let cachedCompanies: string[] = [];
let cachedRoutes: BusRoute[] = [];

// 比较两个字符串数组是否相等（顺序敏感）
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// 清空缓存
function clearCache() {
  cachedCompanies = [];
  cachedRoutes = [];
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
  
  // 公司筛选查询 - 带缓存
  getFilteredRoutes: (companies: string[]) => {
    // 检查缓存：如果筛选条件相同，直接返回缓存的数组引用
    if (arraysEqual(companies, cachedCompanies)) {
      return cachedRoutes;
    }
    
    const allRoutes = Array.from(get().routes.values());
    
    // 如果全部公司都选中，直接返回所有路线
    if (companies.length === 4) {
      cachedCompanies = [...companies];
      cachedRoutes = allRoutes;
      return allRoutes;
    }
    
    const filteredRoutes = allRoutes.filter(route => {
      const company = route.company as string;
      
      // 映射公司到筛选类别
      if (companies.includes('KMB') && (company === 'KMB' || company === 'LWB')) {
        return true;
      }
      if (companies.includes('CTB') && (company === 'CTB' || company === 'NWFB')) {
        return true;
      }
      if (companies.includes('NLB') && company === 'NLB') {
        return true;
      }
      if (companies.includes('OTHER') && !['KMB', 'LWB', 'CTB', 'NWFB', 'NLB'].includes(company)) {
        return true;
      }
      
      return false;
    });
    
    // 缓存结果
    cachedCompanies = [...companies];
    cachedRoutes = filteredRoutes;
    
    return filteredRoutes;
  },
  
  getFilteredStops: (companies: string[]) => {
    // 复用 getFilteredRoutes 的缓存
    const filteredRoutes = get().getFilteredRoutes(companies);
    
    const filteredRouteIds = new Set(filteredRoutes.map(r => r.id));
    
    const allStops = Array.from(get().stops.values());
    const filteredStops = allStops.filter(stop => 
      stop.routeIds.some(routeId => filteredRouteIds.has(routeId))
    );
    
    return filteredStops;
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
    // 数据变化时清空缓存
    clearCache();
  },
  
  setStops: (stops: BusStop[]) => {
    set(() => {
      const stopsMap = new Map<string, BusStop>();
      stops.forEach(stop => {
        stopsMap.set(stop.id, stop);
      });
      return { stops: stopsMap };
    });
    // 数据变化时清空缓存
    clearCache();
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
      // 不重置 loading 状态，由调用方管理
      progress: { loaded: 0, total: 0 },
      error: null,
    });
    globalRouteIndex.clear();
    // 清空缓存
    clearCache();
  },
}));
