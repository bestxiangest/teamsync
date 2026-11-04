-- 企业微信推送增量脚本；在应用启用推送前执行，可重复执行。
BEGIN;

CREATE TABLE IF NOT EXISTS teamsync.sys_wecom_push_setting (
    id smallint PRIMARY KEY CHECK (id = 1),
    webhook_cipher text,
    daily_enabled boolean NOT NULL DEFAULT false,
    daily_times text NOT NULL DEFAULT '[]',
    weekly_enabled boolean NOT NULL DEFAULT false,
    weekly_times text NOT NULL DEFAULT '[]',
    project_ids text NOT NULL DEFAULT '[]',
    next_dispatch_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by bigint,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO teamsync.sys_wecom_push_setting (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS teamsync.sys_wecom_push_job (
    id bigserial PRIMARY KEY,
    job_key varchar(120) NOT NULL UNIQUE,
    report_type varchar(10) NOT NULL CHECK (report_type IN ('DAILY', 'WEEKLY')),
    trigger_type varchar(10) NOT NULL CHECK (trigger_type IN ('SCHEDULED', 'MANUAL')),
    status varchar(10) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'SENDING', 'SUCCESS', 'FAILED')),
    webhook_cipher text NOT NULL,
    messages text NOT NULL,
    total_parts integer NOT NULL CHECK (total_parts > 0),
    sent_parts integer NOT NULL DEFAULT 0,
    error_message varchar(300),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wecom_push_job_pending ON teamsync.sys_wecom_push_job (id)
    WHERE status = 'PENDING';
COMMENT ON TABLE teamsync.sys_wecom_push_setting IS '平台级企业微信推送配置；Webhook 使用 AES-GCM 加密';
COMMENT ON TABLE teamsync.sys_wecom_push_job IS '企业微信推送队列与发送记录；按分片记录进度';

COMMIT;
