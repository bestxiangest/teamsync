--
-- PostgreSQL database dump
--

\restrict zdErHF9bzEvhuFkOFOUEUT8wmZdT6XuonMom4HuEBPkYPY8syxBNkXkWDKkB6LB

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
-- Name: pm_task_comment; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.pm_task_comment (
    id bigint NOT NULL,
    task_id bigint NOT NULL,
    user_id bigint NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE pm_task_comment; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.pm_task_comment IS '任务评论表';


--
-- Name: COLUMN pm_task_comment.id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_comment.id IS '主键ID';


--
-- Name: COLUMN pm_task_comment.task_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_comment.task_id IS '关联任务ID';


--
-- Name: COLUMN pm_task_comment.user_id; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_comment.user_id IS '评论人ID';


--
-- Name: COLUMN pm_task_comment.content; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_comment.content IS '评论内容';


--
-- Name: COLUMN pm_task_comment.created_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.pm_task_comment.created_at IS '创建时间';


--
-- Name: pm_task_comment_id_seq; Type: SEQUENCE; Schema: teamsync; Owner: -
--

CREATE SEQUENCE teamsync.pm_task_comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pm_task_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: teamsync; Owner: -
--

ALTER SEQUENCE teamsync.pm_task_comment_id_seq OWNED BY teamsync.pm_task_comment.id;


--
-- Name: pm_task_comment id; Type: DEFAULT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_comment ALTER COLUMN id SET DEFAULT nextval('teamsync.pm_task_comment_id_seq'::regclass);


--
-- Name: pm_task_comment pm_task_comment_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.pm_task_comment
    ADD CONSTRAINT pm_task_comment_pkey PRIMARY KEY (id);


--
-- Name: idx_task_comment_task_id; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_task_comment_task_id ON teamsync.pm_task_comment USING btree (task_id);


--
-- Name: idx_task_comment_user_id; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE INDEX idx_task_comment_user_id ON teamsync.pm_task_comment USING btree (user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict zdErHF9bzEvhuFkOFOUEUT8wmZdT6XuonMom4HuEBPkYPY8syxBNkXkWDKkB6LB

