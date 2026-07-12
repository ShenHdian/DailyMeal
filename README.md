# 🥗 饮食黑白名单 Dailymeal

> 健康饮食管理工具 — 白名单推荐吃，黑名单避免吃，让饮食选择更健康。

基于 [WhatToEat（今天吃什么）](D:\Code\WhatToEat) 重构，将菜品随机选取升级为**饮食黑白名单管理系统**。

---

## ✨ 功能

| 功能 | 说明 |
|------|------|
| ✅ **白名单管理** | 添加推荐食用的健康食品，支持编辑和删除 |
| ❌ **黑名单管理** | 添加应避免的食品，与白名单分开管理 |
| 🎲 **随机推荐** | 从白名单中随机抽取一道食品，帮你做决定 |
| 📅 **饮食日历** | 月历视图记录每日抽取历史，一目了然 |
| 💬 **每日评论** | 每天可以为抽取结果写评论，记录饮食感受 |

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | [React 19](https://react.dev/) + [TypeScript 6](https://www.typescriptlang.org/) |
| **构建工具** | [Vite 8](https://vite.dev/) |
| **UI 组件库** | [Shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS v4](https://tailwindcss.com/) |
| **后端** | [Express 4](https://expressjs.com/) + [SQLite](https://www.sqlite.org/) |
| **ORM** | [Knex](https://knexjs.org/) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |

---

## 📁 项目结构

```
Dailymeal/
├── package.json                 # 根配置（concurrently 协调前后端）
│
├── client/                      # 前端
│   ├── src/
│   │   ├── App.tsx              # 主应用：顶栏 + 随机推荐 + 日历 + 黑白名单 Tab
│   │   ├── main.tsx             # 入口文件
│   │   ├── index.css            # 全局样式（Tailwind + Shadcn 主题变量）
│   │   ├── api/
│   │   │   ├── foods.ts         # 食品相关 API 封装
│   │   │   └── comments.ts      # 评论 + 日历 API 封装
│   │   ├── types/
│   │   │   └── food.ts          # Food 类型定义
│   │   └── components/
│   │       ├── ui/              # Shadcn/ui 组件
│   │       │   ├── button.tsx / card.tsx / dialog.tsx / input.tsx
│   │       │   ├── label.tsx / tabs.tsx / badge.tsx
│   │       │   ├── separator.tsx / scroll-area.tsx
│   │       │   └── sonner.tsx
│   │       ├── FoodList.tsx     # 食品列表组件
│   │       ├── FoodDialog.tsx   # 添加/编辑弹窗
│   │       ├── RandomPicker.tsx # 随机推荐器
│   │       └── CalendarJournal.tsx # 饮食日历
│   ├── vite.config.ts           # Vite 配置（含 /api 代理）
│   └── components.json          # Shadcn/ui 配置
│
└── server/                      # 后端
    ├── server.js                # Express 主服务（端口 3001）
    └── db.js                    # 数据库初始化 + 自动建表
```

---

## 🚀 快速开始

### 环境要求
- **Node.js** >= 18
- **npm** >= 9

### 安装与运行

```bash
# 1. 安装根依赖
cd D:\Code\Dailymeal
npm install

# 2. 安装服务端依赖
cd server
npm install
cd ..

# 3. 安装客户端依赖
cd client
npm install
cd ..

# 4. 开发模式启动（前后端同时启动）
npm run dev
```

### 构建与部署

```bash
# 构建前端
npm run build

# 启动生产服务（自动 serve 前端构建产物）
npm start
```

访问 [http://localhost:3001](http://localhost:3001) 即可使用。

---

## 📡 API 文档

### 食品管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/foods?type=whitelist\|blacklist | 获取食品列表（可按类型筛选） |
| POST | /api/foods | 添加食品 `{ name, type }` |
| PUT | /api/foods/:id | 编辑食品 `{ name, type? }` |
| DELETE | /api/foods/:id | 删除食品 |
| GET | /api/foods/random | 从白名单随机选取 |

### 历史记录与日历

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/history | 获取当日抽取记录（最多 3 条） |
| POST | /api/history | 添加抽取记录 |
| GET | /api/calendar?month=YYYY-MM | 获取月历数据 |
| GET | /api/comments?date=YYYY-MM-DD | 获取某日评论 |
| POST | /api/comments | 添加评论 |
| DELETE | /api/comments/:id | 删除评论 |
| GET | /api/health | 服务状态检查 |

---

## 🗃️ 数据库

使用 SQLite 本地数据库，无需额外配置。启动时自动创建以下表：

- **foods** — 食品表（id, name, type, created_at）
- **history** — 抽取历史（id, food_name, date, created_at）
- **comments** — 评论（id, content, date, created_at）

---

## 📝 与 WhatToEat 的对比

| 维度 | WhatToEat（原项目） | Dailymeal（新项目） |
|------|--------------------|--------------------|
| UI 组件库 | Ant Design 6 | Shadcn/ui |
| 核心功能 | 随机选取菜品 | 黑白名单 + 仅白名单推荐 |
| 添加食品 | 单一名称输入 | 名称 + 类型（白名单/黑名单） |
| 视觉风格 | Ant Design 主题 | Tailwind 定制 |
| 数据模型 | 单一菜品列表 | 按 type 字段区分黑白名单 |

---

## 📄 许可证

MIT License