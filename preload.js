const { contextBridge, ipcRenderer } = require("electron"); // import secure bridge tools

contextBridge.exposeInMainWorld("api", {
  selectXmlAndAnalyze: () => ipcRenderer.invoke("xml:select-and-analyze"), // expose xml select/analyze function
  saveHtmlFile: (htmlContent, originalXmlPath) =>
    ipcRenderer.invoke("xml:save-html-file", htmlContent, originalXmlPath) // expose html save function
});