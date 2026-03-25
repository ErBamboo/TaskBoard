# Robot Team Task Board

面向 6-8 人机器人竞赛团队的内部在线任务看板。

系统围绕 `项目 -> 子系统 -> 里程碑 -> 任务` 组织，支持：

- 成员独立账号登录
- 我的任务首页
- 项目列表与项目看板
- 任务创建、编辑、状态流转
- 联调任务与阻塞任务高亮
- 管理员维护成员、项目、子系统、里程碑

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL
- Vitest
- Playwright

## 环境要求

- Node.js 20+
- npm 10+
- 一个可用的 Supabase 项目

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

复制 `.env.example` 为 `.env.local`，并填入你的 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

如果你要打包 Windows 客户端，也要补上：

```env
NEXT_PUBLIC_DESKTOP_APP_URL=https://你的真实公网地址
```

桌面打包脚本会自动读取项目根目录的 `.env` 和 `.env.local`，并自动补上常见的 Rust `cargo` 路径；不需要再手工先把这些变量注入 PowerShell 会话。
如果缺少 `NEXT_PUBLIC_DESKTOP_APP_URL`，桌面打包会直接失败，避免误生成一个仍然指向 `task-board.example.com` 的错误安装包。
Windows 下的 `npm run tauri:build` 和 `npm run tauri:dev` 会通过项目内包装脚本启动，不要求 `node` 单独出现在系统 `PATH` 里。

3. 初始化数据库

在 Supabase SQL 编辑器中依次执行：

- `supabase/migrations/202603250001_initial_schema.sql`
- `supabase/seed.sql`

4. 启动开发环境

```bash
npm run dev
```

默认访问地址：

- `http://127.0.0.1:3000`

## 开发用种子账号

执行 `supabase/seed.sql` 后，可使用这些账号验证功能：

- 管理员：`admin@robot.lab` / `robot-admin-123`
- 成员：`mech@robot.lab` / `robot-member-123`
- 成员：`algo@robot.lab` / `robot-member-123`
- 成员：`embedded@robot.lab` / `robot-member-123`

## 主要页面

- `/login`
  - 邮箱密码登录
- `/my-tasks`
  - 成员默认首页
  - 查看个人任务列、临期任务、阻塞任务
- `/projects`
  - 查看所有项目
- `/projects/[projectId]`
  - 查看项目看板
  - 新建 / 编辑任务
  - 更新任务状态
- `/admin`
  - 管理员控制台
  - 创建成员账号
  - 重置密码 / 停用成员
  - 维护项目、子系统、里程碑

## 权限模型

- `admin`
  - 管理成员、项目、子系统、里程碑
  - 修改任意任务
- `member`
  - 查看自己的任务首页
  - 查看项目看板
  - 在已有项目和子系统下创建任务
  - 编辑自己创建或自己负责的任务
  - 更新自己负责任务的状态

## 常用命令

```bash
npm run dev
npm run test
npm run typecheck
npm run build
npm run tauri:build
npx playwright test
```

## 测试说明

- 单元测试：Vitest
- 端到端测试：Playwright
- 当前默认可直接运行的 e2e 覆盖以未登录路由保护为主
- 如果要扩展登录后的 e2e，需要先保证 `.env.local`、Supabase 迁移和种子数据都已准备完毕

## 数据模型概览

核心对象：

- `user_profiles`
- `projects`
- `subsystems`
- `milestones`
- `tasks`
- `task_relations`

任务状态固定为：

- `todo`
- `in_progress`
- `blocked`
- `done`

## 部署到 Vercel

1. 在 Supabase 准备生产项目
2. 关闭邮件确认，使用管理员统一创建成员账号
3. 在 Vercel 配置以下环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 首次部署前先执行数据库迁移
5. 不要在生产库执行 `supabase/seed.sql`

## 当前边界

当前已完成的是可用 MVP，不包含：

- 评论
- 附件
- 通知提醒
- 甘特图
- 多管理员
- 复杂审批流

## 代码结构

```text
src/
  app/
  components/
    admin/
  features/
    admin/
    auth/
    dashboard/
    projects/
    tasks/
  lib/
  types/
supabase/
tests/
```
