// Complete Navigation Handler - Clean instant navigation
(function () {
    'use strict';

    function fixAllNavigation() {
        // console.log('🔧 Fixing all navigation...');

        // Find all clickable elements
        const allElements = document.querySelectorAll('a, button, div[role="button"], span[role="button"]');

        allElements.forEach(el => {
            const text = el.textContent.trim().toLowerCase();
            const href = el.getAttribute('href');

            // Skip external links
            if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:'))) {
                return;
            }

            // Fix based on text content
            let targetUrl = null;

            if (text === 'go back') {
                targetUrl = '/';
            }
            else if (text.includes('quote')) {
                targetUrl = '/pages/get-a-quote.html';
            }
            else if (text.includes('join') || text.includes('career') || text.includes('team')) {
                targetUrl = '/pages/join-our-team.html';
            }
            else if (text.includes('home') || href === '/' || href === '#home') {
                targetUrl = '/';
            }

            // If we found a target, fix the link
            if (targetUrl) {
                el.style.cursor = 'pointer';

                // Remove old handlers
                const newEl = el.cloneNode(true);
                el.parentNode.replaceChild(newEl, el);

                // Add new clean handler
                newEl.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    // console.log(`✅ Navigating to: ${targetUrl}`);

                    // Direct navigation - no loader
                    window.location.href = targetUrl;

                    return false;
                }, true);

                // console.log(`✅ Fixed: "${text}" → ${targetUrl}`);
            }

            // Fix section scrolling
            if (text.includes('contact') || text.includes('about') || text.includes('service') || text.includes('project')) {
                el.addEventListener('click', function (e) {
                    e.preventDefault();

                    let sectionId = '';
                    if (text.includes('contact')) sectionId = 'contact';
                    else if (text.includes('about')) sectionId = 'about';
                    else if (text.includes('service')) sectionId = 'services';
                    else if (text.includes('project')) sectionId = 'projects';

                    const section = document.querySelector(`#${sectionId}, [data-framer-name*="${sectionId}" i]`);
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        window.location.href = `/#${sectionId}`;
                    }
                }, true);
            }
        });

        // console.log('✅ Navigation fixed!');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixAllNavigation);
    } else {
        fixAllNavigation();
    }

    // Run again after delays
    setTimeout(fixAllNavigation, 500);
    setTimeout(fixAllNavigation, 1500);

})();
