const { dialog } = require("electron"); // import electron dialog
const path = require("path"); // import path helper
const fs = require("fs/promises"); // import async file system api

async function openXmlFileDialog() {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"], // allow selecting one file
    filters: [{ name: "XML Files", extensions: ["xml"] }] // limit to xml files
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null; // return null if user cancels
  }

  return result.filePaths[0]; // return selected file path
}

async function saveHtmlFileDialog(defaultFileName) {
  const result = await dialog.showSaveDialog({
    defaultPath: defaultFileName, // set suggested save name
    filters: [{ name: "HTML Files", extensions: ["html"] }] // limit to html extension
  });

  if (result.canceled || !result.filePath) {
    return null; // return null if user cancels
  }

  return result.filePath; // return chosen save path
}

async function readTextFile(filePath) {
  return fs.readFile(filePath, "utf-8"); // read text file as utf-8
}

async function writeTextFile(filePath, content) {
  await fs.writeFile(filePath, content, "utf-8"); // write text file as utf-8
}

function buildDefaultHtmlFileName(originalXmlPath) {
  return path.basename(originalXmlPath, path.extname(originalXmlPath)) + ".html"; // change original extension to .html
}

module.exports = {
  openXmlFileDialog, // export open dialog helper
  saveHtmlFileDialog, // export save dialog helper
  readTextFile, // export file read helper
  writeTextFile, // export file write helper
  buildDefaultHtmlFileName // export default name helper
};