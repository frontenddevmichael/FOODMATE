/* ---------------------------------------------------------
   FOODmate — Interaction Suite  (unified load + loader fix) 06 Jul 2025
   Author: Jarvis 🤖
---------------------------------------------------------- */
(() => {
    'use strict';

    /* ---------- Helpers ---------- */
    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);
    const throttle = (fn, wait = 100) => {
        let t = 0;
        return (...args) => {
            const now = Date.now();
            if (now - t >= wait) {
                t = now;
                fn(...args);
            }
        };
    };

    /* ---------- Single window load ---------- */
    addEventListener('load', () => {
        /* ---------- Hide pre‑loader ---------- */
        setTimeout(() => document.body.classList.add('loaded'), 600);

        /* ---------- Cached Elements ---------- */
        const nav = $('.nav');
        const backToTop = $('#backtoTop');
        const progressBar = $('#scrollProgress');
        const navLinks = [...$$('.nav-links a[href^="#"]')];
        const linkMap = new Map(navLinks.map(l => [l.hash.slice(1), l]));
        const sections = $$('section.snap[id]');
        const menuToggle = $('#menuToggle');
        const navDrawer = $('.nav-links');
        const heroContent = $('.hero-content');
        const overlay = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'navOverlay' }));

        /* ---------- 1. Shrink Nav / Parallax / Back‑to‑Top / Progress ---------- */
        const onScrollUI = () => {
            const y = scrollY;
            nav.classList.toggle('active', y > 120);
            backToTop?.classList.toggle('show', y > 400);

            if (progressBar) {
                const max = document.documentElement.scrollHeight - innerHeight;
                progressBar.style.width = `${(y / max) * 100}%`;
            }

            if (heroContent) heroContent.style.transform = `translateY(${y * 0.2}px)`;
        };
        onScrollUI();
        addEventListener('scroll', throttle(onScrollUI, 16));

        /* ---------- 2. Scroll‑Spy ---------- */
        let activeId = null;
        if (sections.length) {
            const spyObserver = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                            const { id } = entry.target;
                            if (id !== activeId) {
                                linkMap.get(activeId)?.classList.remove('active');
                                linkMap.get(id)?.classList.add('active');
                                activeId = id;
                            }
                        }
                    });
                },
                { threshold: 0.5 }
            );
            sections.forEach(sec => spyObserver.observe(sec));
        }

        /* ---------- 3. Smooth Scroll on Nav Click ---------- */
        const closeDrawer = () => { navDrawer?.classList.remove('open'); overlay.classList.remove('show'); };
        navLinks.forEach(link =>
            link.addEventListener('click', e => {
                e.preventDefault();
                $(link.hash)?.scrollIntoView({ behavior: 'smooth' });
                closeDrawer();
            })
        );

        /* ---------- 4. Mobile Drawer ---------- */
        const openDrawer = () => { navDrawer.classList.add('open'); overlay.classList.add('show'); };
        menuToggle?.addEventListener('click', () => navDrawer.classList.contains('open') ? closeDrawer() : openDrawer());
        overlay.addEventListener('click', closeDrawer);

        /* ---------- 5. Staggered Scroll Reveal Animations ---------- */
        const initReveal = () => {
            const groups = {};
            const animEls = $$('.reveal:not(.in-view)');
            if (!animEls.length) return;

            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('in-view');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
            );

            animEls.forEach(el => {
                const key = el.closest('section')?.id || 'global';
                groups[key] = (groups[key] || 0) + 1;
                el.style.setProperty('--delay', `${(groups[key] - 1) * 100}ms`);
                observer.observe(el);
            });
        };
        initReveal();

        /* ---------- 6. Lazy‑Load Images ---------- */
        const lazyImgs = $$('img.lazy');
        if (lazyImgs.length) {
            const lazyObserver = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            lazyObserver.unobserve(img);
                        }
                    });
                },
                { rootMargin: '200px' }
            );
            lazyImgs.forEach(img => lazyObserver.observe(img));
        }

        /* ---------- 7. Back‑to‑Top Click ---------- */
        backToTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

        /* ---------- 8. Animate SVG Icing Drips ---------- */
        $$('.hero-icing .drip').forEach((drip, i) => {
            drip.style.animationDelay = `${2 + i * 0.5}s`;
        });

        /* ---------- 9. Contact Form Success Popup ---------- */
        const contactForm = $('.contact-form');
        const formSuccess = $('#formSuccess');
        if (contactForm && formSuccess) {
            contactForm.addEventListener('submit', e => {
                e.preventDefault();
                formSuccess.style.display = 'block';
                setTimeout(() => formSuccess.style.display = 'none', 5000);
                contactForm.reset();
            });
        }
    });
})();
