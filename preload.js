const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectXmlAndAnalyze: () => ipcRenderer.invoke("xml:select-and-analyze")
});