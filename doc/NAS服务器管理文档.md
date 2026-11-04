# NAS 服务器管理文档（TeamSync 部署环境）

> 本文档记录 TeamSync 生产环境所在的群晖 NAS 的连接方式、运行结构、部署流程和踩过的坑。
> 最后核对时间：2026-09-04，文中所有数字均为当天实测。
> **口令不写入本文档**，请统一放在密码管理器里。

## 1. 服务器基本信息

| 项目        | 值                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------- |
| 主机名      | `Hivision`                                                                                        |
| 型号 / 系统 | Synology DS1821+ / DSM **7.4.1-90080**（2026-07-22 构建）                                         |
| 内网地址    | `192.168.8.6`                                                                                     |
| 公网地址    | `27.219.135.239`，域名 `work.toplink.wang`                                                        |
| SSH 端口    | **2222**（不是 22）                                                                               |
| 运维账号    | `star0312`（uid 1026，属于 `administrators` 组，可 sudo）                                         |
| 数据卷      | `/volume1`，21T 容量，已用 18T（**86%**）                                                         |
| 已运行天数  | 31 天                                                                                             |
| 容器总数    | 22 个（TeamSync 只占其中 3 个，其余是 halo / jira / confluence / HomeAssistant 等，**不要误动**） |

## 2. 连接方法

### 2.1 SSH（日常运维走这条）

```bash
ssh -p 2222 star0312@192.168.8.6
```

公网连不上 SSH（2222 未做端口映射），必须在内网或先连 VPN。

### 2.2 三个必踩的坑

**坑一：`sudo` 找不到 `docker`。**
DSM 的 `sudo` 有独立的 `secure_path`，不包含 `/usr/local/bin`，所以 `sudo docker ps` 会报
`sudo: docker: command not found`。必须写绝对路径：

```bash
sudo /usr/local/bin/docker ps
```

真实二进制在 `/var/packages/ContainerManager/target/usr/bin/docker`，`/usr/local/bin/docker` 是软链接。
`docker-compose` 同理，在 `/usr/local/bin/docker-compose`。

**坑二：一次会话里多条 `sudo -S` 会抢光 stdin。**
非交互场景（脚本、自动化）里第二条 `sudo -S` 会报 `sudo: no password was provided`。
正确做法是只认证一次，把整段脚本丢进 root shell：

```bash
sudo -S -p "" bash -s <<'EOS'
D=/usr/local/bin/docker
$D ps
$D logs --tail 50 teamsync-app
EOS
```

**坑三：SFTP 服务是关闭的，`scp` / `sftp` / rsync 全部不可用。**
`/etc/ssh/sshd_config` 里虽然有 `Subsystem sftp internal-sftp`，但 DSM 的 SFTP 服务开关没打开，
连接会直接报 `SSHException: Channel closed`。三种应对方式：

1. **推荐**：在 DSM 里打开开关 —— 控制面板 → 文件服务 → FTP → SFTP 页签 → 勾选「启用 SFTP 服务」
   （端口沿用 SSH 的 2222）。之后 `scp -P 2222` 就能正常用了。
2. 文本文件（如 `default.conf`）用带引号的 heredoc 经 SSH 写入，再用 `md5sum` 核对：

   ```bash
   ssh -p 2222 star0312@192.168.8.6 'cat > /volume1/docker/toplink_projects_sys/default.conf' <<'EOF'
   ...文件内容...
   EOF
   ```

   引号一定要加（`<<'EOF'`），否则本地 shell 会把 nginx 配置里的 `$host`、`$uri` 提前展开成空串。
3. 二进制文件（如 43MB 的 jar）用 base64 中转，或者直接走 DSM File Station 网页上传。

### 2.3 DSM 网页管理界面

内网 `http://192.168.8.6:5000`。文件上传可以用里面的 File Station。

> ⚠️ 这个端口**目前对公网开放**（`http://27.219.135.239:5000` 实测返回 200，是明文 HTTP 的
> DSM 登录页）。详见第 8 节安全待办。

## 3. TeamSync 的运行结构

### 3.1 请求链路

```
浏览器
  └─ http://work.toplink.wang:82        （路由器端口映射 82 → 192.168.8.6:8081）
       └─ teamsync-web 容器（nginx 1.29.4，8081 → 80）
            ├─ /            静态文件，SPA 回退到 index.html
            └─ /api/        反向代理 → http://192.168.8.6:8080
                                 └─ teamsync-app 容器（host 网络，Spring Boot 8080）
                                      └─ postgres 容器（5433 → 5432，schema teamsync）
```

前端产物里的 `axios.baseURL` 是 `/api`，**同源**，所以浏览器不会发起跨域请求。

