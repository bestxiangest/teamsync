#!/usr/bin/env bash
# ============================================================
# TeamSync 前端一键启动脚本（Vite 开发服务器）
#
# 用法:
#   ./start-frontend.sh             启动 (后台运行，默认)
#   ./start-frontend.sh restart     重启
#   ./start-frontend.sh stop        停止
#   ./start-frontend.sh status      查看运行状态
#   ./start-frontend.sh logs        实时查看日志 (Ctrl+C 退出)
#
# 可选环境变量:
#   PORT=8081                        前端端口 (默认与 TeamSync_web/.env 的 VITE_PORT 一致)
#   API_PROXY=http://127.0.0.1:8080  接口代理目标，默认指向本机后端；
#                                    要直接连远端后端可设为 http://192.168.8.6:8080
#   INSTALL=1                        强制重新安装依赖 (pnpm install)
#   OPEN=0                           启动后不自动打开浏览器 (默认会打开)
#   FOREGROUND=1                     前台运行 (Ctrl+C 停止)
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "$SCRIPT_DIR/../TeamSync_web" && pwd)"
LOG_DIR="$WEB_DIR/logs"
LOG_FILE="$LOG_DIR/teamsync-frontend.log"
PID_FILE="$LOG_DIR/teamsync-frontend.pid"
PORT="${PORT:-8081}"
API_PROXY="${API_PROXY:-http://127.0.0.1:8080}"
INSTALL="${INSTALL:-0}"
OPEN="${OPEN:-1}"
FOREGROUND="${FOREGROUND:-0}"

mkdir -p "$LOG_DIR"

is_running() {
	if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
		return 0
	fi
	if lsof -tiTCP:"$PORT" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
		return 0
	fi
	return 1
}

stop_frontend() {
	if [ -f "$PID_FILE" ]; then
		local pid
		pid="$(cat "$PID_FILE")"
		if kill -0 "$pid" 2>/dev/null; then
			echo "⏹  正在停止前端进程 (PID: $pid)..."
			kill "$pid" 2>/dev/null || true
			for _ in $(seq 1 20); do
				kill -0 "$pid" 2>/dev/null || break
				sleep 0.5
			done
			kill -0 "$pid" 2>/dev/null && kill -9 "$pid" 2>/dev/null || true
		fi
		rm -f "$PID_FILE"
	fi

	local pids
	pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN -n -P 2>/dev/null || true)"
	if [ -n "$pids" ]; then
		echo "⏹  清理端口 $PORT 上的残留进程: $pids"
		# shellcheck disable=SC2086
		kill $pids 2>/dev/null || true
	fi

	echo "✅ 前端已停止"
}

ensure_pnpm() {
	if command -v pnpm >/dev/null 2>&1; then
		return 0
	fi
	echo "❌ 未找到 pnpm，请先安装 (npm i -g pnpm 或 corepack enable)" >&2
	exit 1
}

ensure_deps() {
	if [ "$INSTALL" = "1" ] || [ ! -d "$WEB_DIR/node_modules" ]; then
		echo "📦 安装前端依赖..."
		cd "$WEB_DIR"
		pnpm install
		echo "✅ 依赖安装完成"
	fi
}

# 交给 Vite 的环境变量：process.env 中的 VITE_* 优先级高于 .env 文件
export VITE_PORT="$PORT"
export VITE_API_PROXY_URL="$API_PROXY"

start_frontend() {
	if is_running; then
		echo "ℹ️  前端已在运行 (端口 $PORT)，如需重启请执行: $0 restart"
		exit 0
	fi

	ensure_pnpm
	ensure_deps

	echo "🚀 启动前端..."
	echo "   目录:    $WEB_DIR"
	echo "   端口:    $PORT"
	echo "   接口代理: /api -> $API_PROXY"
	echo "   日志:    $LOG_FILE"

	if [ "$FOREGROUND" = "1" ]; then
		cd "$WEB_DIR"
		pnpm exec vite --port "$PORT" --strictPort
		return 0
	fi

	cd "$WEB_DIR"
	nohup pnpm exec vite --port "$PORT" --strictPort >"$LOG_FILE" 2>&1 &
	echo $! >"$PID_FILE"
	echo "   PID:     $(cat "$PID_FILE")"

	echo -n "⏳ 等待前端就绪"
	local waited=0
	until curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/" 2>/dev/null; do
		if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
			echo ""
			echo "❌ 前端进程异常退出，日志: $LOG_FILE" >&2
			tail -n 30 "$LOG_FILE" >&2
			exit 1
		fi
		sleep 1
		waited=$((waited + 1))
		echo -n "."
		if [ "$waited" -ge 90 ]; then
			echo ""
			echo "⚠️  等待超时 (90s)，日志: $LOG_FILE" >&2
			exit 1
		fi
	done
	echo ""
	echo "✅ 前端启动成功! http://127.0.0.1:$PORT"

	if [ "$OPEN" = "1" ] && command -v open >/dev/null 2>&1; then
		open "http://127.0.0.1:$PORT" >/dev/null 2>&1 || true
	fi
}

ACTION="${1:-start}"

case "$ACTION" in
start)
	start_frontend
	;;
restart)
	stop_frontend
	start_frontend
	;;
stop)
	stop_frontend
	;;
status)
	if is_running; then
		pid="$(cat "$PID_FILE" 2>/dev/null || echo '?')"
		echo "🟢 前端运行中 (PID: $pid, 端口: $PORT, 代理: $API_PROXY)"
	else
		echo "🔴 前端未运行"
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
