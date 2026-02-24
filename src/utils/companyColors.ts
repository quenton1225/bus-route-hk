import type { BusRoute } from './types';

export const COMPANY_COLORS = {
  KMB: '#D92228',           // 九龙巴士 - 红色
  KMB_AIRPORT: '#FF8C00',   // 龙运巴士 - 橙色
  CTB_NWFB: '#0078D7',      // 城巴/新巴 - 蓝色
  CTB_NWFB_AIRPORT: '#FFB700', // 城巴/新巴机场 - 黄色
  NLB: '#32CD32',           // 新大屿山 - 绿色
  DEFAULT: '#D3D3D3'        // 其他 - 灰色
} as const;

export interface RouteDisplay {
  routeNumber: string;
  displayText: string;  // "机场<->屯门" 或 "机场->屯门"
  type: 'bidirectional' | 'unidirectional';
  routes: BusRoute[];  // 关联的原始路线（1个或2个）
}

export interface CompanyGroup {
  name: string;
  color: string;
  routes: BusRoute[];
  displays: RouteDisplay[];  // 配对后的显示项
}

// 判断是否为机场路线
export function isAirportRoute(routeNumber: string): boolean {
  return routeNumber.startsWith('A');
}

// 获取路线的配色
export function getRouteColor(route: BusRoute): string {
  const company = route.company.toUpperCase();
  const isAirport = isAirportRoute(route.routeNumber);
  
  if (company === 'KMB') {
    return isAirport ? COMPANY_COLORS.KMB_AIRPORT : COMPANY_COLORS.KMB;
  } else if (company === 'CTB' || company === 'NWFB') {
    return isAirport ? COMPANY_COLORS.CTB_NWFB_AIRPORT : COMPANY_COLORS.CTB_NWFB;
  } else if (company === 'NLB') {
    return COMPANY_COLORS.NLB;
  }
  return COMPANY_COLORS.DEFAULT;
}

// 获取路线的显示组名
export function getCompanyGroupName(route: BusRoute): string {
  const company = route.company.toUpperCase();
  const isAirport = isAirportRoute(route.routeNumber);
  
  if (company === 'KMB') {
    return isAirport ? '龙运巴士' : '九龙巴士';
  } else if (company === 'CTB' || company === 'NWFB') {
    return isAirport ? '城巴/新巴机场快线' : '城巴/新巴';
  } else if (company === 'NLB') {
    return '新大屿山巴士';
  }
  return '其他';
}

// 判断两条路线是否为往返配对
function isRoundTrip(route1: BusRoute, route2: BusRoute): boolean {
  return (
    route1.origin === route2.destination &&
    route1.destination === route2.origin
  );
}

// 配对路线并生成显示项
function pairRoutes(routes: BusRoute[]): RouteDisplay[] {
  const displays: RouteDisplay[] = [];
  const paired = new Set<string>();
  
  // 按路线号分组
  const routeGroups = new Map<string, BusRoute[]>();
  routes.forEach(route => {
    const key = route.routeNumber;
    if (!routeGroups.has(key)) {
      routeGroups.set(key, []);
    }
    routeGroups.get(key)!.push(route);
  });
  
  // 对每个路线号进行配对
  for (const [routeNumber, groupRoutes] of routeGroups) {
    // 尝试配对往返路线
    for (let i = 0; i < groupRoutes.length; i++) {
      if (paired.has(groupRoutes[i].id)) continue;
      
      const route1 = groupRoutes[i];
      let foundPair = false;
      
      for (let j = i + 1; j < groupRoutes.length; j++) {
        if (paired.has(groupRoutes[j].id)) continue;
        
        const route2 = groupRoutes[j];
        
        // 检查是否往返配对
        if (isRoundTrip(route1, route2)) {
          displays.push({
            routeNumber,
            displayText: `${route1.origin}<->${route1.destination}`,
            type: 'bidirectional',
            routes: [route1, route2]
          });
          paired.add(route1.id);
          paired.add(route2.id);
          foundPair = true;
          break;
        }
      }
      
      // 如果没有找到配对，作为单向路线
      if (!foundPair && !paired.has(route1.id)) {
        displays.push({
          routeNumber,
          displayText: `${route1.origin}->${route1.destination}`,
          type: 'unidirectional',
          routes: [route1]
        });
        paired.add(route1.id);
      }
    }
  }
  
  return displays;
}

// 分组路线
export function groupRoutesByCompany(routes: BusRoute[]): CompanyGroup[] {
  const groupMap = new Map<string, CompanyGroup>();
  
  routes.forEach(route => {
    const groupName = getCompanyGroupName(route);
    const color = getRouteColor(route);
    
    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, {
        name: groupName,
        color: color,
        routes: [],
        displays: []
      });
    }
    
    groupMap.get(groupName)!.routes.push(route);
  });
  
  // 对每个组的路线进行配对处理
  const groups = Array.from(groupMap.values()).map(group => ({
    ...group,
    displays: pairRoutes(group.routes)
  }));
  
  // 按优先级排序：九龙巴士 → 龙运 → 城巴/新巴 → 城巴机场 → 新大屿山 → 其他
  const order = ['九龙巴士', '龙运巴士', '城巴/新巴', '城巴/新巴机场快线', '新大屿山巴士', '其他'];
  
  return groups
    .filter(g => g.displays.length > 0)
    .sort((a, b) => {
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
}
