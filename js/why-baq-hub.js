(function () {
    const hub = document.querySelector('.why-baq-hub');
    if (!hub) return;

    const tabs = hub.querySelectorAll('.why-baq-hub__tab');
    const panels = hub.querySelectorAll('.why-baq-hub__slide');

    function activate(index) {
        const i = Number(index);
        tabs.forEach((tab, idx) => {
            const on = idx === i;
            tab.classList.toggle('is-active', on);
            tab.setAttribute('aria-selected', on ? 'true' : 'false');
            tab.tabIndex = on ? 0 : -1;
        });
        panels.forEach((panel, idx) => {
            const on = idx === i;
            panel.classList.toggle('is-active', on);
            panel.hidden = !on;
        });
    }

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            activate(tab.getAttribute('data-why-index'));
        });
        tab.addEventListener('keydown', (e) => {
            const current = Number(tab.getAttribute('data-why-index'));
            let next = current;
            if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
            else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = tabs.length - 1;
            else return;
            e.preventDefault();
            activate(next);
            tabs[next].focus();
        });
    });
})();
