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

        // Send the file to the Discord webhook
        const discordFormData = new FormData();
        discordFormData.append('file', file);
        discordFormData.append('content', 'New forum post: Check out this file!');
        discordFormData.append('thread_name', file.name); // Thread name (forum post title)

        const discordResponse = await fetch(webhook_url, {
            method: 'POST',
            body: discordFormData,
        });

        if (discordResponse.ok) {
            const data = await discordResponse.json();
            fileUrl = data.attachments[0].url; // Get the file URL from the Discord response
            status.textContent = "File uploaded successfully!";
            copyButton.style.display = 'inline-block';
        } else {
            const errorData = await discordResponse.json();
            console.error(errorData);
            status.textContent = "Failed to upload file.";
        }
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
