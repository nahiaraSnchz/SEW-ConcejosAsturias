class NoticiasGrado {
  constructor() {
    this.url = 'https://www.lne.es/grado/';
    this.maxNoticias = 5;
  }

  iniciar() {
    this.crearSeccionNoticias();
    this.cargarNoticias();
  }

  crearSeccionNoticias() {
    this.$seccion = $('<section>');
    const $titulo = $('<h3>').text('Noticias del concejo de Grado (LNE)');
    this.$seccion.append($titulo);
    $('main').after(this.$seccion);
  }

  cargarNoticias() {
    const proxy = 'https://thingproxy.freeboard.io/fetch/';
    $.ajax({
      url: proxy + encodeURIComponent(this.url),
      method: 'GET',
      dataType: 'json',
      success: (response) => {
        const html = response.contents;
        const $doc = $('<div>').html(html);

        // Nuevo selector más probable para las noticias
        const $noticias = $doc.find('article.mod-newslist-item').slice(0, this.maxNoticias);

        if ($noticias.length === 0) {
          this.$seccion.append('<p>No se encontraron noticias recientes.</p>');
          return;
        }

        $noticias.each((_, elem) => {
          const $elem = $(elem);
          const titulo = $elem.find('h3 a').text().trim() || $elem.find('h2 a').text().trim();
          const enlace = $elem.find('h3 a').attr('href') || $elem.find('h2 a').attr('href');

          const $article = $('<article>');
          const $h4 = $('<h4>').text(titulo);
          const $a = $('<a>')
            .attr('href', enlace.startsWith('http') ? enlace : 'https://www.lne.es' + enlace)
            .attr('target', '_blank')
            .text('Leer más');

          $article.append($h4, $a);
          this.$seccion.append($article);
        });
      },
      error: () => {
        this.$seccion.append('<p>Error al cargar las noticias desde LNE.</p>');
      }
    });
  }
}

$(document).ready(() => {
  const noticias = new NoticiasGrado();
  noticias.iniciar();
});