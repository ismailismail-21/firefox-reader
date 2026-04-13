// Background script - handles downloads and API communication

// ⚙️ CONFIGURATION - Update the API endpoint here
const API_ENDPOINT = 'http://localhost:3000/api/save-article'; // Change this to your API URL

// Listen for messages from popup/content script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'download') {
        handleDownload(request.data)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Will respond asynchronously
    } else if (request.action === 'sendToDatabase') {
        handleSendToDatabase(request.data)
            .then(response => sendResponse(response))
            .catch(error => sendResponse({ success: false, message: error.message }));
        return true;
    }
});

/**
 * Handle download request - saves HTML file locally
 */
function handleDownload(data) {
    return new Promise((resolve, reject) => {
        try {
            const { title, content, url } = data;

            // Create a complete HTML document with proper structure
            const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background: #f9f9f9;
        }
        article {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h1, h2, h3, h4, h5, h6 {
            color: #222;
            margin-top: 24px;
            margin-bottom: 12px;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 16px 0;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        code, pre {
            background: #f5f5f5;
            border-radius: 4px;
            padding: 2px 6px;
            font-family: 'Courier New', monospace;
        }
        pre {
            padding: 12px;
            overflow-x: auto;
        }
        blockquote {
            border-left: 4px solid #ddd;
            margin: 0;
            padding-left: 16px;
            color: #666;
        }
        .metadata {
            color: #999;
            font-size: 14px;
            border-bottom: 1px solid #eee;
            padding-bottom: 12px;
            margin-bottom: 24px;
        }
    </style>
</head>
<body>
    <article>
        <div class="metadata">
            <p><strong>Source:</strong> <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
            <p><strong>Saved:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <h1>${escapeHtml(title)}</h1>
        ${content}
    </article>
</body>
</html>`;

            // Create blob and download
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const filename = generateFilename(title);

            browser.downloads.download({
                url: URL.createObjectURL(blob),
                filename: filename,
                saveAs: false
            }).then(() => {
                resolve();
            }).catch(error => {
                reject(new Error(`Download failed: ${error.message}`));
            });

        } catch (error) {
            reject(new Error(`Preparation failed: ${error.message}`));
        }
    });
}

/**
 * Handle send to database request - sends JSON to API endpoint
 */
function handleSendToDatabase(data) {
    return new Promise((resolve, reject) => {
        try {
            const { title, content, url, textContent, timestamp, excerpt } = data;

            // Prepare JSON payload
            const payload = {
                title,
                url,
                textContent,
                excerpt,
                timestamp,
                htmlContent: content,
                savedAt: new Date().toISOString()
            };

            // Send POST request to API
            fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                return response.json();
            })
            .then(responseData => {
                resolve({
                    success: true,
                    message: 'Successfully sent to database',
                    data: responseData
                });
            })
            .catch(error => {
                reject(new Error(`API request failed: ${error.message}`));
            });

        } catch (error) {
            reject(new Error(`Preparation failed: ${error.message}`));
        }
    });
}

/**
 * Generate filename with title and timestamp
 */
function generateFilename(title) {
    // Clean title for filename
    const cleanTitle = title
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase()
        .substring(0, 50);

    const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .substring(0, 19);

    return `${cleanTitle}_${timestamp}.html`;
}

/**
 * Escape HTML special characters to prevent injection
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

console.log('[Firefox Reader] Background script loaded. API endpoint:', API_ENDPOINT);
