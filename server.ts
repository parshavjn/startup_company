import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './api/index.ts';

const PORT = 3000;

async function bootstrap() {
  // Vite middleware for development mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting development server with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // This connects Vite's HMR and static asset compilers
    app.use(vite.middlewares);
  } else {
    console.log('Starting production server...');
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files from compiled React build folder
    app.use(expressStaticFallback(distPath));
    
    // Fallback everything else to SPA index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Recently Funded Tech Agent is online at: http://localhost:${PORT}`);
    console.log(`Port: ${PORT} (Ingress-ready bound)`);
  });
}

// Simple Helper to bind static files cleanly
function expressStaticFallback(distPath: string) {
  const express = require('express');
  return express.static(distPath);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrapping failure:', err);
  process.exit(1);
});
