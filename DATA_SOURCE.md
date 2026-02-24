# HK Bus 数据源说明

## 🎉 发现：hkbus.app 提供现成数据！

### 📦 数据下载地址

**主数据文件**（每日更新）：
- 完整版：https://hkbus.github.io/hk-bus-crawling/routeFareList.json
- 压缩版：https://hkbus.github.io/hk-bus-crawling/routeFareList.min.json

### 📊 数据结构

数据包含：

1. **routeList** - 路线列表
   ```json
   {
     "route_id": {
       "route": "路线号",
       "bound": "方向(O/I)",
       "orig": {"en": "起点英文", "zh": "起点中文"},
       "dest": {"en": "终点英文", "zh": "终点中文"},
       "stops": {"kmb": ["站点ID数组"]},
       "co": ["运营公司"]
     }
   }
   ```

2. **stopList** - 站点列表
   ```json
   {
     "stop_id": {
       "name": {"en": "英文名", "zh": "中文名"},
       "location": {"lat": 纬度, "lng": 经度}
     }
   }
   ```

3. **stopMap** - 站点关系映射（附近站点）

### 🚀 使用方案

#### 方案A：直接使用 hkbus 数据（推荐）
1. 下载 `routeFareList.min.json`
2. 转换为我们需要的格式
3. 生成站点-路线索引

#### 方案B：使用 hkbus API
- 路线数据：通过 hkbus 的数据文件
- 路线走向：需要补充 waypoints 数据

### 📝 待完成工作

1. ✅ 下载 hkbus 数据文件
2. 🔄 编写数据转换脚本（hkbus格式 → 我们的格式）
3. 🔄 生成站点-路线关系索引
4. 🔄 获取路线走向坐标（waypoints）
5. 🔄 转换为 GeoJSON 格式

### 🔗 相关链接

- GitHub 仓库：https://github.com/hkbus/hk-bus-crawling
- 路线 waypoints：https://github.com/hkbus/route-waypoints
- hkbus.app 网站：https://hkbus.app

### 💡 优势

- ✅ 数据完整且每日更新
- ✅ 包含所有主要巴士公司
- ✅ 站点坐标准确
- ✅ 开源且免费使用
- ✅ 有活跃维护

### ⚠️ 注意事项

- 数据使用需遵守 GPL-2.0 协议
- 建议标注数据来源：`HK Bus Crawling@2021, https://github.com/hkbus/hk-bus-crawling`
- 路线走向需要额外获取 waypoints 数据
