/**
 * Encuesta a gerentes y directivos: valía de las habilidades blandas
 * Crea el formulario completo en Google Forms.
 *
 * Uso:
 *   1. Abre https://script.google.com y crea un proyecto nuevo.
 *   2. Borra el contenido del editor y pega este archivo completo.
 *   3. Ejecuta la función crearEncuesta y autoriza el permiso que pide.
 *   4. Abre el registro de ejecución: ahí aparece el enlace para editar el formulario.
 *
 * El formulario queda como borrador para que lo revises antes de publicarlo.
 */

// Cambia a true y vuelve a ejecutar para generar una versión B con las
// habilidades en orden inverso (Google Forms no permite orden aleatorio por sección).
var ORDEN_INVERSO = false;

// Habilidades por página en el bloque de calificación.
var HABILIDADES_POR_PAGINA = 4;

var TITULO = 'Habilidades blandas en el personal operativo';

var PRESENTACION =
  'Esta encuesta forma parte de una investigación del Doctorado en Educación y Liderazgo de ' +
  'Instituciones de la Universidad Corporativa del Sureste. Busca identificar qué habilidades ' +
  'blandas necesitan más las empresas en su personal operativo.\n\n' +
  'Contestarla toma menos de 10 minutos. Su participación es voluntaria y anónima: no se piden ' +
  'nombres de personas ni de la empresa, y puede abandonarla en cualquier momento. ' +
  'La información se usará solo con fines académicos y se reportará de forma agregada.\n\n' +
  'Responsable: Javier Alejandro Pérez Ramón.';

// Orden mezclado a propósito: no sigue el nivel de la ruta.
var HABILIDADES = [
  { nombre: 'Trabajo en equipo y colaboración',
    definicion: 'Apoya a sus compañeros cuando lo necesitan y cumple su parte para que el equipo logre la meta.' },
  { nombre: 'Solución de problemas y toma de decisiones',
    definicion: 'Identifica la causa de un problema y decide qué hacer dentro de lo que le corresponde, sin esperar a que otro lo resuelva.' },
  { nombre: 'Orientación al cliente',
    definicion: 'Atiende al cliente con cortesía y resuelve su necesidad o lo canaliza con quien puede resolverla.' },
  { nombre: 'Creatividad',
    definicion: 'Propone formas nuevas o más sencillas de hacer su trabajo.' },
  { nombre: 'Autorregulación emocional y manejo del estrés',
    definicion: 'Mantiene la calma y el trato respetuoso bajo presión o ante una persona molesta.' },
  { nombre: 'Comunicación clara y escucha',
    definicion: 'Explica lo que necesita con claridad y confirma que entendió lo que le dijeron antes de actuar.' },
  { nombre: 'Liderazgo e influencia',
    definicion: 'Orienta a sus compañeros, da el ejemplo y logra que otros lo sigan.' },
  { nombre: 'Adaptabilidad al cambio',
    definicion: 'Acepta cambios de tarea, horario o procedimiento y se ajusta sin bajar su desempeño.' },
  { nombre: 'Aprendizaje continuo',
    definicion: 'Pregunta, pide retroalimentación y aplica en su trabajo lo que aprende.' },
  { nombre: 'Profesionalismo, responsabilidad y ética de trabajo',
    definicion: 'Llega a tiempo, cumple lo que promete, respeta las reglas y reconoce sus errores.' },
  { nombre: 'Negociación y manejo de conflictos',
    definicion: 'Resuelve desacuerdos con compañeros o clientes buscando un acuerdo, sin agredir ni evadir.' },
  { nombre: 'Resiliencia y tolerancia a la frustración',
    definicion: 'Se repone de un error o de un mal día y vuelve a intentarlo.' },
  { nombre: 'Iniciativa',
    definicion: 'Hace lo que se necesita sin que se lo pidan y propone mejoras.' }
];

var ESCALA_FRECUENCIA = [
  '1. Casi nunca',
  '2. Alguna vez al mes',
  '3. Cada semana',
  '4. Varias veces por semana',
  '5. En cada jornada'
];

var ESCALA_CONSECUENCIA = [
  '1. No se nota',
  '2. Molestia menor entre compañeros',
  '3. Retrabajo o quejas',
  '4. Se afecta el resultado del área o hay un conflicto serio',
  '5. Se pierde al cliente o hay que separar al trabajador'
];

