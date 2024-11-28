const softwareIssues = {
    "1": {
        description: "Configuración del avaya.",
        steps: [
            
            {
                text: "Paso 1: Ingresamos al menú, opción configuración del sistema.",
                image: "imagenes/Imagen1.png" 
            },
            {
                text: "Paso 2: En la pestaña 'Telefonía', las opciones encerradas deben estar marcadas.",
                image: "imagenes/image2.png" 
            }
        ]
    },
    "2": {
        description: "Error 500 - Error interno del servidor.",
        steps: [
            {
                text: "Paso 1: Recarga la página y verifica si el problema continúa.",
                image: "https://via.placeholder.com/300x150?text=Recargar+Página"
            },
            {
                text: "Paso 2: Revisa el estado del servidor con el administrador del sitio.",
                image: "https://via.placeholder.com/300x150?text=Estado+del+Servidor"
            },
            {
                text: "Paso 3: Intenta acceder más tarde, podría ser temporal.",
                image: "https://via.placeholder.com/300x150?text=Intentar+Más+Tarde"
            }
        ]
    }
};

let inSoftwareMenu = false;
let currentIssue = null;
let currentStepIndex = 0;
let optionSelected = false;
let issueLocked = false;
let sessionEnded = false;

function showMainMenu() {
    addBotMessage("¿En qué puedo ayudarte? Escribe el número de una opción:");
    addBotMessage("1. Problemas de Software");
    addBotMessage("Escribe 'salir' para terminar la sesión.");
    document.getElementById('userInput').disabled = false;
}

function showSoftwareMenu() {
    addBotMessage("Selecciona el problema que deseas consultar:");
    Object.keys(softwareIssues).forEach(key => {
        addBotMessage(`${key}. ${softwareIssues[key].description}`);
    });
    inSoftwareMenu = true;
}

function processUserInput(input) {
    if (input.toLowerCase() === "salir") {
        addBotMessage("¡Gracias por usar el asistente virtual! Sesión finalizada.");
        document.getElementById('userInput').disabled = true;
        sessionEnded = true;
        return;
    }

    if (sessionEnded && input.toLowerCase() === "hola") {
        addBotMessage("¡Bienvenido de nuevo! Reactivando el chat...");
        sessionEnded = false;
        setTimeout(showMainMenu, 1000);
        return;
    }

    if (!optionSelected) {
        if (input === "1") {
            optionSelected = true;
            showSoftwareMenu();
        } else {
            addBotMessage("Por favor, selecciona una opción válida.");
        }
    } else if (inSoftwareMenu && softwareIssues[input] && !issueLocked) {
        issueLocked = true;
        currentIssue = softwareIssues[input];
        currentStepIndex = 0;
        showIssueDetails();
    } else if (currentIssue && input.toLowerCase() === "listo") {
        showNextStep();
    } else if (issueLocked) {
        addBotMessage("Ya has seleccionado un problema. Completa los pasos antes de intentar algo más.");
    } else {
        addBotMessage("Por favor, escribe una de las opciones proporcionadas.");
    }
}

function showIssueDetails() {
    addBotMessage(currentIssue.description);
    addBotMessage("Escribe 'listo' para avanzar al siguiente paso.");
    showNextStep();
}

function showNextStep() {
    if (currentStepIndex < currentIssue.steps.length) {
        const step = currentIssue.steps[currentStepIndex];
        addBotMessage(step.text);
        if (step.image) {
            addBotImage(step.image);
        }
        currentStepIndex++;
    } else {
        addBotMessage("Has completado todos los pasos. ¿Necesitas ayuda con algo más?");
        issueLocked = false;
        inSoftwareMenu = false;
        currentIssue = null;
        setTimeout(() => {
            optionSelected = false;
            showMainMenu();
        }, 2000);
    }
}

function addUserMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message user-message';
    messageContainer.innerText = message;
    document.getElementById('messages').appendChild(messageContainer);
    scrollToBottom();
}

function addBotMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message bot-message';
    messageContainer.innerHTML = message;
    document.getElementById('messages').appendChild(messageContainer);
    scrollToBottom();
}

function addBotImage(imageUrl) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'message bot-message';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = "Imagen asociada al paso";
    img.style.maxWidth = "100%";
    img.style.cursor = "pointer"; 
    img.onclick = function () {
        openImageModal(imageUrl);
    };

    imageContainer.appendChild(img);
    document.getElementById('messages').appendChild(imageContainer);
    scrollToBottom();
}


function openImageModal(imageUrl) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');

    modal.style.display = "block";
    modalImage.src = imageUrl;
}

document.getElementById('closeModal').onclick = function () {
    document.getElementById('imageModal').style.display = "none";
};


window.onclick = function (event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

function scrollToBottom() {
    const messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
}

document.addEventListener('DOMContentLoaded', showMainMenu);

document.getElementById('userInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        const input = event.target.value.trim();
        if (input) {
            addUserMessage(input);
            processUserInput(input);
            event.target.value = '';
        }
    }
});
