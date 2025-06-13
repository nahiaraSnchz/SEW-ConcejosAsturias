class Test {
  constructor() {
    this.questions = [
      {
        question: "¿Cuál es el principal recurso turístico del concejo?",
        options: [
          "Montañas y senderos",
          "Playas de arena blanca",
          "Monumentos históricos",
          "Parques temáticos",
          "Zoológicos"
        ],
        correctAnswer: 0
      },
      {
        question: "¿Cuál es el nombre de la ruta que visita el río Cubia?",
        options: [
          "Visita por Grado",
          "Camino Real del Puerto de la Mesa",
          "Camino de Santiago entre Grado y Salas",
          "Ruta de la Costa Verde",
          "Sendero del Pico Tres Concejos"
        ],
        correctAnswer: 0
      },
      {
        question: "¿Qué tipo de turismo predomina en las rutas del concejo?",
        options: [
          "Turismo de playa",
          "Turismo de nieve",
          "Turismo de compras",
          "Turismo cultural y senderismo",
          "Turismo gastronómico exclusivamente"
        ],
        correctAnswer: 3
      },
      {
        question: "¿Qué ruta conecta Grado con Sama de Grado?",
        options: [
          "Senda del Río Cubia",
          "Camino Real del Puerto de la Mesa",
          "Camino de Santiago",
          "Ruta del Concejo Histórico",
          "Ruta de los Lagos"
        ],
        correctAnswer: 2
      },
      {
        question: "¿Cuál es el punto de inicio de la ruta 'Visita por Grado' y qué tipo de recorrido es?",
        options: [
          "Parque de San Antonio; recorrido cultural a pie",
          "Iglesia de San Cosme y San Damián; recorrido histórico en coche",
          "Plaza General Ponte; recorrido mixto de tapas y monumentos",
          "Villamarin; ruta de senderismo de alta montaña"
        ],
        correctAnswer: 0
      },
      {
        question: "¿Cuál es la altitud aproximada en la zona del Puerto de la Mesa?",
        options: [
          "200 metros",
          "800 metros",
          "1500 metros",
          "50 metros",
          "3000 metros"
        ],
        correctAnswer: 1
      },
      {
        question: "¿Qué tipo de entorno predominan las rutas del concejo?",
        options: [
          "Bosques y montañas",
          "Playas y dunas",
          "Ciudades y zonas urbanas",
          "Desiertos y cañones",
          "Selvas tropicales"
        ],
        correctAnswer: 0
      },
      {
        question: "¿Qué elemento se utiliza en las rutas para marcar puntos importantes o hitos?",
        options: [
          "Buzones de correos",
          "Hitos o mojones",
          "Semáforos",
          "Bancos de descanso",
          "Señales de tráfico"
        ],
        correctAnswer: 1
      },
      {
        question: "¿Qué municipio está situado al lado de Grado en la ruta del Camino de Santiago que mencionamos?",
        options: [
          "Oviedo",
          "Gijón",
          "Llanes",
          "Salas",
          "Cangas de Onís"
        ],
        correctAnswer: 3
      },
      {
        question: "¿Cuál es una actividad habitual en las rutas turísticas del concejo?",
        options: [
          "Surf",
          "Esquí",
          "Escalada en hielo",
          "Paseos en camello",
          "Senderismo"
        ],
        correctAnswer: 4
      }
    ];

    this.currentIndex = 0;
    this.score = 0;
    this.userAnswers = new Array(this.questions.length).fill(null);
    this.container = document.querySelector("section");

    this.init();
  }

  init() {
    this.renderQuestion();
  }

  renderQuestion() {
    const questionObj = this.questions[this.currentIndex];
    this.container.innerHTML = ''; // Limpiar contenido

    const h2 = document.createElement("h3");
    h2.textContent = `Pregunta ${this.currentIndex + 1} de ${this.questions.length}:`;

    const p = document.createElement("p");
    p.textContent = questionObj.question;

    const form = document.createElement("form");
    form.id = "quiz-form";

    questionObj.options.forEach((opt, i) => {
      const label = document.createElement("label");
      label.style.display = "block";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = i;

      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      form.appendChild(label);
    });

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = this.currentIndex === this.questions.length - 1 ? 'Finalizar' : 'Siguiente';
    btn.addEventListener("click", () => this.next());

    this.container.appendChild(h2);
    this.container.appendChild(p);
    this.container.appendChild(form);
    this.container.appendChild(btn);
  }

  next() {
    const selectedInput = this.container.querySelector('input[name="answer"]:checked');
    if (!selectedInput) {
      alert("Por favor, seleccione una respuesta.");
      return;
    }

    this.userAnswers[this.currentIndex] = parseInt(selectedInput.value);

    if (this.currentIndex === this.questions.length - 1) {
      this.calculateScore();
      this.showResult();
    } else {
      this.currentIndex++;
      this.renderQuestion();
    }
  }

  calculateScore() {
    this.score = 0;
    this.questions.forEach((q, i) => {
      if (this.userAnswers[i] === q.correctAnswer) this.score++;
    });
  }

  showResult() {
    this.container.innerHTML = '';
    const h2 = document.createElement("h2");
    h2.textContent = "Juego terminado";

    const p = document.createElement("p");
    p.innerHTML = `Has obtenido <strong>${this.score}</strong> puntos de ${this.questions.length}.`;

    this.container.appendChild(h2);
    this.container.appendChild(p);

    const ul = document.createElement("ul");

    this.questions.forEach((q, i) => {
      const li = document.createElement("li");
      li.style.marginBottom = "1em";

      const pregunta = document.createElement("p");
      pregunta.textContent = `${i + 1}. ${q.question}`;

      const respuestaUsuario = this.userAnswers[i];
      const respuestaCorrecta = q.correctAnswer;

      const textoUsuario = respuestaUsuario !== null
        ? q.options[respuestaUsuario]
        : "No respondida";

      li.appendChild(pregunta);

      if (respuestaUsuario === respuestaCorrecta) {
        // Correcta, solo muestra la respuesta del usuario
        const correcto = document.createElement("p");
        correcto.textContent = `✅ Respuesta correcta: ${textoUsuario}`;
        li.appendChild(correcto);
      } else {
        // Incorrecta
        const incorrecta = document.createElement("p");
        incorrecta.textContent = "❌ INCORRECTA";
        li.appendChild(incorrecta);

        const marcada = document.createElement("p");
        marcada.textContent = `Respuesta marcada: ${textoUsuario}`;
        li.appendChild(marcada);

        const correcta = document.createElement("p");
        correcta.textContent = `Respuesta correcta: ${q.options[respuestaCorrecta]}`;
        li.appendChild(correcta);
      }

      ul.appendChild(li);
    });

    this.container.appendChild(ul);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Test();
});