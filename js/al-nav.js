(function () {
    const nav = document.querySelector('.al-nav');
    if (!nav) return;

    const burger = document.getElementById('al-burger');
    const drawer = document.getElementById('al-drawer');
    const peek = document.querySelector('.al-nav-peek');
    const langBtn = document.querySelector('.al-lang-btn');
    const langMenu = document.querySelector('.al-lang-menu');
    const langSwitcher = document.getElementById('language-switcher');
    const drawerClose = document.getElementById('al-drawer-close');
    const drawerLinks = drawer ? drawer.querySelectorAll('.al-drawer-links > li > a[href^="#"], .al-drawer-sub a[href^="#"]') : [];

    let lastScrollY = window.scrollY;
    let peekPinned = false;
    let ignoreBurgerUntil = 0;
    let peekAnchor = { top: 0, left: 0 };

    function isMobileNav() {
        return window.matchMedia('(max-width: 1000px)').matches;
    }

    function updatePeekAnchor() {
        if (!burger || !peek) return;
        const r = burger.getBoundingClientRect();
        if (r.width < 1 && r.height < 1) return;
        peekAnchor.top = r.top;
        peekAnchor.left = r.left;
        peek.style.top = `${peekAnchor.top}px`;
        peek.style.left = `${peekAnchor.left}px`;
    }

    function syncPeek() {
        if (!peek) return;
        const hidden = nav.classList.contains('is-hidden');
        const menuOpen = nav.classList.contains('is-menu');
        const show = hidden && !menuOpen;
        if (!hidden || menuOpen) {
            updatePeekAnchor();
        } else if (show) {
            peek.style.top = `${peekAnchor.top}px`;
            peek.style.left = `${peekAnchor.left}px`;
        }
        peek.classList.toggle('is-on', show);
        peek.setAttribute('aria-hidden', show ? 'false' : 'true');
    }

    function setDrawerBlogExpanded(item, expanded) {
        const btn = item.querySelector('.al-drawer-blog-toggle');
        if (!btn) return;
        item.classList.toggle('is-expanded', expanded);
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        const lang = document.documentElement.lang || 'es';
        const openLabel = btn.getAttribute(lang === 'en' ? 'data-aria-label-en' : 'data-aria-label-es') || 'Abrir menú de blog';
        const closeLabel = lang === 'en' ? 'Close blog menu' : 'Cerrar menú de blog';
        btn.setAttribute('aria-label', expanded ? closeLabel : openLabel);
    }

    function initDrawerBlogAccordion() {
        if (!drawer) return;
        drawer.querySelectorAll('.al-drawer-item--blog').forEach((item) => {
            const btn = item.querySelector('.al-drawer-blog-toggle');
            if (!btn || btn.dataset.blogBound === '1') return;
            btn.dataset.blogBound = '1';

            if (item.querySelector('.al-drawer-sub a.active')) {
                setDrawerBlogExpanded(item, true);
            }

            btn.addEventListener('click', () => {
                setDrawerBlogExpanded(item, !item.classList.contains('is-expanded'));
            });
        });
    }

    function setMenuOpen(open) {
        nav.classList.toggle('is-menu', open);
        document.documentElement.classList.toggle('is-menu-open', open);
        document.body.classList.toggle('is-menu-open', open);
        document.body.classList.toggle('mobile-nav-active', open);

        if (burger) {
            burger.classList.toggle('is-open', open);
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
            const lang = document.documentElement.lang || 'es';
            burger.setAttribute(
                'aria-label',
                open
                    ? (lang === 'en' ? 'Close menu' : 'Cerrar menú')
                    : (lang === 'en' ? 'Open menu' : 'Abrir menú')
            );
        }
        if (drawer) {
            drawer.classList.toggle('is-open', open);
            drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
        }
        if (open) {
            nav.classList.remove('is-hidden');
        } else if (window.scrollY > 32 && !peekPinned) {
            nav.classList.add('is-hidden');
        }
        syncPeek();
    }

    function closeMenu() {
        setMenuOpen(false);
        if (langMenu) {
            langMenu.hidden = true;
            langMenu.classList.remove('is-open');
            if (langBtn) langBtn.setAttribute('aria-expanded', 'false');
        }
    }

    function openMenu() {
        if (Date.now() < ignoreBurgerUntil) return;
        setMenuOpen(true);
    }

    function toggleMenu() {
        if (Date.now() < ignoreBurgerUntil) return;
        setMenuOpen(!nav.classList.contains('is-menu'));
    }

    let navScrollRaf = false;

    function onScrollCore() {
        const y = window.scrollY;
        const vh = window.innerHeight;
        const menuOpen = nav.classList.contains('is-menu');
        const scrollingDown = y > lastScrollY;

        const inHero = y < vh * 0.72;
        const atTop = inHero && !menuOpen;
        nav.classList.toggle('is-at-top', atTop);
        nav.classList.toggle('is-solid', !inHero || menuOpen);
        nav.classList.toggle('scrolled', y > 50 && !atTop);

        if (menuOpen || peekPinned || y < 32) {
            nav.classList.remove('is-hidden');
        } else if (scrollingDown && y > 32) {
            nav.classList.add('is-hidden');
        } else if (!scrollingDown && y < 140) {
            nav.classList.remove('is-hidden');
        }

        if (scrollingDown && y > 48) {
            peekPinned = false;
        }

        lastScrollY = y;
        if (!nav.classList.contains('is-hidden')) {
            updatePeekAnchor();
        }
        syncPeek();
    }

    function onScroll() {
        if (navScrollRaf) return;
        navScrollRaf = true;
        requestAnimationFrame(() => {
            onScrollCore();
            navScrollRaf = false;
        });
    }

    if (burger) {
        burger.addEventListener('click', toggleMenu);
    }

    if (drawerClose) {
        drawerClose.addEventListener('click', closeMenu);
    }

    if (peek) {
        peek.addEventListener('click', () => {
            ignoreBurgerUntil = Date.now() + 400;
            peekPinned = true;
            nav.classList.remove('is-hidden');
            nav.classList.add('is-solid');
            syncPeek();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    drawerLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href) return;
            if (!href.startsWith('#')) {
                closeMenu();
                return;
            }
            e.preventDefault();
            const target = document.querySelector(href);
            closeMenu();
            if (target) {
                const top = typeof window.getCdrScrollTop === 'function'
                    ? window.getCdrScrollTop(href, target)
                    : (href === '#pre-hero-banner' ? 0 : target.offsetTop - 70);
                window.scrollTo({ top, behavior: 'smooth' });
            }
            window.setTimeout(() => {
                if (window.scrollY > 32 && !peekPinned && !nav.classList.contains('is-menu')) {
                    nav.classList.add('is-hidden');
                }
                syncPeek();
            }, 700);
        });
    });

    if (langBtn && langMenu) {
        langBtn.addEventListener('click', () => {
            const open = langMenu.hidden;
            langMenu.hidden = !open;
            langMenu.classList.toggle('is-open', open);
            langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function syncLangPills(lang) {
        document.querySelectorAll('.al-lang-pill[data-lang-pick]').forEach((p) => {
            p.classList.toggle('is-active', p.getAttribute('data-lang-pick') === lang);
        });
    }

    document.querySelectorAll('.al-lang-pill[data-lang-pick]').forEach((pill) => {
        pill.addEventListener('click', () => {
            const pick = pill.getAttribute('data-lang-pick');
            const current = document.documentElement.lang || 'es';
            if (pick !== current && langSwitcher) {
                langSwitcher.click();
            }
            syncLangPills(pick);
        });
    });

    syncLangPills(document.documentElement.lang || 'es');

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        if (!isMobileNav()) closeMenu();
        updatePeekAnchor();
        syncPeek();
    }, { passive: true });

    initDrawerBlogAccordion();
    nav.classList.remove('is-hidden');
    updatePeekAnchor();
    onScroll();
    syncPeek();

    window.AlNav = { closeMenu, openMenu, toggleMenu, syncPeek };
})();
