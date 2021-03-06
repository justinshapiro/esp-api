--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.5
-- Dumped by pg_dump version 9.6.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = public, pg_catalog;

ALTER TABLE ONLY public.location DROP CONSTRAINT fk_locations_user_tables_1;
ALTER TABLE ONLY public.location_setting DROP CONSTRAINT fk_location_settings_user_tables_1;
ALTER TABLE ONLY public.location_contact DROP CONSTRAINT fk_location_contacts_user_tables_1;
ALTER TABLE ONLY public.internal_authentication DROP CONSTRAINT fk_internal_authentication_user_tables_1;
ALTER TABLE ONLY public.emergency_contact DROP CONSTRAINT fk_emergency_contacts_user_tables_1;
ALTER TABLE ONLY public.category DROP CONSTRAINT fk_default_categories_user_tables_1;
ALTER TABLE ONLY public.category_setting DROP CONSTRAINT fk_category_settings_user_tables_1;
ALTER TABLE ONLY public.category_contact DROP CONSTRAINT fk_category_contacts_user_tables_1;
DROP TRIGGER location_update ON public.location;
DROP TRIGGER location_insert ON public.location;
DROP RULE "_RETURN" ON public.output_users;
DROP RULE "_RETURN" ON public.output_locations;
DROP INDEX public.idx_location_geom;
ALTER TABLE ONLY public.user_table DROP CONSTRAINT user_table_pkey;
ALTER TABLE ONLY public.location_setting DROP CONSTRAINT location_setting_pkey;
ALTER TABLE ONLY public.location DROP CONSTRAINT location_pkey;
ALTER TABLE ONLY public.location_contact DROP CONSTRAINT location_contact_pkey;
ALTER TABLE ONLY public.internal_authentication DROP CONSTRAINT internal_authentication_pkey;
ALTER TABLE ONLY public.category_setting DROP CONSTRAINT category_setting_pkey;
ALTER TABLE ONLY public.category_contact DROP CONSTRAINT category_contact_pkey;
ALTER TABLE public.authentication_type ALTER COLUMN id DROP DEFAULT;
DROP TABLE public.output_users;
DROP VIEW public.output_user_alerts;
DROP TABLE public.user_table;
DROP TABLE public.output_locations;
DROP TABLE public.location_setting;
DROP TABLE public.location_contact;
DROP TABLE public.location_category;
DROP TABLE public.location;
DROP TABLE public.internal_authentication;
DROP TABLE public.emergency_contact;
DROP TABLE public.category_setting;
DROP TABLE public.category_contact;
DROP TABLE public.category;
DROP SEQUENCE public.authentication_type_id_seq;
DROP TABLE public.authentication_type;
DROP FUNCTION public.update_geom();
DROP EXTENSION "uuid-ossp";
DROP EXTENSION postgis;
DROP EXTENSION adminpack;
DROP EXTENSION plpgsql;
DROP SCHEMA public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET search_path = public, pg_catalog;

