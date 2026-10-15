(function () {
    const wa = document.querySelector('.al-wa');
    const msg = wa ? wa.querySelector('.al-wa-msg') : null;
    if (!wa || !msg) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const visibleMs = 3600;
    const repeatMs = 9000;

    function showBubble() {
        msg.classList.add('is-on');
        window.setTimeout(() => msg.classList.remove('is-on'), visibleMs);
    }

    window.setTimeout(showBubble, 1600);
    window.setInterval(showBubble, repeatMs);
})();
