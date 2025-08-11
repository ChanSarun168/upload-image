const generateForm = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");

// const OPENAI_API_KEY = "";
let isImageCardLoading = false;

const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
        const imgCard = imageGallery.querySelectorAll(".img-card")[index];
        const imgElement = imgCard.querySelector("img");
        const downloadBtn = imgCard.querySelector(".download-btn");

        const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
        imgElement.src = aiGeneratedImage;

        // when the image is loaded, remove the loading class and set the download link
        imgElement.onload = () =>  {
            imgCard.classList.remove("loading");
            downloadBtn.setAttribute("href", aiGeneratedImage);
            downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
        }
    });
}

const generateAiImage = async (userPrompt, userImageQuantity) => {
    try {
        // sent a request to OpenAI API to generate images based on user input
        const respon = await fetch("https://api.openai.com/v1/images/generations", {
             method: "POST",
             headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
             },
             body: JSON.stringify({
              model: "gpt-image-1",   // ✅ required now
              prompt: userPrompt,
              n: parseInt(userImageQuantity),
              size: "512x512",
              response_format: "b64_json"
          })

        });

        // check if the response is ok
        // if not, throw an error
        if (!respon.ok) throw new Error("Failed to generate images! Please try again later.");

        // get data from the response
        const data = await respon.json();
        updateImageCard([...data])
    } catch (error) {
        alert(error.message);
    }
}

const handleFormSubmission = (e) => {
    e.preventDefault();

    // Ger user input and image quantity values from the form
    const userPrompt = e.srcElement[0].value;
    const userImgQuantity = e.srcElement[1].value;

    const imgCardMarkup = Array.from({ length: userImgQuantity }, () => 
        `<div class="img-card loading">
            <i class="fa-solid fa-spinner"></i>
            <a href="#" class="download-btn">
                <i class="fa-solid fa-download"></i>
            </a>
        </div>`

    ).join("");
    const imageGallery = document.querySelector(".image-gallery");
    imageGallery.innerHTML = imgCardMarkup;const generateForm = document.querySelector(".generate-form");

// const OPENAI_API_KEY = "";

const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    if (!imgCard) return;

    let imgElement = imgCard.querySelector("img");
    if (!imgElement) {
      imgElement = document.createElement("img");
      imgCard.appendChild(imgElement);
    }

    const downloadBtn = imgCard.querySelector(".download-btn");

    const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImage;

    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      if (downloadBtn) {
        downloadBtn.setAttribute("href", aiGeneratedImage);
        downloadBtn.setAttribute("download", `${Date.now()}.jpg`);
        downloadBtn.style.display = "inline";  // Show download button after loading
      }
    };
  });
};

const generateAiImage = async (userPrompt, userImageQuantity) => {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: userPrompt,
        n: parseInt(userImageQuantity),
        size: "512x512",
        response_format: "b64_json",
      }),
    });

    if (!response.ok) throw new Error("Failed to generate images! Please try again later.");

    const data = await response.json();
    updateImageCard(data.data); // pass the array of images here
  } catch (error) {
    alert(error.message);
  }
};

const handleFormSubmission = (e) => {
  e.preventDefault();

  // safer way to get form values
  const formData = new FormData(e.target);
  const userPrompt = formData.get("prompt");      // your input must have name="prompt"
  const userImgQuantity = formData.get("quantity") || 1;  // your input must have name="quantity"

  const quantity = Math.min(Math.max(parseInt(userImgQuantity), 1), 5); // limit quantity to 1-5

  // Create placeholders for images with spinner & hidden download button
  const imgCardMarkup = Array.from({ length: quantity }, () =>
    `<div class="img-card loading" style="position:relative;">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <a href="#" class="download-btn" style="display:none; position:absolute; bottom:5px; right:5px; background:#fff; padding:4px; border-radius:4px;">
          <i class="fa-solid fa-download"></i>
        </a>
    </div>`
  ).join("");

  imageGallery.innerHTML = imgCardMarkup;
  generateAiImage(userPrompt, quantity);
};

generateForm.addEventListener("submit", handleFormSubmission);

    generateAiImage(userPrompt, userImgQuantity);

}

generateForm.addEventListener("submit", handleFormSubmission);


