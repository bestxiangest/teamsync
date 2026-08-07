CREATE SCHEMA IF NOT EXISTS teamsync;

CREATE TABLE IF NOT EXISTS teamsync.pm_recurring_plan (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NULL,
    stage_id BIGINT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    recurrence_unit VARCHAR(32) NOT NULL,
    interval_count INTEGER NOT NULL DEFAULT 1,
    start_time TIMESTAMP NOT NULL,
    due_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    next_run_at TIMESTAMP NULL,
    last_run_at TIMESTAMP NULL,
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Shanghai',
    reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_minutes_before INTEGER NULL,
    auto_create_task BOOLEAN NOT NULL DEFAULT FALSE,
    max_occurrences INTEGER NULL,
    generated_count INTEGER NOT NULL DEFAULT 0,
    creator_id BIGINT NOT NULL,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_pm_recurring_plan_priority CHECK (priority IN (1, 2, 3)),
    CONSTRAINT ck_pm_recurring_plan_status CHECK (status IN ('ACTIVE', 'PAUSED', 'FINISHED')),
    CONSTRAINT ck_pm_recurring_plan_unit CHECK (recurrence_unit IN ('DAY', 'WEEK', 'MONTH', 'QUARTER', 'HALF_YEAR', 'YEAR')),
    CONSTRAINT ck_pm_recurring_plan_interval CHECK (interval_count BETWEEN 1 AND 120),
    CONSTRAINT ck_pm_recurring_plan_due_time CHECK (due_time IS NULL OR due_time >= start_time),
    CONSTRAINT ck_pm_recurring_plan_end_time CHECK (end_time IS NULL OR end_time >= start_time),
    CONSTRAINT ck_pm_recurring_plan_reminder_minutes CHECK (reminder_minutes_before IS NULL OR reminder_minutes_before BETWEEN 0 AND 43200),
    CONSTRAINT ck_pm_recurring_plan_max_occurrences CHECK (max_occurrences IS NULL OR max_occurrences > 0),
    CONSTRAINT ck_pm_recurring_plan_generated_count CHECK (generated_count >= 0),
    CONSTRAINT fk_pm_recurring_plan_creator FOREIGN KEY (creator_id) REFERENCES teamsync.sys_user(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pm_recurring_plan_project FOREIGN KEY (project_id) REFERENCES teamsync.pm_project(id) ON DELETE SET NULL,
    CONSTRAINT fk_pm_recurring_plan_stage FOREIGN KEY (stage_id) REFERENCES teamsync.pm_task_stage(id) ON DELETE SET NULL
);

COMMENT ON TABLE teamsync.pm_recurring_plan IS '周期计划表';
COMMENT ON COLUMN teamsync.pm_recurring_plan.project_id IS '可选关联项目ID';
COMMENT ON COLUMN teamsync.pm_recurring_plan.stage_id IS '可选关联看板列ID，用于后续自动生成项目任务';
COMMENT ON COLUMN teamsync.pm_recurring_plan.title IS '周期计划标题';
COMMENT ON COLUMN teamsync.pm_recurring_plan.description IS '周期计划说明';
COMMENT ON COLUMN teamsync.pm_recurring_plan.priority IS '优先级 1:普通 2:紧急 3:非常紧急';
COMMENT ON COLUMN teamsync.pm_recurring_plan.status IS 'ACTIVE:启用 PAUSED:暂停 FINISHED:结束';
COMMENT ON COLUMN teamsync.pm_recurring_plan.recurrence_unit IS '周期单位 DAY/WEEK/MONTH/QUARTER/HALF_YEAR/YEAR';
COMMENT ON COLUMN teamsync.pm_recurring_plan.interval_count IS '周期间隔数量';
COMMENT ON COLUMN teamsync.pm_recurring_plan.start_time IS '首次计划开始时间，也是周期计算锚点';
COMMENT ON COLUMN teamsync.pm_recurring_plan.due_time IS '首次计划截止时间，用于推算后续实例截止时间';
COMMENT ON COLUMN teamsync.pm_recurring_plan.end_time IS '周期结束时间，空表示长期有效';
COMMENT ON COLUMN teamsync.pm_recurring_plan.next_run_at IS '下一次应执行时间';
COMMENT ON COLUMN teamsync.pm_recurring_plan.last_run_at IS '最近一次生成/执行时间';
COMMENT ON COLUMN teamsync.pm_recurring_plan.timezone IS '计划时区';
COMMENT ON COLUMN teamsync.pm_recurring_plan.reminder_enabled IS '是否启用提醒';
COMMENT ON COLUMN teamsync.pm_recurring_plan.reminder_minutes_before IS '提前提醒分钟数';
COMMENT ON COLUMN teamsync.pm_recurring_plan.auto_create_task IS '后续是否自动创建看板任务';
COMMENT ON COLUMN teamsync.pm_recurring_plan.max_occurrences IS '最多生成次数，空表示不限制';
COMMENT ON COLUMN teamsync.pm_recurring_plan.generated_count IS '已生成次数';
COMMENT ON COLUMN teamsync.pm_recurring_plan.creator_id IS '创建人ID，普通用户权限按该字段收口';
COMMENT ON COLUMN teamsync.pm_recurring_plan.is_deleted IS '0:正常 1:删除';

CREATE INDEX IF NOT EXISTS idx_pm_recurring_plan_creator ON teamsync.pm_recurring_plan (creator_id, is_deleted, next_run_at);
CREATE INDEX IF NOT EXISTS idx_pm_recurring_plan_status_next_run ON teamsync.pm_recurring_plan (status, is_deleted, next_run_at);
CREATE INDEX IF NOT EXISTS idx_pm_recurring_plan_project ON teamsync.pm_recurring_plan (project_id);

CREATE TABLE IF NOT EXISTS teamsync.pm_recurring_plan_assignee (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'RESPONSIBLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_pm_recurring_plan_assignee_role CHECK (role IN ('RESPONSIBLE')),
    CONSTRAINT uq_pm_recurring_plan_assignee UNIQUE (plan_id, user_id, role),
    CONSTRAINT fk_pm_recurring_plan_assignee_plan FOREIGN KEY (plan_id) REFERENCES teamsync.pm_recurring_plan(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_recurring_plan_assignee_user FOREIGN KEY (user_id) REFERENCES teamsync.sys_user(id) ON DELETE CASCADE
);

COMMENT ON TABLE teamsync.pm_recurring_plan_assignee IS '周期计划负责人关联表';
COMMENT ON COLUMN teamsync.pm_recurring_plan_assignee.plan_id IS '周期计划ID';
COMMENT ON COLUMN teamsync.pm_recurring_plan_assignee.user_id IS '负责人用户ID';
COMMENT ON COLUMN teamsync.pm_recurring_plan_assignee.role IS 'RESPONSIBLE:负责人';

CREATE INDEX IF NOT EXISTS idx_pm_recurring_plan_assignee_plan ON teamsync.pm_recurring_plan_assignee (plan_id);
CREATE INDEX IF NOT EXISTS idx_pm_recurring_plan_assignee_user ON teamsync.pm_recurring_plan_assignee (user_id);

CREATE TABLE IF NOT EXISTS teamsync.pm_recurring_plan_occurrence (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    occurrence_no INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    scheduled_start_at TIMESTAMP NOT NULL,
    due_time TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    completed_by BIGINT NULL,
    generated_task_id BIGINT NULL,
    assignee_snapshot TEXT NOT NULL DEFAULT '[]',
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_pm_recurring_plan_occurrence_status CHECK (status IN ('PENDING', 'DONE', 'SKIPPED', 'DEFERRED', 'CANCELLED', 'OVERDUE')),
    CONSTRAINT ck_pm_recurring_plan_occurrence_no CHECK (occurrence_no > 0),
    CONSTRAINT ck_pm_recurring_plan_occurrence_due_time CHECK (due_time IS NULL OR due_time >= scheduled_start_at),
    CONSTRAINT uq_pm_recurring_plan_occurrence UNIQUE (plan_id, occurrence_no),
    CONSTRAINT fk_pm_recurring_plan_occurrence_plan FOREIGN KEY (plan_id) REFERENCES teamsync.pm_recurring_plan(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_recurring_plan_occurrence_completed_by FOREIGN KEY (completed_by) REFERENCES teamsync.sys_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_pm_recurring_plan_occurrence_task FOREIGN KEY (generated_task_id) REFERENCES teamsync.pm_task(id) ON DELETE SET NULL
);

COMMENT ON TABLE teamsync.pm_recurring_plan_occurrence IS '周期计划执行实例表';
COMMENT ON COLUMN teamsync.pm_recurring_plan_occurrence.plan_id IS '周期计划ID';
COMMENT ON COLUMN teamsync.pm_recurring_plan_occurrence.occurrence_no IS '第几期';
COMMENT ON COLUMN teamsync.pm_recurring_plan_occurrence.title IS '执行实例标题快照';
COMMENT ON COLUMN teamsync.pm_recurring_plan_occurrence.status IS 'PENDING/DONE/SKIPPED/DEFERRED/CANCELLED/OVERDUE';
COMMENT ON COLUMN teamsync.pm_recurring_plan_occurrence.scheduled_start_at IS '本期计划开始时间';
COMMENT ON COLUMN teamsync.pm_recurring_plan_occurrence.due_time IS '本期截止时间';
COMMENT ON COLUMN teamsync.pm_recurring_plan_occurrence.completed_at IS '完成时间';
COMMENT ON COLUMN teamsync.pm_recurring_plan_occurrence.completed_by IS '完成人ID';
COMMENT ON COLUMN teamsync.pm_recurring_plan_occurrence.generated_task_id IS '自动生成的看板任务ID';
COMMENT ON COLUMN teamsync.pm_recurring_plan_occurrence.assignee_snapshot IS '本期负责人快照';
COMMENT ON COLUMN teamsync.pm_recurring_plan_occurrence.notes IS '执行备注';

CREATE INDEX IF NOT EXISTS idx_pm_recurring_plan_occurrence_plan_status ON teamsync.pm_recurring_plan_occurrence (plan_id, status);
CREATE INDEX IF NOT EXISTS idx_pm_recurring_plan_occurrence_due_time ON teamsync.pm_recurring_plan_occurrence (due_time);
CREATE INDEX IF NOT EXISTS idx_pm_recurring_plan_occurrence_task ON teamsync.pm_recurring_plan_occurrence (generated_task_id);
