// CONFIGURACIÓN: Reemplaza el texto de abajo con tu clave real entre las comillas
const API_KEY = "AQ.Ab8"+"RN6LqWuDxXKwnr939fzC5wOczB2u2Q90gFLMzN_eBX_JIFw"; 
const URL_GEMINI = `https://googleapis.com{API_KEY}`;

// Conexión con los elementos de la interfaz de usuario
const btnBuscar = document.getElementById('ia-btn');
const inputBuscar = document.getElementById('ia-input');
const contenedorRespuesta = document.getElementById('ia-output');
const textoRespuesta = document.getElementById('ia-text');

// Evento que se dispara al presionar el botón de búsqueda
btnBuscar.addEventListener('click', async () => {
    const preguntaUsuario = inputBuscar.value.trim();

    // Validar si el cuadro de texto está vacío
    if (preguntaUsuario === "") {
        alert("Por favor, escribe una pregunta primero.");
        return;
    }

    // Activar el contenedor visual en estado de carga
    contenedorRespuesta.style.display = "block";
    textoRespuesta.innerText = "Buscando en la web y procesando información en tiempo real...";

    // Estructura de datos requerida por la API con la búsqueda web integrada
    const datosPeticion = {
        contents: [{
            parts: [{ text: preguntaUsuario }]
        }],
        tools: [{
            googleSearchRetrieval: {}
        }]
    };

    try {
        const respuestaRaw = await fetch(URL_GEMINI, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPeticion)
        });

        const datos = await respuestaRaw.json();
        
        // Extraer la respuesta textual devuelta por el modelo
        const textoIA = datos.candidates[0].content.parts[0].text;
        
        // Desplegar la respuesta final en la interfaz
        textoRespuesta.innerText = textoIA;

    } catch (error) {
        console.error("Error en la petición de IA:", error);
        textoRespuesta.innerText = "Ocurrió un error al conectar con la IA. Asegúrate de que tu API Key sea correcta o intenta de nuevo más tarde.";
    }
});
