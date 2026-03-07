const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Desktop notifications
  notify: (title, body) => ipcRenderer.send('notify', { title, body }),
  // Platform detection
  platform: process.platform,
  isElectron: true,
  version: process.env.npm_package_version || '1.0.0',
  // Navigation
  navigate: (path) => ipcRenderer.send('navigate', path),
  // Get platform async
  getPlatform: () => ipcRenderer.invoke('get-platform'),
});
