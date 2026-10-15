(function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('[data-aos]').forEach((el) => {
        const delay = el.getAttribute('data-aos-delay');
        if (delay) {
            el.style.setProperty('--reveal-delay', `${parseInt(delay, 10) || 0}ms`);
        }
        el.setAttribute('data-reveal', '');
        el.removeAttribute('data-aos');
        el.removeAttribute('data-aos-delay');
    });

    document.querySelectorAll('main h2[data-reveal], main h3[data-reveal]').forEach((el) => {
        el.removeAttribute('data-reveal');
        el.classList.add('al-unblur');
    });

    document.querySelectorAll('main h2, main .section-intro p, main .section-header p').forEach((el) => {
        if (!el.hasAttribute('data-reveal') && !el.classList.contains('al-unblur')) {
            el.classList.add('al-unblur');
        }
    });

    const observed = document.querySelectorAll('[data-reveal], .al-unblur');

    function markIn(el) {
        el.classList.add('is-in');
    }

    if (reduced) {
        observed.forEach(markIn);
        return;
    }

    function revealWithin(root) {
        root.querySelectorAll('[data-reveal], .al-unblur').forEach(markIn);
    }

    function wireSectionReveal(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return null;

        const reveal = () => revealWithin(section);
        const sectionIo = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        reveal();
                        sectionIo.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0, rootMargin: '0px 0px 40px 0px' }
        );
        sectionIo.observe(section);
        if (section.getBoundingClientRect().top < window.innerHeight * 1.05) {
            reveal();
        }
        return section;
    }

    const whySection = wireSectionReveal('why-barranquilla');
    wireSectionReveal('mapa-lotes');

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    markIn(entry.target);
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );

    observed.forEach((el) => {
        if (el.closest('#pre-hero-banner')) return;
        if (whySection && whySection.contains(el)) return;
        io.observe(el);
    });

    document.querySelectorAll('.block:not(.alrio-block--promo)').forEach((block) => {
        const blockIo = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    block.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
                });
            },
            { rootMargin: '120px 0px', threshold: 0 }
        );
        blockIo.observe(block);
    });

})();
