# TeamSync

TeamSync 是一个面向团队协作和项目推进的项目管理系统，包含 Spring Boot 后端、Vue/Vite 前端和 PostgreSQL 数据库脚本。系统围绕项目、成员、看板任务、子任务、评论、活动流、项目文件、周期计划、日历视图、站内通知、邮件提醒、工作台和管理看板展开。

## 功能概览

- 项目管理：项目、共享分组、项目成员、项目内角色和权限控制。
- 看板协作：阶段、任务拖拽、任务详情、负责人、关注人、子任务、评论和活动日志。
- 周期计划：周期待办、执行记录、本期手动生成看板任务和执行记录跳转。
- 工作台和统计：个人工作台、平台总览、项目健康、任务趋势、成员负载和活动热力数据。
- 日历视图：聚合任务截止、周期计划执行时间、周期计划截止时间和未读通知。
- 通知提醒：站内通知中心、未读数、WebSocket 刷新信号、任务到期/逾期/完成通知和邮件提醒开关。
- 文件协作：项目文件、任务附件、文件上传下载和阿里云 OSS 存储。

## 技术栈

后端：

- Java 21
- Spring Boot 3.5.9
- MyBatis-Plus
- PostgreSQL
- JWT
- Spring Mail
- WebSocket
- Aliyun OSS SDK

前端：

- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router
- Element Plus
- ECharts
- Three.js
- pnpm

## 目录结构

```text
.
├── TeamSync/          # Spring Boot 后端工程
├── TeamSync_web/      # Vue / Vite 前端工程
├── doc/               # 项目文档、数据库脚本和功能说明
│   └── sql/           # PostgreSQL 表结构脚本
└── scripts/           # 辅助脚本
```

重点文档：

- `doc/项目开发基线.md`：当前工程边界、接口、表结构、模块状态和验证命令。
- `doc/重点文件位置索引.md`：按功能模块定位后端、前端和 SQL 文件。
- `doc/站内通知功能说明.md`：站内通知中心、接口和路由维护口径。
- `doc/阿里云OSS配置说明.md`：OSS 环境变量、Bucket 配置和验证方式。
- `doc/未来功能规划.md`：后续功能规划和已知缺口。

## 环境要求

- JDK 21
- Maven Wrapper（已随 `TeamSync/mvnw` 提供）
- Node.js >= 20.19.0
- pnpm >= 8.8.0
- PostgreSQL

## 后端配置

后端主配置文件为 `TeamSync/src/main/resources/application.yml`。敏感信息不要写入代码仓库，启动前通过环境变量提供：

```bash
export DB_URL='jdbc:postgresql://127.0.0.1:5432/postgres?currentSchema=teamsync'
export DB_USERNAME='postgres'
export DB_PASSWORD='your_password'

export MAIL_HOST='smtp.qq.com'
export MAIL_PORT='587'
export MAIL_USERNAME='your_mail@example.com'
export MAIL_PASSWORD='your_mail_auth_code'

export OSS_ENDPOINT='oss-cn-qingdao.aliyuncs.com'
export OSS_BUCKET_NAME='teamsync-files'
export OSS_ACCESS_KEY_ID='your_access_key_id'
export OSS_ACCESS_KEY_SECRET='your_access_key_secret'

export TEAMSYNC_FRONTEND_BASE_URL='http://127.0.0.1:8081'
```

OSS 不是附件列表接口存在性的前置条件，但上传、下载和删除文件需要正确配置 OSS。Bucket 建议保持私有，前端不直接持有 OSS 密钥。

## 数据库初始化

数据库脚本位于 `doc/sql`，当前脚本面向 PostgreSQL。先创建 schema，再按业务表脚本导入：

```sql
CREATE SCHEMA IF NOT EXISTS teamsync;
```

核心脚本包括：

- `sys_user.sql`
- `pm_project.sql`
- `pm_project_group.sql`
- `pm_project_member.sql`
- `pm_task_stage.sql`
- `pm_task.sql`
- `pm_task_member.sql`
- `pm_sub_task.sql`
- `pm_task_comment.sql`
- `pm_task_log.sql`
- `pm_file_node.sql`
- `pm_recurring_plan.sql`
- `pm_task_reminder_log.sql`
- `sys_user_reminder_setting.sql`
- `sys_notification.sql`

## 启动后端

```bash
cd TeamSync
./mvnw spring-boot:run
```

默认端口为 `8080`。后端接口统一以 `/api` 为主要前缀。

## 启动前端

```bash
cd TeamSync_web
pnpm install
pnpm dev
```

当前 `TeamSync_web/.env` 默认使用：

```text
VITE_ACCESS_MODE=frontend
VITE_API_URL=/api
VITE_API_PROXY_URL=http://127.0.0.1:8080
```

也就是说，浏览器访问前端开发服务器，接口请求通过 Vite 代理到本地 Java 后端。

## 构建和验证

后端编译：

```bash
cd TeamSync
./mvnw -DskipTests compile
```

后端测试：

```bash
cd TeamSync
./mvnw test
```

前端构建：

```bash
cd TeamSync_web
pnpm build
```

前端本地后端地址构建：

```bash
cd TeamSync_web
pnpm build:local
```

## 路由和菜单维护说明

当前前端默认运行在 `frontend` 模式，菜单和页面入口主要来自：

```text
TeamSync_web/src/router/modules/**/*.js
```

同目录同名 `.ts` 路由文件不是当前运行链路的主口径。后续新增或调整路由时，应优先修改 `.js` 路由模块。如果切换到 `backend` 模式，需要同步补齐后端 `MenuController` 返回的菜单入口。

## 已知边界

- 周期计划已实现本期手动生成看板任务的最小闭环，尚未实现专用定时扫描器。
- 角色管理和菜单持久化尚未完整落地，前端存在页面入口，后端接口和表结构仍需补齐。
- 部分核心业务表还缺少数据库外键约束，当前主要由业务代码维护一致性。
- 站内通知通过 `sys_notification` 存储，WebSocket 只推未读数刷新信号，不推完整通知明细。
- 部署前应继续检查所有数据库、邮箱、OSS、JWT 等配置，确保通过环境变量或部署平台密钥注入。

## 许可证

当前仓库未声明统一开源许可证。若需要对外协作或二次分发，建议先补充明确的 LICENSE 文件。
