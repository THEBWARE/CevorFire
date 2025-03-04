const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// GitHub credentials and repository details
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Load token from environment variable
const REPO_OWNER = "THEBWARE";
const REPO_NAME = "CevorFire";
const BRANCH = "main";  // or your default branch

// Generate a random filename
function generateRandomFilename() {
  return Math.random().toString(36).substring(2, 15) + '.html';
}

// Create a new HTML file in the repository
async function createHtmlFile(filename, content) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filename}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Add new download file',
      content: Buffer.from(content).toString('base64'),
      branch: BRANCH,
    }),
  });
  return response.json();
}

app.use(express.json());

app.post('/upload', async (req, res) => {
  const { fileContent, fileName } = req.body;

  // Generate a random filename
  const randomFilename = generateRandomFilename();

  // Create the HTML file content
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Download File</title>
    </head>
    <body>
      <h1>Download Your File</h1>
      <a href="${fileContent}" download="${fileName}">Click here to download</a>
    </body>
    </html>
  `;

  // Upload to GitHub
  const uploadResponse = await createHtmlFile(randomFilename, htmlContent);
  if (uploadResponse.content) {
    res.json({ download_link: uploadResponse.content.html_url });
  } else {
    res.status(500).json({ error: 'Failed to upload file to GitHub.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
