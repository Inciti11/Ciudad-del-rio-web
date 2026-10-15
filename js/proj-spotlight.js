(function () {
    const root = document.getElementById('proj-spotlight');
    if (!root) return;

    const track = root.querySelector('.proj-spotlight__track');
    const slides = root.querySelectorAll('.proj-spotlight__slide');
    const dots = root.querySelectorAll('.proj-spotlight__dot');
    const prevBtn = root.querySelector('.proj-spotlight__arrow--prev');
    const nextBtn = root.querySelector('.proj-spotlight__arrow--next');

    if (!track || !slides.length) return;

    let index = 0;
    let ticking = false;

    function setActive(i) {
        index = Math.max(0, Math.min(i, slides.length - 1));
        dots.forEach((dot, idx) => {
            dot.classList.toggle('is-active', idx === index);
            dot.setAttribute('aria-selected', idx === index ? 'true' : 'false');
        });
    }

    function scrollToIndex(i) {
        const slide = slides[i];
        if (!slide) return;
        const left = slide.offsetLeft - track.offsetLeft;
        track.scrollTo({ left, behavior: 'smooth' });
        setActive(i);
    }

    function syncFromScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const center = track.scrollLeft + track.clientWidth * 0.5;
            let closest = 0;
            let minDist = Infinity;
            slides.forEach((slide, idx) => {
                const slideCenter = slide.offsetLeft - track.offsetLeft + slide.offsetWidth * 0.5;
                const dist = Math.abs(center - slideCenter);
                if (dist < minDist) {
                    minDist = dist;
                    closest = idx;
                }
            });
            setActive(closest);
            ticking = false;
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const i = Number(dot.getAttribute('data-proj-index'));
            if (!Number.isNaN(i)) scrollToIndex(i);
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => scrollToIndex(index - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => scrollToIndex(index + 1));
    }

    track.addEventListener('scroll', syncFromScroll, { passive: true });
    window.addEventListener('resize', syncFromScroll, { passive: true });

    setActive(0);
    syncFromScroll();
})();
