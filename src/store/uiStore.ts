import { create } from 'zustand';
import type { UIState, RouteDisplay } from '../utils/types';
import { HK_CENTER, HK_DEFAULT_ZOOM } from '../utils/constants';

interface UIStore extends UIState {
  // 过滤器状态
  selectedFilters: string[];
  filterColors: Record<string, string>;
  isPanelOpen: boolean;
  
  // 公司筛选
  selectedCompanies: string[];
  toggleCompany: (company: string) => void;
  
  // 原有的方法
  setActiveRoutes: (routes: RouteDisplay[]) => void;
  addActiveRoute: (route: RouteDisplay) => void;
  removeActiveRoute: (routeId: string) => void;
  clearActiveRoutes: () => void;
  setSelectedStop: (stopId: string | null) => void;
  setHoveredRoute: (routeId: string | null) => void;
  setShowStopPanel: (show: boolean) => void;
  setShowRoutePanel: (show: boolean) => void;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  toggleRouteVisibility: (routeId: string) => void;
  
  // 新增的过滤器方法
  toggleFilter: (filter: string) => void;
  setFilterColor: (filter: string, color: string) => void;
  togglePanel: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // 初始状态
  activeRoutes: [],
  selectedStop: null,
  hoveredRoute: null,
  showStopPanel: false,
  showRoutePanel: false,
  mapCenter: HK_CENTER,
  mapZoom: HK_DEFAULT_ZOOM,
  
  // 过滤器初始状态 - 默认不选中任何过滤器
  selectedFilters: [],
  filterColors: {
    'A*': '#007AFF',   // 苹果蓝
    'NA*': '#34C759',  // 苹果绿
    'E*': '#FF9500',   // 苹果橙
  },
  isPanelOpen: false,
  
  // 公司筛选初始状态 - 默认全部公司开启
  selectedCompanies: ['KMB', 'CTB', 'NLB', 'OTHER'],

  // Actions
  setActiveRoutes: (routes) => set({ activeRoutes: routes }),
  
  addActiveRoute: (route) => set((state) => ({
    activeRoutes: [...state.activeRoutes, route],
  })),
  
  removeActiveRoute: (routeId) => set((state) => ({
    activeRoutes: state.activeRoutes.filter((r) => r.routeId !== routeId),
  })),
  
  clearActiveRoutes: () => set({ activeRoutes: [] }),
  
  setSelectedStop: (stopId) => set({ selectedStop: stopId }),
  
  setHoveredRoute: (routeId) => set({ hoveredRoute: routeId }),
  
  setShowStopPanel: (show) => set({ showStopPanel: show }),
  
  setShowRoutePanel: (show) => set({ showRoutePanel: show }),
  
  setMapCenter: (center) => set({ mapCenter: center }),
  
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  
  toggleRouteVisibility: (routeId) => set((state) => ({
    activeRoutes: state.activeRoutes.map((route) =>
      route.routeId === routeId
        ? { ...route, visible: !route.visible }
        : route
    ),
  })),
  
  // 过滤器方法
  toggleFilter: (filter) => set((state) => ({
    selectedFilters: state.selectedFilters.includes(filter)
      ? state.selectedFilters.filter(f => f !== filter)
      : [...state.selectedFilters, filter],
  })),
  
  setFilterColor: (filter, color) => set((state) => ({
    filterColors: { ...state.filterColors, [filter]: color }
  })),
  
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  
  // 公司筛选方法
  toggleCompany: (company) => set((state) => {
    const companies = state.selectedCompanies;
    if (companies.includes(company)) {
      return { selectedCompanies: companies.filter(c => c !== company) };
    } else {
      return { selectedCompanies: [...companies, company] };
    }
  }),
}));
