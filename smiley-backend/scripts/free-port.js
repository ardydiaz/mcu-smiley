import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

const port = Number(process.env.PORT) || 5000;

function listeningPidsWindows() {
  let output;
  try {
    output = execSync(`netstat -ano -p tcp | findstr :${port}`, { encoding: 'utf8' });
  } catch {
    return [];
  }
  const pids = new Set();
  for (const line of output.split('\n')) {
    const match = line.match(/LISTENING\s+(\d+)/);
    if (match) pids.add(match[1]);
  }
  return [...pids];
}

function parentPidWindows(pid) {
  try {
    const output = execSync(
      `powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}').ParentProcessId"`,
      { encoding: 'utf8' },
    ).trim();
    return /^\d+$/.test(output) ? output : null;
  } catch {
    return null;
  }
}

function killTreeWindows(pid) {
  try {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function freePortWindows() {
  // node --watch runs as a supervisor process that respawns a child on
  // every restart. Killing only the child that's bound to the port lets
  // the supervisor immediately spawn a replacement and re-take the port,
  // so the parent (and its whole tree) has to go too.
  for (let attempt = 0; attempt < 3; attempt++) {
    const pids = listeningPidsWindows();
    if (!pids.length) return;
    for (const pid of pids) {
      const parentPid = parentPidWindows(pid);
      let killed = false;
      if (parentPid) killed = killTreeWindows(parentPid) || killed;
      killed = killTreeWindows(pid) || killed;
      if (killed) console.log(`Freed port ${port} (stopped stale dev server tree at PID ${parentPid || pid})`);
    }
  }
}

function freePortPosix() {
  for (let attempt = 0; attempt < 3; attempt++) {
    let output;
    try {
      output = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' }).trim();
    } catch {
      return;
    }
    const pids = output.split('\n').filter(Boolean);
    if (!pids.length) return;
    for (const pid of pids) {
      let parentPid = null;
      try {
        parentPid = execSync(`ps -o ppid= -p ${pid}`, { encoding: 'utf8' }).trim() || null;
      } catch {
        // Process already gone.
      }
      for (const id of new Set([parentPid, pid].filter(Boolean))) {
        try {
          execSync(`kill -9 ${id}`);
        } catch {
          // Already gone.
        }
      }
      console.log(`Freed port ${port} (stopped stale dev server tree at PID ${parentPid || pid})`);
    }
  }
}

if (process.platform === 'win32') freePortWindows();
else freePortPosix();
