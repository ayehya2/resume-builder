const express = require('express');
const router = express.Router();
const { generateResumePDF, generateResumeTeX } = require('../services/latex');

// Resume builder page - no authentication required
router.get('/resume', async (req, res) => {
    try {
        res.render('pages/resume-builder', {
            resumeData: null,
            resumeId: null,
            user: null,
            session: {},
            currentPage: 'resume-builder'
        });
    } catch (error) {
        console.error('Resume builder error:', error);
        res.render('pages/resume-builder', {
            resumeData: null,
            resumeId: null,
            user: null,
            session: {},
            currentPage: 'resume-builder'
        });
    }
});

// Also support /resume-builder path
router.get('/resume-builder', (req, res) => {
    res.redirect('/resume');
});

// Resume PDF generation
router.post('/generate-resume', async (req, res) => {
    try {
        const { formData, template, format = 'tex' } = req.body;

        console.log('📄 Generating resume...');

        if (!formData) {
            return res.status(400).json({ error: 'Form data is required' });
        }

        if (format === 'pdf') {
            const pdfBuffer = await generateResumePDF(formData, 'anonymous');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
            if (pdfBuffer instanceof Uint8Array) {
                res.send(Buffer.from(pdfBuffer));
            } else {
                res.send(pdfBuffer);
            }
        } else {
            const texSource = await generateResumeTeX(formData);
            const filename = `resume_${(formData.name || 'resume').replace(/\s+/g, '_')}.tex`;
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(texSource);
        }

    } catch (error) {
        console.error('Resume generation error:', error);

        if (error.code === 'HOSTING_LIMITATION') {
            res.status(503).json({
                error: error.message,
                code: 'HOSTING_LIMITATION'
            });
        } else {
            res.status(500).json({
                error: `Resume generation failed: ${error.message}`
            });
        }
    }
});

// Generate PDF endpoint
router.post('/api/generate-resume-pdf', async (req, res) => {
    try {
        const resumeData = req.body;
        const texSource = await generateResumeTeX(resumeData);
        res.json({ texSource });
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// Generate TeX source
router.post('/api/generate-resume-tex', async (req, res) => {
    try {
        const resumeData = req.body;
        const texSource = await generateResumeTeX(resumeData);

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename="resume.tex"');
        res.send(texSource);
    } catch (error) {
        console.error('TeX generation error:', error);
        res.status(500).json({ error: 'Failed to generate TeX source' });
    }
});

// Stub APIs for frontend compatibility (returns empty data since no database)
router.get('/api/user-resumes', (req, res) => {
    res.json({ success: true, resumes: [] });
});

router.get('/api/load-resume', (req, res) => {
    res.json({ success: true, data: null, message: 'No database configured' });
});

router.post('/api/save-resume', (req, res) => {
    // In standalone mode, saving is handled client-side via localStorage
    res.json({
        success: true,
        message: 'Resume data received. Use browser localStorage for persistence.',
        resumeId: 'local-' + Date.now()
    });
});

router.get('/api/profile/data', (req, res) => {
    res.json({ success: true, profile: null, preferences: null });
});

module.exports = router;