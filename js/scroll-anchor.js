(function () {
    function headerOffset() {
        return parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--header-height-current') || '70',
            10
        );
    }

    window.getCdrScrollTop = function getCdrScrollTop(href, target) {
        if (!target) return 0;
        const h = headerOffset();
        if (href === '#pre-hero-banner') return 0;
        if (href === '#blog') return Math.max(0, target.offsetTop - h - 24);
        return Math.max(0, target.offsetTop - h + 1);
    };

    function scrollToHash(hash, behavior) {
        if (!hash || !hash.startsWith('#')) return;
        const target = document.querySelector(hash);
        if (!target) return;
        const top = window.getCdrScrollTop(hash, target);
        window.scrollTo({ top, behavior: behavior || 'smooth' });
    }

    window.addEventListener('DOMContentLoaded', () => {
        if (window.location.hash) {
            window.setTimeout(() => scrollToHash(window.location.hash, 'auto'), 80);
        }
    });
})();
