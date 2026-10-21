# Respaldo de ha.bla: 20 de octubre de 2026

Estado de la base de datos de ha.bla en Supabase (proyecto `habla`, id `rhbyyhciyiacjbmkqbnw`) **antes** de los cambios de la encuesta doctoral y de la corrección de seguridad. Sirve para restaurar el proyecto o reutilizarlo en uno nuevo.

## Contenido

| Archivo | Qué es |
|---|---|
| `01_esquema.sql` | Las cinco tablas (`episodios`, `personajes`, `progreso`, `historial`, `capas_vistas`), sus restricciones, índices, funciones, triggers, políticas de seguridad y el bucket `audio`. |
| `02_datos.sql` | Los datos. Solo `episodios` tenía una fila: "Activa tu máximo potencial ahora". Conserva sus fechas originales. |
| `03_datos.json` | Los mismos datos en JSON, más el inventario del almacenamiento. |
| `encuesta/encuesta_supabase.sql` | Tablas de la encuesta a gerentes y directivos (todavía no creadas en el proyecto al hacer este respaldo). |
| `encuesta/crear_encuesta_habilidades.gs` | Script que crea la encuesta en Google Forms. |
| `encuesta/vista_previa_encuesta.html` | Vista previa navegable de la encuesta. |

## Cómo restaurar

1. En un proyecto de Supabase **nuevo**, abrir **SQL Editor**.
2. Ejecutar `01_esquema.sql` y después `02_datos.sql`.
3. Opcional: ejecutar `encuesta/encuesta_supabase.sql`.
4. Subir el audio `0001.mp3` al bucket `audio` (ver la sección siguiente).
5. Actualizar en la app la URL del proyecto y la llave pública nuevas.

No ejecutar `01_esquema.sql` sobre el proyecto actual: las tablas ya existen y el script se detendría.

Se probó restaurando en un PostgreSQL 16 vacío: se crean las 7 tablas (5 de ha.bla y 2 de la encuesta), las 9 políticas y los 2 triggers; el episodio conserva sus fechas y el siguiente id es 2.

## Lo que no incluye

- **El archivo de audio.** `0001.mp3` (5.3 MB, subido el 13 de mayo de 2026) no se pudo descargar desde este entorno. Bájalo desde Supabase en **Storage → audio → 0001.mp3 → Download** y guárdalo junto a este respaldo.
- **Usuarios.** Había 1 usuario en `auth.users`; las cuentas no se respaldan por seguridad.
- **El código de la app** (repositorio `javperez82/habla-app`). Se agrega cuando el repositorio esté conectado.

## Problemas conocidos en este estado

1. **Grave:** la política `Escritura anon` de `episodios` permite a cualquiera con la llave pública crear, editar y borrar episodios. Se respaldó tal cual para poder restaurar el comportamiento exacto, pero no debe reutilizarse en un proyecto nuevo.
2. `actualizar_timestamp` y `set_updated_at` no fijan `search_path` (advertencia de seguridad de Supabase).
3. La protección de contraseñas filtradas está desactivada en Authentication.

## Cambios posteriores al respaldo

- **20 de octubre de 2026:** se crearon en el proyecto las tablas `encuesta_respuestas` y `encuesta_contactos`, con seguridad por filas y una sola política de inserción. A diferencia de `encuesta/encuesta_supabase.sql`, la migración aplicada no incluyó el `revoke` de permisos de tabla; ese paso queda pendiente.
