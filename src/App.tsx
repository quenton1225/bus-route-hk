import Map from './components/Map/MapContainer';
import { FilterPanel } from './components/FilterPanel';
import './index.css';

function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 过滤面板 */}
      <FilterPanel />

      {/* 地图主体 */}
      <Map />
    </div>
  );
}

export default App;
