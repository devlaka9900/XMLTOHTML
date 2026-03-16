const btn = document.getElementById("selectXmlBtn");

// UI element for displaying the selected file path
const filePathEl = document.getElementById("filePath");

// UI elements for displaying XML metadata
const contentTitleEl = document.getElementById("contentTitle");
const urlValueEl = document.getElementById("urlValue");
const issuedateEl = document.getElementById("issuedate");
const providerValueEl = document.getElementById("providerValue");

// UI elements for displaying parsed XML statistics / counts
const h1CountEl = document.getElementById("h1Count");
const totalLinksEl = document.getElementById("totalLinks");
const totalImagesEl = document.getElementById("totalImages");
const totalFootnotesEl = document.getElementById("totalFootnotes");

// Event listener for the "Choose XML" button
btn.addEventListener("click", async () => {
  // small loading state
  filePathEl.textContent = "Selecting XML...";
  h1CountEl.textContent = "...";
  contentTitleEl.textContent = "...";
  urlValueEl.textContent = "...";
  issuedateEl.textContent = "...";
  providerValueEl.textContent = "...";
  totalLinksEl.textContent = "...";
  totalImagesEl.textContent = "...";
  totalFootnotesEl.textContent = "...";

  try {
    // Invoke the IPC handler exposed via preload.js (xml:select-and-analyze)
    const res = await window.api.selectXmlAndAnalyze();

    // If the user canceled the dialog or no file was selected, clear the UI
    if (!res) {
      filePathEl.textContent = "No file selected.";
      h1CountEl.textContent = "-";
      contentTitleEl.textContent = "-";
      urlValueEl.textContent = "-";
      issuedateEl.textContent = "-";
      providerValueEl.textContent = "-";
      totalLinksEl.textContent = "-";
      totalImagesEl.textContent = "-";
      totalFootnotesEl.textContent = "-";
      return;
    }

    // fill UI from backend results by binding the returned object properties to the elements text content
    filePathEl.textContent = res.filePath;

    

    contentTitleEl.textContent = res.contentTitle || "-";
    urlValueEl.textContent = res.urlValue || "-";
    issuedateEl.textContent = res.issuedate || "-";
    providerValueEl.textContent = res.providerValue || "-";

    h1CountEl.textContent = String(res.totalH);
    totalLinksEl.textContent = String(res.totalLinks);
    totalImagesEl.textContent = String(res.totalImages);
    totalFootnotesEl.textContent = String(res.totalFootnotes);
  } catch (err) {
    console.error(err);
    filePathEl.textContent = "Error reading XML.";
  }
});