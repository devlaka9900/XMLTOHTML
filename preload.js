const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectFile: () => ipcRenderer.invoke('select-xml-file'),
  convertFile: (filePath) => ipcRenderer.invoke('convert-xml-to-html', filePath)
});