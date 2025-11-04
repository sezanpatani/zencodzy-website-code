/**
 * Error Suppressor for Framer Console Noise
 * Filters out known Framer hydration and React errors
 */

(function() {
  'use strict';

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // List of error patterns to suppress
  const suppressPatterns = [
    'Minified React error',
    'Recoverable error during hydration',
    'edit.framer.com/init.mjs',
    'Failed to fetch dynamically imported module',
    'ERR_BLOCKED_BY_CLIENT',
    'Failed to load resource',
    'Access to script at',
    'CORS policy',
    'violates the following Content Security Policy directive',
    'Refused to connect because it violates the document\'s Content Security Policy',
    'Fetch API cannot load',
    'script-src-elem',
    'font-src',
    'img-src',
    'connect-src',
    '.mjs.map',
    'Fatal error (see above)'
  ];

  // Check if message should be suppressed
  function shouldSuppress(args) {
    const message = args.join(' ');
    return suppressPatterns.some(pattern => message.includes(pattern));
  }

  // Override console.error
  console.error = function(...args) {
    if (!shouldSuppress(args)) {
      originalError.apply(console, args);
    }
  };

  // Override console.warn
  console.warn = function(...args) {
    if (!shouldSuppress(args)) {
      originalWarn.apply(console, args);
    }
  };

  console.log('✨ Console error filter active - Framer errors suppressed');
})();
