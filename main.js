const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs/promises"); // Node async file read

function createWindow() {
  const win = new BrowserWindow({
    width: 840,
    height: 540,
    useContentSize: true, // width/height = content area size (not including window frame)
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // preload runs before renderer loads
      contextIsolation: true, // security: renderer can't access Node directly
      nodeIntegration: false  // security: disable require() in renderer
    }
  });

  win.loadFile("renderer/index.html");
}

app.whenReady().then(createWindow);

// Listen for when all application windows are closed
// Optional (recommended): quit properly on Windows/Linux when all windows closed
app.on("window-all-closed", () => {
  // On macOS (darwin), it's common for apps to stay open until the user explicitly quits
  if (process.platform !== "darwin") app.quit();
});

/**
 * Renderer calls: window.api.selectXmlAndCountH1()
 * Main does:
 *  1) open file dialog
 *  2) read selected XML
 *  3) count <h1> tags
 *  4) return { filePath, h1Count }
 */
ipcMain.handle("xml:select-and-analyze", async () => {
  // 1) Open a system dialog to let the user select an XML file
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "XML Files", extensions: ["xml"] }]
  });

  // If the user canceled the dialog or didn't select any files, return null to the renderer
  if (result.canceled || result.filePaths.length === 0) return null;

  // 2) Get the selected file path and read the XML file content synchronously as a string
  const filePath = result.filePaths[0];
  const xml = await fs.readFile(filePath, "utf-8");

  // ---------- helper functions ----------
  // Helper: Count occurrences of an opening tag in the XML string using Regex.
  // It handles simple `<tag>` as well as tags with attributes `<tag attr="...">`.
  const countTag = (tag) => {
    // \b ensures we match the exact tag name, [^>]* matches any attributes before the closing >
    const re = new RegExp(`<${tag}\\b[^>]*>`, "gi");
    const m = xml.match(re);
    return m ? m.length : 0;
  };

  // Helper: Get the first inner text content of a specified tag: <tag>TEXT</tag>
  const firstTagText = (tag) => {
    // ([\s\S]*?) non-greedily captures the inner content, including newlines
    const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
    const m = xml.match(re);
    return m ? m[1].trim() : "";
  };


  const contentTitle = firstTagText("h1");
  const urlValue = firstTagText("url-link"); // get text inside <url-link> tag
  const issuedate = firstTagText("issue-date") || "";

  let providerValue = ""; // store final provider value

  try {
    // match <title>...</title> followed by <level ... num="X" ...>
    const levelRuleMatch = xml.match(
      /<title\b[^>]*>[\s\S]*?<\/title>\s*<level\b[^>]*\bnum="(\d+)"/i
    ); // capture the num value from the level tag after title

    if (levelRuleMatch) { // check whether regex found a match
      const num = Number(levelRuleMatch[1]); // convert captured num string to number
      providerValue = num === 0 ? "Provider 3 CUBE" : "Other Vendor"; // decide provider based on num
    }
  } catch (error) {
    console.error("Error extracting num value:", error.message); // log any extraction error
  }

  let totalH = 0; 
  for (let i = 1; i <= 10; i++) { 
    totalH += countTag(`h${i}`); 
  }
  const totalLinks = countTag("url");
  const totalImages = countTag("img");
  const totalFootnotes = countTag("footnote-ref");

  // 4) Return all the extracted metadata to the renderer process
  return {
    filePath,
    contentTitle,
    urlValue,
    issuedate,
    providerValue,
    totalH,
    totalLinks,
    totalImages,
    totalFootnotes
  };
});