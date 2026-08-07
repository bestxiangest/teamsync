--
-- PostgreSQL database dump
--

\restrict 65ZBNPMcDnxAL2Cb6zvn4wZ0RTD1gAlmjOy3FyHKcDAd8gAMP8DzW7Jd13ILWNd

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
-- Name: pm_task_stage; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.pm_task_stage (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    name character varying(50) NOT NULL,
    sort integer DEFAULT 0
);


--
-- Name: TABLE pm_task_stage; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.pm_task_stage IS '任务看板列';


--
-- Name: COLUMN pm_task_stage.project_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_stage.project_id IS '所属项目';


--
-- Name: COLUMN pm_task_stage.name; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_stage.name IS '阶段名称';


--
-- Name: COLUMN pm_task_stage.sort; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_stage.sort IS '排序(从左到右)';


--
-- Name: pm_task_stage_id_seq; Type: SEQUENCE; Schema: teamsync; Owner: -
--

CREATE SEQUENCE teamsync.pm_task_stage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pm_task_stage_id_seq; Type: SEQUENCE OWNED BY; Schema: teamsync; Owner: -
--

ALTER SEQUENCE teamsync.pm_task_stage_id_seq OWNED BY teamsync.pm_task_stage.id;


--
-- Name: pm_task_stage id; Type: DEFAULT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_stage ALTER COLUMN id SET DEFAULT nextval('teamsync.pm_task_stage_id_seq'::regclass);


--
-- Name: pm_task_stage pm_task_stage_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_stage
    ADD CONSTRAINT pm_task_stage_pkey PRIMARY KEY (id);


--
-- Name: idx_project; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_project ON teamsync.pm_task_stage USING btree (project_id);


--
-- PostgreSQL database dump complete
--

\unrestrict 65ZBNPMcDnxAL2Cb6zvn4wZ0RTD1gAlmjOy3FyHKcDAd8gAMP8DzW7Jd13ILWNd

