import { execSync } from 'node:child_process';

const port = Number(process.env.PORT) || 5173;

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
  // Whatever's holding the port - our own stale dev server, or a
  // completely unrelated project that happened to grab it first - gets
  // its whole process tree stopped so this project reliably owns the port.
  for (let attempt = 0; attempt < 3; attempt++) {
    const pids = listeningPidsWindows();
    if (!pids.length) return;
    for (const pid of pids) {
      const parentPid = parentPidWindows(pid);
      let killed = false;
      if (parentPid) killed = killTreeWindows(parentPid) || killed;
      killed = killTreeWindows(pid) || killed;
      if (killed) console.log(`Freed port ${port} (stopped process tree at PID ${parentPid || pid})`);
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
      console.log(`Freed port ${port} (stopped process tree at PID ${parentPid || pid})`);
    }
  }
}

if (process.platform === 'win32') freePortWindows();
else freePortPosix();