--
-- Name: update_geom(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION update_geom() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF(TG_OP='INSERT') THEN
        UPDATE location
        SET geom = ST_SetSRID(ST_MakePoint(lat,long), 4326)
        WHERE geom IS NULL;
    ELSIF(TG_OP='UPDATE') THEN
        UPDATE location
        SET geom = ST_SetSRID(ST_MakePoint(lat,long), 4326);
    END IF;
    RETURN NEW;
END;

$$;


ALTER FUNCTION public.update_geom() OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: authentication_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE authentication_type (
    id integer NOT NULL,
    name text
);


ALTER TABLE authentication_type OWNER TO postgres;

--
-- Name: authentication_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE authentication_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE authentication_type_id_seq OWNER TO postgres;

--
-- Name: authentication_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE authentication_type_id_seq OWNED BY authentication_type.id;


--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE category (
    id uuid DEFAULT uuid_generate_v1() NOT NULL,
    name text NOT NULL,
    description text,
    user_table_id uuid DEFAULT uuid_nil() NOT NULL
);


ALTER TABLE category OWNER TO postgres;

--
-- Name: category_contact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE category_contact (
    user_table_id uuid NOT NULL,
    category_id uuid NOT NULL,
    contact_id uuid NOT NULL
);


ALTER TABLE category_contact OWNER TO postgres;

--
-- Name: category_setting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE category_setting (
    user_table_id uuid NOT NULL,
    category_id uuid NOT NULL,
    alertable boolean NOT NULL
);


ALTER TABLE category_setting OWNER TO postgres;

--
-- Name: emergency_contact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE emergency_contact (
    id uuid DEFAULT uuid_generate_v1() NOT NULL,
    name text NOT NULL,
    phone text,
    user_table_id uuid NOT NULL,
    group_id integer
);


ALTER TABLE emergency_contact OWNER TO postgres;

--
-- Name: internal_authentication; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE internal_authentication (
    user_table_id uuid NOT NULL,
    username text,
    password text
);


ALTER TABLE internal_authentication OWNER TO postgres;

--
-- Name: location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE location (
    id text DEFAULT uuid_generate_v1() NOT NULL,
    description text,
    phone_number text,
    address text,
    icon bytea,
    user_table_id uuid,
    lat numeric,
    long numeric,
    geom geometry(Point,4326),
    name text
);


ALTER TABLE location OWNER TO postgres;

--
-- Name: location_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE location_category (
    location_id text NOT NULL,
    category_id uuid NOT NULL
);


ALTER TABLE location_category OWNER TO postgres;

--
-- Name: location_contact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE location_contact (
    location_id text NOT NULL,
    contact_id uuid NOT NULL,
    user_table_id uuid NOT NULL
);


ALTER TABLE location_contact OWNER TO postgres;

--
-- Name: location_setting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE location_setting (
    user_table_id uuid NOT NULL,
    location_id text NOT NULL,
    alertable boolean NOT NULL
);


ALTER TABLE location_setting OWNER TO postgres;

--
-- Name: output_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE output_locations (
    id text,
    name text,
    description text,
    phone_number text,
    address text,
    icon bytea,
    user_table_id uuid,
    geometry text,
    categories json,
    alertable boolean,
    contacts json,
    indexed_location geometry(Point,4326)
);

ALTER TABLE ONLY output_locations REPLICA IDENTITY NOTHING;


ALTER TABLE output_locations OWNER TO postgres;

--
-- Name: user_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE user_table (
    user_table_id uuid DEFAULT uuid_generate_v1() NOT NULL,
    authentication_type integer NOT NULL,
    authentication_token text,
    name text,
    email text
);


ALTER TABLE user_table OWNER TO postgres;

--
-- Name: output_user_alerts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW output_user_alerts AS
 WITH location_alerts AS (
         SELECT user_table.user_table_id,
            jsonb_agg(location_setting.*) AS locations
           FROM (user_table
             LEFT JOIN location_setting ON ((user_table.user_table_id = location_setting.user_table_id)))
          GROUP BY user_table.user_table_id
        )
 SELECT location_alerts.user_table_id,
    location_alerts.locations,
    json_agg(category_setting.*) AS categories
   FROM (location_alerts
     LEFT JOIN category_setting ON ((location_alerts.user_table_id = category_setting.user_table_id)))
  GROUP BY location_alerts.user_table_id, location_alerts.locations;


ALTER TABLE output_user_alerts OWNER TO postgres;

--
-- Name: output_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE output_users (
    user_table_id uuid,
    authentication_token text,
    name text,
    email text,
    auth_type text,
    username text,
    password text,
    locations json
);

ALTER TABLE ONLY output_users REPLICA IDENTITY NOTHING;


ALTER TABLE output_users OWNER TO postgres;

--
-- Name: authentication_type id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY authentication_type ALTER COLUMN id SET DEFAULT nextval('authentication_type_id_seq'::regclass);


--
-- Data for Name: authentication_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY authentication_type (id, name) FROM stdin;
1	Internal
1	Internal
\.


--
-- Name: authentication_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('authentication_type_id_seq', 11, true);


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY category (id, name, description, user_table_id) FROM stdin;
819aaea0-ab8c-11e7-8254-974a4e9a50d4	hospital	Where people go to get healed	00000000-0000-0000-0000-000000000000
819b242a-ab8c-11e7-8255-5fc07584b915	police	Where people go when there’s trouble	00000000-0000-0000-0000-000000000000
819b242b-ab8c-11e7-8256-9751457bf773	fire_station	Where all the fire trucks are	00000000-0000-0000-0000-000000000000
c9c27478-ce6a-11e7-a3a0-8bf715cec419	custom	Where users go when they are in trouble	00000000-0000-0000-0000-000000000000
\.


--
-- Data for Name: category_contact; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY category_contact (user_table_id, category_id, contact_id) FROM stdin;
\.


--
-- Data for Name: category_setting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY category_setting (user_table_id, category_id, alertable) FROM stdin;
00000000-0000-0000-0000-000000000000	819aaea0-ab8c-11e7-8254-974a4e9a50d4	t
00000000-0000-0000-0000-000000000000	819b242a-ab8c-11e7-8255-5fc07584b915	t
\.


--
-- Data for Name: emergency_contact; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY emergency_contact (id, name, phone, user_table_id, group_id) FROM stdin;
646d6946-aeb9-11e7-8a9b-5788aea6d1de	Test Contact	\N	00000000-0000-0000-0000-000000000000	\N
70109b56-aeb9-11e7-aba0-dbfe0e958463	Test Contact	\N	00000000-0000-0000-0000-000000000000	\N
646d6946-aeb9-11e7-8a9b-5788aea6d1de	Test Contact	\N	00000000-0000-0000-0000-000000000000	\N
70109b56-aeb9-11e7-aba0-dbfe0e958463	Test Contact	\N	00000000-0000-0000-0000-000000000000	\N
6c00ba02-0b05-11e8-ae69-ef93eb1ee020	Test Contact 1	3039876543	4c5da46e-d1b0-11e7-877a-73ff015881dd	1
6f5d58b8-0b05-11e8-98b3-971c026ca7b0	Test Contact 2	3039876543	4c5da46e-d1b0-11e7-877a-73ff015881dd	1
713c4298-0b05-11e8-ae6a-eb7447e12829	Test Contact 3	3039876543	4c5da46e-d1b0-11e7-877a-73ff015881dd	1
72890f8c-0b05-11e8-98b4-3b8b1e56f90c	Test Contact 4	3039876543	4c5da46e-d1b0-11e7-877a-73ff015881dd	1
\.


--
-- Data for Name: internal_authentication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY internal_authentication (user_table_id, username, password) FROM stdin;
4c5da46e-d1b0-11e7-877a-73ff015881dd	jshapiro	seniordesign
2cfbdece-d9e9-11e7-8bd7-bbb4c9260935	\N	testpassword
\.


--
-- Data for Name: location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY location (id, description, phone_number, address, icon, user_table_id, lat, long, geom, name) FROM stdin;
4e002b04-ae0e-11e7-bc63-539357cc0fec	\N	\N	\N	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
107c080c-ae13-11e7-a6ad-4f96db8fabde	\N	\N	\N	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
471cc7d4-ae13-11e7-804d-075b518ea09a	\N	\N	\N	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
ad7d8b5e-adf9-11e7-bff8-bb89dc6893cd	\N	\N	\N	\N	\N	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
87ef4dae-aeb3-11e7-a41b-a3f3f93daf9f	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
9e134daa-aeb4-11e7-ad49-43f49e663b93	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
771a5868-aeb6-11e7-8e53-f75c0530d8f9	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
3896947e-aeb3-11e7-9793-77fddd4e0331	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
43063c02-aeb3-11e7-b020-6f7073ac4705	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
9b3fee9a-aeb3-11e7-9f06-a3ad4906a847	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
d138339c-aeb6-11e7-8cf8-9f3619678813	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
51083d20-aeb6-11e7-81d0-87aa2031de3c	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
56979e5a-aeb3-11e7-a48c-2b1e0788dfae	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
b6dea02e-aeb3-11e7-a72d-e7dcdd040dc4	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
63660f74-aeb6-11e7-99b7-ab0b342d81a6	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
74a39ad0-aeb7-11e7-8635-5f6be6901407	\N	\N	test address	\N	00000000-0000-0000-0000-000000000000	39.7271607	-104.9910547	0101000020E6100000DEB7109A13DD43400443B1706D3F5AC0	\N
d3819ade-d23e-11e7-8eb3-4385087a5a0b	This is a test location	\N	2018 South Columbine Street	\N	4c5da46e-d1b0-11e7-877a-73ff015881dd	39.67978	-104.95625	0101000020E6100000C93CF20703D7434033333333333D5AC0	Home
f81c7d00-d23e-11e7-a25f-8381f2cb1a70	This is a test location	\N	2018 South Columbine Street	\N	4c5da46e-d1b0-11e7-877a-73ff015881dd	39.67978	-104.95625	0101000020E6100000C93CF20703D7434033333333333D5AC0	Home
96dfd416-adf8-11e7-8f78-27aa67ba9d05	\N	\N	\N	\N	\N	\N	\N	\N	\N
15ebbd4e-adf7-11e7-8a57-47dbee394b88	\N	\N	\N	\N	\N	\N	\N	\N	\N
b602e58a-ac55-11e7-82a1-e742ada5df7d	Test	\N	\N	\N	\N	\N	\N	\N	\N
43a96e0a-adef-11e7-b511-237f5608ebbd	test	\N	\N	\N	\N	\N	\N	\N	\N
850b451c-adef-11e7-b512-d736fd12fcb3	test	\N	\N	\N	\N	\N	\N	\N	\N
3fc0bd26-adf3-11e7-b513-7fb0965e5b4f	test	\N	\N	\N	\N	\N	\N	\N	\N
a27f16e6-adf4-11e7-a54f-cbd2d36b3376	test	test	test	\N	\N	\N	\N	\N	\N
8629db56-adf5-11e7-b903-af1a4be161a8	test	test	test	\N	\N	\N	\N	\N	\N
98d8eb98-adf5-11e7-ab61-3b4fd457d11b	test	test	test	\N	\N	\N	\N	\N	\N
a1fce746-adf6-11e7-bc9a-733b1f7790e9	\N	\N	\N	\N	\N	\N	\N	\N	\N
aa74cede-adf6-11e7-883e-6be98c0283ed	\N	\N	\N	\N	\N	\N	\N	\N	\N
f93db918-adf6-11e7-84b3-ffba12623491	\N	\N	\N	\N	\N	\N	\N	\N	\N
3457537e-adf7-11e7-ab79-5f1686660ba3	\N	\N	\N	\N	\N	\N	\N	\N	\N
4dd78832-adf7-11e7-96c0-33e7fa9cc392	\N	\N	\N	\N	\N	\N	\N	\N	\N
18e64874-adf8-11e7-87ab-339a8fcee011	\N	\N	\N	\N	\N	\N	\N	\N	\N
8d09113c-adf8-11e7-9c98-8f4bc72eee2c	\N	\N	\N	\N	\N	\N	\N	\N	\N
01635164-adf9-11e7-807d-4f8c27969027	\N	\N	\N	\N	\N	\N	\N	\N	\N
685a97f6-adf9-11e7-bef1-a3f7d74bdf5c	\N	\N	\N	\N	\N	\N	\N	\N	\N
c131d632-d23e-11e7-9ed9-038322cf5c4f	This is a test location	\N	2018 South Columbine Street	\N	4c5da46e-d1b0-11e7-877a-73ff015881dd	39.67978	-104.95625	0101000020E6100000C93CF20703D7434033333333333D5AC0	Home
e2ad57be-d23e-11e7-bf0f-c3943c91a685	This is a test location	\N	2018 South Columbine Street	\N	4c5da46e-d1b0-11e7-877a-73ff015881dd	39.67978	-104.95625	0101000020E6100000C93CF20703D7434033333333333D5AC0	Home
\.


--
-- Data for Name: location_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY location_category (location_id, category_id) FROM stdin;
b602e58a-ac55-11e7-82a1-e742ada5df7d	819aaea0-ab8c-11e7-8254-974a4e9a50d4
43a96e0a-adef-11e7-b511-237f5608ebbd	819aaea0-ab8c-11e7-8254-974a4e9a50d4
850b451c-adef-11e7-b512-d736fd12fcb3	819aaea0-ab8c-11e7-8254-974a4e9a50d4
3fc0bd26-adf3-11e7-b513-7fb0965e5b4f	819aaea0-ab8c-11e7-8254-974a4e9a50d4
a27f16e6-adf4-11e7-a54f-cbd2d36b3376	819aaea0-ab8c-11e7-8254-974a4e9a50d4
8629db56-adf5-11e7-b903-af1a4be161a8	819aaea0-ab8c-11e7-8254-974a4e9a50d4
98d8eb98-adf5-11e7-ab61-3b4fd457d11b	819aaea0-ab8c-11e7-8254-974a4e9a50d4
a1fce746-adf6-11e7-bc9a-733b1f7790e9	819aaea0-ab8c-11e7-8254-974a4e9a50d4
aa74cede-adf6-11e7-883e-6be98c0283ed	819aaea0-ab8c-11e7-8254-974a4e9a50d4
f93db918-adf6-11e7-84b3-ffba12623491	819aaea0-ab8c-11e7-8254-974a4e9a50d4
15ebbd4e-adf7-11e7-8a57-47dbee394b88	819aaea0-ab8c-11e7-8254-974a4e9a50d4
3457537e-adf7-11e7-ab79-5f1686660ba3	819aaea0-ab8c-11e7-8254-974a4e9a50d4
4dd78832-adf7-11e7-96c0-33e7fa9cc392	819aaea0-ab8c-11e7-8254-974a4e9a50d4
18e64874-adf8-11e7-87ab-339a8fcee011	819aaea0-ab8c-11e7-8254-974a4e9a50d4
8d09113c-adf8-11e7-9c98-8f4bc72eee2c	819aaea0-ab8c-11e7-8254-974a4e9a50d4
96dfd416-adf8-11e7-8f78-27aa67ba9d05	819aaea0-ab8c-11e7-8254-974a4e9a50d4
01635164-adf9-11e7-807d-4f8c27969027	819aaea0-ab8c-11e7-8254-974a4e9a50d4
685a97f6-adf9-11e7-bef1-a3f7d74bdf5c	819b242a-ab8c-11e7-8255-5fc07584b915
ad7d8b5e-adf9-11e7-bff8-bb89dc6893cd	819b242a-ab8c-11e7-8255-5fc07584b915
4e002b04-ae0e-11e7-bc63-539357cc0fec	819b242a-ab8c-11e7-8255-5fc07584b915
107c080c-ae13-11e7-a6ad-4f96db8fabde	819b242a-ab8c-11e7-8255-5fc07584b915
471cc7d4-ae13-11e7-804d-075b518ea09a	819b242a-ab8c-11e7-8255-5fc07584b915
3896947e-aeb3-11e7-9793-77fddd4e0331	819aaea0-ab8c-11e7-8254-974a4e9a50d4
43063c02-aeb3-11e7-b020-6f7073ac4705	819aaea0-ab8c-11e7-8254-974a4e9a50d4
56979e5a-aeb3-11e7-a48c-2b1e0788dfae	819aaea0-ab8c-11e7-8254-974a4e9a50d4
87ef4dae-aeb3-11e7-a41b-a3f3f93daf9f	819aaea0-ab8c-11e7-8254-974a4e9a50d4
9b3fee9a-aeb3-11e7-9f06-a3ad4906a847	819aaea0-ab8c-11e7-8254-974a4e9a50d4
b6dea02e-aeb3-11e7-a72d-e7dcdd040dc4	819aaea0-ab8c-11e7-8254-974a4e9a50d4
9e134daa-aeb4-11e7-ad49-43f49e663b93	819aaea0-ab8c-11e7-8254-974a4e9a50d4
51083d20-aeb6-11e7-81d0-87aa2031de3c	819aaea0-ab8c-11e7-8254-974a4e9a50d4
63660f74-aeb6-11e7-99b7-ab0b342d81a6	819aaea0-ab8c-11e7-8254-974a4e9a50d4
771a5868-aeb6-11e7-8e53-f75c0530d8f9	819aaea0-ab8c-11e7-8254-974a4e9a50d4
d138339c-aeb6-11e7-8cf8-9f3619678813	819aaea0-ab8c-11e7-8254-974a4e9a50d4
74a39ad0-aeb7-11e7-8635-5f6be6901407	819aaea0-ab8c-11e7-8254-974a4e9a50d4
b602e58a-ac55-11e7-82a1-e742ada5df7d	819aaea0-ab8c-11e7-8254-974a4e9a50d4
43a96e0a-adef-11e7-b511-237f5608ebbd	819aaea0-ab8c-11e7-8254-974a4e9a50d4
850b451c-adef-11e7-b512-d736fd12fcb3	819aaea0-ab8c-11e7-8254-974a4e9a50d4
3fc0bd26-adf3-11e7-b513-7fb0965e5b4f	819aaea0-ab8c-11e7-8254-974a4e9a50d4
a27f16e6-adf4-11e7-a54f-cbd2d36b3376	819aaea0-ab8c-11e7-8254-974a4e9a50d4
8629db56-adf5-11e7-b903-af1a4be161a8	819aaea0-ab8c-11e7-8254-974a4e9a50d4
98d8eb98-adf5-11e7-ab61-3b4fd457d11b	819aaea0-ab8c-11e7-8254-974a4e9a50d4
a1fce746-adf6-11e7-bc9a-733b1f7790e9	819aaea0-ab8c-11e7-8254-974a4e9a50d4
aa74cede-adf6-11e7-883e-6be98c0283ed	819aaea0-ab8c-11e7-8254-974a4e9a50d4
f93db918-adf6-11e7-84b3-ffba12623491	819aaea0-ab8c-11e7-8254-974a4e9a50d4
15ebbd4e-adf7-11e7-8a57-47dbee394b88	819aaea0-ab8c-11e7-8254-974a4e9a50d4
3457537e-adf7-11e7-ab79-5f1686660ba3	819aaea0-ab8c-11e7-8254-974a4e9a50d4
4dd78832-adf7-11e7-96c0-33e7fa9cc392	819aaea0-ab8c-11e7-8254-974a4e9a50d4
18e64874-adf8-11e7-87ab-339a8fcee011	819aaea0-ab8c-11e7-8254-974a4e9a50d4
8d09113c-adf8-11e7-9c98-8f4bc72eee2c	819aaea0-ab8c-11e7-8254-974a4e9a50d4
96dfd416-adf8-11e7-8f78-27aa67ba9d05	819aaea0-ab8c-11e7-8254-974a4e9a50d4
01635164-adf9-11e7-807d-4f8c27969027	819aaea0-ab8c-11e7-8254-974a4e9a50d4
685a97f6-adf9-11e7-bef1-a3f7d74bdf5c	819b242a-ab8c-11e7-8255-5fc07584b915
ad7d8b5e-adf9-11e7-bff8-bb89dc6893cd	819b242a-ab8c-11e7-8255-5fc07584b915
4e002b04-ae0e-11e7-bc63-539357cc0fec	819b242a-ab8c-11e7-8255-5fc07584b915
107c080c-ae13-11e7-a6ad-4f96db8fabde	819b242a-ab8c-11e7-8255-5fc07584b915
471cc7d4-ae13-11e7-804d-075b518ea09a	819b242a-ab8c-11e7-8255-5fc07584b915
3896947e-aeb3-11e7-9793-77fddd4e0331	819aaea0-ab8c-11e7-8254-974a4e9a50d4
43063c02-aeb3-11e7-b020-6f7073ac4705	819aaea0-ab8c-11e7-8254-974a4e9a50d4
56979e5a-aeb3-11e7-a48c-2b1e0788dfae	819aaea0-ab8c-11e7-8254-974a4e9a50d4
87ef4dae-aeb3-11e7-a41b-a3f3f93daf9f	819aaea0-ab8c-11e7-8254-974a4e9a50d4
9b3fee9a-aeb3-11e7-9f06-a3ad4906a847	819aaea0-ab8c-11e7-8254-974a4e9a50d4
b6dea02e-aeb3-11e7-a72d-e7dcdd040dc4	819aaea0-ab8c-11e7-8254-974a4e9a50d4
9e134daa-aeb4-11e7-ad49-43f49e663b93	819aaea0-ab8c-11e7-8254-974a4e9a50d4
51083d20-aeb6-11e7-81d0-87aa2031de3c	819aaea0-ab8c-11e7-8254-974a4e9a50d4
63660f74-aeb6-11e7-99b7-ab0b342d81a6	819aaea0-ab8c-11e7-8254-974a4e9a50d4
771a5868-aeb6-11e7-8e53-f75c0530d8f9	819aaea0-ab8c-11e7-8254-974a4e9a50d4
d138339c-aeb6-11e7-8cf8-9f3619678813	819aaea0-ab8c-11e7-8254-974a4e9a50d4
74a39ad0-aeb7-11e7-8635-5f6be6901407	819aaea0-ab8c-11e7-8254-974a4e9a50d4
10ef843a-ce6b-11e7-98dc-b3cb3092985f	c9c27478-ce6a-11e7-a3a0-8bf715cec419
1168f1a0-ce6e-11e7-94fe-73bfa49b939b	c9c27478-ce6a-11e7-a3a0-8bf715cec419
779821e2-d1c7-11e7-8fd2-a31ea32f5b5c	c9c27478-ce6a-11e7-a3a0-8bf715cec419
f81c7d00-d23e-11e7-a25f-8381f2cb1a70	c9c27478-ce6a-11e7-a3a0-8bf715cec419
\.


--
-- Data for Name: location_contact; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY location_contact (location_id, contact_id, user_table_id) FROM stdin;
\.


--
-- Data for Name: location_setting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY location_setting (user_table_id, location_id, alertable) FROM stdin;
4c5da46e-d1b0-11e7-877a-73ff015881dd	ChIJvciNETB-bIcR0bz6zqfZyco	f
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: user_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY user_table (user_table_id, authentication_type, authentication_token, name, email) FROM stdin;
00000000-0000-0000-0000-000000000000	1	default	default	\N
2cfbdece-d9e9-11e7-8bd7-bbb4c9260935	1	test_auth_token	Test User	testEmail@google.com
4c5da46e-d1b0-11e7-877a-73ff015881dd	1	\N	Justin Shapiro	12345
\.


--
-- Name: category_contact category_contact_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category_contact
    ADD CONSTRAINT category_contact_pkey PRIMARY KEY (user_table_id, category_id, contact_id);


--
-- Name: category_setting category_setting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category_setting
    ADD CONSTRAINT category_setting_pkey PRIMARY KEY (user_table_id, category_id);


--
-- Name: internal_authentication internal_authentication_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY internal_authentication
    ADD CONSTRAINT internal_authentication_pkey PRIMARY KEY (user_table_id);


--
-- Name: location_contact location_contact_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location_contact
    ADD CONSTRAINT location_contact_pkey PRIMARY KEY (location_id, contact_id, user_table_id);


--
-- Name: location location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);


