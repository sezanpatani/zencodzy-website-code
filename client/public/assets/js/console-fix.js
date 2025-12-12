// Console Cleanup - Final Safe Version
(function () {
    try {
        // Direct reference capture
        var _log = console.log;
        var _warn = console.warn;
        var _error = console.error;

        // Blocklist
        var IGNORE = [
            'Minified React error',
            '#299', '#418', '#423',
            'Hydration failed',
            'framer.com',
            'socket',
            'WebSocket',
            '[vite]',
            'd is not a function',
            'Navigation fixed',
            'Skipped remote Framer'
        ];

        // Safe check function
        var isIgnored = function (args) {
            if (!args || typeof args.length === 'undefined') return false;
            try {
                var msg = '';
                for (var i = 0; i < args.length; i++) {
                    msg += String(args[i]) + ' ';
                }
                for (var i = 0; i < IGNORE.length; i++) {
                    if (msg.indexOf(IGNORE[i]) > -1) return true;
                }
                return false;
            } catch (e) {
                return false;
            }
        };

        // Override with simple wrapper
        console.error = function () {
            if (isIgnored(arguments)) return;
            _error.apply(console, arguments);
        };

        console.warn = function () {
            if (isIgnored(arguments)) return;
            _warn.apply(console, arguments);
        };

        console.log = function () {
            if (isIgnored(arguments)) return;
            var msg = arguments[0] ? String(arguments[0]) : '';
            if (msg.indexOf('Navigating') > -1 || msg.indexOf('Fixed') > -1) return;
            _log.apply(console, arguments);
        };

        // Window error trap
        window.addEventListener('error', function (e) {
            if (e.message && isIgnored([e.message])) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

    } catch (e) {
        // Fallback: Restore everything if setup fails
        try {
            if (_log) console.log = _log;
            if (_warn) console.warn = _warn;
            if (_error) console.error = _error;
        } catch (err) { }
    }
})();
