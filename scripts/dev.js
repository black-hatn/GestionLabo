const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\x1b[35m%s\x1b[0m', '🚀 Démarrage du projet NovaBio Lab (Backend + Frontend)...');

// 1. Nettoyage automatique du port 8000 (Backend) et 3000 (Frontend) si occupés
function killPort(port) {
  if (process.platform === 'linux') {
    try {
      const pids = execSync(`lsof -t -i:${port}`, { encoding: 'utf8' }).trim();
      if (pids) {
        console.log('\x1b[33m%s\x1b[0m', `⚠️ Port ${port} occupé par PID(s) : ${pids.split('\n').join(', ')}. Libération...`);
        pids.split('\n').forEach(pid => {
          try {
            process.kill(pid, 'SIGKILL');
          } catch (e) {}
        });
      }
    } catch (err) {
      // Le port est déjà libre
    }
  }
}

killPort(8000);
killPort(3000);

// 2. Détection automatique du dossier venv du Backend (.venv ou venv)
const backendDir = path.join(__dirname, '..', 'backend');
let pythonBinPath = null;

const venvNames = ['.venv', 'venv'];
for (const venvName of venvNames) {
  const binFolder = process.platform === 'win32' ? 'Scripts' : 'bin';
  const uvicornPath = path.join(backendDir, venvName, binFolder, 'uvicorn');
  const uvicornExePath = path.join(backendDir, venvName, binFolder, 'uvicorn.exe');

  if (fs.existsSync(uvicornExePath) || fs.existsSync(uvicornPath)) {
    pythonBinPath = path.join(backendDir, venvName, binFolder);
    break;
  }
}

if (!pythonBinPath) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Erreur : Environnement virtuel Python (.venv ou venv) introuvable dans backend/.');
  console.error('\x1b[31m%s\x1b[0m', 'Veuillez lancer setup.sh d\'abord.');
  process.exit(1);
}

// 3. Lancement du Backend
const uvicornCmd = process.platform === 'win32' ? 'uvicorn.exe' : 'uvicorn';
const backend = spawn(path.join(pythonBinPath, uvicornCmd), ['app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'], {
  cwd: backendDir,
  shell: process.platform === 'win32'
});

// 4. Lancement du Frontend
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'frontend'),
  shell: process.platform === 'win32'
});

// 5. Affichage des Logs Formatés
function formatLog(prefix, color, data) {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      console.log(`${color}[${prefix}]\x1b[0m ${line}`);
    }
  });
}

backend.stdout.on('data', data => formatLog('BACKEND', '\x1b[34m', data));
backend.stderr.on('data', data => formatLog('BACKEND', '\x1b[34m', data));

frontend.stdout.on('data', data => formatLog('FRONTEND', '\x1b[32m', data));
frontend.stderr.on('data', data => formatLog('FRONTEND', '\x1b[32m', data));

// 6. Gestion propre de l'arrêt (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\x1b[35m%s\x1b[0m', '\n👋 Arrêt des serveurs de développement...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});
