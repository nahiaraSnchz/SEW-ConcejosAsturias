class Meteorologia {
  constructor(lat, lon) {
    this.lat = lat;
    this.lon = lon;
    this.apiBase = 'https://api.open-meteo.com/v1/forecast';
  }

  mostrarTiempoActual() {
    const params = {
      latitude: this.lat,
      longitude: this.lon,
      current_weather: true
    };

    $.ajax({
      url: this.apiBase,
      method: 'GET',
      data: params,
      success: (data) => {
        this.renderTiempoActual(data.current_weather);
      },
      error: () => {
        $('body').children('section').eq(0).html('<p>Error al obtener el tiempo actual.</p>');
      }
    });
  }

  mostrarPrevision7Dias() {
    const params = {
      latitude: this.lat,
      longitude: this.lon,
      daily: 'temperature_2m_max,temperature_2m_min,weathercode',
      timezone: 'auto'
    };

    $.ajax({
      url: this.apiBase,
      method: 'GET',
      data: params,
      success: (data) => {
        this.renderPrevision(data.daily);
      },
      error: () => {
        $('body').children('section').eq(1).html('<p>Error al obtener la previsión.</p>');
      }
    });
  }

  renderTiempoActual(tiempo) {
    const html = `
      <h3>Tiempo actual</h3>
      <p>Temperatura: ${tiempo.temperature} °C</p>
      <p>Viento: ${tiempo.windspeed} km/h</p>
      <p>Última actualización: ${tiempo.time}</p>
    `;
    $('body').children('section').eq(0).html(html);
  }

  renderPrevision(prevision) {
    let html = '<h3>Previsión 7 días</h3><ul>';
    for (let i = 0; i < prevision.time.length; i++) {
      html += `<li>
        <strong>${prevision.time[i]}</strong>: 
        Max: ${prevision.temperature_2m_max[i]} °C, 
        Min: ${prevision.temperature_2m_min[i]} °C
      </li>`;
    }
    html += '</ul>';
    $('body').children('section').eq(1).html(html);
  }

  iniciar() {
    this.mostrarTiempoActual();
    this.mostrarPrevision7Dias();
  }
}

$(document).ready(() => {
  const latitudGrado = 43.387835;
  const longitudGrado = -6.074491;

  const app = new Meteorologia(latitudGrado, longitudGrado);
  app.iniciar();
});