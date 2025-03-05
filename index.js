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
        discordFormData.append('thread_name', file.name); // Add thread_name for forum channels

        const discordResponse = await fetch(webhook_url, {
            method: 'POST',
            body: discordFormData,
        });

        if (!discordResponse.ok) {
            const errorData = await discordResponse.json();
            console.error("Discord API Error:", errorData); // Log the error response
            status.textContent = `Failed to upload file: ${errorData.message || 'Unknown error'}`;
            return;
        }

        const discordData = await discordResponse.json();
        fileUrl = discordData.attachments[0].url; // Get the file URL from the Discord response
        status.textContent = "File uploaded successfully!";
        copyButton.style.display = 'inline-block';
    } catch (error) {
        console.error("Upload Error:", error); // Log any unexpected errors
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
