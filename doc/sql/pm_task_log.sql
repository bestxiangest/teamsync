--
-- PostgreSQL database dump
--

\restrict 6a2wIlBmyuYCabGytSqhfli9KHtDY8qIJPs3UYZaqKGTVTuawabg4HNbtvO91sL

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
-- Name: pm_task_log; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.pm_task_log (
    id bigint NOT NULL,
    task_id bigint NOT NULL,
    operator_id bigint NOT NULL,
    action_type character varying(32) NOT NULL,
    detail character varying(500) DEFAULT NULL::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE pm_task_log; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.pm_task_log IS '任务操作日志表';


--
-- Name: COLUMN pm_task_log.id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_log.id IS '主键ID';


--
-- Name: COLUMN pm_task_log.task_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_log.task_id IS '关联任务ID';


--
-- Name: COLUMN pm_task_log.operator_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_log.operator_id IS '操作人ID';


--
-- Name: COLUMN pm_task_log.action_type; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_log.action_type IS '操作类型: CREATE/UPDATE/MOVE/DELETE/COMMENT/SUBTASK/ATTACHMENT';


--
-- Name: COLUMN pm_task_log.detail; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_log.detail IS '操作详情描述';


--
-- Name: COLUMN pm_task_log.created_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_log.created_at IS '创建时间';


--
-- Name: pm_task_log_id_seq; Type: SEQUENCE; Schema: teamsync; Owner: -
--

CREATE SEQUENCE teamsync.pm_task_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pm_task_log_id_seq; Type: SEQUENCE OWNED BY; Schema: teamsync; Owner: -
--

ALTER SEQUENCE teamsync.pm_task_log_id_seq OWNED BY teamsync.pm_task_log.id;


--
-- Name: pm_task_log id; Type: DEFAULT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_log ALTER COLUMN id SET DEFAULT nextval('teamsync.pm_task_log_id_seq'::regclass);


--
-- Name: pm_task_log pm_task_log_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_log
    ADD CONSTRAINT pm_task_log_pkey PRIMARY KEY (id);


--
-- Name: idx_log_operator_id; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_log_operator_id ON teamsync.pm_task_log USING btree (operator_id);


--
-- Name: idx_log_task_id; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_log_task_id ON teamsync.pm_task_log USING btree (task_id);


--
-- PostgreSQL database dump complete
--

\unrestrict 6a2wIlBmyuYCabGytSqhfli9KHtDY8qIJPs3UYZaqKGTVTuawabg4HNbtvO91sL
