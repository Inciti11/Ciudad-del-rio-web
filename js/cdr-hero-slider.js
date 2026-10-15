(function () {
    const hero = document.querySelector('#pre-hero-banner.cdr-hero');
    if (!hero) return;

    const slides = [...hero.querySelectorAll('.background-slider .slide')];
    if (!slides.length) return;

    const urls = [
        './assets/imagenes/Vistas/Gran Malecon.png',
        './assets/imagenes/Vistas/Vistas_Malecon (2).JPG',
        './assets/imagenes/Vistas/Vistas_Malecon (3).JPG',
        './assets/imagenes/Vistas/Vistas_Malecon (4).jpg',
        './assets/imagenes/Vistas/Vistas_Malecon (5).jpg',
        './assets/imagenes/Vistas/Vistas_Malecon (6).jpg',
        './assets/imagenes/Vistas/Vistas_Malecon (7).JPG'
    ];

    slides.forEach((slide, i) => {
        slide.style.animation = 'none';
        if (urls[i]) {
            slide.style.backgroundImage = `url("${urls[i]}")`;
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundRepeat = 'no-repeat';
            slide.style.backgroundPosition = window.matchMedia('(max-width: 680px)').matches
                ? '38% 42%'
                : '80% 38%';
        }
    });

    urls.slice(1).forEach((url) => {
        const img = new Image();
        img.src = url;
    });

    let index = 0;
    slides[index].classList.add('is-active');

    window.setInterval(() => {
        const next = (index + 1) % slides.length;
        slides[next].classList.add('is-active');
        slides[index].classList.remove('is-active');
        index = next;
    }, 6000);
})();
