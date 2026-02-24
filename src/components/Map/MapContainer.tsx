import { MapContainer as LeafletMap, TileLayer, ZoomControl, useMapEvents, Popup } from 'react-leaflet';
import { useState, startTransition } from 'react';
import { HK_CENTER, HK_DEFAULT_ZOOM, OSM_TILE_URL, OSM_ATTRIBUTION, MAP_CONFIG } from '../../utils/constants';
import { useRouteData } from '../../hooks/useRouteData';
import { StopMarkers } from './StopMarker';
import { RouteLayers } from './RouteLayer';
import { useUIStore } from '../../store/uiStore';
import { useRouteStore } from '../../store/routeStore';
import { groupRoutesByCompany } from '../../utils/companyColors';
import type { BusStop } from '../../utils/types';
import { assignRouteColors } from '../../utils/colorGenerator';
import 'leaflet/dist/leaflet.css';

// 地图点击监听组件
function MapClickHandler() {
  const findRoutesNear = useRouteStore(state => state.findRoutesNear);
  const [clickPopup, setClickPopup] = useState<{ latlng: L.LatLng; content: JSX.Element } | null>(null);
  
  useMapEvents({
    click(e) {
      // 查找点击点附近的路线（使用统一数据层）
      const nearbyRoutes = findRoutesNear([e.latlng.lat, e.latlng.lng], 0.0008);
      
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
  
  // 触发数据加载
  useRouteData(selectedFilters);
  
  // 从 RouteStore 读取状态
  const loading = useRouteStore(state => state.loading);
  const progress = useRouteStore(state => state.progress);
  const error = useRouteStore(state => state.error);
  const routeCount = useRouteStore(state => state.routes.size);
  const stopCount = useRouteStore(state => state.stops.size);
  const getRoutesByStop = useRouteStore(state => state.getRoutesByStop);

  const handleStopClick = (stop: BusStop) => {
    setSelectedStop(stop.id);
    
    // 获取经过该站的所有路线
    const routesAtStop = getRoutesByStop(stop.id);
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
        <RouteLayers />
        
        {/* 显示站点 */}
        <StopMarkers onStopClick={handleStopClick} />
      </LeafletMap>
      
      {/* 显示加载的数据统计 */}
      <div className="absolute top-4 right-4 z-[900]" style={{ backgroundColor: '#ffffff' }}>
        <div className="rounded-lg shadow-lg p-3 text-sm">
          <div className="font-semibold mb-1">已加载数据</div>
          {loading && progress.loaded > 0 && (
            <div className="text-blue-600 mb-1">
              加载中 {progress.loaded}/{progress.total} 条路线
            </div>
          )}
          <div>路线: {routeCount} 条</div>
          <div>站点: {stopCount} 个</div>
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
