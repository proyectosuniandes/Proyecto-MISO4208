DROP TABLE IF EXISTS resultado;
DROP TABLE IF EXISTS estrategia_prueba;
DROP TABLE IF EXISTS ejecucion;
DROP TABLE IF EXISTS estrategia;
DROP TABLE IF EXISTS script;
DROP TABLE IF EXISTS parametro;
DROP TABLE IF EXISTS prueba;
DROP TABLE IF EXISTS version;
DROP TABLE IF EXISTS app;
DROP TYPE IF EXISTS estado_ejecucion;
DROP TYPE IF EXISTS modo_prueba;
DROP TYPE IF EXISTS tipo_prueba;
DROP TYPE IF EXISTS tipo_app;

CREATE TYPE tipo_app AS ENUM ('movil', 'web');
CREATE TYPE tipo_prueba AS ENUM ('E2E', 'random','BDT','VRT');
CREATE TYPE modo_prueba AS ENUM ('headless','headful');
CREATE TYPE estado_ejecucion AS ENUM ('registrado','ejecutado','pendiente');

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
  CONSTRAINT id_version_fkey FOREIGN KEY (id_version, id_app)
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
  id_estrategia SERIAL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS ejecucion(
  id_ejecucion SERIAL PRIMARY KEY,
  estado estado_ejecucion
);

CREATE TABLE IF NOT EXISTS estrategia_prueba(
  id_estrategia INTEGER NOT NULL,
  id_prueba INTEGER NOT NULL,
  id_ejecucion INTEGER NOT NULL,
  PRIMARY KEY (id_estrategia,id_prueba),
  CONSTRAINT id_estrategia_fkey FOREIGN KEY (id_estrategia)
    REFERENCES estrategia (id_estrategia) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT id_prueba_fkey FOREIGN KEY (id_prueba)
    REFERENCES prueba (id_prueba) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT id_ejecucion_fkey FOREIGN KEY (id_ejecucion)
    REFERENCES ejecucion (id_ejecucion) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS RESULTADO(
  id_resultado SERIAL PRIMARY KEY,
  id_ejecucion INTEGER NOT NULL,
  ruta_archivo TEXT NOT NULL,
  CONSTRAINT id_ejecucion_fkey FOREIGN KEY (id_ejecucion)
    REFERENCES ejecucion (id_ejecucion) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);