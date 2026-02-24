import { useEffect, useState } from 'react';
import { loadRoutesData } from '../services/routeDataLoader';
import type { BusRoute, BusStop } from '../utils/types';

export function useRouteData(routeNumbers: string[]) {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 });
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // 如果没有选中任何过滤器，不加载数据
      if (routeNumbers.length === 0) {
        setRoutes([]);
        setStops([]);
        setLoading(false);
        setLoadingProgress({ loaded: 0, total: 0 });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setRoutes([]);
        setStops([]);
        setLoadingProgress({ loaded: 0, total: 0 });
        
        const data = await loadRoutesData(
          routeNumbers,
          // 每加载完一条路线就追加
          (route) => {
            if (mounted) {
              setRoutes(prev => [...prev, route]);
            }
          },
          // 进度更新
          (loaded, total) => {
            if (mounted) {
              setLoadingProgress({ loaded, total });
            }
          }
        );
        
        // 使用最终的 stops 数据（已正确填充 routeIds）
        setStops(data.stops);
        setLoading(false);
        console.log('All data loaded:', {
          routes: data.routes.length,
          stops: data.stops.length,
        });
      } catch (err) {
        console.error('Failed to load route data:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [routeNumbers.join(',')]);

  return { routes, stops, loading, loadingProgress, error };
}
