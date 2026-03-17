const { app, BrowserWindow } = require("electron"); // import Electron app and window
const path = require("path"); // import path helper

const { getMainWindowConfig } = require("./src/config/windowConfig"); // import window config
const { registerXmlIpcHandlers } = require("./src/ipc/xmlIpc"); // import IPC registration

function createWindow() {
  const win = new BrowserWindow(getMainWindowConfig()); // create browser window using config

  win.loadFile(path.join(__dirname, "renderer", "index.html")); // load renderer html
}

app.whenReady().then(() => {
  registerXmlIpcHandlers(); // register IPC handlers once app is ready
  createWindow(); // create the main window
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(); // recreate window on macOS when dock icon is clicked
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit(); // quit app on non-mac platforms
  }
});
 