import { useEffect } from 'react';
import { loadRoutesData } from '../services/routeDataLoader';
import { globalRouteIndex } from '../services/spatialIndex';
import { useRouteStore } from '../store/routeStore';
import type { BusRoute } from '../utils/types';

export function useRouteData(routeNumbers: string[]) {
  const { addRoutes, setStops, setProgress, setLoading, setError, clear } = useRouteStore();

  useEffect(() => {
    const loadData = async () => {
      // 如果没有选中任何过滤器，不加载数据
      if (routeNumbers.length === 0) {
        clear();
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setProgress(0, 0);
        clear(); // 清空旧数据和索引
        
        // 临时数组用于批量更新
        const tempRoutes: BusRoute[] = [];
        const BATCH_SIZE = 50; // 每50条路线批量更新一次
        
        const data = await loadRoutesData(
          routeNumbers,
          // 每加载完一条路线就累积
          (route) => {
            tempRoutes.push(route);
            // 同时添加到空间索引
            globalRouteIndex.addRoute(route);
            
            // 达到批量大小时更新
            if (tempRoutes.length >= BATCH_SIZE) {
              addRoutes([...tempRoutes]);
              tempRoutes.length = 0; // 清空临时数组
            }
          },
          // 进度更新
          (loaded, total) => {
            setProgress(loaded, total);
          }
        );
        
        // 处理剩余未达到批量大小的路线
        if (tempRoutes.length > 0) {
          addRoutes(tempRoutes);
        }
        
        // 使用最终的 stops 数据（已正确填充 routeIds）
        // 不检查 mounted - 确保最终状态更新始终执行
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
  }, [routeNumbers.join(',')]);
}
