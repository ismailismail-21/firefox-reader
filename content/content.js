// Content script that extracts and cleans page content using Readability.js

// Listen for messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extract') {
        extractPageContent()
            .then(data => sendResponse(data))
            .catch(error => sendResponse({ error: error.message || 'Extraction failed' }));
        return true; // Will respond asynchronously
    }
});

function extractPageContent() {
    return new Promise((resolve, reject) => {
        try {
            // Clone the document to avoid modifying the original
            const documentClone = document.cloneNode(true);

            // Create a new Readability instance
            const reader = new Readability(documentClone);
            const article = reader.parse();

            if (!article) {
                reject(new Error('Could not parse article content'));
                return;
            }

            const data = {
                title: article.title || document.title,
                content: article.content,
                textContent: article.textContent || '',
                url: window.location.href,
                timestamp: new Date().toISOString(),
                excerpt: article.excerpt || ''
            };

            resolve(data);
        } catch (error) {
            reject(new Error(`Extraction error: ${error.message}`));
        }
    });
}
