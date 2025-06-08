class NoticiasGrado {
  constructor() {
    this.maxNoticias = 5;
    this.apiKey = 'pub_c13fffda137d4f1b9bf5702bca9044c4';  // Pon aquí tu API Key real
  }

  iniciar() {
    this.crearSeccionNoticias();
    this.cargarNoticias();
  }

  crearSeccionNoticias() {
    this.$seccion = $('<section>');
    const $titulo = $('<h3>').text('Noticias del concejo de Grado (Asturias) o alrededores');
    this.$seccion.append($titulo);
    $('main').after(this.$seccion);
  }

  cargarNoticias() {
    const url = `https://newsdata.io/api/1/latest?apikey=pub_c13fffda137d4f1b9bf5702bca9044c4&q=grado%2C%20asturias`;

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
  const noticias = new NoticiasGrado();
  noticias.iniciar();
});