--
-- Name: location_setting location_setting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location_setting
    ADD CONSTRAINT location_setting_pkey PRIMARY KEY (user_table_id, location_id);


--
-- Name: user_table user_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_table
    ADD CONSTRAINT user_table_pkey PRIMARY KEY (user_table_id);


--
-- Name: idx_location_geom; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_location_geom ON location USING gist (geom);


--
-- Name: output_locations _RETURN; Type: RULE; Schema: public; Owner: postgres
--

CREATE RULE "_RETURN" AS
    ON SELECT TO output_locations DO INSTEAD  SELECT location.id,
    location.name,
    location.description,
    location.phone_number,
    location.address,
    location.icon,
    location.user_table_id,
    st_asgeojson(location.geom) AS geometry,
    json_agg(category.*) AS categories,
    location_setting.alertable,
    json_agg(emergency_contact.*) AS contacts,
    location.geom AS indexed_location
   FROM (((((location
     JOIN location_category lcat ON ((lcat.location_id = location.id)))
     JOIN category ON ((lcat.category_id = category.id)))
     LEFT JOIN location_setting ON (((location.id = location_setting.location_id) AND (location.user_table_id = location_setting.user_table_id))))
     LEFT JOIN location_contact lcon ON (((lcon.location_id = location.id) AND (lcon.user_table_id = location.user_table_id))))
     LEFT JOIN emergency_contact ON ((lcon.contact_id = emergency_contact.id)))
  GROUP BY location.id, location_setting.alertable;


