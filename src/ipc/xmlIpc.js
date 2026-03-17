const { ipcMain } = require("electron"); // import ipc main
const {
  openXmlFileDialog,
  saveHtmlFileDialog,
  readTextFile,
  writeTextFile,
  buildDefaultHtmlFileName
} = require("../services/fileService"); // import file helpers
const { processXml } = require("../services/xmlService"); // import xml processing service

function registerXmlIpcHandlers() {
  ipcMain.handle("xml:select-and-analyze", async () => {
    const selectedFilePath = await openXmlFileDialog(); // open xml picker

    if (!selectedFilePath) {
      return null; // return null if user cancels
    }

    const xmlContent = await readTextFile(selectedFilePath); // read xml file content
    const processedResult = processXml(xmlContent); // process xml and generate html

    return {
      filePath: selectedFilePath, // return selected file path
      ...processedResult // return xml analysis and generated html
    };
  });

  ipcMain.handle("xml:save-html-file", async (event, htmlContent, originalXmlPath) => {
    const defaultFileName = buildDefaultHtmlFileName(originalXmlPath); // build default html file name
    const savePath = await saveHtmlFileDialog(defaultFileName); // open save dialog

    if (!savePath) {
      return { success: false }; // return false if user cancels save
    }

    await writeTextFile(savePath, htmlContent); // write html file to disk

    return {
      success: true, // indicate save success
      savedPath: savePath // return saved file path
    };
  });
}

module.exports = {
  registerXmlIpcHandlers // export register function
};