> 端口 82 不在 NAS 上监听，也不在 DSM 的反向代理规则里（DSM 只配了 `13147`、`89`、`90` 三条，
> 后两条还指向另一台 `192.168.8.13`）。所以 **82 → 8081 的映射在路由器上**，改端口要去路由器改。
> 已实测：`192.168.8.6:8081` 和 `work.toplink.wang:82` 返回的 `index.html` 字节完全一致
> （sha256 前缀 `e5e47849`，1327 字节），确认是同一个 nginx。

### 3.2 三个容器

| 容器名         | 镜像                               | 网络     | 端口              | 重启策略 |
| -------------- | ---------------------------------- | -------- | ----------------- | -------- |
| `teamsync-web` | `nginx:latest`（1.29.4）           | bridge   | 8081 → 80         | `always` |
| `teamsync-app` | `bitnami/java:21`                  | **host** | 直接占用主机 8080 | `always` |
| `postgres`     | `postgres:latest`（实际 **17.2**） | bridge   | 5433 → 5432       | `always` |

三个都是 `restart: always`，NAS 重启后会自动拉起，不需要手工干预。

> `postgres` 容器是**多个项目共用**的，不是 TeamSync 专属，动它之前先确认影响面。

### 3.3 挂载与目录

项目目录 `/volume1/docker/toplink_projects_sys`（55MB）：

| 路径                        | 说明                                                             | 挂载到                                        |
| --------------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| `teamsync.jar`              | 后端产物，43MB                                                   | `teamsync-app:/app/teamsync.jar`              |
| `application.yml`           | 后端配置（数据库、邮件、OSS 密钥）                               | `teamsync-app:/app/application.yml`           |
| `default.conf`              | nginx 站点配置                                                   | `teamsync-web:/etc/nginx/conf.d/default.conf` |
| `html/`                     | 前端产物：`index.html` + `favicon.ico` + `assets/`（348 个文件） | `teamsync-web:/usr/share/nginx/html`          |
| `dist.zip.bak`              | 旧前端整包备份，确认没问题后可删                                 | —                                             |
| `default.conf.bak.20260904` | 改配置前的备份，确认没问题后可删                                 | —                                             |

注意 `teamsync-app` 挂的是**整个项目目录**（`/volume1/docker/toplink_projects_sys` → `/app`）且是
**读写**的，也就是说后端容器对前端 web 根目录有写权限。目录权限现在是 `777`，属主混着
`star0312`（SSH 写入的）和 `zuning`（File Station 上传的）。这两点都偏松，见第 8 节。

数据库数据**不在**这个目录里，而在 docker 命名卷 `/volume1/@docker/volumes/f62808f1.../_data`。
备份数据库不能靠拷贝项目目录，必须 `pg_dump`。

## 4. 日常运维命令

下面所有命令都假定已 `ssh -p 2222 star0312@192.168.8.6`，并先设一个别名省事：

```bash
alias d='sudo /usr/local/bin/docker'
```

| 目的                        | 命令                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| 看三个容器状态              | `d ps --filter name=teamsync --filter name=postgres`                                       |
| 看后端日志（跳过 SQL 噪音） | `d logs --tail 500 teamsync-app 2>&1 \| grep -viE '^(==>\|<==)'`                           |
| 只看后端报错                | `d logs teamsync-app 2>&1 \| grep -aiE 'ERROR\|Exception' \| tail -20`                     |
| 看 nginx 访问日志           | `d logs --tail 100 teamsync-web`                                                           |
| 重启后端                    | `d restart teamsync-app`                                                                   |
| 改完 nginx 配置热加载       | `d exec teamsync-web nginx -t && d exec teamsync-web nginx -s reload`                      |
| 站内自测后端                | `curl -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/api/big-screen/task-reminder` |
| 站内自测前端                | `curl -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8081/`                             |
| 进数据库                    | `d exec -it postgres psql -U toplink -d postgres -c 'set search_path=teamsync'`            |

**改 nginx 配置永远用 `nginx -t` + `nginx -s reload`，不要 `docker restart teamsync-web`。**
`-t` 先验证语法，配置写错了 reload 会被拒绝、旧配置继续服务；直接 restart 的话配置有错容器就起不来了。

### 备份数据库

```bash
sudo /usr/local/bin/docker exec postgres \
  pg_dump -U toplink -d postgres -n teamsync -Fc \
  > /volume1/docker/toplink_projects_sys/teamsync_$(date +%Y%m%d).dump
```

当前 `teamsync` schema 有 17 张表，总大小 3.6MB，dump 很快。

## 5. 部署流程

### 5.1 前端

```bash
cd TeamSync_web
pnpm build            # 等价于 build:prod，必须是 production 模式
```

