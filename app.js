const databaseKey = "aureonixOmegaRecords";
const filesKey = "aureonixOmegaStructuredFiles";

const form = document.querySelector("#contactForm");
const status = document.querySelector("#formStatus");
const fileForm = document.querySelector("#fileForm");
const fileInput = document.querySelector("#fileInput");
const fileContext = document.querySelector("#fileContext");
const fileStatus = document.querySelector("#fileStatus");
const structuredList = document.querySelector("#structuredList");
const structuredEmpty = document.querySelector("#structuredEmpty");
const aiForm = document.querySelector("#aiForm");
const aiQuery = document.querySelector("#aiQuery");
const aiLevel = document.querySelector("#aiLevel");
const aiStatus = document.querySelector("#aiStatus");
const aiOutput = document.querySelector("#aiOutput");
const clearAi = document.querySelector("#clearAi");
const recordsList = document.querySelector("#recordsList");
const recordsEmpty = document.querySelector("#recordsEmpty");
const recordCount = document.querySelector("#recordCount");
const lastRecord = document.querySelector("#lastRecord");
const exportData = document.querySelector("#exportData");
const clearData = document.querySelector("#clearData");

const readJson = (key) => {
  const saved = localStorage.getItem(key);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

const getRecords = () => readJson(databaseKey);
const getStructuredFiles = () => readJson(filesKey);

const saveRecords = (records) => {
  localStorage.setItem(databaseKey, JSON.stringify(records));
};

const saveStructuredFiles = (files) => {
  localStorage.setItem(filesKey, JSON.stringify(files));
};

const createId = () => {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
};

const formatDate = (dateValue) => {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
};

const fieldLabels = {
  resumen: "Resumen",
  hipotesis: "Hipotesis",
  objetivos: "Objetivos",
  materiales: "Materiales",
  metodos: "Metodos",
  resultados: "Resultados",
  discusion: "Discusion",
  conclusiones: "Conclusiones",
  referencias: "Referencias",
};

const fieldKeywords = {
  hipotesis: ["hipotesis", "hypothesis"],
  objetivos: ["objetivo", "objetivos", "objective", "objectives"],
  materiales: ["materiales", "materials", "recursos"],
  metodos: ["metodo", "metodos", "metodologia", "method", "methods", "methodology"],
  resultados: ["resultado", "resultados", "results", "hallazgos"],
  discusion: ["discusion", "discussion", "analisis"],
  conclusiones: ["conclusion", "conclusiones", "conclusions"],
  referencias: ["referencias", "bibliografia", "references", "bibliography"],
};

const normalizeText = (text) => {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const splitSentences = (text) => {
  return normalizeText(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
};

const findByKeywords = (sentences, keywords) => {
  const matches = sentences.filter((sentence) => {
    const lower = sentence.toLowerCase();
    return keywords.some((keyword) => lower.includes(keyword));
  });
  return matches.slice(0, 3).join(" ");
};

const structureText = (text, context) => {
  const clean = normalizeText(text);
  const sentences = splitSentences(clean);
  const structured = {
    resumen: sentences.slice(0, 3).join(" ") || "No se detecto texto suficiente para generar resumen.",
    hipotesis: "",
    objetivos: "",
    materiales: "",
    metodos: "",
    resultados: "",
    discusion: "",
    conclusiones: "",
    referencias: "",
  };

  Object.entries(fieldKeywords).forEach(([field, keywords]) => {
    structured[field] = findByKeywords(sentences, keywords);
  });

  if (!structured.objetivos && context) {
    structured.objetivos = `Objetivo inferido del contexto: ${context}`;
  }

  Object.keys(structured).forEach((field) => {
    if (!structured[field]) {
      structured[field] = "Pendiente de completar durante la revision metodologica.";
    }
  });

  return structured;
};

const createStructuredFile = async (file, context) => {
  const extension = file.name.split(".").pop().toLowerCase();
  const unsupported = ["pdf", "doc", "docx"].includes(extension);
  const base = {
    id: createId(),
    name: file.name,
    type: file.type || extension.toUpperCase(),
    size: file.size,
    context,
    createdAt: new Date().toISOString(),
  };

  if (unsupported) {
    return {
      ...base,
      status: "Pendiente de extraccion avanzada",
      structured: {
        resumen: "Archivo registrado. Para revisar PDF o Word con precision se requiere extraccion avanzada de texto.",
        hipotesis: "Pendiente de extraer del documento.",
        objetivos: "Pendiente de extraer del documento.",
        materiales: "Pendiente de extraer del documento.",
        metodos: "Pendiente de extraer del documento.",
        resultados: "Pendiente de extraer del documento.",
        discusion: "Pendiente de extraer del documento.",
        conclusiones: "Pendiente de extraer del documento.",
        referencias: "Pendiente de extraer del documento.",
      },
    };
  }

  const text = await file.text();
  return {
    ...base,
    status: "Estructurado localmente",
    structured: structureText(text, context),
  };
};

const appendText = (parent, tag, text, className) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
};

const collectKnowledgeItems = () => {
  const records = getRecords().map((record) => ({
    source: "Avance",
    title: record.interest,
    text: `${record.name} ${record.email} ${record.interest} ${record.message}`,
    date: record.createdAt,
  }));

  const files = getStructuredFiles().map((file) => ({
    source: "Archivo",
    title: file.name,
    text: Object.values(file.structured).join(" "),
    date: file.createdAt,
  }));

  return [...records, ...files];
};

const scoreItem = (item, terms) => {
  const text = item.text.toLowerCase();
  return terms.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0);
};

const getOptimizationSuggestions = (query) => {
  const lower = query.toLowerCase();
  const suggestions = [];

  if (lower.includes("busqueda") || lower.includes("buscar") || lower.includes("semantica")) {
    suggestions.push("Crear un indice por titulo, etiquetas, resumen y palabras clave antes de migrar a pgvector.");
    suggestions.push("Separar busqueda exacta y busqueda semantica para comparar resultados y mejorar precision.");
  }

  if (lower.includes("funcion") || lower.includes("optimizar") || lower.includes("rendimiento")) {
    suggestions.push("Dividir funciones largas en modulos pequenos: lectura, normalizacion, analisis, renderizado y persistencia.");
    suggestions.push("Evitar recalcular toda la base en cada consulta; preparar un resumen indexado por registro.");
  }

  if (lower.includes("archivo") || lower.includes("pdf") || lower.includes("documento")) {
    suggestions.push("Agregar extraccion real para PDF y DOCX en el backend con una cola de procesamiento.");
    suggestions.push("Guardar metadatos de archivo: autor, fecha, tipo, etiquetas, estado de revision y version.");
  }

  if (lower.includes("seguridad") || lower.includes("usuario") || lower.includes("permiso")) {
    suggestions.push("Definir roles desde el inicio: administrador, investigador, colaborador y lector.");
    suggestions.push("Validar archivos antes de procesarlos y registrar auditoria de cambios importantes.");
  }

  if (lower.includes("ia") || lower.includes("chat") || lower.includes("modelo")) {
    suggestions.push("Construir un flujo RAG: fragmentar documentos, generar embeddings, recuperar contexto y responder con fuentes.");
    suggestions.push("Mostrar siempre de que archivo o avance proviene cada respuesta del asistente.");
  }

  if (lower.includes("metodo") || lower.includes("metodologia") || lower.includes("investigacion")) {
    suggestions.push("Exigir campos minimos por investigacion: hipotesis, objetivos, metodo, resultados esperados y referencias.");
    suggestions.push("Agregar estados de revision: borrador, en analisis, validado, observado y publicado.");
  }

  if (!suggestions.length) {
    suggestions.push("Registrar mas avances o archivos para que el colaborador tenga mejor contexto.");
    suggestions.push("Convertir la consulta en una tarea concreta con objetivo, modulo afectado y resultado esperado.");
  }

  return suggestions.slice(0, 5);
};

const getAcademicGuidance = (query, level, matches) => {
  const lower = query.toLowerCase();
  const hasEvidence = matches.length > 0;
  const rigor =
    level === "doctorado"
      ? "formular contribucion original, vacio teorico, diseno metodologico defendible y criterios de publicacion"
      : level === "maestria"
        ? "delimitar problema, validar metodologia, construir evidencia suficiente y documentar replicabilidad"
        : "integrar profundidad doctoral con ejecucion de maestria: marco teorico robusto, validacion aplicada, trazabilidad y contribucion original";

  const team = [
    {
      role: "Direccion cientifica",
      advice: `Elevar la investigacion exige ${rigor}. ${hasEvidence ? "Usa las coincidencias como evidencia inicial, pero separa datos observados de inferencias." : "Primero registra documentos base para sostener el marco teorico."}`,
    },
    {
      role: "Metodologia de investigacion",
      advice:
        "Define pregunta central, hipotesis falsable, variables, criterios de inclusion, limitaciones y estrategia de validacion antes de seguir agregando funciones.",
    },
    {
      role: "Ingenieria de software",
      advice:
        "Prioriza arquitectura modular: ingestion de archivos, normalizacion, indexado, busqueda, asistente IA, usuarios, permisos y auditoria como dominios separados.",
    },
    {
      role: "Datos e inteligencia artificial",
      advice:
        "Prepara un flujo RAG: fragmentacion, embeddings, recuperacion con fuentes, respuesta trazable y evaluacion de precision con preguntas de control.",
    },
    {
      role: "Bibliometria y referencias",
      advice:
        "Cada afirmacion fuerte debe conectarse con una fuente. Agrega campos para DOI, autor, ano, tipo de evidencia, relevancia y confiabilidad.",
    },
    {
      role: "Producto e impacto",
      advice:
        "Convierte cada avance en una decision: que problema resuelve, para quien, como se mide, que riesgo reduce y cual es el siguiente experimento.",
    },
    {
      role: "Comite critico independiente",
      advice:
        "No aceptes una funcion como valiosa hasta que demuestre aporte a la pregunta de investigacion, calidad de evidencia, utilidad para usuarios y posibilidad de replicacion.",
    },
  ];

  if (lower.includes("seguridad") || lower.includes("permiso") || lower.includes("usuario")) {
    team.push({
      role: "Seguridad y gobernanza",
      advice:
        "Incluye control de acceso por roles, bitacora de cambios, validacion de archivos, politicas de privacidad y separacion entre datos publicos, privados y sensibles.",
    });
  }

  return team;
};

const getAutonomousRecommendations = (level, matches) => {
  const recommendations = [
    "Crear una matriz de investigacion con problema, pregunta, hipotesis, variables, metodologia, evidencia esperada y riesgos.",
    "Definir taxonomia de etiquetas para documentos: area, metodo, tecnologia, estado, fuente, confiabilidad y relacion con objetivos.",
    "Agregar un estado de madurez por modulo: idea, diseno, prototipo, validacion, estable y publicado.",
    "Mantener una agenda autonoma de investigacion: revisar vacios, proponer experimentos, priorizar lecturas y detectar contradicciones entre documentos.",
  ];

  if (level === "doctorado" || level === "maestria-doctorado") {
    recommendations.push("Redactar una contribucion original provisional y contrastarla contra literatura existente.");
    recommendations.push("Disenar un protocolo de validacion con criterios de reproducibilidad, sesgos, amenazas a validez y trazabilidad.");
  }

  if (level === "maestria" || level === "maestria-doctorado") {
    recommendations.push("Convertir cada linea teorica en un entregable aplicado: modulo, prueba, indicador, reporte o caso de uso validable.");
  }

  if (!matches.length) {
    recommendations.push("Subir al menos tres documentos base: marco teorico, propuesta metodologica y notas tecnicas del sistema.");
  }

  return recommendations;
};

const renderAiResponse = (query, level, matches, suggestions, academicTeam, autonomousRecommendations) => {
  aiOutput.innerHTML = "";
  const response = document.createElement("article");
  const resultGrid = document.createElement("div");
  const suggestionList = document.createElement("ul");
  const teamGrid = document.createElement("div");
  const autonomousList = document.createElement("ul");

  response.className = "ai-response";
  resultGrid.className = "ai-result-grid";
  teamGrid.className = "ai-result-grid";

  appendText(response, "h3", `Analisis del colaborador - nivel ${level}`);
  appendText(
    response,
    "p",
    matches.length
      ? `Encontre ${matches.length} coincidencia(s) relevantes para: "${query}".`
      : `No encontre coincidencias directas para: "${query}". Te dejo recomendaciones para avanzar.`
  );
  appendText(
    response,
    "p",
    "Esta version trabaja localmente con reglas y busqueda sobre tu base del navegador. La evolucion natural es conectarla a un modelo IA real mediante FastAPI para analisis autonomo profundo."
  );

  matches.slice(0, 4).forEach((match) => {
    const card = document.createElement("article");
    card.className = "ai-result";
    appendText(card, "strong", `${match.source}: ${match.title}`);
    appendText(card, "p", match.text.slice(0, 260));
    resultGrid.appendChild(card);
  });

  if (matches.length) response.appendChild(resultGrid);

  appendText(response, "h3", "Equipo multidisciplinario");
  academicTeam.forEach((member) => {
    const card = document.createElement("article");
    card.className = "ai-result";
    appendText(card, "strong", member.role);
    appendText(card, "p", member.advice);
    teamGrid.appendChild(card);
  });
  response.appendChild(teamGrid);

  appendText(response, "h3", "Recomendaciones autonomas");
  autonomousRecommendations.forEach((recommendation) => {
    appendText(autonomousList, "li", recommendation);
  });
  response.appendChild(autonomousList);

  appendText(response, "h3", "Sugerencias de optimizacion");
  suggestions.forEach((suggestion) => {
    appendText(suggestionList, "li", suggestion);
  });
  response.appendChild(suggestionList);
  aiOutput.appendChild(response);
};

const renderStructuredFiles = () => {
  const files = getStructuredFiles();
  structuredList.innerHTML = "";
  structuredEmpty.hidden = files.length > 0;

  files.forEach((file) => {
    const item = document.createElement("article");
    const top = document.createElement("div");
    const heading = document.createElement("div");
    const badge = document.createElement("span");
    const grid = document.createElement("div");

    item.className = "structured-item";
    top.className = "structured-top";
    badge.className = "record-priority";
    grid.className = "structured-grid";

    appendText(heading, "h3", file.name);
    appendText(heading, "p", `${file.status} - ${formatDate(file.createdAt)}`);
    badge.textContent = `${Math.max(1, Math.round(file.size / 1024))} KB`;
    top.append(heading, badge);

    Object.entries(fieldLabels).forEach(([field, label]) => {
      const fieldCard = document.createElement("article");
      fieldCard.className = "structured-field";
      appendText(fieldCard, "h4", label);
      appendText(fieldCard, "p", file.structured[field]);
      grid.appendChild(fieldCard);
    });

    item.append(top, grid);
    structuredList.appendChild(item);
  });
};

const renderRecords = () => {
  const records = getRecords();
  recordsList.innerHTML = "";
  recordCount.textContent = records.length.toString();
  recordsEmpty.hidden = records.length > 0;
  lastRecord.textContent = records.length ? formatDate(records[0].createdAt) : "Sin datos";

  records.forEach((record) => {
    const item = document.createElement("article");
    const content = document.createElement("div");
    const title = document.createElement("h3");
    const meta = document.createElement("p");
    const message = document.createElement("p");
    const priority = document.createElement("span");

    item.className = "record-item";
    meta.className = "record-meta";
    message.className = "record-message";
    priority.className = "record-priority";

    title.textContent = record.name;
    meta.textContent = `${record.email} - ${formatDate(record.createdAt)}`;
    message.textContent = record.message || "Sin mensaje adicional.";
    priority.textContent = record.interest;

    content.append(title, meta, message);
    item.append(content, priority);
    recordsList.appendChild(item);
  });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const record = {
    id: createId(),
    name: data.get("name").toString().trim(),
    email: data.get("email").toString().trim(),
    interest: data.get("interest").toString(),
    message: data.get("message").toString().trim(),
    createdAt: new Date().toISOString(),
  };
  const records = [record, ...getRecords()];
  saveRecords(records);
  renderRecords();
  status.textContent = `${record.name || "Gracias"}, el avance quedo guardado en la base local de Aureonix Omega.`;
  form.reset();
  document.querySelector("#base-local").scrollIntoView({ behavior: "smooth" });
});

fileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selectedFiles = Array.from(fileInput.files);
  const context = fileContext.value.trim();

  if (!selectedFiles.length) {
    fileStatus.textContent = "Selecciona al menos un archivo para estructurarlo.";
    return;
  }

  fileStatus.textContent = "Procesando archivos...";
  const structuredFiles = [];

  for (const file of selectedFiles) {
    structuredFiles.push(await createStructuredFile(file, context));
  }

  saveStructuredFiles([...structuredFiles, ...getStructuredFiles()]);
  renderStructuredFiles();
  fileForm.reset();
  fileStatus.textContent = `${structuredFiles.length} archivo(s) estructurado(s) y guardado(s) en la base local.`;
});

aiForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = aiQuery.value.trim();
  const level = aiLevel.value;
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((term) => term.length > 3);
  const knowledge = collectKnowledgeItems();
  const matches = knowledge
    .map((item) => ({ ...item, score: scoreItem(item, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  const suggestions = getOptimizationSuggestions(query);
  const academicTeam = getAcademicGuidance(query, level, matches);
  const autonomousRecommendations = getAutonomousRecommendations(level, matches);

  renderAiResponse(query, level, matches, suggestions, academicTeam, autonomousRecommendations);
  aiStatus.textContent = "Equipo IA convocado con criterio academico y contexto local.";
});

clearAi.addEventListener("click", () => {
  aiQuery.value = "";
  aiStatus.textContent = "";
  aiOutput.innerHTML =
    '<div class="records-empty">El colaborador IA local esta listo. Guarda avances o estructura archivos para que sus recomendaciones tengan mas contexto.</div>';
});

exportData.addEventListener("click", () => {
  const data = JSON.stringify(
    {
      avances: getRecords(),
      archivosEstructurados: getStructuredFiles(),
    },
    null,
    2
  );
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "aureonix-omega-base-local.json";
  link.click();
  URL.revokeObjectURL(url);
});

clearData.addEventListener("click", () => {
  const records = getRecords();
  const files = getStructuredFiles();
  if (!records.length && !files.length) {
    status.textContent = "La base local ya esta vacia.";
    return;
  }

  const confirmed = confirm("Quieres borrar todos los registros guardados en este navegador?");
  if (!confirmed) return;

  localStorage.removeItem(databaseKey);
  localStorage.removeItem(filesKey);
  renderRecords();
  renderStructuredFiles();
  status.textContent = "La base local fue limpiada.";
});

renderRecords();
renderStructuredFiles();
