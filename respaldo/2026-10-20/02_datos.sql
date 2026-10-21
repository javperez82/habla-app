-- Respaldo de datos de ha.bla al 20 de octubre de 2026.
-- Ejecutar después de 01_esquema.sql. Solo episodios tenía filas.
-- El trigger de actualizado_en se desactiva para conservar las fechas originales.

alter table public.episodios disable trigger trigger_actualizar_timestamp;

insert into public.episodios (id, titulo, categoria, duracion, audio_url, descripcion, tags, reflexion, caso_titulo, caso_historia, caso_preguntas, glosario, reto, estado, orden, creado_en, actualizado_en)
values (
  1,
  'Activa tu máximo potencial ahora',
  'crecimiento',
  '11:06 min',
  'https://rhbyyhciyiacjbmkqbnw.supabase.co/storage/v1/object/public/audio/0001.mp3',
  'Explora la importancia de la perseverancia, el esfuerzo sostenido y la mentalidad de crecimiento como pilares del éxito por encima del talento innato.',
  array['perseverancia','esfuerzo sostenido','mentalidad de crecimiento']::text[],
  'Piensa en algo que dejaste de intentar porque creíste que no eras suficientemente bueno para ello. ¿Qué pasaría si en lugar de verlo como una limitación, lo vieras como un punto de partida?',
  'El caso de Marcos',
  'Marcos tiene 34 años y lleva 6 en la misma empresa como analista. Siempre creyó que sus compañeros que ascendían más rápido simplemente eran más inteligentes o tenían más talento natural. Cuando su jefa le ofreció liderar un proyecto nuevo, su primera reacción fue declinar.

Sin embargo, su jefa insistió y Marcos aceptó con miedo. Durante el proyecto cometió errores, pidió ayuda varias veces y tuvo que rehacer trabajo en dos ocasiones. Al final, el proyecto fue exitoso y Marcos recibió reconocimiento público.

Lo que cambió en Marcos no fue su talento, sino su disposición a persistir frente a la incomodidad.',
  array['¿En qué momento Marcos demostró mentalidad de crecimiento en lugar de mentalidad fija?','¿Qué habrías hecho tú en su lugar cuando tu jefa te ofreció el proyecto?']::text[],
  '[{"termino": "Mentalidad de crecimiento", "definicion": "La creencia de que nuestras habilidades pueden desarrollarse con esfuerzo y dedicación."}, {"termino": "Grit (Perseverancia)", "definicion": "Combinación de pasión sostenida y perseverancia hacia metas a largo plazo."}, {"termino": "Mentalidad fija", "definicion": "La creencia de que la inteligencia es inamovible. Lleva a evitar desafíos por miedo a demostrar limitaciones."}, {"termino": "Todavía no", "definicion": "Reemplazar no puedo por todavía no puedo cambia el fracaso en una etapa del aprendizaje."}]'::jsonb,
  'En la próxima situación donde sientas que no puedes hacer algo, di en voz alta: Todavía no puedo, pero puedo aprender.',
  'publicado',
  1,
  '2026-04-13T19:22:09.379346+00:00',
  '2026-05-13T01:51:54.509198+00:00'
);

alter table public.episodios enable trigger trigger_actualizar_timestamp;

select setval('public.episodios_id_seq', (select max(id) from public.episodios));

-- personajes, progreso, historial y capas_vistas estaban vacías.
-- El audio 0001.mp3 (5.3 MB) se sube a mano al bucket "audio"; ver LEEME.md.
