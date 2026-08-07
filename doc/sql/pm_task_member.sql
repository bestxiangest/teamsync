--
-- PostgreSQL database dump
--

\restrict cORuhE8Uk9c2esksN9sJODZ3ygEjvII5NumI9go0WbGO2xhbOY9HA5WQqOcWL8E

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
-- Name: pm_task_member; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.pm_task_member (
    task_id bigint NOT NULL,
    user_id bigint NOT NULL,
    role character varying(20) DEFAULT 'EXECUTOR'::character varying
);


--
-- Name: TABLE pm_task_member; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.pm_task_member IS '任务成员关联';


--
-- Name: COLUMN pm_task_member.role; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_member.role IS 'EXECUTOR:执行者, FOLLOWER:关注者';


--
-- Name: pm_task_member pm_task_member_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_member
    ADD CONSTRAINT pm_task_member_pkey PRIMARY KEY (task_id, user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict cORuhE8Uk9c2esksN9sJODZ3ygEjvII5NumI9go0WbGO2xhbOY9HA5WQqOcWL8E

