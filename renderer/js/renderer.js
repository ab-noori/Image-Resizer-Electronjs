const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path'); 
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e) {
  const file = e.target.files[0];

  if(!isFileImage(file)) {
    alertError('Please select an image file');
    return
  }
 
  // Get original dimentions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = () => {
    widthInput.value = image.width;
    heightInput.value = image.height;
  };

  form.style.display = 'block';
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), 'imagesresizer');
}

// Send image data to main process

function sendImage(e) {
  e.preventDefault();

  const file = img.files[0];
  const imgPath = img.files[0].path;
  const width = widthInput.value;
  const height = heightInput.value;

  if(!file) {
    alertError('Please select an image file');
    return
  }

  if(!width || !height) {
    alertError('Please enter the width and height');
    return
  }

  // Send to main using ipcRenderer
  ipcRenderer.send('resize-image', { imgPath, width, height });
}

// Catch the image:done event
ipcRenderer.on('image:done', () => {
  alertSuccess(`Image resized to ${widthInput.value} x ${heightInput.value} successfully`);
}); 

// make sure file is image
function isFileImage(file) {
  const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/jpg'];
  return file && acceptedImageTypes.includes(file['type']);
}

const alertError = (message) => {
  Toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center',
    },
  });
} 

const alertSuccess = (message) => {
  Toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center',
    },
  });
} 

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);