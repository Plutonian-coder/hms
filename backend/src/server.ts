// ============================================================
// Server Entry Point
// ============================================================
import app from './app';
import { config } from './config';

const PORT = config.server.port;

app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║   YABATECH HMS Backend API                   ║
  ║   Running on http://localhost:${PORT}            ║
  ║   Environment: ${config.server.nodeEnv.padEnd(15)}         ║
  ╚══════════════════════════════════════════════╝
  `);
});
