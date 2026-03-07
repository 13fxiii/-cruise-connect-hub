const { app, BrowserWindow, shell, Menu, Tray, nativeImage, ipcMain, Notification, session } = require('electron');
const path   = require('path');
const os     = require('os');

const APP_URL  = 'https://cruise-connect-hub.netlify.app';
const APP_NAME = 'Cruise Connect Hub';
const isDev    = process.env.NODE_ENV === 'development';

let mainWindow, tray, splashWindow;

// ── Security ──────────────────────────────────────────────────
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(APP_URL) || url.startsWith('https://xiyjgcoeljquryixmfut.supabase.co')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });
  // Block navigation to dangerous domains
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith(APP_URL) &&
        !url.startsWith('https://xiyjgcoeljquryixmfut.supabase.co') &&
        !url.startsWith('https://paystack.co') &&
        !url.startsWith('about:blank')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
});

// ── Platform icon helper ──────────────────────────────────────
function getIcon() {
  const base = path.join(__dirname, 'icons');
  if (process.platform === 'win32')  return path.join(base, 'icon.ico');
  if (process.platform === 'darwin') return path.join(base, 'icon.png');
  return path.join(base, 'icon.png');
}

// ── Splash window ─────────────────────────────────────────────
function createSplash() {
  splashWindow = new BrowserWindow({
    width: 380, height: 280,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    skipTaskbar: true,
    center: true,
    backgroundColor: '#0a0a0a',
    icon: getIcon(),
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });

  const splashHTML = `<!DOCTYPE html>
  <html><head><meta charset="UTF-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: system-ui, sans-serif;
      background: #0a0a0a;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      border-radius: 16px;
      border: 1px solid rgba(234,179,8,0.2);
    }
    img { width:80px; height:80px; border-radius:16px; margin-bottom:16px; }
    h1 { font-size:16px; font-weight:800; margin-bottom:6px; }
    .sub { font-size:11px; color:#666; margin-bottom:20px; }
    .bar { width:160px; height:3px; background:#1a1a1a; border-radius:2px; overflow:hidden; }
    .fill { width:0; height:100%; background:#EAB308; border-radius:2px; animation: load 1.8s ease forwards; }
    @keyframes load { 0%{width:0} 60%{width:70%} 100%{width:100%} }
  </style></head>
  <body>
    <img src="${path.join(__dirname, 'icons', 'icon.png').replace(/\\/g,'/')}" />
    <h1>Cruise Connect Hub〽️</h1>
    <div class="sub">The home of Naija culture</div>
    <div class="bar"><div class="fill"></div></div>
  </body></html>`;

  const tmpPath = path.join(os.tmpdir(), 'cc-hub-splash.html');
  require('fs').writeFileSync(tmpPath, splashHTML);
  splashWindow.loadFile(tmpPath);
}

