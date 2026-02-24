import RBush from 'rbush';
import type { BusRoute } from '../utils/types';

// 路线段索引项
interface RouteSegment {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  routeId: string;
  routeNumber: string;
  segmentIndex: number; // 段索引
}

/**
 * 空间索引管理器
 * 用于快速查询某个点附近的路线
 */
export class SpatialRouteIndex {
  private tree: RBush<RouteSegment>;
  private routeMap: Map<string, BusRoute>;
  
  constructor() {
    this.tree = new RBush<RouteSegment>();
    this.routeMap = new Map();
  }
  
  /**
   * 添加一条路线到索引
   */
  addRoute(route: BusRoute): void {
    this.routeMap.set(route.id, route);
    
    const coords = route.path.coordinates;
    if (coords.length < 2) return;
    
    // 将路线分成多个段，每段插入索引
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      
      this.tree.insert({
        minX: Math.min(prev[0], curr[0]),
        minY: Math.min(prev[1], curr[1]),
        maxX: Math.max(prev[0], curr[0]),
        maxY: Math.max(prev[1], curr[1]),
        routeId: route.id,
        routeNumber: route.routeNumber,
        segmentIndex: i - 1
      });
    }
  }
  
  /**
   * 批量添加路线
   */
  addRoutes(routes: BusRoute[]): void {
    routes.forEach(route => this.addRoute(route));
  }
  
  /**
   * 查找某个点附近的所有路线
   * @param latlng [latitude, longitude]
   * @param radiusInDegrees 搜索半径（度），默认 0.001 约 100 米
   * @returns 附近的路线数组
   */
  findRoutesNear(latlng: [number, number], radiusInDegrees = 0.001): BusRoute[] {
    const [lat, lng] = latlng;
    
    // 在 R-tree 中搜索
    const results = this.tree.search({
      minX: lng - radiusInDegrees,
      minY: lat - radiusInDegrees,
      maxX: lng + radiusInDegrees,
      maxY: lat + radiusInDegrees
    });
    
    // 去重并获取完整路线对象
    const uniqueRouteIds = new Set(results.map(seg => seg.routeId));
    return Array.from(uniqueRouteIds)
      .map(id => this.routeMap.get(id))
      .filter((route): route is BusRoute => route !== undefined);
  }
  
  /**
   * 获取某个路线的详细信息
   */
  getRoute(routeId: string): BusRoute | undefined {
    return this.routeMap.get(routeId);
  }
  
  /**
   * 清空索引
   */
  clear(): void {
    this.tree.clear();
    this.routeMap.clear();
  }
  
  /**
   * 获取统计信息
   */
  getStats(): { routes: number; segments: number } {
    return {
      routes: this.routeMap.size,
      segments: this.tree.all().length
    };
  }
}

// 创建全局单例
export const globalRouteIndex = new SpatialRouteIndex();
