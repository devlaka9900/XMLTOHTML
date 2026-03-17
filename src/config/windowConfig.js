const path = require("path"); // import path helper

function getMainWindowConfig() {
  return {
    width: 840, // set window width
    height: 540, // set window height
    useContentSize: true, // use content area size
    webPreferences: {
      preload: path.join(__dirname, "..", "..", "preload.js"), // set preload file path
      contextIsolation: true, // isolate renderer from node
      nodeIntegration: false // disable require in renderer
    }
  };
}

module.exports = {
  getMainWindowConfig // export config function
};