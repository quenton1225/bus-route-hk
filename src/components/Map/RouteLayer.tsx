import { Polyline } from 'react-leaflet';
import type { BusRoute } from '../../utils/types';
import { useUIStore } from '../../store/uiStore';
import { useRouteStore } from '../../store/routeStore';
import { getRouteFilterType } from '../../utils/routeTypeHelper';

interface RouteLayerProps {
  route: BusRoute;
  color?: string;
  visible?: boolean;
}

export function RouteLayer({ route, color = '#3B82F6', visible = true }: RouteLayerProps) {
  if (!visible || route.path.coordinates.length === 0) {
    return null;
  }

  // 转换坐标格式 [lng, lat] -> [lat, lng]
  const positions = route.path.coordinates.map(coord => [coord[1], coord[0]] as [number, number]);

  return (
    <Polyline
      positions={positions}
      color={color}
      weight={4}
      opacity={0.7}
      pane="overlayPane"
      pathOptions={{
        className: 'route-line',
      }}
    >
      {/* Popup可以显示路线信息 */}
    </Polyline>
  );
}

export function RouteLayers() {
  const { filterColors } = useUIStore();
  const selectedCompanies = useUIStore(state => state.selectedCompanies);
  const getFilteredRoutes = useRouteStore(state => state.getFilteredRoutes);
  
  const routes = getFilteredRoutes(selectedCompanies);
  return (
    <>
      {routes.map((route) => {
        // 根据路线号和公司判断类型，然后获取对应颜色
        const filterType = getRouteFilterType(route.routeNumber, route.company);
        const color = filterType ? filterColors[filterType] : undefined;
        
        return (
          <RouteLayer
            key={route.id}
            route={route}
            color={color}
          />
        );
      })}
    </>
  );
}
