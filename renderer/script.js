const btn = document.getElementById("selectXmlBtn");
const filePathDisplay = document.getElementById("filePath");

btn.addEventListener("click", async () => {
  const filePath = await window.api.selectXML();

  if (filePath) {
    filePathDisplay.textContent = "Selected: " + filePath;
  } else {
    filePathDisplay.textContent = "No file selected.";
  }
});