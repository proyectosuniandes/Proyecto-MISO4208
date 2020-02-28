DROP TABLE HISTORICO_PRUEBA;
DROP TABLE PRUEBA;
DROP TABLE VERSION;
DROP TABLE APP;
DROP TABLE TIPO_APP;
DROP TABLE TIPO_PRUEBA;
DROP TABLE ESTADO_PRUEBA;
DROP TABLE SCRIPT;
CREATE TABLE IF NOT EXISTS SCRIPT (
  id_script SERIAL PRIMARY KEY,
  descripcion TEXT,
  contenido TEXT
);

CREATE TABLE IF NOT EXISTS ESTADO_PRUEBA (
  id_estado SERIAL PRIMARY KEY,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS TIPO_PRUEBA(
  id_tipo SERIAL PRIMARY KEY,
  descripcion TEXT,
  parametros TEXT,
  script INTEGER NOT NULL,
  CONSTRAINT script_fkey FOREIGN KEY (script)
  REFERENCES SCRIPT (id_script) MATCH SIMPLE
  ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS TIPO_APP(
  id_tipo_app SERIAL PRIMARY KEY,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS APP(
  id_app SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo_app INTEGER NOT NULL,
  CONSTRAINT tipoApp_fkey FOREIGN KEY (tipo_app)
    REFERENCES TIPO_APP (id_tipo_app) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS VERSION(
  id_version SERIAL PRIMARY KEY,
  descripcion TEXT,
  ruta_app TEXT,
  app INTEGER NOT NULL,
  CONSTRAINT app_fkey FOREIGN KEY (app)
    REFERENCES APP (id_app) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS PRUEBA(
  id_prueba SERIAL PRIMARY KEY,
  tipo INTEGER NOT NULL,
  app INTEGER NOT NULL,
  CONSTRAINT tipo_fkey FOREIGN KEY (tipo)
    REFERENCES TIPO_PRUEBA (id_tipo) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT app_fkey1 FOREIGN KEY (app)
    REFERENCES APP (id_app) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS HISTORICO_PRUEBA(
  id_his SERIAL PRIMARY KEY,
  prueba INTEGER NOT NULL,
  estado INTEGER NOT NULL,
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  CONSTRAINT prueba_fkey FOREIGN KEY (prueba)
    REFERENCES PRUEBA (id_prueba) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT estado_fkey FOREIGN KEY (estado)
    REFERENCES ESTADO_PRUEBA (id_estado) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);
