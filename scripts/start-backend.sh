#!/usr/bin/env bash
# ============================================================
# TeamSync 后端一键启动脚本
# 每次启动自动编译打包最新代码，然后后台启动服务
#
# 用法:
#   ./start-backend.sh            编译打包并启动 (默认)
#   ./start-backend.sh restart    重启 (先停旧进程再打包启动)
#   ./start-backend.sh stop       停止服务
#   ./start-backend.sh status     查看运行状态
#   ./start-backend.sh logs       实时查看日志 (Ctrl+C 退出)
#
# 可选环境变量:
#   CLEAN=1         执行 mvn clean 全量重新打包 (默认增量编译，更快)
#   SKIP_TESTS=0    编译并运行单元测试 (默认跳过，加快启动)
#   PORT=8080       覆盖服务端口 (需与 application.yml 保持一致)
#   JAVA_OPTS=""    追加 JVM 参数，如 JAVA_OPTS="-Xmx1g"
# ============================================================

set -euo pipefail

# ---------- 路径与常量 ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../TeamSync" && pwd)"   # 后端模块根目录 (含 pom.xml)
LOG_DIR="$BACKEND_DIR/logs"
LOG_FILE="$LOG_DIR/teamsync-backend.log"
PID_FILE="$LOG_DIR/teamsync-backend.pid"
PORT="${PORT:-8080}"
CLEAN="${CLEAN:-0}"
SKIP_TESTS="${SKIP_TESTS:-1}"

# 加载本地环境变量（数据库/邮件凭据等，不入库，见 TeamSync/.env.local）
if [ -f "$BACKEND_DIR/.env.local" ]; then
    set -a
    # shellcheck disable=SC1091
    source "$BACKEND_DIR/.env.local"
    set +a
fi

# 优先使用系统 mvn，否则回退到项目自带的 mvnw
if command -v mvn >/dev/null 2>&1; then
    MVN="mvn"
else
    MVN="$BACKEND_DIR/mvnw"
fi

mkdir -p "$LOG_DIR"

# ---------- 工具函数 ----------

# 服务是否在运行 (PID 文件 + 端口双重判断，兼容 PID 文件丢失的情况)
is_running() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        return 0
    fi
    if lsof -tiTCP:"$PORT" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

# 停止服务
stop_backend() {
    # 1) 按 PID 文件优雅停止
    if [ -f "$PID_FILE" ]; then
        local pid
        pid="$(cat "$PID_FILE")"
        if kill -0 "$pid" 2>/dev/null; then
            echo "⏹  正在停止进程 (PID: $pid)..."
            kill "$pid"
            # 最多等 10 秒，超时强杀
            for _ in $(seq 1 20); do
                kill -0 "$pid" 2>/dev/null || break
                sleep 0.5
            done
            kill -0 "$pid" 2>/dev/null && kill -9 "$pid" || true
        fi
        rm -f "$PID_FILE"
    fi

    # 2) 兜底: 按端口清理残留进程 (防止 PID 文件丢失后服务仍占用端口)
    local pids
    pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN -n -P 2>/dev/null || true)"
    if [ -n "$pids" ]; then
        echo "⏹  清理端口 $PORT 上的残留进程: $pids"
        kill $pids 2>/dev/null || true
    fi

    echo "✅ 服务已停止"
}

# 编译打包最新代码
build_backend() {
    echo "🔨 开始编译打包代码..."
    echo "   Maven: $MVN"
    echo "   目录:  $BACKEND_DIR"
    cd "$BACKEND_DIR"

    local maven_opts="-Dmaven.test.skip=true"
    if [ "$SKIP_TESTS" = "0" ]; then
        maven_opts=""
    fi

    if [ "$CLEAN" = "1" ]; then
        echo "   ⚙  执行 clean 全量打包 (CLEAN=1)..."
        $MVN clean package $maven_opts
    else
        echo "   ⚙  执行增量打包 (仅重新编译改动代码)..."
        $MVN package $maven_opts
    fi

    echo "✅ 打包完成"
}

# 后台启动服务
start_backend() {
    # 取最新的打包产物
    local jar
    jar="$(ls -t "$BACKEND_DIR"/target/*.jar 2>/dev/null | head -1 || true)"
    if [ -z "$jar" ]; then
        echo "❌ 未找到打包产物 jar，请检查打包是否成功" >&2
        exit 1
    fi

    echo "🚀 启动后端服务..."
    echo "   Jar:  $jar"
    echo "   端口: $PORT"
    echo "   日志: $LOG_FILE"

    # 工作目录切到后端模块，保证相对路径 (upload/ 等) 与 IDEA 运行一致
    cd "$BACKEND_DIR"
    nohup java ${JAVA_OPTS:-} -jar "$jar" > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "   PID:  $(cat "$PID_FILE")"

    # 等待服务端口就绪 (最多 120 秒)
    echo -n "⏳ 等待服务启动"
    local waited=0
    until curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/" 2>/dev/null; do
        # 进程异常退出则直接报错
        if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
            echo ""
            echo "❌ 服务进程异常退出，请查看日志: $LOG_FILE" >&2
            tail -n 30 "$LOG_FILE" >&2
            exit 1
        fi
        sleep 1
        waited=$((waited + 1))
        echo -n "."
        if [ "$waited" -ge 120 ]; then
            echo ""
            echo "⚠️  等待超时 (120s)，服务可能仍在启动，日志: $LOG_FILE" >&2
            exit 1
        fi
    done
    echo ""
    echo "✅ 后端服务启动成功! http://127.0.0.1:$PORT"
}

# ---------- 主流程 ----------
ACTION="${1:-start}"

case "$ACTION" in
    start)
        if is_running; then
            echo "ℹ️  服务已在运行 (端口 $PORT)，如需重启请执行: $0 restart"
            exit 0
        fi
        build_backend
        start_backend
        ;;
    restart)
        stop_backend
        build_backend
        start_backend
        ;;
    stop)
        stop_backend
        ;;
    status)
        if is_running; then
            pid="$(cat "$PID_FILE" 2>/dev/null || echo '?')"
            echo "🟢 服务运行中 (PID: $pid, 端口: $PORT)"
        else
            echo "🔴 服务未运行"
        fi
        ;;
    logs)
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "⚠️  日志文件不存在: $LOG_FILE"
            exit 1
        fi
        ;;
    *)
        echo "用法: $0 {start|restart|stop|status|logs}" >&2
        exit 1
        ;;
esac
