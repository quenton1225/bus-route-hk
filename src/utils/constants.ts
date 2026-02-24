// 香港地图默认中心点
export const HK_CENTER: [number, number] = [22.3193, 114.1694];
export const HK_DEFAULT_ZOOM = 12;

// 地图配置
export const MAP_CONFIG = {
  minZoom: 10,
  maxZoom: 18,
  zoomControl: false, // 手动设置位置
};

// OpenStreetMap 瓦片服务器
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// 巴士公司
export const BUS_COMPANIES = {
  KMB: '九龙巴士',
  CTB: '城巴',
  NWFB: '新世界第一巴士',
  NLB: '新大屿山巴士',
} as const;

export type BusCompany = keyof typeof BUS_COMPANIES;

// 路线颜色（用于多条路线同时显示时区分）
export const ROUTE_COLORS = [
  '#FF6B6B', // 红色
  '#4ECDC4', // 青色
  '#45B7D1', // 蓝色
  '#FFA07A', // 橙色
  '#98D8C8', // 薄荷绿
  '#F7DC6F', // 黄色
  '#BB8FCE', // 紫色
  '#85C1E2', // 天蓝色
  '#F8B739', // 金黄色
  '#52BE80', // 绿色
];
