import { ROUTE_COLORS } from './constants';

/**
 * 为多条路线分配不同的颜色
 */
export function assignRouteColors(routeIds: string[]): Map<string, string> {
  const colorMap = new Map<string, string>();
  
  routeIds.forEach((id, index) => {
    const colorIndex = index % ROUTE_COLORS.length;
    colorMap.set(id, ROUTE_COLORS[colorIndex]);
  });
  
  return colorMap;
}

/**
 * 生成随机颜色
 */
export function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 60%)`;
}