**为什么必须是 production 模式**：`.env.local-build` 会把 `VITE_API_URL` 写成
`http://192.168.8.6:8080/api` 并烧进 `axios.baseURL`，公网访问时浏览器就会直连内网地址，
必然触发跨域失败，同时把内网拓扑暴露给公网客户端。只有 `production` 模式的 `baseURL` 是 `/api`。

**上传前自检**（0 才是对的）：

```bash
grep -rl "192.168.8.6" dist/ | wc -l
```

然后把 **`dist/` 里面的内容**（不是 `dist` 目录本身）放进 `/volume1/docker/toplink_projects_sys/html/`，
即 `html/index.html`、`html/favicon.ico`、`html/assets/`。传完清掉 macOS 带进来的元数据文件：

```bash
find /volume1/docker/toplink_projects_sys/html -name '._*' -delete
```

静态文件直接生效，**不需要重启容器**。`index.html` 配了 `no-cache`，同事不用强制刷新。

> 2026-09-04 实测补充：如果 SFTP 还没开，推荐用 SSH + tar 管道上传，避免 `scp` 不可用。
> 注意不要用 `mv html html.bak && mv html.new html` 这种方式替换目录——Docker 的 bind mount
> 仍可能指向旧目录 inode，导致 nginx 继续吐旧页面；应该在 `html/` 目录内原地清空再拷贝。

```bash
# 本地：打包 dist 内容（--no-xattrs 避免 macOS 塞入 ._* 元数据）
cd TeamSync_web
COPYFILE_DISABLE=1 tar --no-xattrs -C dist -cf - . | \
  ssh -p 2222 star0312@192.168.8.6 \
    'rm -rf /volume1/docker/toplink_projects_sys/html.stage && \
     mkdir -p /volume1/docker/toplink_projects_sys/html.stage && \
     tar -xf - -C /volume1/docker/toplink_projects_sys/html.stage && \
     find /volume1/docker/toplink_projects_sys/html.stage -name "._*" -delete'

# 远程：原地替换 html 内容（不要 rename 整个目录）
ssh -p 2222 star0312@192.168.8.6 \
  'cd /volume1/docker/toplink_projects_sys && \
   find html -mindepth 1 -delete && \
   cp -a html.stage/. html/ && \
   rm -rf html.stage && \
   find html -name "._*" -delete'
```

> 历史故障：2026-09-04 出现的 403 Forbidden，原因就是 `html/` 里只丢了一个**没解压**的 `dist.zip`
> 加四个 `._*` 文件，没有 `index.html`，nginx 又没开目录列表，于是回 403。**传 zip 一定要解压。**

### 5.2 后端

```bash
cd TeamSync
mvn -B -DskipTests package     # 产出 target/TeamSync-*.jar
```

上传覆盖 `/volume1/docker/toplink_projects_sys/teamsync.jar`，然后**必须重启**（jar 已加载进内存）：

```bash
sudo /usr/local/bin/docker restart teamsync-app
sudo /usr/local/bin/docker logs -f teamsync-app 2>&1 | grep -a "Started TeamSyncApplication"
```

改 `application.yml` 同样需要重启后端。

## 6. 容器重建（重要：没有 compose 文件）

这两个容器是**手工创建**的，`/volume1/docker/toplink_projects_sys` 下没有 `docker-compose.yml`，
DSM Container Manager 里也没有对应的 compose 项目。**一旦容器被删除，配置只能靠下面的命令重建。**

```bash
sudo /usr/local/bin/docker run -d --name teamsync-web \
  --restart always \
  -p 8081:80 \
  -v /volume1/docker/toplink_projects_sys/html:/usr/share/nginx/html \
  -v /volume1/docker/toplink_projects_sys/default.conf:/etc/nginx/conf.d/default.conf \
  nginx:latest

sudo /usr/local/bin/docker run -d --name teamsync-app \
  --restart always \
  --network host \
  -w /app \
  -v /volume1/docker/toplink_projects_sys:/app \
  bitnami/java:21 \
  sh -c "java -jar /app/teamsync.jar --spring.config.location=/app/application.yml"
```

建议后续补一个 `docker-compose.yml` 落到项目目录，把上面两段固化下来，顺手就能修掉
「挂载可写」「整个项目目录挂进容器」这两个问题（见第 8 节）。

## 7. 注意事项（踩过的坑汇总）

1. **不要碰其他项目。** NAS 上还有 halo、halo-postgres、toplink-jira、toplink-confluence、
   HomeAssistant、mysql848、redis、pixelbeat 等 19 个容器在跑，`docker restart` 之类的命令
   一定要带准确的容器名，别用 `docker restart $(docker ps -q)` 这种批量写法。
