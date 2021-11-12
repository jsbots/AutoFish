let { app, BrowserWindow, ipcMain, Menu } = require('electron');

function createWindow() {
  let win = new BrowserWindow({
    width: 800, // 400
    height: 600, // 500
    show: false,
    webPreferences: {
      contextIsolation: false,
  	  nodeIntegration: true
    }
  });

  win.resizable = false;
  win.loadFile('./app/index.html');

  win.on('closed', () => {
    win = null;
  });

  win.once('ready-to-show', () => {
    win.webContents.openDevTools()
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

Menu.setApplicationMenu(null)
