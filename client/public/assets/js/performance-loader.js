// Performance Optimization - Lazy Load Scripts
(function () {
    'use strict';

    // Show loading indicator
    const loadingStyle = document.createElement('style');
    loadingStyle.textContent = `
        .page-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.3s ease;
        }
        .page-loader.hidden {
            opacity: 0;
            pointer-events: none;
        }
        .loader-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(156, 255, 51, 0.3);
            border-top-color: #9cff33;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(loadingStyle);

    // Add loader HTML
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="loader-spinner"></div>';
    document.body.insertBefore(loader, document.body.firstChild);

    // Hide loader when page is ready
    function hideLoader() {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 300);
        }, 500);
    }

    // Wait for DOM and images
    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }

    // Fallback - hide after 3 seconds max
    setTimeout(hideLoader, 3000);

})();
