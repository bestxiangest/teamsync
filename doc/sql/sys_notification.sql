CREATE SCHEMA IF NOT EXISTS teamsync;

CREATE TABLE IF NOT EXISTS teamsync.sys_notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(160) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    source_type VARCHAR(64) NULL,
    source_id BIGINT NULL,
    target_path VARCHAR(255) NULL,
    dedupe_key VARCHAR(255) NOT NULL,
    actor_id BIGINT NULL,
    read_flag BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sys_notification_dedupe UNIQUE (user_id, dedupe_key),
    CONSTRAINT fk_sys_notification_user FOREIGN KEY (user_id) REFERENCES teamsync.sys_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_sys_notification_actor FOREIGN KEY (actor_id) REFERENCES teamsync.sys_user(id) ON DELETE SET NULL
);

COMMENT ON TABLE teamsync.sys_notification IS '站内通知';
COMMENT ON COLUMN teamsync.sys_notification.user_id IS '接收通知用户ID';
COMMENT ON COLUMN teamsync.sys_notification.type IS '通知类型';
COMMENT ON COLUMN teamsync.sys_notification.title IS '通知标题';
COMMENT ON COLUMN teamsync.sys_notification.content IS '通知内容';
COMMENT ON COLUMN teamsync.sys_notification.source_type IS '来源类型，如 TASK/RECURRING_PLAN/PROJECT';
COMMENT ON COLUMN teamsync.sys_notification.source_id IS '来源业务ID';
COMMENT ON COLUMN teamsync.sys_notification.target_path IS '前端跳转路径';
COMMENT ON COLUMN teamsync.sys_notification.dedupe_key IS '去重键，同一用户同一事件窗口唯一';
COMMENT ON COLUMN teamsync.sys_notification.actor_id IS '触发通知的操作者ID';
COMMENT ON COLUMN teamsync.sys_notification.read_flag IS '是否已读';
COMMENT ON COLUMN teamsync.sys_notification.read_at IS '已读时间';

CREATE INDEX IF NOT EXISTS idx_sys_notification_user_read_created
    ON teamsync.sys_notification (user_id, read_flag, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sys_notification_user_type_created
    ON teamsync.sys_notification (user_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sys_notification_source
    ON teamsync.sys_notification (source_type, source_id);
