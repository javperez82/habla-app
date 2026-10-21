-- =====================================================================
-- Encuesta a gerentes y directivos: habilidades blandas del personal operativo
-- Tablas para ha.bla (Supabase). Ejecutar una sola vez en el SQL Editor.
--
-- Diseño de privacidad:
--   * encuesta_respuestas guarda las respuestas, sin datos de contacto.
--   * encuesta_contactos guarda teléfono y correo, SIN liga a las respuestas.
--     Solo guarda la fecha (no la hora) para que no se puedan emparejar
--     ambas tablas por el momento del envío.
--   * El público (anon) solo puede INSERTAR; nadie puede leer con la llave pública.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Respuestas
-- ---------------------------------------------------------------------
create table if not exists public.encuesta_respuestas (
  id              uuid primary key default gen_random_uuid(),
  creado          timestamptz not null default now(),
  version         text not null default 'v1',     -- versión del instrumento
  variante        text not null default 'A'
                    check (variante in ('A', 'B')), -- orden de habilidades (B = inverso)

  -- Perfil
  sector          text not null check (char_length(sector) <= 80),
  tamano          text not null check (char_length(tamano) <= 40),
  cargo           text not null check (char_length(cargo) <= 120),
  personas_cargo  text not null check (char_length(personas_cargo) <= 40),
  antiguedad      text not null check (char_length(antiguedad) <= 40),
  ciudad          text not null check (char_length(ciudad) <= 120),

  -- Puesto de referencia
  puesto          text not null check (char_length(puesto) <= 120),

  -- Calificaciones: objeto con 13 claves, una por habilidad, por ejemplo
  -- {"orientacion_cliente": {"f": 5, "c": 4, "n": 3}, ...}
  -- n = null cuando la persona eligió "No lo observo directamente".
  habilidades     jsonb not null
                    check (jsonb_typeof(habilidades) = 'object'),

  -- Las cinco más críticas (claves de habilidad)
  top5            text[] not null
                    check (cardinality(top5) = 5),

  -- Cierre
  caso            text check (caso is null or char_length(caso) <= 3000),
  momento         text not null check (char_length(momento) <= 120),
  via             text not null check (char_length(via) <= 120),
  acepta_llamada  boolean not null
);

comment on table public.encuesta_respuestas is
  'Respuestas anónimas de la encuesta a gerentes y directivos. Sin datos de contacto.';

-- ---------------------------------------------------------------------
-- 2. Contactos (separados de las respuestas)
-- ---------------------------------------------------------------------
create table if not exists public.encuesta_contactos (
  id                 uuid primary key default gen_random_uuid(),
  fecha              date not null default current_date,  -- solo fecha, sin hora
  telefono           text check (telefono is null
                       or telefono ~ '^[+() -]*([0-9][+() -]*){10,15}$'),
  correo             text check (correo is null
                       or (char_length(correo) <= 200 and correo ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  quiere_llamada     boolean not null default false,
  quiere_resultados  boolean not null default false,
  check (telefono is not null or correo is not null),
  check (not quiere_llamada or telefono is not null)
);

comment on table public.encuesta_contactos is
  'Datos de contacto voluntarios. No se ligan con encuesta_respuestas.';

-- ---------------------------------------------------------------------
-- 3. Seguridad: el público solo inserta
-- ---------------------------------------------------------------------
alter table public.encuesta_respuestas enable row level security;
alter table public.encuesta_contactos  enable row level security;

revoke all on public.encuesta_respuestas from anon, authenticated;
revoke all on public.encuesta_contactos  from anon, authenticated;
grant insert on public.encuesta_respuestas to anon, authenticated;
grant insert on public.encuesta_contactos  to anon, authenticated;

drop policy if exists "encuesta: insertar respuestas" on public.encuesta_respuestas;
create policy "encuesta: insertar respuestas"
  on public.encuesta_respuestas for insert
  to anon, authenticated
  with check (true);

drop policy if exists "encuesta: insertar contactos" on public.encuesta_contactos;
create policy "encuesta: insertar contactos"
  on public.encuesta_contactos for insert
  to anon, authenticated
  with check (true);

-- No se crean políticas de SELECT, UPDATE ni DELETE: con la llave pública
-- nadie puede leer ni modificar. La lectura para el panel de administración
-- se agrega después, según cómo se autentica hoy el admin de ha.bla.
