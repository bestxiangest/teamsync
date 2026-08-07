--
-- PostgreSQL database dump
--

\restrict EY335NP09kw9y2tKSNJtplkry87bQatvGErMn6D5AeMYm6wBBbwAhFoOWqPqPOD

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
-- Name: pm_project; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.pm_project (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    owner_id bigint NOT NULL,
    is_deleted smallint DEFAULT 0,
    is_archived smallint DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    progress integer DEFAULT 0,
    group_id bigint DEFAULT 0
);


--
-- Name: TABLE pm_project; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.pm_project IS '项目表';


--
-- Name: COLUMN pm_project.name; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project.name IS '项目名称';


--
-- Name: COLUMN pm_project.description; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project.description IS '项目简介';


--
-- Name: COLUMN pm_project.owner_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project.owner_id IS '项目拥有者ID';


--
-- Name: COLUMN pm_project.is_deleted; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project.is_deleted IS '0:正常 1:删除';


--
-- Name: COLUMN pm_project.is_archived; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project.is_archived IS '是否归档 0:活跃 1:已归档';


--
-- Name: COLUMN pm_project.progress; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project.progress IS '项目进度(0-100)';


--
-- Name: COLUMN pm_project.group_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project.group_id IS '共享分组ID，0表示根目录';


--
-- Name: pm_project_id_seq; Type: SEQUENCE; Schema: teamsync; Owner: -
--

CREATE SEQUENCE teamsync.pm_project_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pm_project_id_seq; Type: SEQUENCE OWNED BY; Schema: teamsync; Owner: -
--

ALTER SEQUENCE teamsync.pm_project_id_seq OWNED BY teamsync.pm_project.id;


--
-- Name: pm_project id; Type: DEFAULT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_project ALTER COLUMN id SET DEFAULT nextval('teamsync.pm_project_id_seq'::regclass);


--
-- Name: pm_project pm_project_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_project
    ADD CONSTRAINT pm_project_pkey PRIMARY KEY (id);


--
-- Name: idx_is_archived; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_is_archived ON teamsync.pm_project USING btree (is_archived);


--
-- Name: idx_pm_project_group_id; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_pm_project_group_id ON teamsync.pm_project USING btree (group_id);


--
-- PostgreSQL database dump complete
--

\unrestrict EY335NP09kw9y2tKSNJtplkry87bQatvGErMn6D5AeMYm6wBBbwAhFoOWqPqPOD

