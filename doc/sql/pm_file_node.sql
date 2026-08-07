--
-- PostgreSQL database dump
--

\restrict cr3fSNxdrUfScAB2KCMVeMciU9akXDETEf2rN2ExCm3v6xs6GikL95Geg01ErQx

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
-- Name: pm_file_node; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.pm_file_node (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    parent_id bigint DEFAULT 0 NOT NULL,
    node_type smallint DEFAULT 1 NOT NULL,
    name character varying(255) NOT NULL,
    file_url character varying(500) DEFAULT NULL::character varying,
    file_size bigint,
    extension character varying(20) DEFAULT NULL::character varying,
    task_id bigint,
    creator_id bigint NOT NULL,
    is_deleted smallint DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE pm_file_node; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.pm_file_node IS '项目文档节点表（文件夹/文件统一管理）';


--
-- Name: COLUMN pm_file_node.id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.id IS '主键ID';


--
-- Name: COLUMN pm_file_node.project_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.project_id IS '所属项目ID';


--
-- Name: COLUMN pm_file_node.parent_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.parent_id IS '父节点ID，0表示根目录';


--
-- Name: COLUMN pm_file_node.node_type; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.node_type IS '节点类型：0-文件夹 1-文件';


--
-- Name: COLUMN pm_file_node.name; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.name IS '文件名或文件夹名';


--
-- Name: COLUMN pm_file_node.file_url; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.file_url IS '文件存储路径（仅文件类型有效）';


--
-- Name: COLUMN pm_file_node.file_size; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.file_size IS '文件大小（字节，仅文件类型有效）';


--
-- Name: COLUMN pm_file_node.extension; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.extension IS '文件后缀（如 pdf, docx, png）';


--
-- Name: COLUMN pm_file_node.task_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.task_id IS '关联任务ID，任务附件使用；项目文档为空';


--
-- Name: COLUMN pm_file_node.creator_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.creator_id IS '创建人ID';


--
-- Name: COLUMN pm_file_node.is_deleted; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.is_deleted IS '是否删除：0-正常 1-已删除';


--
-- Name: COLUMN pm_file_node.created_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.created_at IS '创建时间';


--
-- Name: COLUMN pm_file_node.updated_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_file_node.updated_at IS '更新时间';


--
-- Name: pm_file_node_id_seq; Type: SEQUENCE; Schema: teamsync; Owner: -
--

CREATE SEQUENCE teamsync.pm_file_node_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pm_file_node_id_seq; Type: SEQUENCE OWNED BY; Schema: teamsync; Owner: -
--

ALTER SEQUENCE teamsync.pm_file_node_id_seq OWNED BY teamsync.pm_file_node.id;


--
-- Name: pm_file_node id; Type: DEFAULT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_file_node ALTER COLUMN id SET DEFAULT nextval('teamsync.pm_file_node_id_seq'::regclass);


--
-- Name: pm_file_node pm_file_node_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_file_node
    ADD CONSTRAINT pm_file_node_pkey PRIMARY KEY (id);


--
-- Name: idx_creator; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_creator ON teamsync.pm_file_node USING btree (creator_id);


--
-- Name: idx_project_parent; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_project_parent ON teamsync.pm_file_node USING btree (project_id, parent_id);


--
-- Name: idx_file_task_id; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_file_task_id ON teamsync.pm_file_node USING btree (task_id);


--
-- PostgreSQL database dump complete
--

\unrestrict cr3fSNxdrUfScAB2KCMVeMciU9akXDETEf2rN2ExCm3v6xs6GikL95Geg01ErQx
