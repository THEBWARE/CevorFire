let fileUrl = ""; // Variable to store the file URL

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const status = document.getElementById('status');
    const copyButton = document.querySelector('.copy-button');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress-bar');

    if (!fileInput.files[0]) {
        status.textContent = "Please select a file first.";
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    status.textContent = "Uploading...";
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';

    try {
        // Load the webhook URL from webhook.json
        const response = await fetch('webhook.json');
        const { webhook_url } = await response.json();

        // Step 1: Send the file to the Discord webhook
        const discordFormData = new FormData();
        discordFormData.append('file', file);
        discordFormData.append('content', 'New file uploaded!');

        const discordResponse = await fetch(webhook_url, {
            method: 'POST',
            body: discordFormData,
        });

        if (!discordResponse.ok) {
            const errorData = await discordResponse.json();
            console.error(errorData);
            status.textContent = "Failed to upload file.";
            return;
        }

        const discordData = await discordResponse.json();
        fileUrl = discordData.attachments[0].url; // Get the file URL from the Discord response

        // Step 2: Create a thread in the forum channel
        const channelId = 'YOUR_FORUM_CHANNEL_ID'; // Replace with your forum channel ID
        const botToken = 'YOUR_BOT_TOKEN'; // Replace with your bot token

        const threadResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/threads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${botToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: file.name, // Thread name (forum post title)
                auto_archive_duration: 60, // Thread auto-archive duration (in minutes)
                message: {
                    content: `File uploaded: ${file.name}`,
                },
            }),
        });

        if (!threadResponse.ok) {
            const threadErrorData = await threadResponse.json();
            console.error(threadErrorData);
            status.textContent = "Failed to create forum post.";
            return;
        }

        const threadData = await threadResponse.json();
        const threadId = threadData.id; // Get the thread ID

        // Step 3: Move the file message to the thread (optional)
        const messageId = discordData.id; // Get the message ID of the uploaded file
        await fetch(`https://discord.com/api/v10/channels/${threadId}/messages/${messageId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${botToken}`,
            },
        });

        status.textContent = "File uploaded successfully and forum post created!";
        copyButton.style.display = 'inline-block';
    } catch (error) {
        console.error(error);
        status.textContent = "An error occurred.";
    } finally {
        progressContainer.style.display = 'none';
    }
}

function copyUrl() {
    if (!fileUrl) {
        alert("No file URL available to copy.");
        return;
    }

    // Modern method (navigator.clipboard)
    if (navigator.clipboard) {
        navigator.clipboard.writeText(fileUrl)
            .then(() => {
                alert("File URL copied to clipboard!");
            })
            .catch(() => {
                // Fallback to older method if modern method fails
                fallbackCopyText(fileUrl);
            });
    } else {
        // Fallback to older method
        fallbackCopyText(fileUrl);
    }
}

function fallbackCopyText(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert("File URL copied to clipboard!");
    } catch (err) {
        alert("Failed to copy URL.");
    }
    document.body.removeChild(textarea);
}
