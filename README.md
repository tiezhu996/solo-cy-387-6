# RentFind 租房与物业报修平台

```bash
cp .env.example .env
docker compose up -d --build
```

RentFind 面向房东、租客和物业人员，提供房源发布、搜索预约、合同管理和报修跟踪能力。

## 项目主要功能

- 房源发布：小区、户型、面积、租金、押金、付款方式、照片和设施。
- 搜索筛选：区域、价格、户型、面积、设施，并支持列表和地图视图切换。
- 预约看房：租客选择时间段，房东确认后生成通知。
- 合同管理：生成租赁合同模板并记录租期、租金、双方信息和状态。
- 物业报修：提交故障类型、描述和照片，物业接单并更新进度。
- 共享设施预约与核销：物业维护健身房等共享设施与开放时段，租客在线预约、到场由物业按凭证核销；同一设施同一时段仅允许一个有效预约，支持取消、使用时间登记与爽约标记。
- 角色区分：房东、租客、物业人员拥有不同工作台。

## 快速启动方式

首次启动前执行：

```bash
cp .env.example .env
docker compose up -d --build
```

访问地址：http://localhost:18407

## 共享设施预约与核销模块

首页默认进入设施模块，可在右上角切换「租客工作台 / 物业工作台」。

### 业务规则

| 场景 | 规则与错误码 |
| --- | --- |
| 物业维护设施/时段 | 新增、停用、删除设施，创建/关闭开放时段；重名返回 `FACILITY_NAME_DUPLICATE`，时段重叠返回 `SLOT_OVERLAP`，时间倒挂返回 `SLOT_TIME_INVALID` |
| 租客预约 | 仅可预约「开放设施 + 未结束 + 未约满」的时段；设施不存在返回 `FACILITY_NOT_FOUND`，时段不存在返回 `SLOT_NOT_FOUND`，时段已占返回 `SLOT_FULL` |
| 并发预约 | 数据库对（设施, 时段）建立**部分唯一索引**（仅"待核销/已核销"生效），并配合行级锁；并发提交保证只有一个成功，其余收到 409 `SLOT_FULL` |
| 取消预约 | 仅「待核销」可取消；取消后时段立即释放可被他人再约，重复取消返回 `ALREADY_CANCELLED` |
| 到场核销 | 物业输入凭证号核销，记录核销时间；开场前 15 分钟开放核销；凭证不存在 `VOUCHER_NOT_FOUND`、重复核销 `VOUCHER_ALREADY_USED`、取消后核销 `RESERVATION_CANCELLED`、爽约后核销 `RESERVATION_NO_SHOW`、过早核销 `RESERVATION_NOT_STARTED` |
| 使用结束 | 已核销预约可登记使用结束并记录时间，未核销返回 `RESERVATION_NOT_CHECKED_IN`，重复结束返回 `RESERVATION_ALREADY_FINISHED` |
| 爽约 | 已过结束时间仍待核销的预约，在查询时自动批量标记为爽约；物业也可手动标记，重复标记返回 `ALREADY_NO_SHOW` |
| 数据持久化 | 全部数据落 PostgreSQL（本地开发可用 SQLite），刷新或重新进入后设施、时段、预约和核销状态均可查询 |

### 主要接口（前缀 `/api`）

- `GET/POST /facilities/`、`PATCH/DELETE /facilities/{id}/`（写操作需物业角色）
- `GET/POST /slots/`、`POST /slots/{id}/close/`
- `GET/POST /reservations/`（GET 支持 `tenantPhone`/`status`/`facilityId`/`date` 过滤）
- `POST /reservations/{id}/cancel/`、`POST /reservations/{id}/no-show/`
- `POST /check-in/`、`POST /finish-use/`

统一响应包络：`{ "success": true, "code": 0, "data": ..., "error": null }`；失败时 `success=false`，`code` 为明确的业务错误码。物业写操作需带请求头 `X-User-Role: property`（接入 JWT 后由登录角色替换）。

## 本地开发方式

```bash
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py seed_facilities && python manage.py runserver 0.0.0.0:8000
cd frontend && npm install && npm run dev
```

后端默认使用 SQLite（`backend/db.sqlite3`），无需数据库即可本地体验；设置 `DATABASE_URL` 后切换 PostgreSQL。

后端测试（含 5 线程并发只成功一次的用例）：

```bash
cd backend && python manage.py test app.apps.facility
```

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 前端 | Vue 3、TypeScript、Element Plus、Vite、高德地图 JS API |
| 后端 | Python、Django、Django REST Framework |
| 数据库 | PostgreSQL |
| 认证 | JWT |
| 部署 | Docker Compose、Nginx |

## 项目目录结构

```text
.
├── backend
│   ├── app
│   ├── database
│   └── manage.py
├── frontend
│   ├── src
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## 环境变量说明

| 变量 | 说明 |
| --- | --- |
| COMPOSE_PROJECT_NAME | Compose 项目名，固定为 rentfind |
| DATABASE_URL | Django 连接 PostgreSQL 的地址 |
| DJANGO_SECRET_KEY | Django 密钥 |
| AMAP_KEY | 高德地图 JS API Key |

## Docker 部署说明

Compose 顶层声明 `name: rentfind`，容器名带 `rentfind-` 前缀，数据库和媒体文件分别使用命名卷持久化，前端 Nginx 将 `/api` 代理到后端 `backend:8000`。

## License

MIT
