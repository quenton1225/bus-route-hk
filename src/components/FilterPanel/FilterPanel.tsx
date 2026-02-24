import { useUIStore } from '../../store/uiStore';
import { FILTER_OPTIONS } from '../../utils/filterConfig';
import { useState } from 'react';

export function FilterPanel() {
  const { 
    isPanelOpen, 
    togglePanel, 
    selectedFilters, 
    toggleFilter, 
    filterColors, 
    setFilterColor,
    selectedCompanies,
    toggleCompany
  } = useUIStore();
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  
  // 公司配置
  const companies = [
    { id: 'KMB', label: '九巴/龙运', color: '#E31C23' },
    { id: 'CTB', label: '城巴/新巴', color: '#FFD100' },
    { id: 'NLB', label: '大屿山巴士', color: '#00A550' },
    { id: 'OTHER', label: '其它', color: '#999999' },
  ];

  return (
    <>
      {/* 侧边栏容器 - 苹果地图风格 */}
      <div
        className={`fixed top-0 left-0 h-full z-[1001] shadow-xl transition-all duration-300 ${
          isPanelOpen ? 'w-72' : 'w-14'
        }`}
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* 顶部展开/折叠按钮 */}
        <div className="flex items-center justify-center h-14 border-b border-gray-200" style={{ backgroundColor: '#ffffff' }}>
          <button
            onClick={togglePanel}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Toggle filter panel"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="#374151" 
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isPanelOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* 展开后的内容 */}
        {isPanelOpen && (
          <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 56px)', backgroundColor: '#ffffff' }}>
            {/* 标题 */}
            <h1 className="text-base font-semibold text-gray-800 mb-4">
              香港巴士路线可视化
            </h1>
            
            {/* 路线类型选择 */}
            <h3 className="text-sm font-semibold text-gray-700 mb-3">路线类型</h3>
            
            <div className="space-y-2">
              {FILTER_OPTIONS.map((option) => {
                const isSelected = selectedFilters.includes(option.id);
                const currentColor = filterColors[option.id] || option.defaultColor;
                
                return (
                  <div key={option.id} className="flex items-center justify-between group">
                    {/* 复选框和标签 */}
                    <label className="flex items-center flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFilter(option.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </label>

                    {/* 颜色指示器和选择器 */}
                    <div className="relative ml-2">
                      <button
                        onClick={() => setColorPickerOpen(colorPickerOpen === option.id ? null : option.id)}
                        className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-300 transition-colors"
                        style={{ backgroundColor: currentColor }}
                        aria-label="Change color"
                      />
                      
                      {/* 颜色选择器弹出层 */}
                      {colorPickerOpen === option.id && (
                        <div className="absolute right-0 top-10 z-10 bg-white rounded-lg shadow-xl p-3 border border-gray-200">
                          <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => setFilterColor(option.id, e.target.value)}
                            className="w-24 h-24 cursor-pointer rounded border-0"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 公司筛选 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">巴士公司</h3>
              <div className="space-y-2">
                {companies.map(company => (
                  <label key={company.id} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => toggleCompany(company.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span
                      className="w-3 h-3 rounded-full ml-3 mr-2"
                      style={{ backgroundColor: company.color }}
                    />
                    <span className="text-sm text-gray-900">{company.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 预留搜索区域 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-400 text-center">搜索功能即将推出</div>
            </div>
          </div>
        )}
      </div>

      {/* 点击外部关闭颜色选择器 */}
      {colorPickerOpen && (
        <div
          className="fixed inset-0 z-[1000]"
          onClick={() => setColorPickerOpen(null)}
        />
      )}
    </>
  );
}