2. **`postgres` 容器是共用的**，重启会影响其他项目。
3. **改 nginx 用 reload，不用 restart**（理由见第 4 节）。
4. **前端必须 production 模式构建**（理由见 5.1）。
5. **zip 包一定要解压**，403 就是这么来的。
6. **macOS 上传会带 `._*` 文件**，会污染 web 根目录，传完记得清。
7. **`sudo` 要写 docker 绝对路径**，脚本里只认证一次 sudo。
8. **SFTP 是关着的**，`scp` 用不了，先去 DSM 打开开关。
9. `/volume1` 已用 86%，剩 3.1T。加新容器或大文件前先看一眼 `df -h /volume1`。
10. **`rsync` over SSH 在这台 NAS 上不可用。** 即使 SSH 密钥能登录、远端也有 `/usr/bin/rsync`，
    `rsync --server` 仍会报 `Permission denied, please try again.`；不要浪费时间，直接用 SSH + tar 管道。
11. **对比文件列表必须统一 `LC_ALL=C`。** 用 `comm` 比较本地/远端文件清单时，如果两边 `sort` 的
    locale 不一致，会报 `file 2 is not in sorted order`，且可能误删文件；脚本里写成
    `LC_ALL=C sort`。
12. **替换前端目录要在 `html/` 内原地进行，不要 `mv` 整个目录。** Docker bind mount 绑定的是
    目录 inode，`mv html html.bak && mv html.new html` 后 nginx 可能继续读旧目录；应先备份，
    再清空 `html/` 内容，把新文件拷进去。

## 8. 待办清单（按优先级）

### 安全

1. **DSM 管理界面 5000 端口对公网开放，且是明文 HTTP。** 实测 `http://27.219.135.239:5000` 直接返回
   DSM 登录页，任何人都能爆破，登录口令还会明文经过公网。建议去路由器撤掉这条端口映射；确实需要
   外网管理就改走 HTTPS（5001）+ 两步验证 + 自动封锁，或者干脆只留 VPN 入口。
2. **更换 NAS 账号口令。** 当前口令曾以明文出现在协作对话里。顺带建议 SSH 改为仅密钥认证
   （现在是 `PasswordAuthentication yes`）。
3. **后端 8080 在内网是裸奔的。** 公网访问不到（已实测 8080/8081/2222/5433 从公网均不可达，
   只有 82 通），但内网任何设备都能直连 8080 绕过 nginx。建议让 Spring Boot 只监听 `127.0.0.1`，
   或改回 bridge 网络不发布端口。
4. **`WebMvcConfig` 里的 CORS 是 `allowedOriginPatterns("*")` + `allowCredentials(true)`。**
   既然前端已经同源，应该收成明确的白名单，或者直接去掉 CORS 配置。
5. **收紧文件权限**：`html/` 和 `default.conf` 目前是 `777`，`default.conf` 建议以 `:ro` 挂载，
   `teamsync-app` 不需要挂整个项目目录（只需要 jar 和 yml 两个文件）。

### 配置

1. **邮件提醒里的链接是坏的。** `application.yml` 里
   `teamsync.mail.reminder.frontend-base-url` 用的是默认值 `http://localhost:5173`，同事收到
   提醒邮件后点链接会打不开。应改成 `http://work.toplink.wang:82`。
2. **关掉生产环境的 SQL 全量打印。** `mybatis-plus.configuration.log-impl` 现在是
   `StdOutImpl`，后端日志 321,952 行里有 272,133 行（85%）是 SQL，容器日志库已经涨到 75MB。
   生产环境应删掉这项配置或换成 `Slf4jImpl` 并把级别调到 `WARN`。
3. **容器日志没有大小上限。** Synology 用的是自家的 `db` 日志驱动，`log.db` 分别是
   teamsync-app 75MB、postgres 33MB、teamsync-web 25MB。清掉 SQL 噪音后这个问题会自然缓解。
4. **补 `docker-compose.yml`**，把第 6 节的两条 `docker run` 固化下来。
5. **加一个定时 `pg_dump`**（DSM 控制面板 → 任务计划），目前没有任何 TeamSync 相关的计划任务。

### 可以清理的文件

`/volume1/docker/toplink_projects_sys/dist.zip.bak`（3.8MB）和 `default.conf.bak.20260904`，
确认线上没问题后可以删。

## 9. 现状核对结果（2026-09-04）

前端 `192.168.8.6:8081` 与 `work.toplink.wang:82` 均返回 200 且内容一致；后端
`/api/big-screen/task-reminder` 返回 200；nginx `-t` 通过；gzip 生效，主包 2,454,045 → 733,007 字节
（省 70%）；`/assets/` 长缓存、`index.html` 不缓存；OPTIONS 预检返回 200（登录后的跨域报错已修）；
后端日志除客户端 token 过期的 `JWT expired` 外无异常。
