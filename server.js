const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Endpoint to fetch the token from Pastebin
app.get('/get-token', async (req, res) => {
  try {
    const pastebinResponse = await fetch('https://pastebin.com/raw/VGCA7Whr');
    const token = await pastebinResponse.text();
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch token from Pastebin.' });
  }
});

// Endpoint to upload files to GitHub
app.post('/upload', async (req, res) => {
  const { fileContent, fileName } = req.body;

  // Fetch the token from Pastebin
  const tokenResponse = await fetch('https://pastebin.com/raw/VGCA7Whr');
  const githubToken = await tokenResponse.text();

  // Generate a random filename
  const randomFilename = Math.random().toString(36).substring(2, 15) + '.html';

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

  // Base64 encode the content
  const base64Content = Buffer.from(htmlContent).toString('base64');

  // Upload the HTML file to GitHub
  const uploadUrl = `https://api.github.com/repos/THEBWARE/CevorFire/contents/${randomFilename}`;
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Add new download file',
      content: base64Content,
    }),
  });

  const uploadData = await uploadResponse.json();
  if (uploadData.content) {
    res.json({ download_link: uploadData.content.html_url });
  } else {
    res.status(500).json({ error: 'Failed to upload file to GitHub.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
