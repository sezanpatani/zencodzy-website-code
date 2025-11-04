import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    headers: {
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https://framerusercontent.com; script-src 'self' https://framerusercontent.com 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://framerusercontent.com; connect-src 'self' http://localhost:5000 https://framerusercontent.com; frame-src 'self';",
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    {
      name: 'local-html-rewriter',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          try {
            if (!req.url) return next();
            const url = req.url.split('?')[0];
            // Map root to index.html to guarantee rewriting/injection on '/'
            const isRoot = url === '/' || url === '';
            const targetUrl = isRoot ? '/index.html' : url;
            if (!targetUrl.endsWith('.html')) return next();

            const root = server.config.root || process.cwd();
            const filePath = path.join(root, targetUrl.startsWith('/') ? targetUrl.slice(1) : targetUrl);
            if (!fs.existsSync(filePath)) return next();

            let html = fs.readFileSync(filePath, 'utf8');

            // 0) Remove any meta CSP to avoid competing with server headers
            html = html.replace(/<meta[^>]+http-equiv=("|')Content-Security-Policy\1[^>]*>/gi, '');

            // 1) Rewrite remote framer images to local paths
            html = html.replace(/https:\/\/framerusercontent\.com\/images\/([^"'\s)]+)(\?[^"'\s)]*)?/g, (_m, file) => {
              return `/framerusercontent.com/images/${file}`;
            });

            // 1b) Also rewrite inline <style> blocks that reference framerusercontent images
            html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, css, close) => {
              const rewritten = css.replace(/https:\/\/framerusercontent\.com\/images\/([^\)"']+)(\?[^\)"']+)?/g, (_m2, file) => `/framerusercontent.com/images/${file}`);
              return open + rewritten + close;
            });

            // 2) Remove Google Fonts preconnects
            html = html.replace(/<link[^>]+href=("|')https:\/\/fonts\.gstatic\.com\/?\1[^>]*>/g, '');

            // 3) Remove Framer remote scripts we don't want
            html = html.replace(/<script[^>]+src=("|')https:\/\/edit\.framer\.com\/init\.mjs\1[^>]*><\/script>/g, '');
            html = html.replace(/<script[^>]+src=("|')https:\/\/framer\.com\/m\/[^"]+\1[^>]*><\/script>/g, '');

            // 3b) Strip external @font-face rules inside inline <style> tags (framerusercontent assets or fonts.gstatic)
            html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, css, close) => {
              // Remove only @font-face blocks that reference external fonts
              const cleaned = css.replace(/@font-face\s*\{[\s\S]*?\}/g, (block) => {
                return (/framerusercontent\.com\/assets\//.test(block) || /fonts\.gstatic\.com\//.test(block)) ? '' : block;
              });
              return open + cleaned + close;
            });

            // 4) Inject our local scripts early in <head> if not already present
            const needsInjector = !/local-asset-rewriter\.js/.test(html);
            if (needsInjector) {
              const earlyBootstrapContent = `
                (function(){try{
                  var OrigFetch = window.fetch;
                  if (OrigFetch) {
                    window.fetch = function(resource, init){
                      try {
                        var u = typeof resource === "string" ? resource : (resource && resource.url);
                        if (u && /https:\/\/framerusercontent\.com\/cms\//.test(u)) {
                          return Promise.resolve(new Response(JSON.stringify({ items: [] }), {status:200, headers:{"Content-Type":"application/json"}}));
                        }
                      } catch(_){}
                      return OrigFetch.apply(this, arguments);
                    };
                  }
                  var X = window.XMLHttpRequest; if (X) { var o = X.prototype.open, s = X.prototype.send;
                    X.prototype.open = function(m,u){ this.__cms = typeof u === "string" && /https:\/\/framerusercontent\.com\/cms\//.test(u); return o.apply(this, arguments); };
                    X.prototype.send = function(b){ if (this.__cms) { var self = this; setTimeout(function(){ try{ self.readyState=4; self.status=200; self.responseText=JSON.stringify({items:[]}); if (self.onreadystatechange) self.onreadystatechange(); if (self.onload) self.onload(); } catch(e){} }, 0); return; } return s.apply(this, arguments); };
                  }
                  var SP = window.HTMLScriptElement && window.HTMLScriptElement.prototype; if (SP) {
                    var d = Object.getOwnPropertyDescriptor(SP, "src");
                    if (d && d.set) { Object.defineProperty(SP, "src", { set: function(v){ if (typeof v === "string" && (v.indexOf("https://framer.com/m/")===0 || v.indexOf("https://edit.framer.com/")===0 || v.indexOf("https://events.framer.com/")===0)) { v = ""; } return d.set.call(this, v); }, get: d.get, configurable: true, enumerable: d.enumerable }); }
                    var sa = SP.setAttribute; SP.setAttribute = function(n, v){ if (String(n).toLowerCase() === "src" && typeof v === "string" && (v.indexOf("https://framer.com/m/")===0 || v.indexOf("https://edit.framer.com/")===0 || v.indexOf("https://events.framer.com/")===0)) { v = ""; } return sa.call(this, n, v); };
                  }
                  var IP = window.HTMLImageElement && window.HTMLImageElement.prototype; if (IP) {
                    var ids = Object.getOwnPropertyDescriptor(IP, "src");
                    if (ids && ids.set) { Object.defineProperty(IP, "src", { set: function(v){ try{ if (typeof v === "string" && v.indexOf("https://framerusercontent.com/images/")===0) { var f = v.split("https://framerusercontent.com/images/")[1].split("?")[0]; v = "/framerusercontent.com/images/" + f; } } catch(e){} return ids.set.call(this, v); }, get: ids.get, configurable: true, enumerable: ids.enumerable }); }
                    var ia = IP.setAttribute; IP.setAttribute = function(n, v){ try{ var k = String(n || "").toLowerCase(); if (k === "src" || k === "srcset") { v = String(v || ""); if (k === "src") { if (v.indexOf("https://framerusercontent.com/images/")===0) { var f2 = v.split("https://framerusercontent.com/images/")[1].split("?")[0]; v = "/framerusercontent.com/images/" + f2; } } if (k === "srcset") { v = v.split(',').map(function(p){ var seg = p.trim().split(' '); if (seg.length > 0 && seg[0].indexOf("https://framerusercontent.com/images/")===0) { var f3 = seg[0].split("https://framerusercontent.com/images/")[1].split("?")[0]; seg[0] = "/framerusercontent.com/images/" + f3; } return seg.join(' '); }).join(', '); } } } catch(e){} return ia.call(this, n, v); };
                  }
                }catch(e){}})();
              `;

              const injector = [
                `<script>\n${earlyBootstrapContent}\n<\/script>`,
                '<script src="/large-lifecycle-826295.framer.app/js/error-suppressor.js"></script>',
                '<script src="/large-lifecycle-826295.framer.app/js/local-asset-rewriter.js"></script>',
                '<script src="/large-lifecycle-826295.framer.app/js/form-handler.js"></script>'
              ].join('\n');
              html = html.replace(/<head(\s[^>]*)?>/, (m) => `${m}\n${injector}\n`);
            }

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(html);
            return;
          } catch (_) {
            return next();
          }
        });
      },
    }
  ]
})
