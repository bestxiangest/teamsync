--
-- PostgreSQL database dump
--

\restrict Noc8K1gqaupVw42rfRAMcdzjCQcmfBMMC4hpIEcff3bd22lMj1HdaCepZWJ7uwH

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
-- Name: sys_user; Type: TABLE; Schema: teamsync; Owner: -
--

CREATE TABLE teamsync.sys_user (
    id bigint NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(100) NOT NULL,
    nickname character varying(50) DEFAULT NULL::character varying,
    avatar character varying(255) DEFAULT NULL::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(100),
    phone character varying(20),
    gender smallint DEFAULT 0,
    status smallint DEFAULT 1,
    is_admin boolean DEFAULT false,
    updated_at timestamp without time zone
);


--
-- Name: TABLE sys_user; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON TABLE teamsync.sys_user IS '用户表';


--
-- Name: COLUMN sys_user.username; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user.username IS '账号';


--
-- Name: COLUMN sys_user.password; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user.password IS '加密密码';


--
-- Name: COLUMN sys_user.nickname; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user.nickname IS '昵称/显示名';


--
-- Name: COLUMN sys_user.avatar; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user.avatar IS '头像URL';


--
-- Name: COLUMN sys_user.email; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user.email IS '邮箱地址';


--
-- Name: COLUMN sys_user.phone; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user.phone IS '手机号码';


--
-- Name: COLUMN sys_user.gender; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user.gender IS '性别：0-未知 1-男 2-女';


--
-- Name: COLUMN sys_user.status; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user.status IS '状态：1-正常 2-离线 3-异常 4-禁用';


--
-- Name: COLUMN sys_user.is_admin; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user.is_admin IS '是否超级管理员';


--
-- Name: COLUMN sys_user.updated_at; Type: COMMENT; Schema: teamsync; Owner: -
--

COMMENT ON COLUMN teamsync.sys_user.updated_at IS '更新时间';


--
-- Name: sys_user_id_seq; Type: SEQUENCE; Schema: teamsync; Owner: -
--

CREATE SEQUENCE teamsync.sys_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sys_user_id_seq; Type: SEQUENCE OWNED BY; Schema: teamsync; Owner: -
--

ALTER SEQUENCE teamsync.sys_user_id_seq OWNED BY teamsync.sys_user.id;


--
-- Name: sys_user id; Type: DEFAULT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.sys_user ALTER COLUMN id SET DEFAULT nextval('teamsync.sys_user_id_seq'::regclass);


--
-- Name: sys_user sys_user_pkey; Type: CONSTRAINT; Schema: teamsync; Owner: -
--

ALTER TABLE ONLY teamsync.sys_user
    ADD CONSTRAINT sys_user_pkey PRIMARY KEY (id);


--
-- Name: uk_username; Type: INDEX; Schema: teamsync; Owner: -
--

CREATE UNIQUE INDEX uk_username ON teamsync.sys_user USING btree (username);


--
-- PostgreSQL database dump complete
--

\unrestrict Noc8K1gqaupVw42rfRAMcdzjCQcmfBMMC4hpIEcff3bd22lMj1HdaCepZWJ7uwH

