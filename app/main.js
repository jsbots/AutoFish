let { app, BrowserWindow, ipcMain, Menu, dialog, desktopCapturer, shell } = require('electron');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800, // 350
    height: 1000, // 630
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

ipcMain.on('wrong-place', (event) => {
  dialog.showMessageBoxSync(win, {
  type: `warning`,
  title: `Warning!`,
  message: `It seems bot can't /cast fishing in this place, try to find another.`,
  buttons: [`Ok`],
  });
});

ipcMain.handle('lose-focus', (event) => {
  win.blur();
});

ipcMain.on('sound', () => {
  shell.beep();
})
