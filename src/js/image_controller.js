const baseUrl = 'http://kfz24.test.serverless.dev.s3-website.eu-central-1.amazonaws.com';
let transformations = {};
let timetrack = new Date().getTime();
let filename;
let onExtract = false;

const getImageSize = event => {
  console.log('fired');
  const url = event.target.src;
  const xhr = new XMLHttpRequest()
  xhr.onload = response => console.log(response);
  xhr.withCredentials = true;
  xhr.open('get', url, true);
  xhr.send();
};

const displayWindowSize = () => {
  const { outerWidth, outerHeight } = window;
  document.getElementById('js-window-size').innerText = `${outerWidth}x${outerHeight}`;
};

const startTimeTracking = () => {
  document.getElementById('js-timetrack').className = document.getElementById('js-timetrack').className.replace(' show', ' ');
  timetrack = new Date().getTime();
};

const endTimeTracking = () => {
  const timeTrack = document.getElementById('js-timetrack');
  const timeTrackDisplay = document.getElementById('js-timetrack-value');
  timeTrack.className = timeTrack.className.replace(' show', '');
  timeTrackDisplay.innerText = (new Date().getTime() - timetrack) / 1000;
  timeTrack.className += ' show';
};

const handleImageLoad = event => {
  const image = event.target;
  const { naturalWidth: width, naturalHeight: height } = image;
  // update image size display
  document.getElementById('js-image-size').innerText = `${width}x${height}`;
  document.getElementById('js-src-display').innerText = image.currentSrc;
  endTimeTracking();
};

const generateURL = (transformationsString = '', mediaWidth) => {
  transformationsString = mediaWidth && transformationsString ? `,${transformationsString}` : transformationsString;
  return `${baseUrl}/${mediaWidth ? `w_${mediaWidth}` : ''}${transformationsString}/${filename}`;
};

const initializeSources = () => {
  const images = document.getElementById('js-picture').children;
  for (let i = 0; i < images.length; i++) {
    switch (images[i].nodeName) {
    case 'SOURCE':
      images[i].srcset = generateURL('', images[i].attributes['data-width'].value);
      break;
    case 'IMG':
      images[i].src = generateURL();
      break;
    }
  }
  // extraction image
  document.getElementById('js-extracted-image').src = generateURL();
};

const setOnExtractOn = () => {
  onExtract = true;
  // display clear button
  document.getElementById('js-extract-clear-button').hidden = false;
  document.getElementById('js-extracted-image').parentNode.hidden = false;
  document.getElementById('js-picture').parentNode.hidden = true;
};

const setOnExtractOff = () => {
  onExtract = false;
  // hidde clear button
  document.getElementById('js-extract-clear-button').hidden = true;
  document.getElementById('js-extracted-image').parentNode.hidden = true;
  document.getElementById('js-picture').parentNode.hidden = false;
  delete transformations.ex;
  delete transformations.w;
  delete transformations.h;
  applyTransformations();
};

const applyTransformations = () => {
  const keys = Object.keys(transformations);
  const transformationsString = keys
    .filter(element => !!transformations[element])
    .map(element => `${element}_${transformations[element]}`)
    .join(',');

  if(onExtract) {
    const image = document.getElementById('js-extracted-image');
    image.src = generateURL(transformationsString);
  } else {
    const picture = document.getElementById('js-picture');
    const picChildren = picture.children;
    for (let i = 0; i < picChildren.length; i++) {
      switch (picChildren[i].nodeName) {
      case 'SOURCE':
        picChildren[i].srcset = generateURL(transformationsString, picChildren[i].attributes['data-width'].value);
        break;
      case 'IMG':
        picChildren[i].src = generateURL(transformationsString);
        break;
      }
    }
  }
  startTimeTracking();
};

const updateExampleImage = event => {
  const { value } = event.target;
  filename = value;
  applyTransformations();
  startTimeTracking();
};

const performTransform = ({ target }) => {
  const { value, attributes } = target;
  transformations[attributes['data-transform'].value] = value;
  applyTransformations();
};

const performExtraction = () => {
  setOnExtractOn();
  const form = document.forms.image_controlers;
  const coords = form.x.value && form.y.value ? `${form.x.value}x${form.y.value}` : false;
  const ex = coords || form.gravity.value;
  const w = form.width.value;
  const h = form.height.value;
  const q = form.quality.value;
  const f = form.format.value;
  transformations = {ex, w, h, q, f};
  applyTransformations(true);
};

const updateQualityDisplay = ({ target }) => {
  document.getElementById('js-qualityDisplay').innerText = `${target.value}%`;
};

const initializeInputs = () => {
  // examples
  const form = document.forms.image_controlers;
  form.example.forEach(input => input.addEventListener('change', updateExampleImage));
  form.format.forEach(input => input.addEventListener('change', performTransform));
  form.quality.addEventListener('change', performTransform);
  form.quality.addEventListener('input', updateQualityDisplay);
  form.extract.addEventListener('click', performExtraction);
  document.getElementById('js-extract-clear-button').addEventListener('click', setOnExtractOff);
  document.getElementById('js-extract-clear-button').hidden = true;
};

const initializeImageHandlers = () => {
  document.getElementById('js-image').addEventListener('load', handleImageLoad);
  document.getElementById('js-extracted-image').addEventListener('load', handleImageLoad);
};

window.onload = () => {
  initializeInputs();
  initializeImageHandlers();
  filename = document.forms.image_controlers.example.value;
  document.getElementById('js-extracted-image').parentNode.hidden = true;
  window.addEventListener('resize', displayWindowSize);
  displayWindowSize();
  initializeSources();
};
