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

ALTER TABLE ONLY public.user_table DROP CONSTRAINT fk_user_tables_authentication_types_1;
ALTER TABLE ONLY public.location DROP CONSTRAINT fk_locations_user_tables_1;
ALTER TABLE ONLY public.location_setting DROP CONSTRAINT fk_location_settings_user_tables_1;
ALTER TABLE ONLY public.location_setting DROP CONSTRAINT fk_location_settings_locations_1;
ALTER TABLE ONLY public.location_contact DROP CONSTRAINT fk_location_contacts_user_tables_1;
ALTER TABLE ONLY public.location_contact DROP CONSTRAINT fk_location_contacts_locations_1;
ALTER TABLE ONLY public.location_contact DROP CONSTRAINT fk_location_contacts_emergency_contacts_1;
ALTER TABLE ONLY public.location_category DROP CONSTRAINT fk_location_categories_locations_1;
ALTER TABLE ONLY public.location_category DROP CONSTRAINT fk_location_categories_categories_1;
ALTER TABLE ONLY public.internal_authentication DROP CONSTRAINT fk_internal_authentication_user_tables_1;
ALTER TABLE ONLY public.emergency_contact DROP CONSTRAINT fk_emergency_contacts_user_tables_1;
ALTER TABLE ONLY public.category DROP CONSTRAINT fk_default_categories_user_tables_1;
ALTER TABLE ONLY public.category_setting DROP CONSTRAINT fk_category_settings_user_tables_1;
ALTER TABLE ONLY public.category_setting DROP CONSTRAINT fk_category_settings_categories_1;
ALTER TABLE ONLY public.category_contact DROP CONSTRAINT fk_category_contacts_user_tables_1;
ALTER TABLE ONLY public.category_contact DROP CONSTRAINT fk_category_contacts_emergency_contacts_1;
ALTER TABLE ONLY public.category_contact DROP CONSTRAINT fk_category_contacts_categories_1;
DROP TRIGGER location_update ON public.location;
DROP TRIGGER location_insert ON public.location;
DROP INDEX public.idx_location_geom;
ALTER TABLE ONLY public.user_table DROP CONSTRAINT user_table_pkey;
ALTER TABLE ONLY public.category DROP CONSTRAINT unique_name_and_user_id;
ALTER TABLE ONLY public.location_setting DROP CONSTRAINT location_setting_pkey;
ALTER TABLE ONLY public.location DROP CONSTRAINT location_pkey;
ALTER TABLE ONLY public.location_contact DROP CONSTRAINT location_contact_pkey;
ALTER TABLE ONLY public.location_category DROP CONSTRAINT key;
ALTER TABLE ONLY public.internal_authentication DROP CONSTRAINT internal_authentication_pkey;
ALTER TABLE ONLY public.emergency_contact DROP CONSTRAINT emergency_contact_pkey;
ALTER TABLE ONLY public.category_setting DROP CONSTRAINT category_setting_pkey;
ALTER TABLE ONLY public.category DROP CONSTRAINT category_pkey;
ALTER TABLE ONLY public.category_contact DROP CONSTRAINT category_contact_pkey;
ALTER TABLE ONLY public.authentication_type DROP CONSTRAINT authentication_type_pkey;
ALTER TABLE ONLY public.authentication_type DROP CONSTRAINT authentication_type_name_key;
ALTER TABLE public.authentication_type ALTER COLUMN id DROP DEFAULT;
DROP TABLE public.user_table;
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
    email text,
    user_table_id uuid NOT NULL
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
    id uuid DEFAULT uuid_generate_v1() NOT NULL,
    description text,
    phone_number text,
    address text,
    icon bytea,
    user_table_id uuid,
    lat numeric,
    long numeric,
    geom geometry(Point,4326)
);


ALTER TABLE location OWNER TO postgres;

--
-- Name: location_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE location_category (
    location_id uuid NOT NULL,
    category_id uuid NOT NULL
);


ALTER TABLE location_category OWNER TO postgres;

--
-- Name: location_contact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE location_contact (
    location_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    user_table_id uuid NOT NULL
);


ALTER TABLE location_contact OWNER TO postgres;

--
-- Name: location_setting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE location_setting (
    user_table_id uuid NOT NULL,
    location_id uuid NOT NULL,
    alertable boolean NOT NULL
);


ALTER TABLE location_setting OWNER TO postgres;

--
-- Name: user_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE user_table (
    user_table_id uuid DEFAULT uuid_generate_v1() NOT NULL,
    authentication_type integer NOT NULL,
    authentication_token text,
    name text
);


ALTER TABLE user_table OWNER TO postgres;

--
-- Name: authentication_type id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY authentication_type ALTER COLUMN id SET DEFAULT nextval('authentication_type_id_seq'::regclass);


--
-- Data for Name: authentication_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY authentication_type (id, name) FROM stdin;
1	Internal
\.


