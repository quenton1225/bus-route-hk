# 香港巴士路线地图 🚌

一个基于 React 的交互式香港巴士路线可视化应用，展示九巴、城巴、新巴、龙运和专线小巴等巴士路线。

## 🌐 在线演示

**👉 [立即访问](https://quenton1225.github.io/bus-route-hk/)**

## ✨ 主要功能

- 🗺️ **交互式地图**：基于 Leaflet 的流畅地图体验
- 🚍 **多公司支持**：九巴(KMB)、城巴/新巴(CTB)、龙运(LWB)、新大屿山(NLB)及专线小巴(GMB)
- 🔍 **智能筛选**：
  - 按巴士公司筛选
  - 按服务区域筛选（25个详细区域分类）
  - 按路线号搜索
- 📍 **详细信息**：
  - 路线路径可视化
  - 巴士站点标记
  - 起点/终点信息
  - 行车方向
- ⚡ **性能优化**：
  - 路线和站点数据缓存
  - 内存优化的路径加载
  - 智能进度显示

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 部署到 GitHub Pages

```bash
npm run deploy
```

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **地图引擎**：Leaflet + React Leaflet
- **状态管理**：Zustand
- **样式**：Tailwind CSS 4
- **构建工具**：Vite
- **数据缓存**：localforage + RBush

## 📊 数据来源

本项目使用 [hkbus](https://github.com/hkbus) 提供的开放数据：
- 路线数据：[hk-bus-crawling](https://github.com/hkbus/hk-bus-crawling)
- 路径数据：[route-waypoints](https://github.com/hkbus/route-waypoints)

详细数据源说明见 [DATA_SOURCE.md](DATA_SOURCE.md)

## � 反馈与贡献

这是我的第一个可运行的开源项目！如果你有任何建议、发现了 bug，或想要添加新功能，非常欢迎：

- 🐛 [提交 Issue](https://github.com/quenton1225/bus-route-hk/issues) 报告问题或建议
- 🔧 提交 Pull Request 参与开发
- ⭐ 如果觉得有用，欢迎 Star 支持！

## �📝 许可

MIT License
