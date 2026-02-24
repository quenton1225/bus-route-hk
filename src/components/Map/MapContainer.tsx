import { MapContainer as LeafletMap, TileLayer, ZoomControl } from 'react-leaflet';
import { HK_CENTER, HK_DEFAULT_ZOOM, OSM_TILE_URL, OSM_ATTRIBUTION, MAP_CONFIG } from '../../utils/constants';
import { useRouteData } from '../../hooks/useRouteData';
import { StopMarkers } from './StopMarker';
import { RouteLayers } from './RouteLayer';
import { useUIStore } from '../../store/uiStore';
import type { BusStop } from '../../utils/types';
import { getRoutesByStop } from '../../services/routeDataLoader';
import { assignRouteColors } from '../../utils/colorGenerator';
import 'leaflet/dist/leaflet.css';

export default function Map() {
  // 从 store 读取选中的过滤器
  const { selectedFilters, setSelectedStop, setActiveRoutes } = useUIStore();
  const { routes, stops, loading, loadingProgress, error } = useRouteData(selectedFilters);

  const handleStopClick = (stop: BusStop) => {
    setSelectedStop(stop.id);
    
    // 获取经过该站的所有路线
    const routesAtStop = getRoutesByStop(stop.id, routes);
    console.log('Clicked stop:', stop.name.zh, 'Routes:', routesAtStop.map(r => r.routeNumber));
    
    // 为路线分配颜色
    const colorMap = assignRouteColors(routesAtStop.map(r => r.id));
    
    // 更新激活的路线
    const activeRoutes = routesAtStop.map(route => ({
      routeId: route.id,
      color: colorMap.get(route.id) || '#FF6B6B',
      visible: true,
      highlighted: false,
    }));
    
    setActiveRoutes(activeRoutes);
  };

  return (
    <div className="w-full h-screen">
      <LeafletMap
        center={HK_CENTER}
        zoom={HK_DEFAULT_ZOOM}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        zoomControl={MAP_CONFIG.zoomControl}
        className="w-full h-full"
      >
        <TileLayer
          url={OSM_TILE_URL}
          attribution={OSM_ATTRIBUTION}
        />
        
        {/* 缩放控件 - 右下角 */}
        <ZoomControl position="bottomright" />
        
        {/* 显示路线 */}
        <RouteLayers routes={routes} />
        
        {/* 显示站点 */}
        <StopMarkers stops={stops} routes={routes} onStopClick={handleStopClick} />
      </LeafletMap>
      
      {/* 显示加载的数据统计 */}
      <div className="absolute top-4 right-4 z-[900]" style={{ backgroundColor: '#ffffff' }}>
        <div className="rounded-lg shadow-lg p-3 text-sm">
          <div className="font-semibold mb-1">已加载数据</div>
          {loading && loadingProgress.loaded > 0 && (
            <div className="text-blue-600 mb-1">
              加载中 {loadingProgress.loaded}/{loadingProgress.total} 条路线
            </div>
          )}
          <div>路线: {routes.length} 条</div>
          <div>站点: {stops.length} 个</div>
          {error && (
            <div className="text-red-600 text-xs mt-2">
              ⚠️ {error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
