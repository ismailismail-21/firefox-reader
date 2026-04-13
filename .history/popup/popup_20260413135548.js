// Get the current tab info when popup opens
function loadPageInfo() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        const tab = tabs[0];
        document.getElementById('pageTitle').textContent = tab.title || 'Untitled';
        document.getElementById('pageUrl').textContent = tab.url || 'No URL';
    });
}

// Show status message
function showStatus(message, type = 'loading') {
    const statusEl = document.getElementById('status');
    statusEl.className = `status show ${type}`;

    if (type === 'loading') {
        statusEl.innerHTML = `<span class="spinner"></span>${message}`;
    } else {
        statusEl.textContent = message;
    }
}

// Hide status message
function hideStatus() {
    const statusEl = document.getElementById('status');
    statusEl.className = 'status';
}

// Clear status after delay
function autoHideStatus(delay = 4000) {
    setTimeout(() => hideStatus(), delay);
}

// Extract content from current tab
function extractContent() {
    return browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        return browser.tabs.sendMessage(tabs[0].id, { action: 'extract' });
    });
}

// Download button handler
document.getElementById('downloadBtn').addEventListener('click', () => {
    const btn = document.getElementById('downloadBtn');
    btn.disabled = true;

    showStatus('Extracting content...', 'loading');

    extractContent()
        .then(data => {
            showStatus('Preparing download...', 'loading');
            return browser.runtime.sendMessage({
                action: 'download',
                data: data
            });
        })
        .then(() => {
            showStatus('✓ Downloaded successfully!', 'success');
            autoHideStatus();
        })
        .catch(error => {
            console.error('Download error:', error);
            showStatus(`✗ Error: ${error.message || 'Download failed'}`, 'error');
            autoHideStatus(5000);
        })
        .finally(() => {
            btn.disabled = false;
        });
});

// Send to database button handler
document.getElementById('sendBtn').addEventListener('click', () => {
    const btn = document.getElementById('sendBtn');
    btn.disabled = true;

    showStatus('Preparing content...', 'loading');

    extractContent()
        .then(data => {
            showStatus('Sending to database...', 'loading');
            return browser.runtime.sendMessage({
                action: 'sendToDatabase',
                data: data
            });
        })
        .then(response => {
            if (response && response.success) {
                showStatus(`✓ Sent successfully!`, 'success');
            } else {
                showStatus(`✗ Server error: ${response?.message || 'Unknown error'}`, 'error');
            }
            autoHideStatus(5000);
        })
        .catch(error => {
            console.error('Send error:', error);
            showStatus(`✗ Error: ${error.message || 'Failed to send'}`, 'error');
            autoHideStatus(5000);
        })
        .finally(() => {
            btn.disabled = false;
        });
});

// Load page info when popup opens
loadPageInfo();
