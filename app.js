/* ---------------------------------------------------------
   FOODmate — Interaction Suite  (staggered reveal + parallax + icing) 05 Jul 2025
   Author: Jarvis 🤖
---------------------------------------------------------- */

addEventListener('load', () => {
    // Hide loader after short delay
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);

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

        /* ---------- Boot on FULL page load ---------- */
        addEventListener('load', () => {
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

                // progress bar
                if (progressBar) {
                    const max = document.documentElement.scrollHeight - innerHeight;
                    progressBar.style.width = `${(y / max) * 100}%`;
                }

                // hero parallax (20% of scroll)
                if (heroContent) heroContent.style.transform = `translateY(${y * 0.2}px)`;
            };
            onScrollUI();
            addEventListener('scroll', throttle(onScrollUI, 16)); // ~60fps throttle

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
                                const target = entry.target;
                                target.classList.add('in-view');
                                observer.unobserve(target);
                            }
                        });
                    },
                    { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
                );

                animEls.forEach(el => {
                    // group elements by parent section for stagger
                    const key = el.closest('section')?.id || 'global';
                    if (!groups[key]) groups[key] = 0;
                    const delay = groups[key] * 100; // 0.1s increments
                    el.style.setProperty('--delay', `${delay}ms`);
                    groups[key]++;
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
            /* --- 9. Contact Form Success Message --- */
            const contactForm = $('.contact-form');
            const formSuccess = $('#formSuccess');

            if (contactForm) {
                contactForm.addEventListener('submit', e => {
                    e.preventDefault();

                    // show visual success instead of alert
                    formSuccess.style.display = 'block';

                    // optional: auto-hide after 5s
                    setTimeout(() => {
                        formSuccess.style.display = 'none';
                    }, 5000);

                    contactForm.reset();
                });
            }

        });
    })();

