-- =====================================================================
-- Respaldo de ha.bla (Supabase, proyecto rhbyyhciyiacjbmkqbnw)
-- Estado al 20 de octubre de 2026, ANTES de cualquier cambio de esta etapa.
-- Esquema public: tablas, restricciones, índices, funciones, triggers,
-- seguridad (RLS, políticas y permisos) y bucket de almacenamiento.
--
-- Uso: en un proyecto de Supabase NUEVO, ejecutar este archivo y luego
-- 02_datos.sql en el SQL Editor. No ejecutarlo sobre el proyecto actual.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Funciones ----------
create or replace function public.actualizar_timestamp()
 returns trigger language plpgsql as $function$
begin
  new.actualizado_en = now();
  return new;
end;
$function$;

create or replace function public.set_updated_at()
 returns trigger language plpgsql as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- ---------- episodios ----------
create table public.episodios (
  id              serial primary key,
  titulo          text not null,
  categoria       text not null,
  duracion        text,
  audio_url       text,
  descripcion     text,
  tags            text[],
  reflexion       text,
  caso_titulo     text,
  caso_historia   text,
  caso_preguntas  text[],
  glosario        jsonb,
  reto            text,
  estado          text not null default 'borrador',
  orden           integer default 0,
  creado_en       timestamptz default now(),
  actualizado_en  timestamptz default now(),
  constraint episodios_categoria_check check (categoria = any (array['crecimiento','motivacion','liderazgo','equipo','seguridad','practicas','ambiental'])),
  constraint episodios_estado_check check (estado = any (array['borrador','publicado']))
);
create trigger trigger_actualizar_timestamp before update on public.episodios
  for each row execute function public.actualizar_timestamp();

-- ---------- personajes ----------
create table public.personajes (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  slug          text not null unique,
  rol           text not null,
  bio           text,
  foto_url      text,
  libros        text[] default '{}'::text[],
  episodios_ids text[] default '{}'::text[],
  linkedin      text,
  twitter       text,
  website       text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
comment on table public.personajes is 'Perfiles de personajes/expertos del podcast ha.bla';
comment on column public.personajes.slug is 'Ruta del mini sitio: /profiles/[slug].html';
comment on column public.personajes.foto_url is 'URL pública de la foto en Supabase Storage: images/profiles/';
comment on column public.personajes.libros is 'Array de títulos de libros clave recomendados';
comment on column public.personajes.episodios_ids is 'Array de IDs de episodios donde aparece este personaje';
create index idx_personajes_slug on public.personajes using btree (slug);
create index idx_personajes_nombre on public.personajes using btree (nombre);
create trigger personajes_updated_at before update on public.personajes
  for each row execute function public.set_updated_at();

-- ---------- progreso ----------
create table public.progreso (
  id             serial primary key,
  user_id        uuid references auth.users(id) on delete cascade,
  episodio_id    integer references public.episodios(id) on delete cascade,
  posicion       double precision default 0,
  completado     boolean default false,
  actualizado_en timestamptz default now(),
  unique (user_id, episodio_id)
);

-- ---------- historial ----------
create table public.historial (
  id           serial primary key,
  user_id      uuid references auth.users(id) on delete cascade,
  episodio_id  integer references public.episodios(id) on delete cascade,
  escuchado_en timestamptz default now()
);

-- ---------- capas_vistas ----------
create table public.capas_vistas (
  id          serial primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  episodio_id integer references public.episodios(id) on delete cascade,
  capa        text check (capa = any (array['reflexion','caso','glosario','reto'])),
  visto_en    timestamptz default now(),
  unique (user_id, episodio_id, capa)
);

-- ---------- Seguridad tal como estaba ----------
-- AVISO: la política "Escritura anon" de episodios permite a cualquiera con la
-- llave pública crear, editar y borrar episodios. Se respalda tal cual para
-- poder restaurar el comportamiento exacto; ver LEEME.md antes de reutilizarla.
alter table public.episodios    enable row level security;
alter table public.personajes   enable row level security;
alter table public.progreso     enable row level security;
alter table public.historial    enable row level security;
alter table public.capas_vistas enable row level security;

create policy "Escritura anon" on public.episodios
  for all to anon using (true) with check (true);
create policy "Lectura pública total" on public.episodios
  for select to anon using (true);

create policy "personajes_auth_write" on public.personajes
  for all to public using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "personajes_public_read" on public.personajes
  for select to public using (true);

create policy "Usuario ve su progreso" on public.progreso
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Usuario ve su historial" on public.historial
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Usuario ve sus capas" on public.capas_vistas
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Permisos de tabla: los predeterminados de Supabase (todos para anon y
-- authenticated en las cinco tablas); no requieren instrucciones adicionales.

-- ---------- Almacenamiento ----------
-- Bucket público "audio": máximo 50 MB, tipos audio/mp4, audio/mpeg, audio/x-m4a.
-- No había políticas en storage.objects (las subidas se hacen desde el panel).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio', 'audio', true, 52428800, array['audio/mp4','audio/mpeg','audio/x-m4a'])
on conflict (id) do nothing;