// ── Main window ───────────────────────────────────────────────
function createWindow() {
  const { screen } = require('electron');
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width:     Math.min(1280, width),
    height:    Math.min(860, height),
    minWidth:  380,
    minHeight: 600,
    center:    true,
    title:     APP_NAME,
    backgroundColor: '#0a0a0a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    icon: getIcon(),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: isDev,
    },
  });

  // Set user agent (mobile-friendly)
  mainWindow.webContents.setUserAgent(
    'Mozilla/5.0 (compatible; CruiseConnectHub/1.0; Electron/' + process.versions.electron + ')'
  );

  mainWindow.loadURL(APP_URL);

  mainWindow.once('ready-to-show', () => {
    // Smooth transition: close splash, show main
    if (splashWindow && !splashWindow.isDestroyed()) {
      setTimeout(() => {
        splashWindow.close();
        splashWindow = null;
        mainWindow.show();
        if (isDev) mainWindow.webContents.openDevTools();
      }, 1800); // Let splash animation finish
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('close', (event) => {
    if (process.platform !== 'darwin' && tray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
  buildMenu();
}

// ── System tray ───────────────────────────────────────────────
function createTray() {
  try {
    const tp = path.join(__dirname, 'icons',
      process.platform === 'win32' ? 'tray.ico' : 'tray.png');
    const ni = nativeImage.createFromPath(tp);
    tray = new Tray(ni.isEmpty() ? nativeImage.createEmpty() : ni);
  } catch { tray = new Tray(nativeImage.createEmpty()); }

  tray.setToolTip(APP_NAME);
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '🚌 Open CC Hub',  click: () => { mainWindow?.show(); mainWindow?.focus(); }},
    { type: 'separator' },
    { label: '📰 Feed',   click: () => navigate('/feed') },
    { label: '🎮 Games',  click: () => navigate('/games') },
    { label: '🎵 Music',  click: () => navigate('/music') },
    { label: '💳 Wallet', click: () => navigate('/wallet') },
    { type: 'separator' },
    { label: 'Quit', click: () => { tray?.destroy(); app.quit(); }},
  ]));
  tray.on('click', () => { mainWindow?.show(); mainWindow?.focus(); });
}

function navigate(p) {
  mainWindow?.show();
  mainWindow?.loadURL(APP_URL + p);
}

// ── App menu ─────────────────────────────────────────────────
function buildMenu() {
  const isMac = process.platform === 'darwin';
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(isMac ? [{ label: app.name, submenu: [
      { role: 'about' }, { type: 'separator' },
      { role: 'services' }, { type: 'separator' },
      { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
      { type: 'separator' }, { role: 'quit' },
    ]}] : []),
    { label: 'File', submenu: [
      { label: 'Home',    click: () => navigate('/') },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' },
    ]},
    { label: 'Navigate', submenu: [
      { label: '📰 Feed',         click: () => navigate('/feed') },
      { label: '🎤 Live Spaces',  click: () => navigate('/spaces') },
      { label: '🎮 Games',        click: () => navigate('/games') },
      { label: '🎵 Music Hub',    click: () => navigate('/music') },
      { label: '🎬 Movie Hub',    click: () => navigate('/movies') },
      { label: '💳 Wallet',       click: () => navigate('/wallet') },
      { label: '🛍️ Shop',         click: () => navigate('/shop') },
      { label: '💼 Jobs',         click: () => navigate('/jobs') },
      { label: '📣 PR/ADS',       click: () => navigate('/ads') },
      { label: '🏆 Leaderboard',  click: () => navigate('/leaderboard') },
      { label: '⭐ Community ID', click: () => navigate('/community-id') },
    ]},
    { label: 'Edit', submenu: [
      { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
    ]},
    { label: 'View', submenu: [
      { role: 'reload' }, { role: 'forceReload' },
      { type: 'separator' }, { role: 'togglefullscreen' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      ...(isDev ? [{ type: 'separator' }, { role: 'toggleDevTools' }] : []),
    ]},
    { role: 'window', submenu: [
      { role: 'minimize' }, { role: 'zoom' },
      ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : []),
    ]},
    { role: 'help', submenu: [
      { label: 'X Community', click: () => shell.openExternal('https://x.com/i/communities/1897164314764579242') },
      { label: 'Follow @CCHub_', click: () => shell.openExternal('https://x.com/CCHub_') },
    ]},
  ]));
}

// ── App lifecycle ─────────────────────────────────────────────
app.whenReady().then(() => {
  createSplash();
  createWindow();
  if (process.platform !== 'darwin') createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else { mainWindow?.show(); mainWindow?.focus(); }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { tray?.destroy(); app.quit(); }
});

// ── IPC bridge ────────────────────────────────────────────────
ipcMain.on('notify', (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, icon: path.join(__dirname, 'icons', 'icon.png') }).show();
  }
});

ipcMain.on('navigate', (_, p) => navigate(p));

ipcMain.handle('get-platform', () => process.platform);

// ── Deep links: ccapp://games ─────────────────────────────────
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('ccapp', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('ccapp');
}

app.on('open-url', (event, url) => {
  event.preventDefault();
  const p = url.replace('ccapp:/', '') || '/';
  navigate(p);
});
