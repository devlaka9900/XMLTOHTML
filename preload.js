const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectXML: () => ipcRenderer.invoke("select-xml-file")
});