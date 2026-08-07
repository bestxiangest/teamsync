--
-- PostgreSQL database dump
--

\restrict GERqFbTbS0xyNE2HwytjgcZyEsmTlbRxRkEHbyq1D50JbQaYVHzbCkdhdmXM3cd

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
-- Name: pm_project_member; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.pm_project_member (
    project_id bigint NOT NULL,
    user_id bigint NOT NULL,
    role_type smallint DEFAULT 1,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    custom_group_id bigint DEFAULT 0 NOT NULL
);


--
-- Name: TABLE pm_project_member; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.pm_project_member IS '项目成员表';


--
-- Name: COLUMN pm_project_member.role_type; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project_member.role_type IS '1:普通成员 2:管理员';


--
-- Name: COLUMN pm_project_member.custom_group_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_project_member.custom_group_id IS '自定义分组ID(0:根目录)';


--
-- Name: pm_project_member pm_project_member_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_project_member
    ADD CONSTRAINT pm_project_member_pkey PRIMARY KEY (project_id, user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict GERqFbTbS0xyNE2HwytjgcZyEsmTlbRxRkEHbyq1D50JbQaYVHzbCkdhdmXM3cd

