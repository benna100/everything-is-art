let base64String;

const artistSpan = document.querySelector("span.artist");
const dateOfBirthSpan = document.querySelector("span.dateOfBirth");
const titleSpan = document.querySelector("span.title");
const createdYearSpan = document.querySelector("span.createdYear");
const mediumP = document.querySelector("p.medium");
const descriptionP = document.querySelector("p.description");
const loadingSpan = document.querySelector("p.loading");
const artTextDiv = document.querySelector(".art-text");
const chosenImageImg = document.querySelector(".chosen-image img");
const apiKeyInput = document.querySelector("input#api-token");

if (hasLocalStorage("OPENAI_KEY")) {
  apiKeyInput.value = localStorage.getItem("OPENAI_KEY");
}

const searchParams = new URLSearchParams(window.location.search);

if (searchParams.has("apikey")) {
  apiKeyInput.classList.add("hidden");
  apiKeyInput.value = searchParams.get("apikey");
}

let language;
if (searchParams.has("lang")) {
  language = searchParams.get("lang");
}

document.querySelector("button").addEventListener("click", () => {
  artTextDiv.classList.add("hidden");
  if (!base64String) {
    alert("Insert an image");
  }

  if (apiKeyInput.value === "") {
    alert("Insert an OpenAI api-key");
  }

  loadingSpan.classList.remove("hidden");

  const apiKey = apiKeyInput.value;
  localStorage.setItem("OPENAI_KEY", apiKeyInput.value);

  const englishPrompt = `Describe the following image as if it was an art piece. Dont use words that are hard to understand! 
            Never write UNKNOWN_ARTIST or UNKNOWN_YEAR_OF_BIRTH or UNKNOWN_CREATION_YEAR. For YEAR_ARTIST_WAS_BORN and CREATED_YEAR always make a year up. 
            Please respond in the following format
              ARTIST_TITLE;YEAR_ARTIST_WAS_BORN;TITLE_OF_ART_WORK;CREATED_YEAR;MEDIUM_DESCRIPTION;FANCY_DESCRIPTION_OF_ARTWORK

              Here are two examples:
              ---
              Wayne Thiebaud; 1920; Diagonal Freeway; 1993; Acrylic of canvas; "Diagonal Freeway" is an enigmatic masterpiece by the illustrious artist Isabella Rosetti, created in the pivotal year of 1894.  At its heart lies a solitary figure, cloaked in whispers of silk, gazing into the horizon where the first light of dawn meets the shadowy embrace of the night. Rosetti's masterful brushwork imbues the scene with a palpable sense of longing and introspection, weaving a complex tapestry of emotions that resonate with the soul's deepest yearnings. 
              Kelly Hughes; 1942; White Curves 11; 1978; Oil on Panel; Beginning early in his career, Kelly moved seamlessly between two and three dimensions, transposing the precisely delineated contours of his painted canvases into reliefs and sculptures. Kelly first made freestanding sculptures in the late 1950s, crafting objects in thinly painted metal. As his studio space and ambition grew, so too did the scope of his sculpture practice.
              ---
              `;
  // Bruger ikke det her, mini er ikke god på dansk
  const danishPrompt = `
                beskriv det følgende billede som om det var et kunsstykke. Undgå at bruge ord der er svære at forstå. 
                Aldrig skriv UNKNOWN_ARTIST eller UNKNOWN_YEAR_OF_BIRTH eller UNKNOWN_CREATION_YEAR. For YEAR_ARTIST_WAS_BORN og CREATED_YEAR altid find på et år.  
                Svar i det følgende format: 

                ARTIST_TITLE;YEAR_ARTIST_WAS_BORN;TITLE_OF_ART_WORK;CREATED_YEAR;MEDIUM_DESCRIPTION;FANCY_DESCRIPTION_OF_ARTWORK
  
                Her er to eksempler på engelsk:
                ---
                Wayne Thiebaud; 1920; Diagonal Freeway; 1993; Acrylic of canvas; "Diagonal Freeway" is an enigmatic masterpiece by the illustrious artist Isabella Rosetti, created in the pivotal year of 1894.  At its heart lies a solitary figure, cloaked in whispers of silk, gazing into the horizon where the first light of dawn meets the shadowy embrace of the night. Rosetti's masterful brushwork imbues the scene with a palpable sense of longing and introspection, weaving a complex tapestry of emotions that resonate with the soul's deepest yearnings. 
                Kelly Hughes; 1942; White Curves 11; 1978; Oil on Panel; Beginning early in his career, Kelly moved seamlessly between two and three dimensions, transposing the precisely delineated contours of his painted canvases into reliefs and sculptures. Kelly first made freestanding sculptures in the late 1950s, crafting objects in thinly painted metal. As his studio space and ambition grew, so too did the scope of his sculpture practice.
                ---
                Husk at svar på dansk
                `;

  const url = "https://api.openai.com/v1/chat/completions";
  const data = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: englishPrompt,
          },
          {
            type: "image_url",
            image_url: {
              url: base64String,
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  };

  fetch(url, {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      artTextDiv.classList.remove("hidden");
      loadingSpan.classList.add("hidden");

      const response = data.choices[0].message.content;
      const [artist, dateOfBirth, title, createdYear, medium, description] =
        response.split(";");

      artistSpan.innerText = artist;
      dateOfBirthSpan.innerText = `(b. ${dateOfBirth})`;
      titleSpan.innerText = title + `, `;
      createdYearSpan.innerText = createdYear;
      mediumP.innerText = medium;
      descriptionP.innerText = description;

      var rect = document.querySelector(".art-text").getBoundingClientRect();
      window.scrollTo({
        top: rect.top,
        left: 0,
        behavior: "smooth",
      });
    })
    .catch((error) => {
      console.log(error);
      artTextDiv.classList.add("hidden");
      loadingSpan.classList.add("hidden");
      alert("error", error);
    });
});

document.getElementById("imageInput").addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      base64String = event.target.result;
      const image = document.createElement("img");
      image.src = base64String;
      chosenImageImg.src = base64String;
      chosenImageImg.classList.remove("hidden");
    };

    reader.readAsDataURL(file);
  }
});

function hasLocalStorage(key) {
  let stableDiffusionSessionStorage = localStorage.getItem(key);
  const doesSessionStorageExist =
    stableDiffusionSessionStorage &&
    stableDiffusionSessionStorage !== "null" &&
    stableDiffusionSessionStorage !== "";
  return doesSessionStorageExist;
}
