/**
 * Example API Server for Firefox Reader Extension
 *
 * This is a simple Express server for testing the "Send to Database" feature.
 * In production, replace this with your actual backend implementation.
 *
 * Installation:
 *   npm install express body-parser cors
 *
 * Usage: 
 *   node example-api.js
 *
 * The server will run on http://localhost:3000
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Simple in-memory storage for articles (replace with database in production)
const articles = [];

/**
 * POST /api/save-article
 * Saves an article from the Firefox Reader extension
 */
app.post('/api/save-article', (req, res) => {
    try {
        const { title, url, textContent, excerpt, timestamp, htmlContent, savedAt } = req.body;

        // Validate required fields
        if (!title || !url) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title and url'
            });
        }

        // Create article object
        const article = {
            id: `article_${Date.now()}`,
            title,
            url,
            textContent,
            excerpt,
            timestamp,
            htmlContent: htmlContent ? `[HTML content - ${htmlContent.length} chars]` : null,
            savedAt,
            receivedAt: new Date().toISOString()
        };

        // Store article (in production, save to database)
        articles.push(article);

        console.log('\n✓ Article received and saved:');
        console.log(`  ID: ${article.id}`);
        console.log(`  Title: ${article.title}`);
        console.log(`  URL: ${article.url}`);
        console.log(`  Text length: ${article.textContent?.length || 0} chars`);
        console.log(`  Total articles stored: ${articles.length}`);

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Article saved successfully',
            id: article.id
        });

    } catch (error) {
        console.error('✗ Error processing article:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to save article',
            error: error.message
        });
    }
});

/**
 * GET /api/articles
 * Retrieve all saved articles (for testing/debugging)
 */
app.get('/api/articles', (req, res) => {
    const summary = articles.map(article => ({
        id: article.id,
        title: article.title,
        url: article.url,
        textLength: article.textContent?.length || 0,
        savedAt: article.receivedAt
    }));

    res.json({
        success: true,
        total: articles.length,
        articles: summary
    });
});

/**
 * GET /api/articles/:id
 * Retrieve a specific article
 */
app.get('/api/articles/:id', (req, res) => {
    const article = articles.find(a => a.id === req.params.id);

    if (!article) {
        return res.status(404).json({
            success: false,
            message: 'Article not found'
        });
    }

    res.json({
        success: true,
        article
    });
});

/**
 * DELETE /api/articles/:id
 * Delete a saved article (for testing/cleanup)
 */
app.delete('/api/articles/:id', (req, res) => {
    const index = articles.findIndex(a => a.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Article not found'
        });
    }

    const removed = articles.splice(index, 1)[0];
    res.json({
        success: true,
        message: 'Article deleted',
        article: removed
    });
});

/**
 * GET /
 * Health check and API documentation
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Firefox Reader API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            'POST /api/save-article': 'Save an article from the extension',
            'GET /api/articles': 'Get all saved articles',
            'GET /api/articles/:id': 'Get a specific article',
            'DELETE /api/articles/:id': 'Delete an article'
        },
        articlesStored: articles.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  Firefox Reader API Server                                 ║
║  Running on http://localhost:${PORT}                       ║
╚════════════════════════════════════════════════════════════╝

📝 Usage:
   1. Configure Firefox extension with API_ENDPOINT = 'http://localhost:3000/api/save-article'
   2. Click "Send to DB" button in Firefox Reader extension
   3. Articles will appear below

📊 Endpoints:
   GET  http://localhost:${PORT}/               (API info)
   GET  http://localhost:${PORT}/api/articles        (list all articles)
   POST http://localhost:${PORT}/api/save-article    (receives articles from extension)

🔄 Articles received: 0
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n✓ Server shutting down gracefully');
    console.log(`  Total articles received: ${articles.length}`);
    process.exit(0);
});
