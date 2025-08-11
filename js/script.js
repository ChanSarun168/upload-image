// Replace these with your actual keys
const cloudName = ''; // replace this
const unsignedUploadPreset = ''; // replace this

const imaggaApiKey = '';
const imaggaApiSecret = '';

const unsplashAccessKey = 'i25ZBDCmKcrOOzF0dhWnV3GlTFeC8F466csveqAgQOc';

// DOM Elements
const uploadBtn = document.querySelector('#uploadBtn');
const fileInput = document.querySelector('#upload-image');
const gallery = document.querySelector('.gallery');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessages = document.getElementById('errorMessages');

// Show/hide loading
function showLoading(show = true) {
  if (show) {
    loadingIndicator.classList.remove('hidden');
  } else {
    loadingIndicator.classList.add('hidden');
  }
}

// Show error message
function showError(message) {
  errorMessages.textContent = message;
  errorMessages.classList.remove('hidden');
  gallery.innerHTML = '';
}

// Clear error message
function clearError() {
  errorMessages.textContent = '';
  errorMessages.classList.add('hidden');
}

// Display images in gallery
function displayImages(images) {
  gallery.innerHTML = '';
  images.forEach(img => {
    const imgEl = document.createElement('img');
    imgEl.src = img.urls.small;
    imgEl.alt = img.alt_description || 'Unsplash Image';
    imgEl.className = 'gallery-img rounded-2xl cursor-pointer w-full object-cover mb-6';
    gallery.appendChild(imgEl);
  });
}

// Upload image to Cloudinary
async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', unsignedUploadPreset);

  const res = await fetch(url, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    throw new Error('Failed to upload image to Cloudinary');
  }
  return res.json();
}

// Get tags from Imagga API
async function getImaggaTags(imageUrl) {
  const auth = btoa(`${imaggaApiKey}:${imaggaApiSecret}`);
  const apiUrl = `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(imageUrl)}`;

  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `Basic ${auth}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to get tags from Imagga');
  }

  const data = await res.json();
  return data.result.tags;
}

// Search Unsplash API
async function searchUnsplash(query) {
  const url = `https://api.unsplash.com/search/photos?client_id=${unsplashAccessKey}&query=${encodeURIComponent(query)}&per_page=20`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Unsplash API error');
  }
  const data = await res.json();
  return data.results;
}

// Main upload handler
uploadBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  clearError();
  showLoading(true);
  gallery.innerHTML = '';

  try {
    // 1. Upload to Cloudinary
    const uploaded = await uploadToCloudinary(file);

    // 2. Analyze with Imagga
    const tags = await getImaggaTags(uploaded.secure_url);

    if (!tags || tags.length === 0) {
      throw new Error('No tags found for this image');
    }

    // Take top tag
    const topTag = tags[0].tag.en;

    // 3. Search Unsplash using top tag
    const unsplashResults = await searchUnsplash(topTag);

    if (!unsplashResults || unsplashResults.length === 0) {
      throw new Error('No similar images found on Unsplash');
    }

    // 4. Display images
    displayImages(unsplashResults);
  } catch (error) {
    showError(error.message);
  } finally {
    showLoading(false);
    // Clear the file input so same file can be selected again if needed
    fileInput.value = '';
  }
});
