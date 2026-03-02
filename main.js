const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


// Open XML File
ipcMain.handle('select-xml-file', async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: 'XML Files', extensions: ['xml'] }],
    properties: ['openFile']
  });

  if (result.canceled) return null;

  return result.filePaths[0];
});


// Convert XML → HTML
ipcMain.handle('convert-xml-to-html', async (event, filePath) => {
  try {
    const xmlData = fs.readFileSync(filePath, 'utf-8');

    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlData);

    // Simple HTML generation
    let htmlContent = `
      <html>
      <head>
        <title>Converted XML</title>
      </head>
      <body>
        <pre>${JSON.stringify(jsonObj, null, 2)}</pre>
      </body>
      </html>
    `;

    const saveResult = await dialog.showSaveDialog({
      defaultPath: 'converted.html'
    });

    if (saveResult.canceled) return { success: false };

    fs.writeFileSync(saveResult.filePath, htmlContent);

    return { success: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
});