var ESCALA_NIVEL = [
  '1. Casi nadie la muestra',
  '2. Pocos la muestran',
  '3. La mitad la muestra',
  '4. La mayoría la muestra',
  '5. Casi todos la muestran de forma constante',
  'No lo observo directamente'
];

function crearEncuesta() {
  var habilidades = ORDEN_INVERSO ? HABILIDADES.slice().reverse() : HABILIDADES.slice();
  var form = FormApp.create(TITULO + (ORDEN_INVERSO ? ' (versión B)' : ''));

  form.setTitle(TITULO);
  form.setDescription(PRESENTACION);
  form.setCollectEmail(false);
  form.setProgressBar(true);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setConfirmationMessage(
    'Gracias por su tiempo. Sus respuestas quedaron registradas de forma anónima.');

  // ---------- Bloque 1: consentimiento ----------
  var consentimiento = form.addMultipleChoiceItem();
  consentimiento
    .setTitle('¿Acepta participar en esta encuesta?')
    .setHelpText('Al aceptar confirma que leyó la presentación y que participa de forma voluntaria.')
    .setChoices([
      consentimiento.createChoice('Sí, acepto participar', FormApp.PageNavigationType.CONTINUE),
      consentimiento.createChoice('No acepto', FormApp.PageNavigationType.SUBMIT)
    ])
    .setRequired(true);

  // ---------- Bloque 2: perfil ----------
  form.addPageBreakItem()
    .setTitle('Sobre usted y su empresa')
    .setHelpText('Cinco preguntas para clasificar las respuestas. Ninguna lo identifica.');

  form.addListItem()
    .setTitle('¿A qué sector pertenece su empresa?')
    .setChoiceValues([
      'Comercio al por menor (retail)',
      'Comercio al por mayor',
      'Manufactura',
      'Construcción',
      'Restaurantes, hoteles y turismo',
      'Transporte y logística',
      'Salud',
      'Educación',
      'Servicios financieros',
      'Tecnología',
      'Gobierno',
      'Otro'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('¿Cuántas personas trabajan en su empresa?')
    .setChoiceValues(['1 a 10', '11 a 50', '51 a 250', 'Más de 250'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('¿Cuál es su cargo?')
    .setChoiceValues([
      'Alta dirección (dueño, director general o equivalente)',
      'Gerencia',
      'Jefatura o supervisión',
      'Recursos humanos o capacitación'
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('¿Cuántas personas tiene a su cargo?')
    .setChoiceValues(['Ninguna', '1 a 5', '6 a 20', '21 a 50', 'Más de 50'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('¿Cuánto tiempo lleva en su cargo actual?')
    .setChoiceValues(['Menos de 1 año', '1 a 3 años', '4 a 10 años', 'Más de 10 años'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('¿En qué ciudad y estado trabaja?')
    .setRequired(true);

  // ---------- Bloque 3: puesto de referencia ----------
  form.addPageBreakItem()
    .setTitle('Puesto de referencia')
    .setHelpText(
      'Piense en el puesto operativo que mejor conoce dentro de su empresa. ' +
      'Todas las preguntas siguientes se refieren al personal que ocupa ese puesto.');

  form.addMultipleChoiceItem()
    .setTitle('¿Sobre qué puesto operativo va a contestar?')
    .setChoiceValues([
      'Atención al cliente o cajas',
      'Ventas o piso de venta',
      'Almacén, reparto o logística',
      'Producción u operación',
      'Administrativo o de oficina'
    ])
    .showOtherOption(true)
    .setRequired(true);

  // ---------- Bloque 4: calificación de las 13 habilidades ----------
  // Reparte las habilidades de forma pareja entre páginas (13 queda en 4, 3, 3 y 3).
  var totalPaginas = Math.ceil(habilidades.length / HABILIDADES_POR_PAGINA);
  var base = Math.floor(habilidades.length / totalPaginas);
  var sobrantes = habilidades.length % totalPaginas;
  var inicios = {};
  for (var p = 0, inicio = 0; p < totalPaginas; p++) {
    inicios[inicio] = p + 1;
    inicio += base + (p < sobrantes ? 1 : 0);
  }
  for (var i = 0; i < habilidades.length; i++) {
    if (inicios[i]) {
      var pagina = inicios[i];
      form.addPageBreakItem()
        .setTitle('Habilidades (' + pagina + ' de ' + totalPaginas + ')')
        .setHelpText(
          'Para cada habilidad hay tres preguntas: con qué frecuencia la exige el puesto, ' +
          'qué pasa si falta y cómo la observa hoy en su personal. ' +
          'Lea la descripción de cada habilidad antes de contestar.');
    }
    agregarHabilidad_(form, habilidades[i]);
  }

  // ---------- Bloque 5: las cinco más críticas ----------
  form.addPageBreakItem()
    .setTitle('Las cinco más críticas')
    .setHelpText('Si solo pudiera asegurar cinco habilidades en el personal de ese puesto, ¿cuáles serían?');

  var nombres = habilidades.map(function (h) { return h.nombre; });
  form.addCheckboxItem()
    .setTitle('Marque exactamente cinco habilidades')
    .setChoiceValues(nombres)
    .setValidation(
      FormApp.createCheckboxValidation()
        .requireSelectExactly(5)
        .setHelpText('Marque exactamente cinco opciones.')
        .build())
    .setRequired(true);

  // ---------- Bloques 6 a 8: caso, momento de escucha y cierre ----------
  form.addPageBreakItem()
    .setTitle('Para terminar')
    .setHelpText('Últimas preguntas.');

  form.addParagraphTextItem()
    .setTitle('Opcional: cuente un caso reciente en que la falta de una de estas habilidades le costó algo a la empresa.')
    .setHelpText('No mencione nombres de personas.')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('¿En qué momento podría un trabajador de ese puesto escuchar un audio de hasta 15 minutos?')
    .setChoiceValues([
      'Al inicio de la jornada',
      'Durante un descanso',
      'Al cierre de la jornada',
      'En el traslado al trabajo',
      'Fuera del horario laboral',
      'No veo un momento viable'
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('¿Cómo le llegó esta encuesta?')
    .setChoiceValues([
      'Me la envió directamente el investigador',
      'Me la reenvió un colega',
      'Por un grupo de mensajería o red social'
    ])
    .showOtherOption(true)
    .setRequired(true);

  // Debe ser la última pregunta de la página: su respuesta decide a qué página se salta.
  var llamada = form.addMultipleChoiceItem();
  llamada
    .setTitle('¿Aceptaría una llamada de 20 minutos para profundizar en sus respuestas?')
    .setHelpText('Si acepta, en la página siguiente se le pedirá un teléfono. Ese dato se guarda aparte de sus respuestas.')
    .setRequired(true);

  // Página que solo ve quien aceptó la llamada: el teléfono es obligatorio.
  var paginaTelefono = form.addPageBreakItem()
    .setTitle('Datos para la llamada')
    .setHelpText('Su teléfono se usará solo para acordar la llamada.');

  form.addTextItem()
    .setTitle('Teléfono para la llamada')
    .setHelpText('Escriba al menos 10 dígitos.')
    .setValidation(
      FormApp.createTextValidation()
        .requireTextMatchesPattern('^[+() -]*([0-9][+() -]*){10,15}$')
        .setHelpText('Escriba un teléfono de 10 a 15 dígitos.')
        .build())
    .setRequired(true);

  var paginaCorreo = form.addPageBreakItem()
    .setTitle('Último paso');

  form.addTextItem()
    .setTitle('Opcional: correo electrónico')
    .setHelpText(
      'Déjelo solo si quiere recibir el resumen de resultados. ' +
      'Se guardará aparte de sus respuestas al analizar los datos.')
    .setValidation(
      FormApp.createTextValidation()
        .requireTextIsEmail()
        .setHelpText('Escriba un correo válido.')
        .build())
    .setRequired(false);

  // "Sí" lleva a la página del teléfono; "No" la salta.
  llamada.setChoices([
    llamada.createChoice('Sí', paginaTelefono),
    llamada.createChoice('No', paginaCorreo)
  ]);

  Logger.log('Formulario creado.');
  Logger.log('Enlace para editar y publicar: ' + form.getEditUrl());
}

/** Agrega el encabezado de una habilidad y sus tres preguntas. */
function agregarHabilidad_(form, habilidad) {
  form.addSectionHeaderItem()
    .setTitle(habilidad.nombre)
    .setHelpText(habilidad.definicion);

  form.addMultipleChoiceItem()
    .setTitle(habilidad.nombre + ': ¿con qué frecuencia la exige el puesto?')
    .setChoiceValues(ESCALA_FRECUENCIA)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle(habilidad.nombre + ': si el trabajador no la tiene, ¿qué pasa?')
    .setChoiceValues(ESCALA_CONSECUENCIA)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle(habilidad.nombre + ': ¿cómo la observa hoy en el personal de ese puesto?')
    .setChoiceValues(ESCALA_NIVEL)
    .setRequired(true);
}
