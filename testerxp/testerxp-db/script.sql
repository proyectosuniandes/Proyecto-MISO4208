DROP TABLE IF EXISTS resultado;
DROP TABLE IF EXISTS ejecucion;
DROP TABLE IF EXISTS estrategia_prueba;
DROP TABLE IF EXISTS navegadores;
DROP TABLE IF EXISTS dispositivos;
DROP TABLE IF EXISTS estrategia;
DROP TABLE IF EXISTS script;
DROP TABLE IF EXISTS parametro;
DROP TABLE IF EXISTS prueba;
DROP TABLE IF EXISTS version;
DROP TABLE IF EXISTS app;
DROP TYPE IF EXISTS navegador;
DROP TYPE IF EXISTS dispositivo;
DROP TYPE IF EXISTS estado_ejecucion;
DROP TYPE IF EXISTS modo_prueba;
DROP TYPE IF EXISTS tipo_prueba;
DROP TYPE IF EXISTS tipo_app;

CREATE TYPE tipo_app AS ENUM ('movil', 'web');
CREATE TYPE tipo_prueba AS ENUM ('E2E', 'random','BDT');
CREATE TYPE modo_prueba AS ENUM ('headless','headful');
CREATE TYPE estado_ejecucion AS ENUM ('registrado','ejecutado','pendiente', 'cancelado');
CREATE TYPE dispositivo AS ENUM ('b1e51193-4db8-43f7-b7cd-ae35eebb6bca','5e4c60b3-327b-4fb4-98e2-4f996900e145','42b60b69-bd60-4c3d-912c-4073d854573d','31f96174-9148-4bd3-84dd-0819681936bf','b4f164b3-277e-4efe-9fcd-38f6d847ddd7','e38a1ec9-5fbf-481c-9103-d1782ea9f1d7','3ca42f69-ff08-42b3-8d78-2ccb617e55f2','2f71872c-8bbc-4260-a284-7c6f50ede169','47f68b9a-08cb-4b55-b0a7-a6664d118829','de20111c-332a-4cb4-8088-d4a7f8f961ec','c1fb5618-68de-47c6-9659-e28a30de156c','1df05208-b43d-4ac4-a0af-1b60d7efd763','15edb3ca-3bf4-4778-a85c-c04a7d005715','4a7cf261-fa75-4a18-a564-718ebefba390','3302ec22-38d0-4ccb-9f6d-6bea2e1ede13','ca245ccd-6920-4b3b-a354-2592887a7bb4','f6db2e31-feee-4262-ae4b-dd3749eece87','f1a8a52b-5b1c-4d24-806f-3fbe838eb32d','d39db595-6ae3-4ae9-bddc-fcaf85cf1d83','9c667b7a-1a43-4d4f-8b5b-2dc8c7888d21','b7347f03-2a75-45a1-a8a1-42324198125e','57110e09-24f5-4e32-b4ea-a549e95970bf','8e33f3db-68d9-4700-95dd-850e23d634ed','4f50f627-a4c8-4368-bc5c-91467a9ceb24','7fad4b10-140c-4227-84d0-22dd88c8f8b1','84f0cceb-c1a2-4380-a1a7-1e4ae3f74a4b','3752d651-4657-4284-b620-978472e7d8ac','cde39d84-1698-47f8-8edb-b0c1dda09bcb','c6e1222c-993e-4bf2-840f-4795792f2143','55fddf0b-0e56-4742-8791-106ad93c01ff','e70d130c-955c-4f25-a451-0ed2e57a24ac','a9af19b8-8df9-41a8-81ac-a6294648ecc1','89be4b14-a11a-471c-a3a5-2a9237a80007','8616f424-caac-4dc9-864d-d1381b1b6360','8bdeb4ca-7114-4920-903d-b33085b38eaa','865d12b1-d839-49a7-90cf-175cab4ba51f','76e0cd80-7904-4d41-a812-47f9598ded23','8b8e7929-cb0e-4aac-b367-aa91ce5b506d','f028a901-70e3-4d31-8aca-3993d2dbcde3','97027cf3-9498-4bf1-8414-88a6b3d4b83c','9fc4abf6-4a22-443d-b045-d3ef2bd96974','c660c8c2-df75-44ac-9a81-e08f468f1c10','da95cf5c-7652-46ce-a946-906d93fc2eca','46028057-70cd-49f5-9c91-d7413b4e4400','1f173992-993a-4241-9db8-f68685c7f404','445e774c-a9e9-49bd-84b9-673c4e9f7163','35d91457-dbfe-47ac-98fc-3271440753c4','082aa083-451d-4d4d-a680-b784d2012b94','a2a0c86c-7572-45fe-98d0-66f8efed9fa0','23cf0c50-e80b-4fc8-ab9c-fa767b806ee9','bb0a0ca4-ddd8-449f-9f16-093f7351b9cf','43ea364a-efb0-41c2-99b9-b3f269fea1cc','a0a9c90a-b391-42f4-b77b-ae0561d74bbe','9f1adea8-e280-460d-9319-580570f61e8c','f5ba679d-bc43-4b33-b046-4923835851b1','b747b286-4729-46ef-9bfa-f05942b15588','8f373fa1-97fa-4652-84c8-a006459d50a0','5f6d4c94-d926-42cc-8019-f902295fc36d','45f37afb-0a08-4775-8358-09d7ccc15adb','c41a277f-39a1-402c-bf92-34d86732f89d','5fdbb58a-b612-4cdd-939b-15e9982b69c9','4b13441b-dacc-4803-b2e3-cb2d8d23def2','80a67ae9-430c-4824-a386-befbb19518b9','00cd578a-14de-4f47-b4f1-d454d613d9da','bccf86e5-7280-47bf-a502-6f64eba116f7','de849ff1-e051-4844-a92f-51b0181a6586','bb06e95f-b326-4510-a8e5-22c0f9ed9e83','48007128-c74d-461a-892a-f88aa3c1a694','6185bb7c-1f96-40bb-9f6c-798bd7547d36','d777f454-c238-4a59-a587-6b88efcd5986','2b104999-1937-401e-b9b8-7a9a857d5088','dd55a4aa-aefd-4594-b299-8d09a1392502','bf1a9765-c743-4cdc-95ec-c40a74493055','a59951f2-ed13-40f9-80b9-3ddceb3c89f5','180ddae8-436c-4ae3-a274-91144b7e4bb4','74ad0f8b-90f5-47c5-bc7a-9c05b04de4ca','c52fdfc2-6914-4266-aa6e-50258f50ef91','cbd25b62-a120-4ea2-9528-36f575478775','3e1aa8be-b625-4622-8705-c5a0c69fa687','06867de4-4b99-4842-ba40-fd3daaabdf23','e7a4ecd9-6044-41c7-ace3-ccee5402b590','b9cf7b2c-4d11-4777-97c7-29d3b5c68d59','b0a2e032-2117-4066-9d74-3904eceef4a8','8c59e59e-283f-4dcb-bf55-6523b30b59f9','df785e5b-b1bf-470b-af5d-0c28a3d98a26','63cd126c-406e-4886-ac5d-8a7d6ca6486c','107d757e-463a-4a18-8667-b8dec6e4c87e','e6a305b5-ca40-4587-9aa8-623eb535b2f2','dfbdd1bc-cce2-4f27-b8be-535b93ff9ee7','143eb44a-1d3a-4f27-bcac-3c40124e2836','e5008049-8394-40fc-b7f8-87fa9f1c305f','fb936099-d261-4dd3-8dec-3fc14f1d0f03','bd402826-4ee6-4598-94df-da4f89021042','95c48908-744b-4768-a6c0-4fca8e27d166','a2631466-c3e1-4fea-b625-80ee31f384ee','b5fb8027-05a1-4ade-937b-38b04696104e','a3f26fce-0632-4df4-88aa-cbddbc739e1e','c6c6a0f3-0b13-4411-b30b-4827fb699500','f34de94f-1e85-4d61-9b0d-c47968bc156c','e20da1a3-313c-434a-9d43-7268b12fee08','d8b10016-c02a-41f9-8a91-ce9b44197d21');
CREATE TYPE navegador AS ENUM ('chrome','electron');

