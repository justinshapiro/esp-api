/* Add extension for UUID generation */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE user_table (

user_table_id uuid NOT NULL DEFAULT uuid_generate_v1(),

name text,

authentication_type int4 NOT NULL,

authentication_token text,

PRIMARY KEY (user_table_id) ,

UNIQUE (user_table_id)

)

WITHOUT OIDS;



CREATE TABLE authentication_type (

id serial4 NOT NULL,

name text,

PRIMARY KEY (id) ,

UNIQUE (name)

)

WITHOUT OIDS;



CREATE TABLE location (

id uuid NOT NULL DEFAULT uuid_generate_v1(),

description text,

phone_number text,

address text,

icon bytea,

user_table_id uuid NOT NULL,

lat decimal,

long decimal,

PRIMARY KEY (id) 

)

WITHOUT OIDS;



CREATE TABLE category (

id uuid NOT NULL DEFAULT uuid_generate_v1(),

name text NOT NULL,

description text,

user_table_id uuid NOT NULL DEFAULT uuid_nil(),

PRIMARY KEY (id) 

)

WITHOUT OIDS;



CREATE TABLE location_category (

location_id uuid NOT NULL,

category_id uuid NOT NULL,

PRIMARY KEY (location_id, category_id) ,

CONSTRAINT Key UNIQUE (location_id, category_id)

)

WITHOUT OIDS;



CREATE TABLE emergency_contact (

id uuid NOT NULL DEFAULT uuid_generate_v1(),

name text NOT NULL,

email text,

user_table_id uuid NOT NULL,

PRIMARY KEY (id) 

)

WITHOUT OIDS;



CREATE TABLE location_contact (

location_id uuid NOT NULL,

contact_id uuid NOT NULL,

user_table_id uuid NOT NULL,

PRIMARY KEY (location_id, contact_id, user_table_id) 

)

WITHOUT OIDS;



CREATE TABLE category_setting (

user_table_id uuid NOT NULL,

category_id uuid NOT NULL,

alertable bool NOT NULL,

PRIMARY KEY (user_table_id, category_id) 

)

WITHOUT OIDS;



CREATE TABLE category_contact (

user_table_id uuid NOT NULL,

category_id uuid NOT NULL,

contact_id uuid NOT NULL,

PRIMARY KEY (user_table_id, category_id, contact_id) 

)

WITHOUT OIDS;



CREATE TABLE location_setting (

user_table_id uuid NOT NULL,

location_id uuid NOT NULL,

alertable bool NOT NULL,

PRIMARY KEY (user_table_id, location_id) 

)

WITHOUT OIDS;



CREATE TABLE internal_authentication (

user_table_id uuid NOT NULL,

username text,

password text,

PRIMARY KEY (user_table_id) 

)

WITHOUT OIDS;





ALTER TABLE user_table ADD CONSTRAINT fk_user_tables_Authentication_Types_1 FOREIGN KEY (authentication_type) REFERENCES authentication_type (id);

ALTER TABLE location_category ADD CONSTRAINT fk_Location_Categories_Categories_1 FOREIGN KEY (category_id) REFERENCES category (id);

ALTER TABLE location_contact ADD CONSTRAINT fk_Location_Contacts_Emergency_Contacts_1 FOREIGN KEY (contact_id) REFERENCES emergency_contact (id);

ALTER TABLE emergency_contact ADD CONSTRAINT fk_Emergency_Contacts_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table (user_table_id);

ALTER TABLE location ADD CONSTRAINT fk_Locations_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table (user_table_id);

ALTER TABLE category ADD CONSTRAINT fk_Default_Categories_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table (user_table_id);

ALTER TABLE location_contact ADD CONSTRAINT fk_Location_Contacts_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table (user_table_id);

ALTER TABLE location_setting ADD CONSTRAINT fk_Location_Settings_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table (user_table_id);

ALTER TABLE location_setting ADD CONSTRAINT fk_Location_Settings_Locations_1 FOREIGN KEY (location_id) REFERENCES location (id);