--
-- Name: authentication_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('authentication_type_id_seq', 10, true);


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY category (id, name, description, user_table_id) FROM stdin;
819aaea0-ab8c-11e7-8254-974a4e9a50d4	Hospital	Where people go to get healed	00000000-0000-0000-0000-000000000000
819b242a-ab8c-11e7-8255-5fc07584b915	Police Dept	Where people go when there’s trouble	00000000-0000-0000-0000-000000000000
819b242b-ab8c-11e7-8256-9751457bf773	Fire Dept	Where all the fire trucks are	00000000-0000-0000-0000-000000000000
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
\.


--
-- Data for Name: emergency_contact; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY emergency_contact (id, name, email, user_table_id) FROM stdin;
\.


--
-- Data for Name: internal_authentication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY internal_authentication (user_table_id, username, password) FROM stdin;
\.


--
-- Data for Name: location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY location (id, description, phone_number, address, icon, user_table_id, lat, long, geom) FROM stdin;
\.


--
-- Data for Name: location_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY location_category (location_id, category_id) FROM stdin;
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
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: user_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY user_table (user_table_id, authentication_type, authentication_token, name) FROM stdin;
00000000-0000-0000-0000-000000000000	1	default	default
\.


--
-- Name: authentication_type authentication_type_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY authentication_type
    ADD CONSTRAINT authentication_type_name_key UNIQUE (name);


--
-- Name: authentication_type authentication_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY authentication_type
    ADD CONSTRAINT authentication_type_pkey PRIMARY KEY (id);


--
-- Name: category_contact category_contact_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category_contact
    ADD CONSTRAINT category_contact_pkey PRIMARY KEY (user_table_id, category_id, contact_id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: category_setting category_setting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category_setting
    ADD CONSTRAINT category_setting_pkey PRIMARY KEY (user_table_id, category_id);


--
-- Name: emergency_contact emergency_contact_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY emergency_contact
    ADD CONSTRAINT emergency_contact_pkey PRIMARY KEY (id);


--
-- Name: internal_authentication internal_authentication_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY internal_authentication
    ADD CONSTRAINT internal_authentication_pkey PRIMARY KEY (user_table_id);


--
-- Name: location_category key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location_category
    ADD CONSTRAINT key PRIMARY KEY (location_id, category_id);


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
-- Name: category unique_name_and_user_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category
    ADD CONSTRAINT unique_name_and_user_id UNIQUE (name, user_table_id);


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
-- Name: location location_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER location_insert AFTER INSERT ON location FOR EACH ROW EXECUTE PROCEDURE update_geom();


--
-- Name: location location_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER location_update AFTER UPDATE ON location FOR EACH ROW WHEN (((old.lat IS DISTINCT FROM new.lat) AND (old.long IS DISTINCT FROM new.long))) EXECUTE PROCEDURE update_geom();


--
-- Name: category_contact fk_category_contacts_categories_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category_contact
    ADD CONSTRAINT fk_category_contacts_categories_1 FOREIGN KEY (category_id) REFERENCES category(id);


--
-- Name: category_contact fk_category_contacts_emergency_contacts_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category_contact
    ADD CONSTRAINT fk_category_contacts_emergency_contacts_1 FOREIGN KEY (contact_id) REFERENCES emergency_contact(id);


--
-- Name: category_contact fk_category_contacts_user_tables_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category_contact
    ADD CONSTRAINT fk_category_contacts_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table(user_table_id);


--
-- Name: category_setting fk_category_settings_categories_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY category_setting
    ADD CONSTRAINT fk_category_settings_categories_1 FOREIGN KEY (category_id) REFERENCES category(id);


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
-- Name: location_category fk_location_categories_categories_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location_category
    ADD CONSTRAINT fk_location_categories_categories_1 FOREIGN KEY (category_id) REFERENCES category(id);


--
-- Name: location_category fk_location_categories_locations_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location_category
    ADD CONSTRAINT fk_location_categories_locations_1 FOREIGN KEY (location_id) REFERENCES location(id);


--
-- Name: location_contact fk_location_contacts_emergency_contacts_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location_contact
    ADD CONSTRAINT fk_location_contacts_emergency_contacts_1 FOREIGN KEY (contact_id) REFERENCES emergency_contact(id);


--
-- Name: location_contact fk_location_contacts_locations_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location_contact
    ADD CONSTRAINT fk_location_contacts_locations_1 FOREIGN KEY (location_id) REFERENCES location(id);


--
-- Name: location_contact fk_location_contacts_user_tables_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location_contact
    ADD CONSTRAINT fk_location_contacts_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table(user_table_id);


--
-- Name: location_setting fk_location_settings_locations_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY location_setting
    ADD CONSTRAINT fk_location_settings_locations_1 FOREIGN KEY (location_id) REFERENCES location(id);


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
-- Name: user_table fk_user_tables_authentication_types_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_table
    ADD CONSTRAINT fk_user_tables_authentication_types_1 FOREIGN KEY (authentication_type) REFERENCES authentication_type(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

