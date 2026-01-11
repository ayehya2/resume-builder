// Resume Builder Configuration
module.exports = {
    // PDF generation settings
    PDF_STALE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
    PDF_CLEANUP_INTERVAL: 60 * 1000,   // 1 minute
    MAX_CONCURRENT_PDFS: 3,

    // Browser settings
    BROWSER_TIMEOUT: 30000,
    PAGE_TIMEOUT: 20000,

    // Server settings
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development'
};
