const btn = document.getElementById("selectXmlBtn"); // get main button
const filePathEl = document.getElementById("filePath"); // get path/status display

let generatedHtml = null; // store generated html for later download
let selectedXmlPath = null; // store selected xml path
let mode = "choose"; // track current button mode

const contentTitleEl = document.getElementById("contentTitle"); // get content title element
const urlValueEl = document.getElementById("urlValue"); // get url value element
const issuedateEl = document.getElementById("issuedate"); // get issue date element
const providerValueEl = document.getElementById("providerValue"); // get provider value element

const h1CountEl = document.getElementById("h1Count"); // get heading count element
const totalLinksEl = document.getElementById("totalLinks"); // get links count element
const totalImagesEl = document.getElementById("totalImages"); // get images count element
const totalFootnotesEl = document.getElementById("totalFootnotes"); // get footnotes count element

function setLoadingState() {
  filePathEl.textContent = "Selecting XML..."; // show loading text
  h1CountEl.textContent = "..."; // show loading for heading count
  contentTitleEl.textContent = "..."; // show loading for title
  urlValueEl.textContent = "..."; // show loading for url
  issuedateEl.textContent = "..."; // show loading for issue date
  providerValueEl.textContent = "..."; // show loading for provider
  totalLinksEl.textContent = "..."; // show loading for links
  totalImagesEl.textContent = "..."; // show loading for images
  totalFootnotesEl.textContent = "..."; // show loading for footnotes
}

function resetDisplayState(message = "No file selected.") {
  filePathEl.textContent = message; // show default message
  h1CountEl.textContent = "-"; // reset heading count
  contentTitleEl.textContent = "-"; // reset title
  urlValueEl.textContent = "-"; // reset url
  issuedateEl.textContent = "-"; // reset issue date
  providerValueEl.textContent = "-"; // reset provider
  totalLinksEl.textContent = "-"; // reset links
  totalImagesEl.textContent = "-"; // reset images
  totalFootnotesEl.textContent = "-"; // reset footnotes
}

btn.addEventListener("click", async () => {
  if (mode === "choose") {
    setLoadingState(); // set loading state before opening xml

    try {
      const res = await window.api.selectXmlAndAnalyze(); // ask backend to select and process xml

      if (!res) {
        resetDisplayState(); // reset ui if canceled
        return; // stop flow
      }

      generatedHtml = res.htmlContent; // store generated html
      selectedXmlPath = res.filePath; // store selected xml path

      filePathEl.textContent = res.filePath; // show selected file path
      contentTitleEl.textContent = res.contentTitle || "-"; // show title
      urlValueEl.textContent = res.urlValue || "-"; // show url
      issuedateEl.textContent = res.issuedate || "-"; // show issue date
      providerValueEl.textContent = res.providerValue || "-"; // show provider
      h1CountEl.textContent = String(res.totalH); // show heading count
      totalLinksEl.textContent = String(res.totalLinks); // show links count
      totalImagesEl.textContent = String(res.totalImages); // show images count
      totalFootnotesEl.textContent = String(res.totalFootnotes); // show footnotes count

      btn.textContent = "Download HTML"; // change button label
      mode = "download"; // switch to download mode
    } catch (error) {
      console.error(error); // log error
      resetDisplayState("Error reading XML."); // show error state
    }

    return; // stop after choose mode
  }

  if (mode === "download") {
    try {
      if (!generatedHtml || !selectedXmlPath) {
        filePathEl.textContent = "No generated HTML found."; // guard against empty html
        return; // stop if missing html
      }

      const saveResult = await window.api.saveHtmlFile(generatedHtml, selectedXmlPath); // ask backend to save html

      if (saveResult && saveResult.success) {
        filePathEl.textContent = `HTML saved: ${saveResult.savedPath}`; // show saved path
      } else {
        filePathEl.textContent = "Save canceled."; // show cancel message
      }
    } catch (error) {
      console.error(error); // log error
      filePathEl.textContent = "Error saving HTML."; // show save error
    }
  }
});