ALTER TABLE location_contact ADD CONSTRAINT fk_Location_Contacts_Locations_1 FOREIGN KEY (location_id) REFERENCES location (id);

ALTER TABLE category_contact ADD CONSTRAINT fk_Category_Contacts_Emergency_Contacts_1 FOREIGN KEY (contact_id) REFERENCES emergency_contact (id);

ALTER TABLE category_contact ADD CONSTRAINT fk_Category_Contacts_Categories_1 FOREIGN KEY (category_id) REFERENCES category (id);

ALTER TABLE category_contact ADD CONSTRAINT fk_Category_Contacts_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table (user_table_id);

ALTER TABLE category_setting ADD CONSTRAINT fk_Category_Settings_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table (user_table_id);

ALTER TABLE category_setting ADD CONSTRAINT fk_Category_Settings_Categories_1 FOREIGN KEY (category_id) REFERENCES category (id);

ALTER TABLE location_category ADD CONSTRAINT fk_Location_Categories_Locations_1 FOREIGN KEY (location_id) REFERENCES location (id);

ALTER TABLE internal_authentication ADD CONSTRAINT fk_Internal_Authentication_user_tables_1 FOREIGN KEY (user_table_id) REFERENCES user_table (user_table_id);

ALTER TABLE public.category ADD CONSTRAINT unique_name_and_user_id UNIQUE (name, user_table_id);

/* Create the geometry column */
SELECT AddGeometryColumn('location', 'geom', 4326, 'POINT', 2);

/* Create index on geometry column */
CREATE INDEX idx_location_geom ON location USING gist(geom);

/* Create trigger to automatically calculate geometry column */
CREATE OR REPLACE FUNCTION public.update_geom()
    RETURNS TRIGGER AS $popgeom$
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

$popgeom$ LANGUAGE plpgsql;

CREATE TRIGGER location_insert
    AFTER INSERT ON location
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_geom();
CREATE TRIGGER location_update
    AFTER UPDATE ON location
    FOR EACH ROW
    WHEN (OLD.lat IS DISTINCT FROM NEW.lat AND OLD.long IS DISTINCT FROM
    NEW.long)
    EXECUTE PROCEDURE public.update_geom();

/* Add views to simplify getting data */
CREATE OR REPLACE VIEW public.output_locations AS
 SELECT location.id,
    location.description,
    location.phone_number,
    location.address,
    location.icon,
    location.user_table_id,
    st_asgeojson(location.geom) AS geometry,
    json_agg(category.*) AS categories,
    location_setting.alertable,
    json_agg(emergency_contact.*) AS contacts
   FROM location
     JOIN location_category lcat ON lcat.location_id = location.id
     JOIN category ON lcat.category_id = category.id
     LEFT JOIN location_setting ON location.id = location_setting.location_id AND location.user_table_id = location_setting.user_table_id
     LEFT JOIN location_contact lcon ON lcon.location_id = location.id AND lcon.user_table_id = location.user_table_id
     LEFT JOIN emergency_contact ON lcon.contact_id = emergency_contact.id
  GROUP BY location.id, location_setting.alertable;

ALTER TABLE public.output_locations
    OWNER TO postgres;

CREATE OR REPLACE VIEW public.output_users AS
SELECT user_table.user_table_id, user_table.authentication_token, user_table.name,
	authentication_type.name as auth_type, internal_authentication.username,
    internal_authentication.password, json_agg(output_locations.*) as locations
FROM user_table
JOIN authentication_type ON user_table.authentication_type = authentication_type.id
LEFT JOIN internal_authentication ON user_table.user_table_id = internal_authentication.user_table_id
LEFT JOIN output_locations ON user_table.user_table_id = output_locations.user_table_id
GROUP BY user_table.user_table_id, authentication_type.name, internal_authentication.username, internal_authentication.password;

ALTER TABLE public.output_users
    OWNER TO postgres;