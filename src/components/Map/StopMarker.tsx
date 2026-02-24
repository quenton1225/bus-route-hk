import { CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { BusStop } from '../../utils/types';
import L from 'leaflet';
import { useRouteStore } from '../../store/routeStore';
import { groupRoutesByCompany } from '../../utils/companyColors';

interface StopMarkerProps {
  stop: BusStop;
  onClick?: (stop: BusStop) => void;
}

export function StopMarker({ stop, onClick }: StopMarkerProps) {
  // 使用统一数据层查询经过该站的路线
  const getRoutesByStop = useRouteStore(state => state.getRoutesByStop);
  const routesAtStop = getRoutesByStop(stop.id);
  
  return (
    <CircleMarker
      center={stop.coordinates}
      radius={4}
      pathOptions={{
        fillColor: '#ffffff',
        fillOpacity: 0.9,
        color: '#666666',
        weight: 1,
      }}
      eventHandlers={{
        click: () => onClick?.(stop),
      }}
    >
      <Popup minWidth={200} maxWidth={400}>
        <div className="text-sm max-h-[300px] overflow-y-auto min-w-[180px]">
          <div className="font-bold mb-1">{stop.name.zh}</div>
          <div className="text-gray-600 text-xs mb-2">{stop.name.en}</div>
          
          {groupRoutesByCompany(routesAtStop).map(group => (
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
      </Popup>
    </CircleMarker>
  );
}

interface StopMarkersProps {
  onStopClick?: (stop: BusStop) => void;
  autoFit?: boolean;
}

export function StopMarkers({ onStopClick, autoFit = true }: StopMarkersProps) {
  const map = useMap();
  const stopsMap = useRouteStore(state => state.stops) || new Map();

  // 自动调整地图视野以包含所有站点
  useEffect(() => {
    if (autoFit && stopsMap.size > 0) {
      const stops = Array.from(stopsMap.values());
      const bounds = L.latLngBounds(stops.map(stop => stop.coordinates));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stopsMap.size, map, autoFit]);

  const stops = Array.from(stopsMap.values());
  return (
    <>
      {stops.map((stop) => (
        <StopMarker key={stop.id} stop={stop} onClick={onStopClick} />
      ))}
    </>
  );
}
