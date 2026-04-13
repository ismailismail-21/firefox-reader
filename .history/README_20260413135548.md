# Firefox Reader Extension

A Firefox extension that extracts, cleans, and downloads web page content, or sends it to a backend database.

## Features

- **Clean Content Extraction**: Uses Mozilla's Readability.js to extract and clean article content
- **Local Download**: Download cleaned pages as HTML files with proper formatting
- **Database Integration**: Send extracted content to a backend API for storage
- **Simple UI**: Easy-to-use popup with status feedback

## Project Structure

```
firefox-reader/
├── manifest.json              # Extension configuration
├── popup/
│   ├── popup.html            # Popup UI
│   └── popup.js              # Popup logic
├── content/
│   └── content.js            # Content extraction script
├── background/
│   └── background.js         # Download & API handling
├── lib/
│   └── readability.js        # Readability.js library
├── icons/
│   └── icon.svg              # Extension icon
└── server/
    └── example-api.js        # Example API server for testing
```

## Installation

### For Development/Testing

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to the project folder and select `manifest.json`
5. The extension will load and appear in your toolbar

### For Production

Package the extension following [Mozilla's documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Package_your_extension)

## Configuration

### API Endpoint

To use the "Send to Database" feature, configure the API endpoint in `background/background.js`:

```javascript
const API_ENDPOINT = 'http://localhost:3000/api/save-article';
```

Change `http://localhost:3000/api/save-article` to your actual API endpoint.

### API Expected Format

The extension sends a POST request with the following JSON payload:

```json
{
  "title": "Article Title",
  "url": "https://example.com/article",
  "textContent": "Plain text content...",
  "excerpt": "Short excerpt...",
  "timestamp": "2026-04-13T...",
  "htmlContent": "<html>...</html>",
  "savedAt": "2026-04-13T..."
}
```

Your API should return:

```json
{
  "success": true,
  "message": "Article saved",
  "id": "article_123"
}
```

## Testing

### Test the Download Feature

1. Navigate to any article page (e.g., news site, blog post)
2. Click the Firefox Reader icon in the toolbar
3. Click the "📥 Download" button
4. A file will be downloaded as `[article-title]_[timestamp].html`
5. Open the file to view the cleaned content

### Test the Database Integration

#### Option 1: Using Example Server

Run the included example Express server:

```bash
cd server
npm install express body-parser cors
node example-api.js
```

This starts a local API on `http://localhost:3000` that logs received articles.

#### Option 2: Using Your Own Backend

1. Set up your API endpoint following the format shown above
2. Update the `API_ENDPOINT` in `background/background.js`
3. Reload the extension (`about:debugging` → Reload)
4. Click extension icon and test "☁️ Send to DB"

## How It Works

### Workflow

1. **User clicks extension icon** → Popup shows current page info
2. **User clicks Download or Send to DB** → Popup sends message to content script
3. **Content script** → Uses Readability.js to extract clean content
4. **Background script**:
   - **Download**: Creates HTML file with styling and downloads it
   - **Send to DB**: Sends JSON to API endpoint

### Content Extraction

The extension uses Readability.js to:
- Extract article text and HTML
- Remove ads, navigation, sidebars
- Clean up formatting
- Extract metadata (title, excerpt)

## Troubleshooting

### Extension not appearing in toolbar
- Reload the extension at `about:debugging`
- Check browser console for errors (F12)

### Download not working
- Check browser console for errors
- Verify file permissions in Downloads folder

### Send to Database not working
- Verify API endpoint is correct in `background/background.js`
- Check if API server is running
- Check browser console and API server logs for errors
- Verify the API accepts POST requests with JSON

### Content not extracting
- Some pages (heavy JavaScript content, paywalled content) may not work
- Try on a standard news or blog article
- Check console for Readability.js errors

## Browser Compatibility

- Firefox 88+ (requires Manifest V3 support)
- Currently tested on: Firefox 121+ on macOS

## Development

### File Purposes

- **manifest.json**: Declares permissions, background script, content script, popup
- **popup.html/js**: User interface and button handlers
- **content.js**: Extracts content using Readability.js (runs in page context)
- **background.js**: Handles downloads and API requests
- **readability.js**: Mozilla's content extraction library

### Modifying Styling

Edit the CSS in `popup/popup.html` for popup styling or `background/background.js` for downloaded file styling.

### Adding New Features

For new features, consider:
1. UI changes → modify `popup/popup.html` and `popup/popup.js`
2. Content extraction changes → modify `content/content.js`
3. Backend logic changes → modify `background/background.js`

## License

MIT

## Resources

- [Mozilla WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Readability.js](https://github.com/mozilla/readability)
- [Firefox Add-ons Development](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons)
