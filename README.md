# inverse-proportion

九年级“反比例函数”教师主导互动课堂。课程以五份课堂精讲 PPT 的知识顺序为准，网页负责把同一知识变成讲解、动画、实验室和随机检测。

## 已实现范围

- 5 个 Lesson、90 个唯一 Step，固定分配为 15 / 19 / 17 / 18 / 21。
- 主类型合计：15 个讲解、19 个动画、48 个实验室、8 个随机 Quick Check。
- 单一课堂壳、Hash Router、Lesson Engine、Step Registry、Teacher Mode 与统一 Step 生命周期。
- Canvas 笛卡尔核心 + 反比例函数适配器；支持双分支、断点、Ghost、直线、阈值、区域和拖拽点。
- Reality ↔ Equation ↔ Graph 单一状态源联动，以及统一 seeded Random Question Generator。
- KaTeX 公式、键盘操作、ARIA live、reduced motion、Canvas 文本回退和三档课堂视口。

完整 Step—PPT—类型映射位于 [`src/core/course-data.js`](src/core/course-data.js)。

## 本地运行

```powershell
npm.cmd ci
npm.cmd run dev
```

开发地址默认使用 `/`；生产构建使用 GitHub Pages base `/inverse-proportion/`。

## 验证命令

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
```

`test:e2e` 会自行启动和关闭 Vite preview，遍历 90 个路由，并在 1920×1080、1366×768、1280×720 三档运行。关键页面另以 1024×576 CSS 视口模拟 1280×720 下的 125% 浏览器缩放。

## 架构

```text
src/core/          课程清单、路由、课堂壳、Step 注册
src/math/          纯数学、交点、面积、范围、不等式
src/graph/         笛卡尔核心与反比例适配器
src/components/    公式、图象舞台、Quick Check
src/interactions/  三联动状态与随机题系统
src/lessons/       内容配置与共享场景渲染器
tests/             Vitest 单元、DOM、引擎与清单测试
e2e/               Playwright 90 路由与交互验收
```

## 发布边界

工作流文件已准备，但本地创建 Git 仓库、分支、commit、push、PR、Pages Source 设置和正式部署都不由脚本自动执行。启用发布前需在仓库 Settings → Pages 将 Source 设为 GitHub Actions，并按项目约定逐项取得授权。
