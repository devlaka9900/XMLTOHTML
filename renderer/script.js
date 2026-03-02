const uploadBtn = document.getElementById('uploadBtn');
const convertBtn = document.getElementById('convertBtn');
const filePathDisplay = document.getElementById('filePath');
const status = document.getElementById('status');

let selectedFilePath = null;

uploadBtn.addEventListener('click', async () => {
  const filePath = await window.api.selectFile();

  if (filePath) {
    selectedFilePath = filePath;
    filePathDisplay.textContent = filePath;
    convertBtn.disabled = false;
    status.textContent = '';
  }
});

convertBtn.addEventListener('click', async () => {
  if (!selectedFilePath) return;

  status.textContent = 'Processing...';

  const result = await window.api.convertFile(selectedFilePath);

  if (result.success) {
    status.textContent = 'Conversion successful! 🎉';
  } else {
    status.textContent = 'Error: ' + (result.error || 'Operation cancelled');
  }
});