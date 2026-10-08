# 林间文具店 / Forest Stationery Shop

Browser 3D stationery shop for grade-2 money practice (yuan / jiao).
Students shop and check out. Teachers review attempts on a separate page.

- Student app: `/`
- Teacher app: `/teacher`
- Default local URL: `http://localhost:5173/`

[中文说明](#中文) · [English](#english) · [AI context](#ai-context)

---

## AI context

Use this section first when editing or extending the project.

### Goal

Teach `1 yuan = 10 jiao` through a shop checkout:

1. Student picks school supplies.
2. Student enters the total in yuan/jiao.
3. Student pays with virtual cash.
4. Student enters the change.
5. Teacher sees purchase history and mistake counts.

### Runtime

| Item | Value |
| --- | --- |
| Package manager | npm |
| Dev command | `npm run dev` |
| Port | `5173` (strict) |
| Host | `true` (LAN reachable) |
| Build | `npm run build` |
| Preview | `npm run preview` |
| Node | 20+ |

### Stack

Vite + React 19 + TypeScript + React Three Fiber + Three.js + Zustand + Tailwind CSS 4.

No React Router. Routing is pathname-based in `src/App.tsx`:

- `/teacher` → teacher UI
- otherwise student UI / login

### Important paths

| Path | Role |
| --- | --- |
| `src/App.tsx` | Student vs teacher gate |
| `src/ui/Login.tsx` | Student name + class + avatar |
| `src/ui/Register.tsx` | Checkout panel: sum → pay → change |
| `src/ui/Teacher.tsx` | Teacher dashboard + per-student stats |
| `src/ui/Hud.tsx` | In-game overlays |
| `src/game/store.ts` | Zustand shop state, `payCash` |
| `src/game/money.ts` | Bills, purse, change |
| `src/game/catalog.ts` | Supplies and prices (jiao) |
| `src/game/records.ts` | Purchase records + teacher aggregates |
| `src/game/session.ts` | Persist student/avatar in localStorage |
| `src/game/teacherAuth.ts` | Teacher login credentials |
| `src/scene/*` | 3D exterior / interior / characters |
| `plugins/purchaseApi.ts` | Vite middleware for `/api/purchases` |
| `data/purchases.json` | Runtime purchase data (**do not commit**) |
| `data/.gitkeep` | Keep empty data folder in git |

### Purchase recording

On successful checkout, `payCash` in `src/game/store.ts` calls `savePurchase`:

1. Cache to `localStorage` key `forest-shop-records`
2. `POST /api/purchases`
3. Server stores `data/purchases.json`

Teacher page loads with `GET /api/purchases`.

Record fields include:

- student name / room
- items, total, paid, change
- `sumAttempts`, `sumWrong`, `changeAttempts`, `changeWrong`
- `sumCorrect`, `changeCorrect`

### Teacher auth

Defined in `src/game/teacherAuth.ts` (username is `admin`; password stays in that file, not in README).

Session key: `sessionStorage` → `forest-shop-teacher`

Teacher UI tabs:

1. Dashboard: class totals, room summary, students needing practice, recent purchases
2. Students: filter by room, ranking table, per-student detail

### Do not commit

- `data/purchases.json` (gitignored)
- `node_modules/`
- `dist/`
- teacher password in README

### Conventions for agents

- Prefer Chinese UI copy for classroom pages.
- Money unit is integer **jiao**.
- Keep camera fixed orientation indoors; follow player by translation only.
- Do not add React Router unless required.
- Keep purchase API file-based for local classroom use.
- After checkout changes, verify both `/` and `/teacher`.

---

## 中文

### 怎么玩

1. 填写名字、班级、角色后进店。
2. 点木门进去。
3. 方向键 / `WASD` 走路，或点地面走过去。
4. 点柜子看文具并加入购物车；桌上水彩笔、胶水可直接点。
5. 去收银台：先算总价，再付钱，再算找零。
6. 店内门可走回外面。

价格：1 元 = 10 角。购物车最多 8 件，同一种最多 2 件。

| 位置 | 文具 |
| --- | --- |
| 蓝色柜子 | 铅笔 5角、橡皮 8角、尺子 1元、铅笔盒 2元5角 |
| 木柜子 | 练习本 1元5角、文件夹 1元2角、便签 6角 |
| 桌子 | 水彩笔 3元、胶水 1元2角 |

### 老师查看

地址：`http://localhost:5173/teacher`

用户名是 `admin`。密码写在 `src/game/teacherAuth.ts`，这里不公开。

老师页有「总览看板」和「学生统计」。记录保存在服务器文件 `data/purchases.json`，不同浏览器也能看到。

### 本地运行

```bash
npm install
npm run dev
```

---

## English

### How to play

1. Enter name, class, and avatar.
2. Click the wooden door to enter.
3. Move with arrows / `WASD`, or click the floor.
4. Open cabinets to shop; table items can be clicked directly.
5. At checkout: enter total, pay, then enter change.
6. Use the interior door to leave.

Money unit: 1 yuan = 10 jiao. Cart max 8 items, max 2 of the same item.

### Teacher view

URL: `http://localhost:5173/teacher`

Username is `admin`. Password lives in `src/game/teacherAuth.ts` and is not listed here.

Dashboard + per-student stats. Records live in `data/purchases.json` on the shop server.

### Run locally

```bash
npm install
npm run dev
```
