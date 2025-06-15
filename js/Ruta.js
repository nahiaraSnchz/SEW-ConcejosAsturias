class RutasConMapas {
    constructor() {
        this.key = "AIzaSyA2aLnWSkwGvVo7erYNyjW1fzG5LP5Djk0";
        this.loadGoogleMaps().then(() => {
            //this.cargarXmlDesdeRuta('/xml/rutas.xml');
            // Si quieres mantener el botón de carga manual, llama a createBotonXml aquí también
            this.createBotonXml();
        });
    }

    // Opción de crear botón (opcional)
    createBotonXml() {
        const label = document.createElement("label");
        label.innerHTML = "Cargar archivo XML:";
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".xml";
        input.addEventListener("change", this.procesarArchivoXml.bind(this));

        const section = document.createElement("section");
        section.appendChild(label);
        section.appendChild(input);
        document.body.appendChild(section);
    }

    // Carga XML desde ruta fija
    cargarXmlDesdeRuta(ruta) {
        fetch(ruta)
            .then(response => {
                if (!response.ok) throw new Error(`No se pudo cargar el archivo XML: ${ruta}`);
                return response.text();
            })
            .then(xmlText => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "application/xml");
                this.mostrarRutas(xmlDoc);
            })
            .catch(error => {
                const errorMsg = document.createElement("p");
                errorMsg.textContent = `❌ Error al cargar el archivo XML: ${error.message}`;
                document.body.appendChild(errorMsg);
            });
    }

    procesarArchivoXml(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "application/xml");
            this.mostrarRutas(xmlDoc);

            // Buscar el ancestor <section> que contenga un <input type="file">
            const sections = document.querySelectorAll('section');
            sections.forEach(section => {
                const inputFile = section.querySelector('input[type="file"]');
                if (inputFile) {
                    section.remove();
                }
            });
        };
        reader.readAsText(file);
    }

    mostrarRutas(xmlDoc) {
        const rutas = xmlDoc.querySelectorAll("ruta");

        rutas.forEach((ruta, index) => {

            const section = document.createElement("section");

            // Función auxiliar para extraer texto de nodo con control
            const getText = (parent, selector, fallback = "No disponible") => {
                const el = parent.querySelector(selector);
                return el && el.textContent.trim() ? el.textContent.trim() : fallback;
            };

            // Extraer datos principales
            const nombre = ruta.getAttribute("nombre") || "Sin nombre";
            const tipo = ruta.getAttribute("tipo") || "Sin tipo";
            const descripcion = ruta.querySelector("descripcion").textContent || "Sin descripción";
            const medioTransporte = ruta.querySelector("medio_transporte").textContent || "Sin medio de transporte";
            const fechaInicio = ruta.querySelector("fecha_inicio").textContent || "Fecha no disponible";
            const horaInicio = ruta.querySelector("hora_inicio").textContent || "Hora no disponible";
            const duracion = ruta.querySelector("duracion").textContent || "Duración no disponible";
            const agencia = ruta.querySelector("agencia").textContent || "Agencia no disponible";
            const personasAdecuadas = ruta.querySelector("personas_adecuadas").textContent || "No especificado";

            // Punto de salida
            const inicio = $(ruta).find("inicio");
            const lugar = inicio.find("lugar").text() || "Lugar no especificado";
            const direccion = inicio.find("direccion").text() || "Dirección no especificada";
            const latitud = inicio.find("coordenadas > latitud").text() || "Latitud no especificada";
            const longitud = inicio.find("coordenadas > longitud").text() || "Longitud no especificada";
            const altitud = inicio.find("coordenadas > altitud").text() || "Altitud no especificada";

            // Recomendacion
            const recomendacion = $(ruta).find("recomendacion").text() || "No hay recomendaciones disponibles";

            // Cabecera info general
            section.innerHTML += `<h2>${nombre}</h2>`;
            section.innerHTML +=`<p><strong>Descripción:</strong> ${descripcion}</p>`;

            // Detalles
            const detallesHtml = `
            <h3>Detalles de la ruta</h3>
            <ul>
                <li><strong>Recomendación:</strong> ${recomendacion}</li>
                <li><strong>Tipo:</strong> ${tipo}</li>
                <li><strong>Medio de transporte:</strong> ${medioTransporte}</li>
                <li><strong>Fecha de inicio:</strong> ${fechaInicio}</li>
                <li><strong>Hora de inicio:</strong> ${horaInicio}</li>
                <li><strong>Duración:</strong> ${duracion}</li>
                <li><strong>Agencia:</strong> ${agencia}</li>
                <li><strong>Personas adecuadas:</strong> ${personasAdecuadas}</li>
            </ul>
            <br>
            <h3>Punto de salida</h3>
            <ul>
                <li><strong>Lugar:</strong> ${lugar}</li>
                <li><strong>Dirección:</strong> ${direccion}</li>
                <li><strong>Coordenadas:</strong> ${latitud}, ${longitud}, ${altitud}</li>
            </ul>
            <br>
            `;
            section.innerHTML += detallesHtml;

            // Referencias
            const referencias = $(ruta).find("referencias > referencia");
            if (referencias.length > 0) {
            let htmlReferencias = "<h3>Referencias:</h3><ul>";
            referencias.each((i, ref) => {
                const url = $(ref).text().trim();
                htmlReferencias += `<li><a href="${url}" target="_blank">${url}</a></li>`;
            });
            htmlReferencias += "</ul>";
            section.innerHTML += htmlReferencias;
            } else {
            section.innerHTML += "<p>No hay referencias disponibles.</p>";
            }

            // Hitos
            const hitos = $(ruta).find("hitos > hito");
            if (hitos.length > 0) {
            let htmlHitos = "<br><h3>Hitos del recorrido</h3>";
            hitos.each((index, hito) => {
                const $hito = $(hito);
                const nombreHito = $hito.find("nombre").text() || "Sin nombre";
                const descripcionHito = $hito.find("descripcion").text() || "Sin descripción";

                const lat = $hito.find("coordenadas > latitud").text() || "Latitud no especificada";
                const lon = $hito.find("coordenadas > longitud").text() || "Longitud no especificada";
                const alt = $hito.find("coordenadas > altitud").text() || "Altitud no especificada";

                const distancia = $hito.find("distancia").text() || "Distancia no especificada";
                const unidad = $hito.find("distancia").attr("unidad") || "";

                // Fotos
                const fotos = $hito.find("fotos > foto");
                let htmlFotos = "";
                fotos.each((i, foto) => {
                const archivo = $(foto).text().trim();
                htmlFotos += `<img src="multimedia/images/${archivo}" alt="${nombreHito}" style="max-width:200px; margin:5px;">`;
                });

                // Videos
                const videos = $hito.find("videos > video");
                let htmlVideos = "";
                videos.each((i, video) => {
                const archivo = $(video).text().trim();
                htmlVideos += `
                    <video controls width="300" style="margin:5px;">
                    <source src="multimedia/videos/${archivo}" type="video/mp4">
                    Tu navegador no soporta la reproducción de video.
                    </video>
                `;
                });

                htmlHitos += `
                <article>
                    <h4>Hito ${index + 1}: ${nombreHito}</h4>
                    <p><strong>Descripción:</strong> ${descripcionHito}</p>
                    <ul>
                    <li><strong>Coordenadas:</strong> ${lat}, ${lon}, ${alt}</li>
                    <li><strong>Distancia desde inicio:</strong> ${distancia} ${unidad}</li>
                    </ul>
                    ${htmlFotos}
                    ${htmlVideos}
                </article>
                <hr>
                `;
            });
            section.innerHTML += htmlHitos;
            } else {
            section.innerHTML += "<p>No hay hitos disponibles para esta ruta.</p>";
            }

            document.body.appendChild(section);

            let planimetriaPath = ruta.querySelector("planimetria")?.getAttribute("archivo_kml") || "";
            planimetriaPath = planimetriaPath.replace(/\\/g, "/");

            
            

            fetch(planimetriaPath) 
                .then(response => {
                    if (!response.ok) throw new Error("No se pudo cargar el archivo KML.");
                    return response.text();
                })
                .then(kmlText => {
                    const parser = new DOMParser();
                    const kmlDoc = parser.parseFromString(kmlText, "application/xml");

                    const tituloMapa = document.createElement("h4");
                    tituloMapa.textContent = "Mapa de la ruta";
                    section.appendChild(tituloMapa);

                    this.dibujarMapaDesdeKml(kmlDoc, section);

                                    
                })
                .catch(error => {
                    const errorMsg = document.createElement("p");
                    errorMsg.textContent = `❌ Error al cargar el archivo KML: ${error.message}`;
                    section.appendChild(errorMsg);
                });

            const altimetria = ruta.querySelector("altimetria");
            const svgArchivo = altimetria?.getAttribute("archivo_svg");

            if (svgArchivo) {
                fetch(svgArchivo)
                    .then(response => {
                        if (!response.ok) throw new Error("No se pudo cargar la altimetría SVG.");
                        return response.text();
                    })
                    .then(svgContent => {
                        const tituloAltimetria = document.createElement("h4");
                        tituloAltimetria.textContent = "Altimetría de la ruta";
                        section.appendChild(tituloAltimetria);

                        const contenedor = document.createElement("div");
                        contenedor.innerHTML = svgContent;
                        const svg = contenedor.querySelector("svg");

                        const ancho = parseFloat(svg.getAttribute("width")) || 500;
                        const altoOriginal = parseFloat(svg.getAttribute("height")) || 200;

                        const espacioExtraArriba = 100; // espacio extra arriba para el texto
                        const nuevoAlto = altoOriginal + espacioExtraArriba;
                        svg.setAttribute("height", nuevoAlto);

                        // Mover todos los elementos dentro del SVG hacia abajo para dejar espacio arriba
                        const todosLosElementos = svg.querySelectorAll("*");
                        todosLosElementos.forEach(el => {
                            // Obtiene transform actual o vacío
                            const transformActual = el.getAttribute("transform") || "";
                            // Añade translate para bajar
                            el.setAttribute("transform", `translate(0,${espacioExtraArriba}) ${transformActual}`);
                        });

                        // Línea y etiqueta de cota 0 m (posición ajustada por espacio extra)
                        const lineaCero = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        lineaCero.setAttribute("x1", 0);
                        lineaCero.setAttribute("y1", nuevoAlto);
                        lineaCero.setAttribute("x2", ancho);
                        lineaCero.setAttribute("y2", nuevoAlto);
                        lineaCero.setAttribute("stroke", "red");
                        lineaCero.setAttribute("stroke-dasharray", "4");
                        svg.appendChild(lineaCero);

                        const etiquetaCero = document.createElementNS("http://www.w3.org/2000/svg", "text");
                        etiquetaCero.setAttribute("x", 5);
                        etiquetaCero.setAttribute("y", nuevoAlto - 5);
                        etiquetaCero.setAttribute("font-size", "10");
                        etiquetaCero.setAttribute("fill", "red");
                        etiquetaCero.textContent = "Cota 0 m";
                        svg.appendChild(etiquetaCero);

                        // Extraer puntos del polyline
                        const polyline = svg.querySelector("polyline");
                        if (!polyline) {
                            throw new Error("No se encontró el polyline en el SVG.");
                        }
                        const puntos = polyline.getAttribute("points").trim().split(" ");

                        const hitosXML = ruta.querySelectorAll("hito");

                        // Por cada hito, colocar círculo y texto en el punto correspondiente (ajustando Y)
                        hitosXML.forEach((hito, i) => {
                            if (i >= puntos.length) return; // evitar desbordar si hay más hitos que puntos

                            const nombre = hito.querySelector("nombre")?.textContent ?? "Hito";

                            const [x, yOriginal] = puntos[i].split(",").map(coord => parseFloat(coord));
                            const y = yOriginal + espacioExtraArriba; // desplaza también los puntos

                            // Círculo rojo en la posición exacta del punto
                            const punto = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                            punto.setAttribute("cx", x);
                            punto.setAttribute("cy", y);
                            punto.setAttribute("r", 4);
                            punto.setAttribute("fill", "red");
                            svg.appendChild(punto);

                            // Texto vertical cerca del círculo
                            const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
                            texto.setAttribute("x", x + 5);
                            texto.setAttribute("y", y - 5);
                            texto.setAttribute("font-size", "10");
                            texto.setAttribute("fill", "black");
                            texto.setAttribute("transform", `rotate(-90 ${x + 5} ${y - 5})`);
                            texto.textContent = nombre;
                            svg.appendChild(texto);
                        });

                        section.appendChild(contenedor);
                    })
                    .catch(err => {
                        const errorAlt = document.createElement("p");
                        errorAlt.textContent = `Error al cargar altimetría: ${err.message}`;
                        section.appendChild(errorAlt);
                    });
            }

        });
    }

    async dibujarMapaDesdeKml(kmlDoc, contenedor) {
        const { Map } = await google.maps.importLibrary("maps");

        const divMapa = document.createElement("div");
        contenedor.appendChild(divMapa);

        const lineString = kmlDoc.querySelector("LineString > coordinates");
        if (!lineString) return;

        const coords = lineString.textContent.trim().split(/\s+/).map(coord => {
            const [lng, lat] = coord.split(",");
            return { lat: parseFloat(lat), lng: parseFloat(lng) };
        });

        const mapa = new Map(divMapa, {
            center: coords[0],
            zoom: 14,
            mapTypeId: "hybrid"
        });

        const ruta = new google.maps.Polyline({
            path: coords,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 3
        });

        ruta.setMap(mapa);
    }

    async loadGoogleMaps() {
        const scriptId = "google-maps-script";
        if (document.getElementById(scriptId)) return;

        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.key}&callback=initMapLib`;
            script.async = true;
            window.initMapLib = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}