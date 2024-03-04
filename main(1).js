let base64String;

document.querySelector("button").addEventListener("click", () => {
  //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
  const apiKey = document.querySelector("input#api-token").value; // Replace with your actual API key
  const url = "https://api.openai.com/v1/chat/completions";
  const data = {
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Describe the following image as if it was an art piece. The description should contain:
              1. Title of the artwork
              2. Artist name
              3. Period
              4. Fancy description
              Please only answer with the description!
              `,
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
      const response = data.choices[0].message.content;
      document.querySelector("p").innerText = response;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

document.getElementById("imageInput").addEventListener("change", function () {
  console.log(1);
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      base64String = event.target.result;
    };

    reader.readAsDataURL(file);
  }
});