--
-- Name: output_users _RETURN; Type: RULE; Schema: public; Owner: postgres
--

CREATE RULE "_RETURN" AS
    ON SELECT TO output_users DO INSTEAD  SELECT user_table.user_table_id,
    user_table.authentication_token,
    user_table.name,
    user_table.email,
    authentication_type.name AS auth_type,
    internal_authentication.username,
    internal_authentication.password,
    json_agg(output_locations.*) AS locations
   FROM (((user_table
     JOIN authentication_type ON ((user_table.authentication_type = authentication_type.id)))
     LEFT JOIN internal_authentication ON ((user_table.user_table_id = internal_authentication.user_table_id)))
     LEFT JOIN output_locations ON ((user_table.user_table_id = output_locations.user_table_id)))
  GROUP BY user_table.user_table_id, authentication_type.name, internal_authentication.username, internal_authentication.password;


--
-- Name: location location_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER location_insert AFTER INSERT ON location FOR EACH ROW EXECUTE PROCEDURE update_geom();


--
-- Name: location location_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER location_update AFTER UPDATE ON location FOR EACH ROW WHEN (((old.lat IS DISTINCT FROM new.lat) AND (old.long IS DISTINCT FROM new.long))) EXECUTE PROCEDURE update_geom();


--
-- Name: category_contact fk_category_contacts_user_tables_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category_contact
    ADD CONSTRAINT fk_category_contacts_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table(user_table_id);


--
-- Name: category_setting fk_category_settings_user_tables_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category_setting
    ADD CONSTRAINT fk_category_settings_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table(user_table_id);


--
-- Name: category fk_default_categories_user_tables_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category
    ADD CONSTRAINT fk_default_categories_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table(user_table_id);


--
-- Name: emergency_contact fk_emergency_contacts_user_tables_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY emergency_contact
    ADD CONSTRAINT fk_emergency_contacts_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table(user_table_id);


--
-- Name: internal_authentication fk_internal_authentication_user_tables_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY internal_authentication
    ADD CONSTRAINT fk_internal_authentication_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table(user_table_id);


--
-- Name: location_contact fk_location_contacts_user_tables_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location_contact
    ADD CONSTRAINT fk_location_contacts_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table(user_table_id);


--
-- Name: location_setting fk_location_settings_user_tables_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location_setting
    ADD CONSTRAINT fk_location_settings_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table(user_table_id);


--
-- Name: location fk_locations_user_tables_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location
    ADD CONSTRAINT fk_locations_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table(user_table_id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

