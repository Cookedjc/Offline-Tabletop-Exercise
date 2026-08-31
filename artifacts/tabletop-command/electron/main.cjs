const { app, BrowserWindow, screen } = require('electron');
const path = require('node:path');

let moderatorWindow;
let participantWindow;

function showWindowError(window, role, error) {
  const message = String(error?.message ?? error ?? 'Unknown renderer error');
  const escapedMessage = message.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]));
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Tabletop Command Center</title><style>body{margin:0;min-height:100vh;background:#020617;color:#f8fafc;font:16px Arial,sans-serif;display:grid;place-items:center}main{max-width:720px;margin:24px;padding:32px;border:1px solid #7f1d1d;border-radius:12px;background:#0f172a}h1{margin:0 0 12px;color:#fca5a5}p{color:#cbd5e1;line-height:1.6}pre{white-space:pre-wrap;background:#020617;padding:16px;border-radius:8px;color:#fecaca;font-size:13px}</style></head><body><main><h1>${role} window could not load</h1><p>Restart Tabletop Command Center. If the problem continues, confirm that the application folder was extracted completely.</p><pre>${escapedMessage}</pre></main></body></html>`;
  console.error(`[${role}] renderer failed: ${message}`);
  void window.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
}

function loadApplication(window, view) {
  const developmentUrl = process.env.ELECTRON_RENDERER_URL;
  const query = `view=${view}`;

  if (developmentUrl) {
    const separator = developmentUrl.includes('?') ? '&' : '?';
    return window.loadURL(`${developmentUrl}${separator}${query}`);
  }

  return window.loadFile(
    path.join(__dirname, '..', 'dist', 'public', 'index.html'),
    { query: { view } },
  );
}

function monitorWindow(window, role) {
  window.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (isMainFrame && errorCode !== -3) {
        showWindowError(
          window,
          role,
          `${errorDescription} (${errorCode})\n${validatedURL}`,
        );
      }
    },
  );

  window.webContents.on('render-process-gone', (_event, details) => {
    showWindowError(window, role, `Renderer process stopped: ${details.reason}`);
  });
}

function createWindows() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const externalDisplay = screen
    .getAllDisplays()
    .find((display) => display.id !== primaryDisplay.id);

  moderatorWindow = new BrowserWindow({
    x: primaryDisplay.workArea.x,
    y: primaryDisplay.workArea.y,
    width: Math.min(1600, Math.max(800, primaryDisplay.workArea.width)),
    height: Math.min(1000, Math.max(640, primaryDisplay.workArea.height)),
    minWidth: 800,
    minHeight: 640,
    backgroundColor: '#020617',
    title: 'Tabletop Command Center — Moderator',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const displayBounds = externalDisplay?.bounds ?? primaryDisplay.bounds;
  participantWindow = new BrowserWindow({
    x: displayBounds.x,
    y: displayBounds.y,
    width: displayBounds.width,
    height: displayBounds.height,
    fullscreen: Boolean(externalDisplay),
    autoHideMenuBar: true,
    backgroundColor: '#020617',
    title: 'Tabletop Command Center — Room Display',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  participantWindow.setMenuBarVisibility(false);
  monitorWindow(moderatorWindow, 'Moderator');
  monitorWindow(participantWindow, 'Room display');

  moderatorWindow.on('closed', () => {
    moderatorWindow = undefined;
    participantWindow?.close();
  });

  participantWindow.on('closed', () => {
    participantWindow = undefined;
  });

  void loadApplication(moderatorWindow, 'moderator').catch((error) => {
    showWindowError(moderatorWindow, 'Moderator', error);
  });
  void loadApplication(participantWindow, 'display').catch((error) => {
    showWindowError(participantWindow, 'Room display', error);
  });
}

app.whenReady().then(() => {
  createWindows();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindows();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});