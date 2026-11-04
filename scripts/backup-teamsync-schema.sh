#!/usr/bin/env bash
# ============================================================
# TeamSync 数据库结构备份脚本（只备份结构，不备份任何数据）
#
# 作用:
#   连接 PostgreSQL，把指定 schema 的 DDL 导出成一份本地 .sql 备份文件。
#   导出方式为 pg_dump --schema-only，文件内不含 COPY / INSERT 数据段，
#   脚本结尾会再校验一次，发现数据段直接判失败。
#
# 用法:
#   ./backup-teamsync-schema.sh                 # 按 application.yml 默认远端地址备份
#   DB_URL='jdbc:postgresql://HOST:PORT/postgres?currentSchema=teamsync' ./backup-teamsync-schema.sh
#   OUT_DIR=/tmp/schema-bak ./backup-teamsync-schema.sh
#
# 可选环境变量:
#   DB_HOST / DB_PORT / DB_NAME / SCHEMA   分项覆盖（DB_URL 优先于分项）
#   DB_USERNAME / DB_PASSWORD              未设置时读取 TeamSync/.env.local
#   OUT_DIR                                输出目录，默认 doc/db-backup
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/TeamSync"
OUT_DIR="${OUT_DIR:-$PROJECT_DIR/doc/db-backup}"

# ---------- 1. 解析连接参数 ----------
DB_HOST="${DB_HOST:-192.168.8.6}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-postgres}"
SCHEMA="${SCHEMA:-teamsync}"

# DB_URL 存在时以它为准（格式 jdbc:postgresql://host:port/db?currentSchema=schema）
if [ -n "${DB_URL:-}" ]; then
	_rest="${DB_URL#jdbc:postgresql://}"
	_hostport="${_rest%%/*}"
	_after="${_rest#*/}"
	DB_HOST="${_hostport%%:*}"
	if [ "$_hostport" != "${_hostport#*:}" ]; then
		DB_PORT="${_hostport#*:}"
	fi
	DB_NAME="${_after%%\?*}"
	case "$_after" in
	*currentSchema=*)
		SCHEMA="${_after##*currentSchema=}"
		SCHEMA="${SCHEMA%%&*}"
		;;
	esac
fi

# ---------- 2. 凭据（本地 env 文件优先，不入库） ----------
if [ -f "$BACKEND_DIR/.env.local" ]; then
	set -a
	# shellcheck disable=SC1091
	source "$BACKEND_DIR/.env.local"
	set +a
fi
DB_USERNAME="${DB_USERNAME:-toplink}"
export PGPASSWORD="${PGPASSWORD:-${DB_PASSWORD:-}}"
export PGCONNECT_TIMEOUT="${PGCONNECT_TIMEOUT:-15}"

# ---------- 3. 前置检查 ----------
for bin in pg_dump psql; do
	if ! command -v "$bin" >/dev/null 2>&1; then
		echo "❌ 缺少 $bin，请先安装 PostgreSQL 客户端工具" >&2
		exit 1
	fi
done

if [ -z "${PGPASSWORD}" ]; then
	echo "❌ 未拿到数据库口令：请设置 DB_PASSWORD，或在 TeamSync/.env.local 中提供" >&2
	exit 1
fi

mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="$OUT_DIR/${SCHEMA}_schema_${STAMP}.sql"
META_FILE="${OUT_FILE%.sql}.meta.txt"
CONN="host=$DB_HOST port=$DB_PORT user=$DB_USERNAME dbname=$DB_NAME"

echo "📦 备份目标: $DB_USERNAME@$DB_HOST:$DB_PORT/$DB_NAME (schema: $SCHEMA)"
echo "📁 输出文件: $OUT_FILE"

# ---------- 4. 导出结构 ----------
# --schema-only: 只导出 DDL；--no-owner/--no-privileges: 便于在任何本地实例恢复
pg_dump \
	--host="$DB_HOST" --port="$DB_PORT" --username="$DB_USERNAME" --dbname="$DB_NAME" \
	--schema="$SCHEMA" \
	--schema-only --no-owner --no-privileges --no-tablespaces \
	--file="$OUT_FILE"

if [ ! -s "$OUT_FILE" ]; then
	echo "❌ 导出失败：文件为空" >&2
	exit 1
fi

# pg_dump 18 会写入 psql 18 才认识的 \restrict / \unrestrict 元命令，
# 用 psql 17 之类的旧客户端恢复会直接报错，这里去掉两行以保证通用可恢复。
grep -v -F -e '\restrict ' -e '\unrestrict ' "$OUT_FILE" >"$OUT_FILE.tmp"
mv "$OUT_FILE.tmp" "$OUT_FILE"

# ---------- 5. 校验：必须没有数据段 ----------
DATA_LINES="$(grep -c -E '^(COPY |INSERT INTO|COPY \()' "$OUT_FILE" || true)"
TABLE_COUNT="$(grep -c '^CREATE TABLE' "$OUT_FILE" || true)"
if [ "${DATA_LINES:-0}" != "0" ]; then
	echo "❌ 校验失败：导出文件命中 ${DATA_LINES} 行数据语句，不是纯结构备份" >&2
	exit 1
fi

SERVER_VERSION="$(psql "$CONN" -Atc "select version();" 2>/dev/null | head -1 || echo 'unknown')"
{
	echo "schema: $SCHEMA"
	echo "source: $DB_USERNAME@$DB_HOST:$DB_PORT/$DB_NAME"
	echo "backup_time: $(date '+%Y-%m-%d %H:%M:%S')"
	echo "server_version: $SERVER_VERSION"
	echo "mode: schema-only (no data)"
	echo "tables: $TABLE_COUNT"
	echo "size: $(wc -c <"$OUT_FILE" | tr -d ' ') bytes"
	echo "sha256: $(shasum -a 256 "$OUT_FILE" | cut -d' ' -f1)"
} >"$META_FILE"

echo "✅ 结构备份完成"
echo "   表数量: $TABLE_COUNT   数据段: 0 (纯结构)"
echo "   元信息: $META_FILE"
echo "   恢复示例: psql -h 127.0.0.1 -p 5432 -U $USER -d postgres -f \"$OUT_FILE\""
