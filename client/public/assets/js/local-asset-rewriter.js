(function(){
  'use strict';

  // Utility: convert framerusercontent.com image URLs to local paths
  function toLocal(url) {
    try {
      if (!url) return url;
      if (url.startsWith('https://framerusercontent.com/images/')) {
        const file = url.split('https://framerusercontent.com/images/')[1].split('?')[0];
        return '/framerusercontent.com/images/' + file;
      }
      return url;
    } catch (_) { return url; }
  }

  // Hook setters to rewrite before network requests fire
  (function installSettersHooks(){
    try {
      const ImgProto = window.HTMLImageElement && window.HTMLImageElement.prototype;
      if (ImgProto) {
        const srcDesc = Object.getOwnPropertyDescriptor(ImgProto, 'src');
        if (srcDesc && srcDesc.set) {
          Object.defineProperty(ImgProto, 'src', {
            set(value) {
              try { value = toLocal(String(value)); } catch (_) {}
              return srcDesc.set.call(this, value);
            },
            get: srcDesc.get,
            configurable: true,
            enumerable: srcDesc.enumerable
          });
        }
        const setAttr = ImgProto.setAttribute;
        ImgProto.setAttribute = function(name, value){
          try {
            if (name && typeof name === 'string') {
              const key = name.toLowerCase();
              if (key === 'src' || key === 'srcset') {
                value = String(value || '');
                if (key === 'src') value = toLocal(value);
                if (key === 'srcset') {
                  value = value.split(',').map(part => {
                    const segs = part.trim().split(' ');
                    if (segs.length > 0) segs[0] = toLocal(segs[0]);
                    return segs.join(' ');
                  }).join(', ');
                }
              }
            }
          } catch (_) {}
          return setAttr.call(this, name, value);
        };
      }

      // Hook <source> (e.g., within <picture>) to rewrite srcset before network
      const SourceProto = window.HTMLSourceElement && window.HTMLSourceElement.prototype;
      if (SourceProto) {
        const setAttrS = SourceProto.setAttribute;
        SourceProto.setAttribute = function(name, value){
          try {
            if (String(name).toLowerCase() === 'srcset' && value) {
              value = String(value).split(',').map(part => {
                const segs = part.trim().split(' ');
                if (segs.length > 0) segs[0] = toLocal(segs[0]);
                return segs.join(' ');
              }).join(', ');
            }
          } catch(_) {}
          return setAttrS.call(this, name, value);
        };
      }

      const ScriptProto = window.HTMLScriptElement && window.HTMLScriptElement.prototype;
      function isBlockedScriptUrl(url){
        return (
          typeof url === 'string' && (
            url.startsWith('https://events.framer.com/') ||
            url.startsWith('https://framer.com/m/') ||
            url.startsWith('https://edit.framer.com/')
          )
        );
      }
      if (ScriptProto) {
        const sDesc = Object.getOwnPropertyDescriptor(ScriptProto, 'src');
        if (sDesc && sDesc.set) {
          Object.defineProperty(ScriptProto, 'src', {
            set(value) {
              if (isBlockedScriptUrl(value)) {
                // neutralize
                value = '';
              }
              return sDesc.set.call(this, value);
            },
            get: sDesc.get,
            configurable: true,
            enumerable: sDesc.enumerable
          });
        }
        const sSetAttr = ScriptProto.setAttribute;
        ScriptProto.setAttribute = function(name, value){
          if (String(name).toLowerCase() === 'src' && isBlockedScriptUrl(value)) {
            value = '';
          }
          return sSetAttr.call(this, name, value);
        };
      }

      // Intercept DOM insertions to block remote scripts at append-time
      const EP = Element && Element.prototype;
      if (EP) {
        const isBlockedScriptUrl = (url) => typeof url === 'string' && (
          url.startsWith('https://events.framer.com/') ||
          url.startsWith('https://framer.com/m/') ||
          url.startsWith('https://edit.framer.com/')
        );
        const wrapNode = (node) => {
          try {
            if (node && node.tagName === 'SCRIPT') {
              const src = node.getAttribute('src') || '';
              if (isBlockedScriptUrl(src)) {
                // Neutralize before insertion
                node.setAttribute('src', '');
                return node;
              }
            }
          } catch(_){}
          return node;
        };
        const origAppend = EP.appendChild;
        EP.appendChild = function(child){
          return origAppend.call(this, wrapNode(child));
        };
        const origInsertBefore = EP.insertBefore;
        EP.insertBefore = function(child, ref){
          return origInsertBefore.call(this, wrapNode(child), ref);
        };
      }

      // Stub XHR to avoid CMS connections
      const OrigXHR = window.XMLHttpRequest;
      if (OrigXHR) {
        const open = OrigXHR.prototype.open;
        const send = OrigXHR.prototype.send;
        OrigXHR.prototype.open = function(method, url){
          this.__isBlockedCMS = typeof url === 'string' && /https:\/\/framerusercontent\.com\/cms\//.test(url);
          return open.apply(this, arguments);
        };
        OrigXHR.prototype.send = function(body){
          if (this.__isBlockedCMS) {
            // Simulate async success with empty JSON
            setTimeout(() => {
              try {
                this.readyState = 4; this.status = 200;
                this.responseText = JSON.stringify({ items: [] });
                this.onreadystatechange && this.onreadystatechange();
                this.onload && this.onload();
              } catch (_){ }
            }, 0);
            return;
          }
          return send.apply(this, arguments);
        };
      }
    } catch(_) {}
  })();

  // Rewrite <img> src and srcset
  function rewriteImages() {
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img => {
      if (img.src && img.src.startsWith('https://framerusercontent.com/images/')) {
        img.src = toLocal(img.src);
      }
      const srcset = img.getAttribute('srcset');
      if (srcset) {
        const rewritten = srcset.split(',').map(part => {
          const segs = part.trim().split(' ');
          if (segs.length > 0) segs[0] = toLocal(segs[0]);
          return segs.join(' ');
        }).join(', ');
        img.setAttribute('srcset', rewritten);
      }
    });

    // Rewrite <source srcset> inside <picture>
    document.querySelectorAll('source[srcset]').forEach(src => {
      const srcset = src.getAttribute('srcset');
      if (srcset) {
        const rewritten = srcset.split(',').map(part => {
          const segs = part.trim().split(' ');
          if (segs.length > 0) segs[0] = toLocal(segs[0]);
          return segs.join(' ');
        }).join(', ');
        src.setAttribute('srcset', rewritten);
      }
    });

    // Rewrite <link rel="icon"> and known meta images (og/twitter)
    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('framerusercontent.com/images/')) {
        link.setAttribute('href', toLocal(href));
      }
    });
    document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(meta => {
      const content = meta.getAttribute('content');
      if (content && content.includes('framerusercontent.com/images/')) {
        meta.setAttribute('content', toLocal(content));
      }
    });
  }

  // Rewrite inline backgrounds that reference framerusercontent images
  function rewriteBackgrounds() {
    const all = document.querySelectorAll('[style*="framerusercontent.com/images/"]');
    all.forEach(el => {
      const s = el.getAttribute('style');
      if (!s) return;
      const rewritten = s.replace(/https:\/\/framerusercontent\.com\/images\/([^\)"]+)(\?[^\)"]+)?/g, (_, file) => '/framerusercontent.com/images/' + file);
      if (rewritten !== s) el.setAttribute('style', rewritten);
    });
  }

  // Rewrite stylesheets' CSS rules that reference framerusercontent images
  function rewriteStylesheetUrls() {
    const sheets = Array.from(document.styleSheets || []);
    sheets.forEach(sheet => {
      let rules;
      try { rules = sheet.cssRules; } catch (_) { return; }
      if (!rules) return;
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        // Style rules with declarations
        if (rule.type === 1 /* CSSStyleRule */) {
          try {
            const text = String(rule.cssText || '');
            if (text.includes('framerusercontent.com/images/')) {
              const updated = text.replace(/https:\/\/framerusercontent\.com\/images\/([^\)"']+)(\?[^\)"']+)?/g, (_m, file) => `/framerusercontent.com/images/${file}`);
              if (updated !== text) {
                try { sheet.deleteRule(i); } catch(_) {}
                try { sheet.insertRule(updated, i); } catch(_) {}
              }
            }
          } catch(_){}
        }
      }
    });
  }

  // Remove @font-face rules referencing external hosts
  function removeExternalFontFaces() {
    const sheets = Array.from(document.styleSheets);
    sheets.forEach(sheet => {
      let rules;
      try { rules = sheet.cssRules; } catch (_) { return; }
      if (!rules) return;
      for (let i = rules.length - 1; i >= 0; i--) {
        const rule = rules[i];
        if (rule.type === 5) { // CSSFontFaceRule
          const text = String(rule.cssText || '');
          if (text.includes('framerusercontent.com/assets') || text.includes('fonts.gstatic.com')) {
            try { sheet.deleteRule(i); } catch (_) {}
          }
        }
      }
    });
  }

  // Decide whether an element is an external network element we should remove immediately
  function isBlockedExternal(el) {
    if (el.tagName === 'SCRIPT') {
      const src = el.getAttribute('src') || '';
      return (
        // Block analytics/events and framer app icon modules and editor
        src.startsWith('https://events.framer.com/') ||
        src.startsWith('https://framer.com/m/') ||
        src.startsWith('https://edit.framer.com/')
      );
    }
    if (el.tagName === 'LINK') {
      const rel = (el.getAttribute('rel') || '').toLowerCase();
      const href = el.getAttribute('href') || '';
      if (rel === 'preconnect') {
        // Allow preconnect to framerusercontent (needed for runtime modules),
        // but still block Google Fonts preconnects
        return href.startsWith('https://fonts.gstatic.com');
      }
      // Block prefetch/preload to CMS or other remote endpoints that are not essential for motion
      if (rel === 'prefetch' || rel === 'preload') {
        if (href.startsWith('https://framerusercontent.com/cms/')) return true;
        if (href.startsWith('https://edit.framer.com/')) return true;
        if (href.startsWith('https://framer.com/m/')) return true;
        // allow other preloads (e.g., framerusercontent site modules) for motion
        return false;
      }
      if (rel === 'modulepreload') {
        // Allow modulepreload from framerusercontent (motion), but block framer app/editor
        if (href.startsWith('https://framer.com/m/')) return true;
        if (href.startsWith('https://edit.framer.com/')) return true;
        return false;
      }
    }
    return false;
  }

  function purgeExistingExternalTags() {
    document.querySelectorAll('script,link').forEach(node => {
      if (isBlockedExternal(node)) node.remove();
    });
  }

  // Observe DOM for future additions (parser continues after our script)
  function observeAndBlockNewExternals() {
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes && m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (isBlockedExternal(node)) {
            try { node.remove(); } catch(_) {}
            return;
          }
          // Also scan immediate children for nested scripts/links
          node.querySelectorAll && node.querySelectorAll('script,link').forEach(child => {
            if (isBlockedExternal(child)) {
              try { child.remove(); } catch(_) {}
            }
          });
          // Proactively rewrite images and backgrounds in this subtree
          if (node.matches && node.matches('img,[style]')) {
            rewriteImages();
            rewriteBackgrounds();
          } else if (node.querySelectorAll) {
            const anyImg = node.querySelectorAll('img, [style*="framerusercontent.com/images/"]');
            if (anyImg.length) { rewriteImages(); rewriteBackgrounds(); }
          }
          // If new <style> appeared, attempt CSS rewrite too
          if (node.tagName === 'STYLE' || (node.querySelectorAll && node.querySelectorAll('style').length)) {
            rewriteStylesheetUrls();
          }
        });
      }
    });
    try {
      observer.observe(document.documentElement || document.body || document, { childList: true, subtree: true });
    } catch (_) {}
  }

  function run() {
    // Proactively block future additions first
    observeAndBlockNewExternals();
    // Clean up anything already in the DOM
    purgeExistingExternalTags();
    removeExternalFontFaces();
    rewriteImages();
    rewriteBackgrounds();
  rewriteStylesheetUrls();

    // Stub remote CMS fetches so React doesn't crash due to CSP connect blocks
    // This prevents fatal errors caused by Framer CMS endpoints.
    if (window.fetch) {
      const origFetch = window.fetch;
      window.fetch = async function(resource, init) {
        try {
          const url = typeof resource === 'string' ? resource : (resource && resource.url);
          if (url && /https:\/\/framerusercontent\.com\/cms\//.test(url)) {
            return new Response(JSON.stringify({ items: [] }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        } catch (_) {}
        return origFetch.apply(this, arguments);
      };
    }
  }

  // Run immediately (parser will continue; our observer will catch later nodes)
  try { run(); } catch (_) {}
})();
