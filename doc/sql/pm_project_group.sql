--
-- PostgreSQL database dump
--

\restrict gezWRKWTrr97avZrhJ9tuN3TeJZwNpa3shur1SvVNP01uZYrzZdHpJa2uYk3o4w

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
-- Name: pm_project_group; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.pm_project_group (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    owner_id bigint NOT NULL,
    sort integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE pm_project_group; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.pm_project_group IS '项目分组表';


--
-- Name: COLUMN pm_project_group.name; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project_group.name IS '分组名称';


--
-- Name: COLUMN pm_project_group.owner_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project_group.owner_id IS '创建者ID';


--
-- Name: COLUMN pm_project_group.sort; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project_group.sort IS '排序';


--
-- Name: pm_project_group_id_seq; Type: SEQUENCE; Schema: teamsync; Owner: -
--

CREATE SEQUENCE teamsync.pm_project_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pm_project_group_id_seq; Type: SEQUENCE OWNED BY; Schema: teamsync; Owner: -
--

ALTER SEQUENCE teamsync.pm_project_group_id_seq OWNED BY teamsync.pm_project_group.id;


--
-- Name: pm_project_group id; Type: DEFAULT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_project_group ALTER COLUMN id SET DEFAULT nextval('teamsync.pm_project_group_id_seq'::regclass);


--
-- Name: pm_project_group pm_project_group_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_project_group
    ADD CONSTRAINT pm_project_group_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict gezWRKWTrr97avZrhJ9tuN3TeJZwNpa3shur1SvVNP01uZYrzZdHpJa2uYk3o4w