CREATE TABLE IF NOT EXISTS app(
  id_app SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo_app tipo_app NOT NULL
);

CREATE TABLE IF NOT EXISTS version(
  id_version SERIAL NOT NULL,
  id_app INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  ruta_app TEXT NOT NULL,
  PRIMARY KEY (id_version,id_app),
  CONSTRAINT id_app_fkey FOREIGN KEY (id_app)
    REFERENCES app (id_app) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS prueba(
  id_prueba SERIAL PRIMARY KEY,
  id_version INTEGER NOT NULL,
  id_app INTEGER NOT NULL,
  tipo_prueba tipo_prueba NOT NULL,
  modo_prueba modo_prueba NOT NULL,
  vrt BOOLEAN NOT NULL,
  ref_app INTEGER,
  ref_version INTEGER,

  CONSTRAINT id_version_fkey FOREIGN KEY (id_version, id_app)
    REFERENCES version (id_version, id_app) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT id_referencia_fkey FOREIGN KEY (ref_version, ref_app)
    REFERENCES version (id_version, id_app) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS parametro(
  id_parametro SERIAL PRIMARY KEY,
  id_prueba INTEGER NOT NULL,
  param TEXT NOT NULL,
  CONSTRAINT id_prueba_fkey FOREIGN KEY (id_prueba)
    REFERENCES prueba (id_prueba) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS script (
  id_script SERIAL PRIMARY KEY,
  id_prueba INTEGER NOT NULL,
  ruta_script TEXT NOT NULL,
  CONSTRAINT id_prueba_fkey FOREIGN KEY (id_prueba)
    REFERENCES prueba (id_prueba) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS estrategia(
  id_estrategia SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  estado estado_ejecucion NOT NULL,
  ruta_consolidado TEXT

);

CREATE TABLE IF NOT EXISTS dispositivos(
  id_dispositivo SERIAL PRIMARY KEY,
  id_estrategia INTEGER NOT NULL,
  dispositivo dispositivo NOT NULL,
  CONSTRAINT id_estrategia_fkey FOREIGN KEY(id_estrategia)
    REFERENCES estrategia (id_estrategia) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS navegadores(
  id_navegador SERIAL PRIMARY KEY,
  id_estrategia INTEGER NOT NULL,
  navegador navegador NOT NULL,
  version TEXT NOT NULL,
  CONSTRAINT id_estrategia_fkey FOREIGN KEY(id_estrategia)
    REFERENCES estrategia (id_estrategia) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS estrategia_prueba(
  id_estrategia INTEGER NOT NULL,
  id_prueba INTEGER NOT NULL,
  PRIMARY KEY (id_estrategia,id_prueba),
  CONSTRAINT id_estrategia_fkey FOREIGN KEY (id_estrategia)
    REFERENCES estrategia (id_estrategia) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT id_prueba_fkey FOREIGN KEY (id_prueba)
    REFERENCES prueba (id_prueba) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS ejecucion(
  id_ejecucion SERIAL PRIMARY KEY,
  id_estrategia INTEGER NOT NULL,
  id_prueba INTEGER NOT NULL,
  estado estado_ejecucion NOT NULL,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP,
  CONSTRAINT id_estrategia_prueba_fkey FOREIGN KEY (id_estrategia,id_prueba)
    REFERENCES estrategia_prueba (id_estrategia,id_prueba) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS RESULTADO(
  id_resultado SERIAL PRIMARY KEY,
  id_ejecucion INTEGER NOT NULL,
  ruta_archivo TEXT NOT NULL,
  fecha TIMESTAMP NOT NULL,
  CONSTRAINT id_ejecucion_fkey FOREIGN KEY (id_ejecucion)
    REFERENCES ejecucion (id_ejecucion) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);
