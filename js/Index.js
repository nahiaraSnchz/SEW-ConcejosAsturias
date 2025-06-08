const Turismo = {
    iniciar: function () {
        this.iniciarCarrusel();
    },

    iniciarCarrusel: function () {
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
    },

};

$(document).ready(() => Turismo.iniciar());