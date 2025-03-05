// server.js
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Replace with your Discord webhook URL
const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL';

// Serve static files from the "public" directory
app.use(express.static('public'));

// Handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    try {
        // Read the file
        const fileStream = fs.createReadStream(filePath);

        // Send the file to Discord webhook
        const formData = new FormData();
        formData.append('file', fileStream, fileName);

        const response = await axios.post(DISCORD_WEBHOOK_URL, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        if (response.status === 200) {
            // Return the file URL (or any other response you want)
            res.json({ fileUrl: `https://discord.com/files/${fileName}` });
        } else {
            res.status(500).json({ error: 'Failed to upload file to Discord.' });
        }
    } catch (error) {
        console.error('Error uploading file to Discord:', error);
        res.status(500).json({ error: 'An error occurred while uploading the file.' });
    } finally {
        // Clean up the uploaded file
        fs.unlinkSync(filePath);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
