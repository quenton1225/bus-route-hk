import { MapContainer as LeafletMap, TileLayer, ZoomControl, useMapEvents, Popup } from 'react-leaflet';
import { useState, startTransition } from 'react';
import { HK_CENTER, HK_DEFAULT_ZOOM, OSM_TILE_URL, OSM_ATTRIBUTION, MAP_CONFIG } from '../../utils/constants';
import { useRouteData } from '../../hooks/useRouteData';
import { StopMarkers } from './StopMarker';
import { RouteLayers } from './RouteLayer';
import { useUIStore } from '../../store/uiStore';
import { globalRouteIndex } from '../../services/spatialIndex';
import { groupRoutesByCompany } from '../../utils/companyColors';
import type { BusStop } from '../../utils/types';
import { getRoutesByStop } from '../../services/routeDataLoader';
import { assignRouteColors } from '../../utils/colorGenerator';
import 'leaflet/dist/leaflet.css';

// 地图点击监听组件
function MapClickHandler() {
  const [clickPopup, setClickPopup] = useState<{ latlng: L.LatLng; content: JSX.Element } | null>(null);
  
  useMapEvents({
    click(e) {
      // 查找点击点附近的路线
      const nearbyRoutes = globalRouteIndex.findRoutesNear([e.latlng.lat, e.latlng.lng], 0.0008);
      
      if (nearbyRoutes.length > 0) {
        // 使用 startTransition 延迟非紧急更新，避免阻塞渲染
        startTransition(() => {
          const groups = groupRoutesByCompany(nearbyRoutes);
          
          setClickPopup({
            latlng: e.latlng,
            content: (
            <div className="text-sm min-w-[180px]">
              <div className="font-bold mb-2">此处经过 {nearbyRoutes.length} 条路线</div>
              {groups.map(group => (
                <div key={group.name} className="mb-2 last:mb-0">
                  <div className="text-xs text-gray-600 mb-1">{group.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.displays.map((display, idx) => (
                      <div key={`${display.routeNumber}-${idx}`} className="flex flex-col items-center">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-white text-xs font-medium whitespace-nowrap"
                          style={{ backgroundColor: group.color }}
                        >
                          {display.routeNumber}
                        </span>
                        <span className="text-[10px] text-gray-500 text-center mt-0.5" title={display.displayText}>
                          {display.displayText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
          });
        });
      }
    }
  });
  
  return clickPopup ? (
    <Popup position={clickPopup.latlng} onClose={() => setClickPopup(null)}>
      {clickPopup.content}
    </Popup>
  ) : null;
}

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
        
        {/* 地图点击监听 */}
        <MapClickHandler />
        
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
