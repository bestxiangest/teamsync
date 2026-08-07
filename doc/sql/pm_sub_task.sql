--
-- PostgreSQL database dump
--

\restrict JL7t509kfKIj3M0WQ9ZIlIQzzDIJeaekbO8PCtusuvOwF92dT4eVwPYjL0LUN5W

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
-- Name: pm_sub_task; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.pm_sub_task (
    id bigint NOT NULL,
    task_id bigint NOT NULL,
    content character varying(255) NOT NULL,
    status smallint DEFAULT 0 NOT NULL,
    sort integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    due_time timestamp without time zone
);


--
-- Name: TABLE pm_sub_task; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.pm_sub_task IS '子任务/检查项表';


--
-- Name: COLUMN pm_sub_task.id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_sub_task.id IS '主键ID';


--
-- Name: COLUMN pm_sub_task.task_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_sub_task.task_id IS '所属任务ID';


--
-- Name: COLUMN pm_sub_task.content; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_sub_task.content IS '子任务内容';


--
-- Name: COLUMN pm_sub_task.status; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_sub_task.status IS '状态 0:未完成 1:已完成';


--
-- Name: COLUMN pm_sub_task.sort; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_sub_task.sort IS '排序(从上到下)';


--
-- Name: COLUMN pm_sub_task.created_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_sub_task.created_at IS '创建时间';


--
-- Name: COLUMN pm_sub_task.due_time; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_sub_task.due_time IS '截止时间';


--
-- Name: pm_sub_task_id_seq; Type: SEQUENCE; Schema: teamsync; Owner: -
--

CREATE SEQUENCE teamsync.pm_sub_task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pm_sub_task_id_seq; Type: SEQUENCE OWNED BY; Schema: teamsync; Owner: -
--

ALTER SEQUENCE teamsync.pm_sub_task_id_seq OWNED BY teamsync.pm_sub_task.id;


--
-- Name: pm_sub_task id; Type: DEFAULT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_sub_task ALTER COLUMN id SET DEFAULT nextval('teamsync.pm_sub_task_id_seq'::regclass);


--
-- Name: pm_sub_task pm_sub_task_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_sub_task
    ADD CONSTRAINT pm_sub_task_pkey PRIMARY KEY (id);


--
-- Name: idx_task_id; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_task_id ON teamsync.pm_sub_task USING btree (task_id);


--
-- PostgreSQL database dump complete
--

\unrestrict JL7t509kfKIj3M0WQ9ZIlIQzzDIJeaekbO8PCtusuvOwF92dT4eVwPYjL0LUN5W

