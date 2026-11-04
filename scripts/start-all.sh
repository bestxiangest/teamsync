#!/usr/bin/env bash
# ============================================================
# TeamSync 一键启动前后端
#
# 用法:
#   ./start-all.sh            编译打包后端 + 启动后端 + 启动前端
#   ./start-all.sh restart    全部重启
#   ./start-all.sh stop       全部停止
#   ./start-all.sh status     查看前后端状态与数据库连通性
#   ./start-all.sh logs       同时跟踪前后端日志 (Ctrl+C 退出)
#
# 透传环境变量: PORT(后端 8080) / FRONTEND_PORT(前端 8081) /
#              API_PROXY(前端接口代理) / CLEAN=1 / SKIP_TESTS=0 / JAVA_OPTS
# ============================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_SCRIPT="$SCRIPT_DIR/start-backend.sh"
FRONTEND_SCRIPT="$SCRIPT_DIR/start-frontend.sh"
APP_YML="$PROJECT_DIR/TeamSync/src/main/resources/application.yml"
FRONTEND_PORT="${FRONTEND_PORT:-8081}"
API_PROXY="${API_PROXY:-http://127.0.0.1:${PORT:-8080}}"

# 数据库连接目标：优先环境变量 DB_URL，否则取 application.yml 内置默认值
db_url() {
	local default_url
	default_url="$(grep -o 'jdbc:postgresql://[^ }]*' "$APP_YML" 2>/dev/null | head -1 || true)"
	echo "${DB_URL:-${default_url:-unknown}}"
}

# 从 jdbc 连接串里取 host / port
db_host_port() {
	local url rest hostport
	url="$1"
	rest="${url#jdbc:postgresql://}"
	rest="${rest#//}"
	hostport="${rest%%/*}"
	echo "${hostport}"
}

print_links() {
	echo ""
	echo "────────────────────────────────────────────"
	echo " 前端: http://127.0.0.1:$FRONTEND_PORT"
	echo " 后端: http://127.0.0.1:${PORT:-8080}"
	echo " 数据库: $(db_url)"
	echo " 停止: $SCRIPT_DIR/start-all.sh stop"
	echo "────────────────────────────────────────────"
}

ACTION="${1:-start}"

case "$ACTION" in
start)
	echo "=== TeamSync 一键启动 ==="
	echo "数据库目标: $(db_url)"
	if ! "$BACKEND_SCRIPT" start; then
		echo "❌ 后端启动失败，前端不再启动" >&2
		exit 1
	fi
	if ! FRONTEND_PORT="$FRONTEND_PORT" API_PROXY="$API_PROXY" "$FRONTEND_SCRIPT" start; then
		echo "❌ 前端启动失败，后端仍在运行，可用 $SCRIPT_DIR/start-backend.sh stop 停止" >&2
		exit 1
	fi
	print_links
	;;
stop)
	echo "=== 停止 TeamSync ==="
	"$FRONTEND_SCRIPT" stop || true
	"$BACKEND_SCRIPT" stop || true
	;;
restart)
	"$SCRIPT_DIR/start-all.sh" stop
	"$SCRIPT_DIR/start-all.sh" start
	;;
status)
	echo "=== TeamSync 状态 ==="
	"$BACKEND_SCRIPT" status || true
	FRONTEND_PORT="$FRONTEND_PORT" "$FRONTEND_SCRIPT" status || true
	echo ""
	echo "数据库目标: $(db_url)"
	hostport="$(db_host_port "$(db_url)")"
	if [ -n "$hostport" ] && [ "$hostport" != "unknown" ]; then
		host="${hostport%%:*}"
		port="${hostport#*:}"
		[ "$port" = "$host" ] && port="5432"
		if nc -z -G 3 "$host" "$port" >/dev/null 2>&1; then
			echo "🟢 数据库端口可达 $host:$port"
		else
			echo "🔴 数据库端口不可达 $host:$port (检查 VPN / 内网连通性)"
		fi
	fi
	;;
logs)
	tail -n 40 -f "$PROJECT_DIR/TeamSync/logs/teamsync-backend.log" "$PROJECT_DIR/TeamSync_web/logs/teamsync-frontend.log"
	;;
*)
	echo "用法: $0 {start|restart|stop|status|logs}" >&2
	exit 1
	;;
esac
