--
-- PostgreSQL database dump
--

\restrict yCfSuTMrMRpVWccpxa0IjLC41e8lOawdnUHGcNAGNF6h023js3k14naeEg0JB1X

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
-- Name: pm_task; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.pm_task (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    stage_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    priority smallint DEFAULT 1,
    status smallint DEFAULT 0 NOT NULL,
    start_time timestamp without time zone,
    due_time timestamp without time zone,
    creator_id bigint NOT NULL,
    sort integer DEFAULT 0,
    is_deleted smallint DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE pm_task; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.pm_task IS '任务表';


--
-- Name: COLUMN pm_task.project_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task.project_id IS '冗余字段，方便查询';


--
-- Name: COLUMN pm_task.stage_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task.stage_id IS '当前处于哪个阶段列';


--
-- Name: COLUMN pm_task.title; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task.title IS '任务标题';


--
-- Name: COLUMN pm_task.description; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task.description IS '任务详情';


--
-- Name: COLUMN pm_task.priority; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task.priority IS '1:普通 2:紧急 3:非常紧急';


--
-- Name: COLUMN pm_task.status; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task.status IS '任务状态 0:未完成 1:已完成';


--
-- Name: COLUMN pm_task.due_time; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task.due_time IS '截止时间';


--
-- Name: COLUMN pm_task.creator_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task.creator_id IS '创建人';


--
-- Name: COLUMN pm_task.sort; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task.sort IS '在列内的排序(从上到下)';


--
-- Name: pm_task_id_seq; Type: SEQUENCE; Schema: teamsync; Owner: -
--

CREATE SEQUENCE teamsync.pm_task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pm_task_id_seq; Type: SEQUENCE OWNED BY; Schema: teamsync; Owner: -
--

ALTER SEQUENCE teamsync.pm_task_id_seq OWNED BY teamsync.pm_task.id;


--
-- Name: pm_task id; Type: DEFAULT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task ALTER COLUMN id SET DEFAULT nextval('teamsync.pm_task_id_seq'::regclass);


--
-- Name: pm_task pm_task_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task
    ADD CONSTRAINT pm_task_pkey PRIMARY KEY (id);


--
-- Name: idx_project_status; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_project_status ON teamsync.pm_task USING btree (project_id, status);


--
-- Name: idx_stage; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_stage ON teamsync.pm_task USING btree (stage_id);


--
-- Name: idx_status; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_status ON teamsync.pm_task USING btree (status);


--
-- PostgreSQL database dump complete
--

\unrestrict yCfSuTMrMRpVWccpxa0IjLC41e8lOawdnUHGcNAGNF6h023js3k14naeEg0JB1X

