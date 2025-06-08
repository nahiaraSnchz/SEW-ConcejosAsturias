class AppGrado {
  constructor() {
    this.maxNoticias = 5;
    this.apiKey = 'pub_c13fffda137d4f1b9bf5702bca9044c4'; // Sustituye con tu API key real
  }

  iniciar() {
    this.iniciarCarrusel();
    this.crearSeccionNoticias();
    this.cargarNoticias();
  }

  // Carrusel de imágenes
  iniciarCarrusel() {
    const $imgs = $('main > article > img');
    const $btnSiguiente = $('main > article > button:nth-of-type(1)');
    const $btnAnterior = $('main > article > button:nth-of-type(2)');
    let actual = 0;

    const actualizar = () => {
      $imgs.each((i, img) => {
        const desplazamiento = 100 * (i - actual);
        $(img).css('transform', `translateX(${desplazamiento}%)`);
      });
    };

    $btnSiguiente.on('click', () => {
      actual = (actual + 1) % $imgs.length;
      actualizar();
    });

    $btnAnterior.on('click', () => {
      actual = (actual - 1 + $imgs.length) % $imgs.length;
      actualizar();
    });

    actualizar();
  }

  // Noticias
  crearSeccionNoticias() {
    this.$seccion = $('<section>');
    const $titulo = $('<h3>').text('Noticias del concejo de Grado (Asturias) o alrededores');
    this.$seccion.append($titulo);
    $('main').after(this.$seccion);
  }

  cargarNoticias() {
    const url = `https://newsdata.io/api/1/latest?apikey=pub_c13fffda137d4f1b9bf5702bca9044c4&q=grado%2C%20asturias&country=es&language=es`;

    $.ajax({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (response) => {
        if (!response.results || response.results.length === 0) {
          this.$seccion.append('<p>No se encontraron noticias recientes.</p>');
          return;
        }

        const noticias = response.results.slice(0, this.maxNoticias);
        noticias.forEach(noticia => {
          const $article = $('<article>');
          const titulo = noticia.title || 'Sin título';
          const descripcion = noticia.description || '';
          const enlace = noticia.link || '#';
          const fecha = noticia.pubDate ? new Date(noticia.pubDate).toLocaleString() : '';

          const $h4 = $('<h4>').text(titulo);
          const $a = $('<a>')
            .attr('href', enlace)
            .attr('target', '_blank')
            .text('Leer más');
          const $p = $('<p>').text(descripcion);
          const $small = $('<small>').text(fecha);

          $article.append($h4, $p, $a, $small);
          this.$seccion.append($article);
        });
      },
      error: () => {
        this.$seccion.append('<p>Error al cargar las noticias desde Newsdata.io.</p>');
      }
    });
  }
}

$(document).ready(() => {
  const app = new AppGrado();
  app.iniciar();
});