--
-- PostgreSQL database dump
--

\restrict beb0G4dUFYFukEzptGnmDBAMvd5s7Ti7BoW21WZdDFCQxkpfbLN5WCpyzZhfDsU

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
-- Name: sys_user_reminder_setting; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.sys_user_reminder_setting (
    user_id bigint NOT NULL,
    email_enabled boolean DEFAULT false NOT NULL,
    overdue_task_enabled boolean DEFAULT false NOT NULL,
    task_completed_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE sys_user_reminder_setting; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.sys_user_reminder_setting IS '用户邮件提醒设置';


--
-- Name: COLUMN sys_user_reminder_setting.user_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user_reminder_setting.user_id IS '用户ID';


--
-- Name: COLUMN sys_user_reminder_setting.email_enabled; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user_reminder_setting.email_enabled IS '邮件提醒总开关';


--
-- Name: COLUMN sys_user_reminder_setting.overdue_task_enabled; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user_reminder_setting.overdue_task_enabled IS '任务逾期提醒开关';


--
-- Name: COLUMN sys_user_reminder_setting.task_completed_enabled; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user_reminder_setting.task_completed_enabled IS '任务完成邮件提醒开关';


--
-- Name: COLUMN sys_user_reminder_setting.created_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user_reminder_setting.created_at IS '创建时间';


--
-- Name: COLUMN sys_user_reminder_setting.updated_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user_reminder_setting.updated_at IS '更新时间';


--
-- Name: sys_user_reminder_setting sys_user_reminder_setting_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.sys_user_reminder_setting
    ADD CONSTRAINT sys_user_reminder_setting_pkey PRIMARY KEY (user_id);


--
-- Name: sys_user_reminder_setting fk_sys_user_reminder_setting_user; Type: FK CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.sys_user_reminder_setting
    ADD CONSTRAINT fk_sys_user_reminder_setting_user FOREIGN KEY (user_id) REFERENCES teamsync.sys_user(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict beb0G4dUFYFukEzptGnmDBAMvd5s7Ti7BoW21WZdDFCQxkpfbLN5WCpyzZhfDsU
