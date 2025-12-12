// Ultra-Fast Page Loader - ONLY on first visit
(function () {
    'use strict';

    // Check if we've already shown the loader in this session
    const hasSeenLoader = sessionStorage.getItem('loaderShown');

    // Skip loader if already shown or if navigating
    if (hasSeenLoader === 'true') {
        console.log('⏭️ Skipping loader (already shown this session)');
        return;
    }

    // Mark that we've shown the loader
    sessionStorage.setItem('loaderShown', 'true');

    // Minimal critical CSS for instant display
    const criticalCSS = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: #000; 
            color: #fff; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            overflow-x: hidden;
        }
        .instant-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            transition: opacity 0.5s ease, visibility 0.5s ease;
        }
        .instant-loader.hide {
            opacity: 0;
            visibility: hidden;
        }
        .loader-logo {
            font-size: 48px;
            font-weight: 700;
            color: #9cff33;
            letter-spacing: 2px;
            margin-bottom: 30px;
            animation: pulse 2s ease-in-out infinite;
        }
        .loader-bar {
            width: 250px;
            height: 4px;
            background: rgba(156, 255, 51, 0.2);
            border-radius: 2px;
            overflow: hidden;
            position: relative;
        }
        .loader-progress {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: linear-gradient(90deg, #9cff33, #7acc00);
            width: 0%;
            transition: width 0.3s ease-out;
            box-shadow: 0 0 15px #9cff33;
        }
        .loader-text {
            margin-top: 20px;
            font-size: 14px;
            color: rgba(156, 255, 51, 0.8);
            letter-spacing: 1px;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
        }
    `;

    // Inject critical CSS immediately
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);

    // Create loader HTML
    const loader = document.createElement('div');
    loader.className = 'instant-loader';
    loader.innerHTML = `
        <div class="loader-logo">ZENCODZY</div>
        <div class="loader-bar">
            <div class="loader-progress" id="loadProgress"></div>
        </div>
        <div class="loader-text" id="loadText">Loading...</div>
    `;

    // Insert loader immediately
    if (document.body) {
        document.body.insertBefore(loader, document.body.firstChild);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.insertBefore(loader, document.body.firstChild);
        });
    }

    // Progress tracking
    let progress = 0;
    const progressBar = () => document.getElementById('loadProgress');
    const loadText = () => document.getElementById('loadText');

    function updateProgress(value, text) {
        progress = Math.min(value, 100);
        const bar = progressBar();
        if (bar) bar.style.width = progress + '%';

        const textEl = loadText();
        if (textEl && text) textEl.textContent = text;
    }

    // Quick progress
    updateProgress(20, 'Loading...');

    setTimeout(() => updateProgress(50, 'Almost ready...'), 200);

    // DOM Content Loaded
    document.addEventListener('DOMContentLoaded', () => {
        updateProgress(80, 'Finalizing...');
    });

    // Window fully loaded
    window.addEventListener('load', () => {
        updateProgress(100, 'Complete!');

        setTimeout(() => {
            loader.classList.add('hide');

            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 500);
        }, 200);
    });

    // Safety fallback
    setTimeout(() => {
        updateProgress(100, 'Ready!');
        loader.classList.add('hide');
        setTimeout(() => {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 500);
    }, 3000);

    document.documentElement.style.visibility = 'visible';

})();
