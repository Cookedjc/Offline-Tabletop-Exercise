const { app, BrowserWindow, screen } = require('electron');
const path = require('node:path');

let moderatorWindow;
let participantWindow;

function loadApplication(window, view) {
  const developmentUrl = process.env.ELECTRON_RENDERER_URL;

  if (developmentUrl) {
    const separator = developmentUrl.includes('?') ? '&' : '?';
    return window.loadURL(
      view === 'display'
        ? `${developmentUrl}${separator}view=display`
        : developmentUrl,
    );
  }

  return window.loadFile(
    path.join(__dirname, '..', 'dist', 'public', 'index.html'),
    view === 'display' ? { query: { view: 'display' } } : undefined,
  );
}

function createWindows() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const externalDisplay = screen
    .getAllDisplays()
    .find((display) => display.id !== primaryDisplay.id);

  moderatorWindow = new BrowserWindow({
    x: primaryDisplay.workArea.x,
    y: primaryDisplay.workArea.y,
    width: Math.min(1600, primaryDisplay.workArea.width),
    height: Math.min(1000, primaryDisplay.workArea.height),
    minWidth: 1180,
    minHeight: 760,
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

  moderatorWindow.on('closed', () => {
    moderatorWindow = undefined;
    participantWindow?.close();
  });

  participantWindow.on('closed', () => {
    participantWindow = undefined;
  });

  void loadApplication(moderatorWindow, 'moderator');
  void loadApplication(participantWindow, 'display');
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