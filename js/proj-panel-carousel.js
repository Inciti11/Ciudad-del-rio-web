(function () {
    const START_INDEX = 0;
    const SLIDE_HOLD_MS = 4800;
    const SCROLL_MS = 650;

    document.querySelectorAll('[data-proj-carousel]').forEach((root) => {
        const stage = root.querySelector('.proj-panel__stage');
        const track = root.querySelector('.proj-panel__track');
        const slides = root.querySelectorAll('.proj-panel__slide');
        const dots = root.querySelectorAll('.proj-panel__dot');
        const playBtn = root.querySelector('.proj-panel__arrow--play');
        if (!track || !slides.length || !stage) return;

        const videoIndex = slides.length - 1;
        let index = START_INDEX;
        let filmPlaying = false;
        let filmTimer = null;

        function embedUrl(raw) {
            let url = raw;
            if (!url) return '';
            if (!/[?&]autoplay=1/.test(url)) {
                url += `${url.includes('?') ? '&' : '?'}autoplay=1&mute=1&enablejsapi=1`;
            }
            if (!/[?&]loop=1/.test(url)) {
                const idMatch = url.match(/embed\/([^?&]+)/);
                const id = idMatch ? idMatch[1] : '';
                if (id) {
                    url += `&loop=1&playlist=${id}`;
                }
            }
            return url;
        }

        function ytCommand(iframe, func) {
            iframe.contentWindow?.postMessage(
                JSON.stringify({ event: 'command', func, args: '' }),
                '*'
            );
        }

        function loadVideo(slide) {
            const iframe = slide.querySelector('iframe[data-src], iframe[data-video-id]');
            if (!iframe) return iframe;
            if (iframe.dataset.loaded !== '1') {
                let url = iframe.getAttribute('data-src');
                const videoId = iframe.getAttribute('data-video-id');
                if (!url && videoId) {
                    url = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&loop=1&playlist=${videoId}`;
                }
                url = embedUrl(url);
                if (!url) return iframe;

                iframe.src = url;
                iframe.dataset.loaded = '1';
                iframe.removeAttribute('data-src');
            }
            return iframe;
        }

        function updateDotProgress() {
            dots.forEach((dot, idx) => {
                dot.classList.remove('is-progressing');
                dot.style.removeProperty('--dot-duration');
                if (idx === index && filmPlaying && index < videoIndex) {
                    dot.style.setProperty('--dot-duration', `${SLIDE_HOLD_MS}ms`);
                    requestAnimationFrame(() => {
                        dot.classList.add('is-progressing');
                    });
                }
            });
        }

        function setPlayUi(playing) {
            filmPlaying = playing;
            if (playBtn) {
                const icon = playBtn.querySelector('i');
                playBtn.classList.toggle('is-pause', playing);
                playBtn.setAttribute(
                    'aria-label',
                    playing ? 'Pausar presentación' : 'Reproducir presentación'
                );
                if (icon) {
                    icon.classList.toggle('fa-play', !playing);
                    icon.classList.toggle('fa-pause', playing);
                }
            }
            stage.classList.toggle('is-film-playing', playing);
            updateDotProgress();
        }

        function markActiveSlide() {
            slides.forEach((slide, idx) => {
                slide.classList.toggle('is-active-slide', idx === index);
            });
        }

        function clearFilmTimer() {
            if (filmTimer) {
                clearTimeout(filmTimer);
                filmTimer = null;
            }
        }

        function pauseYoutube() {
            const iframe = slides[videoIndex].querySelector('iframe');
            if (iframe?.src) {
                ytCommand(iframe, 'pauseVideo');
            }
        }

        function playYoutube(withSound) {
            const videoSlide = slides[videoIndex];
            const iframe = loadVideo(videoSlide);
            if (!iframe?.src) return;
            window.setTimeout(() => {
                ytCommand(iframe, 'playVideo');
                if (withSound) {
                    ytCommand(iframe, 'unMute');
                }
            }, 120);
        }

        function stopFilm() {
            clearFilmTimer();
            filmPlaying = false;
            stage.classList.remove('is-film-playing');
            if (playBtn) {
                const icon = playBtn.querySelector('i');
                playBtn.classList.remove('is-pause');
                playBtn.setAttribute('aria-label', 'Reproducir presentación');
                if (icon) {
                    icon.classList.add('fa-play');
                    icon.classList.remove('fa-pause');
                }
            }
            dots.forEach((dot) => dot.classList.remove('is-progressing'));
            pauseYoutube();
        }

        function scheduleFilmStep() {
            clearFilmTimer();
            if (!filmPlaying) return;

            if (index < videoIndex) {
                filmTimer = window.setTimeout(() => {
                    if (!filmPlaying) return;
                    scrollToIndex(index + 1);
                    scheduleFilmStep();
                }, SLIDE_HOLD_MS);
                return;
            }

            playYoutube(true);
        }

        function startFilm() {
            setPlayUi(true);
            markActiveSlide();
            updateDotProgress();
            if (index === videoIndex) {
                playYoutube(true);
                return;
            }
            scheduleFilmStep();
        }

        function setActive(i, opts = {}) {
            index = Math.max(0, Math.min(i, slides.length - 1));
            dots.forEach((dot, idx) => {
                dot.classList.toggle('is-active', idx === index);
                dot.setAttribute('aria-selected', idx === index ? 'true' : 'false');
            });
            markActiveSlide();
            if (filmPlaying) {
                updateDotProgress();
            }

            if (!opts.fromFilm && !opts.silent) {
                /* dot / manual scroll stops autoplay */
            }

            const slide = slides[index];
            if (slide.classList.contains('proj-panel__slide--video')) {
                loadVideo(slide);
            }
        }

        function scrollToIndex(i, instant, opts = {}) {
            const slide = slides[i];
            if (!slide) return;
            track.scrollTo({
                left: slide.offsetLeft,
                behavior: instant ? 'auto' : 'smooth',
            });
            setActive(i, opts);
        }

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                stopFilm();
                const i = Number(dot.getAttribute('data-slide-index'));
                if (!Number.isNaN(i)) scrollToIndex(i);
            });
        });

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (filmPlaying) {
                    stopFilm();
                    return;
                }
                startFilm();
            });
        }

        track.addEventListener(
            'pointerdown',
            (e) => {
                if (e.target.closest('.proj-panel__controls')) return;
                if (filmPlaying) stopFilm();
            },
            { passive: true }
        );

        let ticking = false;
        track.addEventListener(
            'scroll',
            () => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    const viewCenter = track.scrollLeft + track.clientWidth * 0.5;
                    let closest = 0;
                    let minDist = Infinity;
                    slides.forEach((slide, idx) => {
                        const slideCenter = slide.offsetLeft + slide.offsetWidth * 0.5;
                        const dist = Math.abs(viewCenter - slideCenter);
                        if (dist < minDist) {
                            minDist = dist;
                            closest = idx;
                        }
                    });
                    if (closest !== index) {
                        const wasFilm = filmPlaying;
                        setActive(closest, { fromFilm: wasFilm });
                        if (wasFilm) {
                            clearFilmTimer();
                            window.setTimeout(() => {
                                if (filmPlaying) scheduleFilmStep();
                            }, SCROLL_MS);
                        }
                    }
                    ticking = false;
                });
            },
            { passive: true }
        );

        function initPosition() {
            scrollToIndex(START_INDEX, true, { silent: true });
        }

        if (document.readyState === 'complete') {
            requestAnimationFrame(initPosition);
        } else {
            window.addEventListener('load', () => {
                requestAnimationFrame(initPosition);
            });
        }

        const visIo = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) stopFilm();
                });
            },
            { root: null, threshold: 0, rootMargin: '80px 0px' }
        );
        visIo.observe(root);
    });
})();
