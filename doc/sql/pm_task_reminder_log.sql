--
-- PostgreSQL database dump
--

\restrict kiUyNnJvPlyqRrR9ER7qAWRNPa1qg7KUbemRi2Y2fE8fVlrEuuhdGoDEBs6y9m3

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg120+1)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: pm_task_reminder_log; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.pm_task_reminder_log (
    id bigint NOT NULL,
    task_id bigint NOT NULL,
    user_id bigint NOT NULL,
    reminder_type character varying(32) NOT NULL,
    due_time_snapshot timestamp without time zone,
    first_sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    send_count integer DEFAULT 1 NOT NULL,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE pm_task_reminder_log; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.pm_task_reminder_log IS '任务提醒发送日志';


--
-- Name: COLUMN pm_task_reminder_log.task_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_reminder_log.task_id IS '任务ID';


--
-- Name: COLUMN pm_task_reminder_log.user_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_reminder_log.user_id IS '接收提醒的用户ID';


--
-- Name: COLUMN pm_task_reminder_log.reminder_type; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_reminder_log.reminder_type IS '提醒类型，当前为 OVERDUE_EMAIL';


--
-- Name: COLUMN pm_task_reminder_log.due_time_snapshot; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_reminder_log.due_time_snapshot IS '发送时任务的截止时间快照';


--
-- Name: COLUMN pm_task_reminder_log.first_sent_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_reminder_log.first_sent_at IS '首次发送时间';


--
-- Name: COLUMN pm_task_reminder_log.last_sent_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_reminder_log.last_sent_at IS '最近发送时间';


--
-- Name: COLUMN pm_task_reminder_log.send_count; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_reminder_log.send_count IS '发送次数';


--
-- Name: COLUMN pm_task_reminder_log.resolved_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_reminder_log.resolved_at IS '本轮逾期提醒结束时间';


--
-- Name: COLUMN pm_task_reminder_log.created_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_reminder_log.created_at IS '创建时间';


--
-- Name: COLUMN pm_task_reminder_log.updated_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_reminder_log.updated_at IS '更新时间';


--
-- Name: pm_task_reminder_log_id_seq; Type: SEQUENCE; Schema: teamsync; Owner: -
--

CREATE SEQUENCE teamsync.pm_task_reminder_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pm_task_reminder_log_id_seq; Type: SEQUENCE OWNED BY; Schema: teamsync; Owner: -
--

ALTER SEQUENCE teamsync.pm_task_reminder_log_id_seq OWNED BY teamsync.pm_task_reminder_log.id;


--
-- Name: pm_task_reminder_log id; Type: DEFAULT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_reminder_log ALTER COLUMN id SET DEFAULT nextval('teamsync.pm_task_reminder_log_id_seq'::regclass);


--
-- Name: pm_task_reminder_log pm_task_reminder_log_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_reminder_log
    ADD CONSTRAINT pm_task_reminder_log_pkey PRIMARY KEY (id);


--
-- Name: pm_task_reminder_log uq_pm_task_reminder_log; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_reminder_log
    ADD CONSTRAINT uq_pm_task_reminder_log UNIQUE (task_id, user_id, reminder_type);


--
-- Name: idx_pm_task_reminder_log_task_id; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_pm_task_reminder_log_task_id ON teamsync.pm_task_reminder_log USING btree (task_id);


--
-- Name: idx_pm_task_reminder_log_type_resolved; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_pm_task_reminder_log_type_resolved ON teamsync.pm_task_reminder_log USING btree (reminder_type, resolved_at);


--
-- Name: idx_pm_task_reminder_log_user_id; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_pm_task_reminder_log_user_id ON teamsync.pm_task_reminder_log USING btree (user_id);


--
-- Name: pm_task_reminder_log fk_pm_task_reminder_log_task; Type: FK CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_reminder_log
    ADD CONSTRAINT fk_pm_task_reminder_log_task FOREIGN KEY (task_id) REFERENCES teamsync.pm_task(id) ON DELETE CASCADE;


--
-- Name: pm_task_reminder_log fk_pm_task_reminder_log_user; Type: FK CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_reminder_log
    ADD CONSTRAINT fk_pm_task_reminder_log_user FOREIGN KEY (user_id) REFERENCES teamsync.sys_user(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict kiUyNnJvPlyqRrR9ER7qAWRNPa1qg7KUbemRi2Y2fE8fVlrEuuhdGoDEBs6y9m3

