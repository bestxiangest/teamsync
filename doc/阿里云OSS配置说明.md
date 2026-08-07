# 阿里云 OSS 配置说明

## 当前结论

任务详情打开时报 `GET /api/tasks/{taskId}/files` 的 404 时，优先检查前端代理到的后端版本是否包含任务附件接口。OSS 未配置通常会影响上传、下载文件，不会让附件列表接口本身变成 404。

本项目后端通过环境变量读取 OSS 配置：

```bash
OSS_ENDPOINT=oss-cn-qingdao.aliyuncs.com
OSS_BUCKET_NAME=teamsync-files
OSS_ACCESS_KEY_ID=你的 AccessKey ID
OSS_ACCESS_KEY_SECRET=你的 AccessKey Secret
```

不要把 `OSS_ACCESS_KEY_SECRET` 提交到 Git，也不要发到聊天记录里。建议使用 RAM 子账号或 RAM 角色，不要使用阿里云主账号 AccessKey。

## 当前 Bucket 的推荐填写

你当前的 Bucket 名称是：

```bash
OSS_BUCKET_NAME=teamsync-files
```

如果 Bucket 地域是华北1（青岛），当前后端配置应填写普通地域 Endpoint：

```bash
OSS_ENDPOINT=oss-cn-qingdao.aliyuncs.com
```

`teamsync-1541521700871854.oss-cn-qingdao.oss-accesspoint.aliyuncs.com` 是接入点外网 Endpoint，不建议直接填到当前 `OSS_ENDPOINT`。当前代码按普通 Bucket SDK 方式访问：`endpoint` 填地域服务地址，`bucket-name` 填 Bucket 名称。只有明确要走接入点访问时，才需要改成接入点别名模式，并同时配置接入点策略和 Bucket Policy 权限委派。

## 需要的信息

1. `OSS_ENDPOINT`
   - 阿里云控制台进入 `对象存储 OSS`。
   - 打开目标 Bucket。
   - 在 `概览` 的访问域名/Endpoint 区域查看地域对应的 Endpoint。
   - 当前后端需要的是形如 `oss-cn-qingdao.aliyuncs.com` 的服务 Endpoint，不是 `bucket-name.oss-cn-qingdao.aliyuncs.com`，也不是 `*.oss-accesspoint.aliyuncs.com`。
   - 当前默认值是 `oss-cn-qingdao.aliyuncs.com`，如果 Bucket 不在青岛，需要改成实际地域。

2. `OSS_BUCKET_NAME`
   - 阿里云控制台进入 `对象存储 OSS`。
   - `Bucket 列表` 中的 Bucket 名称就是这个值。

3. `OSS_ACCESS_KEY_ID` 和 `OSS_ACCESS_KEY_SECRET`
   - 阿里云控制台进入 `访问控制 RAM`。
   - 创建专用用户，例如 `teamsync-oss-uploader`。
   - 勾选 `OpenAPI 调用访问`，生成 AccessKey。
   - 给该 RAM 用户授予目标 Bucket 的最小权限：上传、下载、删除、列举对象。
   - Secret 只在创建时显示一次，丢失后不要找回，直接重新创建并禁用旧 Key。

## 本地启动方式

在启动后端前设置环境变量：

```bash
export OSS_ENDPOINT=oss-cn-qingdao.aliyuncs.com
export OSS_BUCKET_NAME=teamsync-files
export OSS_ACCESS_KEY_ID=你的 AccessKey ID
export OSS_ACCESS_KEY_SECRET=你的 AccessKey Secret
cd /Users/wyy/Desktop/teamsync/TeamSync
./mvnw spring-boot:run
```

如果用 IDEA 启动，在 Run Configuration 的 Environment variables 中填写同名变量。

## 服务器部署方式

服务器上同样设置这四个环境变量，再重启 Java 后端服务。前端不需要 OSS 密钥，所有上传和下载都通过后端接口完成。

如果后端部署在同地域的阿里云 ECS 上，可以考虑使用内网 Endpoint，例如 `oss-cn-qingdao-internal.aliyuncs.com`。本地电脑开发、非阿里云服务器或跨地域服务器使用外网 Endpoint。

## 阻止公共访问

本项目不需要把 Bucket 开成公共读。前端不会直接匿名访问 OSS，上传和下载都由 Java 后端携带 AccessKey 访问 OSS，再把结果返回给浏览器。

建议保持 Bucket 私有，并开启阻止公共访问。这样可以避免文件被匿名访问。只要 RAM 用户拥有目标 Bucket 的读写权限，后端 SDK 的认证访问不受影响。

## 验证

后端重启后，未登录状态访问附件接口应返回 `401 未提供认证令牌`，这说明接口已存在：

```bash
curl -i http://127.0.0.1:8080/api/tasks/1/files
```

登录后在任务详情上传一个小文件，再执行下载和删除，确认 OSS 配置可用。
