// Resume Builder - Standalone Express Application
// No authentication required - just the resume builder
const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const open = require('open');

// Initialize Express app
const app = express();

// Import route modules
const resumeRoutes = require('./routes/resume');
// const aiRoutes = require('./routes/ai'); 

// Basic Express configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../frontend/views'));

// Set up proper MIME types for static files
app.use((req, res, next) => {
    if (req.path.endsWith('.css')) {
        res.set('Content-Type', 'text/css; charset=utf-8');
    } else if (req.path.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript; charset=utf-8');
    } else if (req.path.endsWith('.json')) {
        res.set('Content-Type', 'application/json; charset=utf-8');
    } else if (req.path.endsWith('.svg')) {
        res.set('Content-Type', 'image/svg+xml');
    } else if (req.path.endsWith('.woff') || req.path.endsWith('.woff2')) {
        res.set('Content-Type', 'font/woff2');
    } else if (req.path.endsWith('.ttf')) {
        res.set('Content-Type', 'font/ttf');
    }
    next();
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for handling FormData
const upload = multer();
app.use(upload.none());

// Static file serving
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Apply CORS middleware
app.use(cors());

// Mock user for routes that expect it
app.use((req, res, next) => {
    req.user = null;
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Redirect root to resume builder
app.get('/', (req, res) => {
    res.redirect('/resume');
});

// Mount route modules
app.use('/', resumeRoutes);            // Resume builder and management

// 404 handler
app.use('*', (req, res) => {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(404).json({ success: false, error: 'API endpoint not found' });
    } else {
        res.status(404).send('<h1>404 - Page Not Found</h1><p><a href="/resume">Go to Resume Builder</a></p>');
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(500).json({
            success: false,
            error: isDevelopment ? err.message : 'Internal server error'
        });
    } else {
        res.status(500).send(`<h1>Server Error</h1><p>${isDevelopment ? err.message : 'Something went wrong'}</p>`);
    }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    const url = `http://localhost:${PORT}`;
    console.log(`🚀 Resume Builder running on port ${PORT}`);
    console.log(`🌐 Open: ${url}`);

    if (process.env.OPEN_BROWSER === 'true') {
        open(url).catch(() => { });
    }
});

module.exports = app;
