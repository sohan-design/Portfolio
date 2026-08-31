import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/** MPA routes — Vite dev/preview serve root index.html for /route without a trailing slash. */
const MPA_ROUTES = [
  '/about',
  '/more-work',
  '/work/redesigned-ai-agents',
  '/work/redesigned-payment-pages',
];

function isViteInternalPath(pathname) {
  return (
    pathname.startsWith('/@') ||
    pathname.startsWith('/src/') ||
    pathname.startsWith('/node_modules/') ||
    pathname.startsWith('/assets/') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function mpaRouteRewrite() {
  const rewrite = (req, _res, next) => {
    const raw = req.url || '';
    const q = raw.indexOf('?');
    const pathname = (q === -1 ? raw : raw.slice(0, q)) || '/';
    const search = q === -1 ? '' : raw.slice(q);

    if (
      pathname === '/' ||
      pathname.endsWith('/') ||
      isViteInternalPath(pathname)
    ) {
      return next();
    }

    if (MPA_ROUTES.includes(pathname)) {
      req.url = `${pathname}/index.html${search}`;
    }

    next();
  };

  return {
    name: 'mpa-route-rewrite',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  plugins: [mpaRouteRewrite()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about/index.html'),
        moreWork: resolve(__dirname, 'more-work/index.html'),
        unify: resolve(__dirname, 'work/redesigned-ai-agents/index.html'),
        cosmo: resolve(__dirname, 'work/redesigned-payment-pages/index.html'),
      },
    },
  },
});
