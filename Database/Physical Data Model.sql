CREATE TABLE "Users" (
"ID" serial4 NOT NULL,
"Authentication_Type" int4 NOT NULL,
"Authentication_Token" text,
PRIMARY KEY ("ID") ,
UNIQUE ("ID")
)
WITHOUT OIDS;

CREATE TABLE "Authentication_Types" (
"Type_ID" serial4 NOT NULL,
"Name" text,
PRIMARY KEY ("Type_ID") 
)
WITHOUT OIDS;

CREATE TABLE "Locations" (
"ID" serial4 NOT NULL,
"Geolocation" geometry NOT NULL,
"Description" text,
"Phone Number" text,
"Address" text,
"Icon" bytea,
"User_ID" int4,
"Latitude" decimal,
"Longitude" decimal,
PRIMARY KEY ("ID") ,
CONSTRAINT "Location for User" UNIQUE ("Geolocation", "User_ID")
)
WITHOUT OIDS;

CREATE TABLE "Categories" (
"ID" serial4 NOT NULL,
"Name" text NOT NULL,
"Description" text,
"User_ID" int4,
PRIMARY KEY ("ID") 
)
WITHOUT OIDS;

CREATE TABLE "Location_Categories" (
"Location_ID" int4 NOT NULL,
"Catgory_ID" int4 NOT NULL,
PRIMARY KEY ("Location_ID", "Catgory_ID") ,
CONSTRAINT "Key" UNIQUE ("Location_ID", "Catgory_ID")
)
WITHOUT OIDS;

CREATE TABLE "Emergency_Contacts" (
"ID" serial4 NOT NULL,
"Name" text NOT NULL,
"Email" text,
"User_ID" int4 NOT NULL,
PRIMARY KEY ("ID") 
)
WITHOUT OIDS;

CREATE TABLE "Location_Contacts" (
"Location_ID" int4 NOT NULL,
"Contact_ID" int4 NOT NULL,
"User_ID" int4 NOT NULL,
PRIMARY KEY ("Location_ID", "Contact_ID", "User_ID") 
)
WITHOUT OIDS;

CREATE TABLE "Category_Settings" (
"User_ID" int4 NOT NULL,
"Category_ID" int4 NOT NULL,
"Alertable" bool NOT NULL,
PRIMARY KEY ("User_ID", "Category_ID") 
)
WITHOUT OIDS;

CREATE TABLE "Category_Contacts" (
"User_ID" int4 NOT NULL,
"Category_ID" int4 NOT NULL,
"Contact_ID" int4 NOT NULL,
PRIMARY KEY ("User_ID", "Category_ID", "Contact_ID") 
)
WITHOUT OIDS;

CREATE TABLE "Location_Settings" (
"User_ID" int4 NOT NULL,
"Location_ID" int4 NOT NULL,
"Alertable" bool NOT NULL,
PRIMARY KEY ("User_ID", "Location_ID") 
)
WITHOUT OIDS;

CREATE TABLE "Internal_Authentication" (
"User_ID" serial4 NOT NULL,
"Username" text,
"Password" text,
PRIMARY KEY ("User_ID") 
)
WITHOUT OIDS;


ALTER TABLE "Users" ADD CONSTRAINT "fk_Users_Authentication_Types_1" FOREIGN KEY ("Authentication_Type") REFERENCES "Authentication_Types" ("Type_ID");
ALTER TABLE "Location_Categories" ADD CONSTRAINT "fk_Location_Categories_Categories_1" FOREIGN KEY ("Catgory_ID") REFERENCES "Categories" ("ID");
ALTER TABLE "Location_Contacts" ADD CONSTRAINT "fk_Location_Contacts_Emergency_Contacts_1" FOREIGN KEY ("Contact_ID") REFERENCES "Emergency_Contacts" ("ID");
ALTER TABLE "Emergency_Contacts" ADD CONSTRAINT "fk_Emergency_Contacts_Users_1" FOREIGN KEY ("User_ID") REFERENCES "Users" ("ID");
ALTER TABLE "Locations" ADD CONSTRAINT "fk_Locations_Users_1" FOREIGN KEY ("User_ID") REFERENCES "Users" ("ID");
ALTER TABLE "Categories" ADD CONSTRAINT "fk_Default_Categories_Users_1" FOREIGN KEY ("User_ID") REFERENCES "Users" ("ID");
ALTER TABLE "Location_Contacts" ADD CONSTRAINT "fk_Location_Contacts_Users_1" FOREIGN KEY ("User_ID") REFERENCES "Users" ("ID");
ALTER TABLE "Location_Settings" ADD CONSTRAINT "fk_Location_Settings_Users_1" FOREIGN KEY ("User_ID") REFERENCES "Users" ("ID");
ALTER TABLE "Location_Settings" ADD CONSTRAINT "fk_Location_Settings_Locations_1" FOREIGN KEY ("Location_ID") REFERENCES "Locations" ("ID");
ALTER TABLE "Location_Contacts" ADD CONSTRAINT "fk_Location_Contacts_Locations_1" FOREIGN KEY ("Location_ID") REFERENCES "Locations" ("ID");
ALTER TABLE "Category_Contacts" ADD CONSTRAINT "fk_Category_Contacts_Emergency_Contacts_1" FOREIGN KEY ("Contact_ID") REFERENCES "Emergency_Contacts" ("ID");
ALTER TABLE "Category_Contacts" ADD CONSTRAINT "fk_Category_Contacts_Categories_1" FOREIGN KEY ("Category_ID") REFERENCES "Categories" ("ID");
ALTER TABLE "Category_Contacts" ADD CONSTRAINT "fk_Category_Contacts_Users_1" FOREIGN KEY ("User_ID") REFERENCES "Users" ("ID");
ALTER TABLE "Category_Settings" ADD CONSTRAINT "fk_Category_Settings_Users_1" FOREIGN KEY ("User_ID") REFERENCES "Users" ("ID");
ALTER TABLE "Category_Settings" ADD CONSTRAINT "fk_Category_Settings_Categories_1" FOREIGN KEY ("Category_ID") REFERENCES "Categories" ("ID");
ALTER TABLE "Location_Categories" ADD CONSTRAINT "fk_Location_Categories_Locations_1" FOREIGN KEY ("Location_ID") REFERENCES "Locations" ("ID");
ALTER TABLE "Internal_Authentication" ADD CONSTRAINT "fk_Internal_Authentication_Users_1" FOREIGN KEY ("User_ID") REFERENCES "Users" ("ID");

