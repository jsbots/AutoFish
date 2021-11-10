let { app, BrowserWindow, ipcMain } = require('electron');

function createWindow() {
  let win = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: false,
  	  nodeIntegration: true
    }
  });

  win.loadFile('./app/index.html');

  win.on('closed', () => {
    win = null;
  });

  win.once('ready-to-show', () => {
    win.show();
  })
}

app.whenReady().then(() => {
  createWindow();
})

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') {
    return false;
  }
  app.quit();
});
