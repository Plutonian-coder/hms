// ============================================================
// Server Entry Point
// ============================================================
import app from './app';
import { config } from './config';

const PORT = config.server.port;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║   YABATECH HMS Backend API                   ║
  ║   Running on http://0.0.0.0:${PORT}             ║
  ║   Environment: ${config.server.nodeEnv.padEnd(15)}         ║
  ╚══════════════════════════════════════════════╝
  `);
});
