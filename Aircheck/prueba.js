const apiKey = "2f98e07dc12a93cc31326fb6fe31ecba"; // Reemplaza con tu clave de OpenWeatherMap.

document.getElementById("location-form").addEventListener("submit", (e) => {
    e.preventDefault();
    getLocationAndFetchAirQuality();
});

function getLocationAndFetchAirQuality() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                console.log("Ubicación del usuario:", lat, lon); // Para verificar la ubicación.

                try {
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
                    );
                    if (!response.ok) {
                        throw new Error("Error en la respuesta de la API");
                    }
                    const data = await response.json();
                    displayResults(data);
                } catch (error) {
                    console.error("Error al obtener los datos:", error);
                    document.getElementById("results").innerHTML = "<p>Error al obtener los datos de calidad del aire.</p>";
                }
            },
            (error) => {
                console.error("Error al obtener la ubicación:", error);
                document.getElementById("results").innerHTML = "<p>No se pudo obtener la ubicación del usuario.</p>";
            }
        );
    } else {
        document.getElementById("results").innerHTML = "<p>Geolocalización no soportada en este navegador.</p>";
    }
}
// Inicializa el mapa centrado en una ubicación predeterminada
const map = L.map("map").setView([4.7110, -74.0721], 6); // Centrado en Bogotá, Colombia

// Capa de mapa de OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(map);

// Añade un marcador que el usuario puede mover
const marker = L.marker([4.7110, -74.0721], { draggable: true }).addTo(map);

// Evento para detectar movimiento del marcador
marker.on("moveend", async (e) => {
    const { lat, lng } = e.target.getLatLng();
    console.log("Nueva posición:", lat, lng); // Verifica la posición en la consola

    try {
        // Llama a la API con la ubicación seleccionada
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`
        );
        if (!response.ok) {
            throw new Error("Error en la respuesta de la API");
        }

        const data = await response.json();
        displayResults(data, lat, lng);
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        document.getElementById("results").innerHTML = "<p>Error al obtener los datos de calidad del aire.</p>";
    }
});
function displayResults(data) {
    const resultsDiv = document.getElementById("results");
    if (data.list && data.list.length > 0) {
        const aqi = data.list[0].main.aqi;
        const components = data.list[0].components;
        
        resultsDiv.innerHTML = `
            <h2>Índice de Calidad del Aire: ${aqi}</h2>
            <p>CO: ${components.co} μg/m³</p>
            <p>NO₂: ${components.no2} μg/m³</p>
            <p>PM2.5: ${components.pm2_5} μg/m³</p>
            <p>PM10: ${components.pm10} μg/m³</p>
            <p>O₃: ${components.o3} μg/m³</p>
            <p>SO₂: ${components.so2} μg/m³</p>
        `;
        resultsDiv.style.color = getColor(aqi);
    } else {
        resultsDiv.innerHTML = `<p>No se encontraron datos para esta ubicación.</p>`;
    }
}

function getColor(aqi) {
    switch (aqi) {
        case 1: return "green";
        case 2: return "yellow";
        case 3: return "orange";
        case 4: return "red";
        case 5: return "purple";
        default: return "black";
    }
}

function getAirQualityRange(aqi) {
    if (aqi === 1) {
        return {
            range: "Bueno",
            recommendations: [
                "El aire es saludable para la mayoría de las personas.",
                "Aprovecha el aire fresco para realizar actividades al aire libre.",
                "No se requieren precauciones adicionales."
            ]
        };
    } else if (aqi === 2) {
        return {
            range: "Moderado",
            recommendations: [
                "Las personas con afecciones respiratorias pueden experimentar irritación.",
                "Evita hacer ejercicio intenso al aire libre si eres sensible a la calidad del aire.",
                "Mantente informado sobre la calidad del aire si tienes condiciones respiratorias."
            ]
        };
    } else if (aqi === 3) {
        return {
            range: "Insalubre para grupos sensibles",
            recommendations: [
                "Personas con afecciones respiratorias o cardiovasculares pueden tener problemas.",
                "Evita actividades al aire libre prolongadas si eres parte de un grupo sensible.",
                "Usa una mascarilla si debes salir al exterior."
            ]
        };
    } else if (aqi === 4) {
        return {
            range: "Insalubre",
            recommendations: [
                "Todos deberían limitar su tiempo al aire libre.",
                "Evita cualquier tipo de actividad física al aire libre.",
                "Si tienes condiciones preexistentes, considera permanecer en interiores."
            ]
        };
    } else if (aqi === 5) {
        return {
            range: "Muy insalubre",
            recommendations: [
                "Se recomienda permanecer en interiores todo el tiempo.",
                "Usa una mascarilla de alta protección si debes salir.",
                "Evita actividades al aire libre y busca atención médica si experimentas dificultad para respirar."
            ]
        };
    } else {
        return {
            range: "Desconocido",
            recommendations: ["No se pudo determinar el rango de calidad del aire."]
        };
    }
}

async function displayResults(data, lat, lon) {
    const resultsDiv = document.getElementById("results");
    const aiRecommendationsDiv = document.getElementById("ai-recommendations");

    if (data.list && data.list.length > 0) {
        const aqi = data.list[0].main.aqi;
        const components = data.list[0].components;

        const { range, recommendations } = getAirQualityRange(aqi);

        resultsDiv.innerHTML = `
            <h2>Índice de Calidad del Aire: ${aqi}</h2>
            <p>CO: ${components.co} μg/m³</p>
            <p>NO₂: ${components.no2} μg/m³</p>
            <p>PM2.5: ${components.pm2_5} μg/m³</p>
            <p>PM10: ${components.pm10} μg/m³</p>
            <p>O₃: ${components.o3} μg/m³</p>
            <p>SO₂: ${components.so2} μg/m³</p>
            <p><strong>Rango de calidad del aire: ${range}</strong></p>
            <ul>
                ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;

        const aiMessage = await getAIRecommendations(aqi, components);
        aiRecommendationsDiv.innerHTML = `<h3>Recomendación Personalizada (IA):</h3><p>${aiMessage}</p>`;
    } else {
        resultsDiv.innerHTML = `<p>No se encontraron datos para esta ubicación.</p>`;
    }
}


