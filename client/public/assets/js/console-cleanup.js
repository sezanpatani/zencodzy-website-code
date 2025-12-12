// Console Cleanup Script
// This filters out harmless warnings from third-party libraries (React/Framer)
(function () {
    // Save original methods
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    // Filter patterns
    const ignorePatterns = [
        'Minified React error',
        'Hydration failed',
        'Recoverable error during hydration',
        'framer.com',
        'edit.framer.com',
        'WebSocket connection',
        '[vite] failed'
    ];

    function shouldIgnore(args) {
        const msg = args.map(a => String(a)).join(' ');
        return ignorePatterns.some(pattern => msg.includes(pattern));
    }

    // Override console.error
    console.error = function (...args) {
        if (shouldIgnore(args)) return;
        originalError.apply(console, args);
    };

    // Override console.warn
    console.warn = function (...args) {
        if (shouldIgnore(args)) return;
        originalWarn.apply(console, args);
    };

    // Keep "Navigation Fixed" logs but filter others if needed
    console.log = function (...args) {
        originalLog.apply(console, args);
    };

})();
