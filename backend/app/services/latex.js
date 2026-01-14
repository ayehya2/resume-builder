const { stripIndent } = require('common-tags');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const puppeteer = require('puppeteer');
const config = require('../../../config/config');
// const getTemplateData = require('./templates');

// Track active PDF generations to prevent browser exhaustion
const activePdfGenerations = new Map();

// Browser pool for reusing browser instances
let browserPool = [];
const MAX_BROWSER_POOL_SIZE = 3;
let isShuttingDown = false;

// Performance optimizations
const PDF_GENERATION_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const HTML_TEMPLATE_CACHE = new Map();

// Clean up stale PDF generations and cache periodically
setInterval(() => {
  const now = Date.now();

  // Clean up stale PDF generations
  for (const [userId, timestamp] of activePdfGenerations.entries()) {
    if (now - timestamp > config.PDF_STALE_TIMEOUT) {
      console.log(`⚠️ Cleaning up stale PDF generation for user: ${userId}`);
      activePdfGenerations.delete(userId);
    }
  }

  // Clean up expired cache entries
  for (const [key, { timestamp }] of PDF_GENERATION_CACHE.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      PDF_GENERATION_CACHE.delete(key);
    }
  }

  // Clean up HTML template cache
  for (const [key, { timestamp }] of HTML_TEMPLATE_CACHE.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      HTML_TEMPLATE_CACHE.delete(key);
    }
  }
}, config.PDF_CLEANUP_INTERVAL);

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down gracefully...');
  isShuttingDown = true;
  await closeBrowserPool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  isShuttingDown = true;
  await closeBrowserPool();
  process.exit(0);
});

// Helper function to format bullet points into HTML
function formatBulletPoints(description) {
  console.log('🔧 formatBulletPoints input:', JSON.stringify(description));

  if (!description) return '';

  // Split by newlines and process each line
  const lines = description.split('\n').map(line => line.trim()).filter(line => line);
  console.log('🔧 Split lines:', lines);

  if (lines.length === 0) return '';

  // Check if this looks like bullet points (starts with • or has multiple lines)
  const hasBulletPoints = lines.some(line => line.startsWith('•')) || lines.length > 1;
  console.log('🔧 Has bullet points:', hasBulletPoints);

  if (hasBulletPoints) {
    // Convert to HTML list
    const listItems = lines.map(line => {
      // Remove leading bullet if present
      const cleanLine = line.replace(/^[•\-\*]\s*/, '');
      return `<li>${cleanLine}</li>`;
    }).join('');

    const result = `<ul>${listItems}</ul>`;
    console.log('🔧 formatBulletPoints result:', result);
    return result;
  } else {
    // Single line, just return as is
    console.log('🔧 Single line, returning as is:', description);
    return description;
  }
}

function generateContactInfo({ email, phone, address, links }) {
  console.log('🔗 generateContactInfo received links:', links);
  const contactItems = [email, phone, address].filter(Boolean);

  if (links && Array.isArray(links)) {
    console.log(`📎 Processing ${links.length} links for HTML...`);
    links.forEach((link, index) => {
      console.log(`HTML Link ${index}:`, link);
      if (link.url) {
        const displayText = link.name || link.url;
        const htmlLink = `<a href="${link.url}" target="_blank">${displayText}</a>`;
        console.log(`Generated HTML link: ${htmlLink}`);
        contactItems.push(htmlLink);
      }
    });
  } else {
    console.log('⚠️ No links found in generateContactInfo or links is not an array');
  }

  console.log('🔗 Final contact items:', contactItems);
  return contactItems.join(' • ');
}

function generateBasicResumeTemplate(resumeData) {
  const { name, email, phone, address, experience = [], education = [], skills = [] } = resumeData;

  return stripIndent`
    \\documentclass{article}
    \\usepackage[utf8]{inputenc}
    \\pagestyle{empty}
    \\setlength{\\parindent}{0pt}
    \\setlength{\\topmargin}{-0.7in}
    \\setlength{\\textheight}{10.5in}
    \\setlength{\\textwidth}{7.5in}
    \\setlength{\\oddsidemargin}{-0.3in}

    \\begin{document}

    % Profile Section
    \\begin{center}
        {\\Large \\textbf{${name || 'Your Name'}}}\\\\
        ${[email, phone, address].filter(Boolean).join(' | ')}\\\\
    \\end{center}
    
    \\vspace{0.2in}

    % Experience Section
    ${experience.length > 0 ? `
    \\textbf{\\large Experience}\\\\
    \\rule{\\textwidth}{0.4pt}
    \\vspace{0.1in}
    ${experience.map(job => `
    \\textbf{${job.company || 'Company'}} \\hfill ${job.location || ''}\\\\
    \\textit{${job.position || 'Position'}} \\hfill ${job.startDate || ''} - ${job.endDate || 'Present'}\\\\
    ${job.description ? `${job.description}\\\\` : ''}
    \\vspace{0.1in}
    `).join('\n')}
    ` : ''}

    % Education Section
    ${education.length > 0 ? `
    \\textbf{\\large Education}\\\\
    \\rule{\\textwidth}{0.4pt}
    \\vspace{0.1in}
    ${education.map(school => `
    \\textbf{${school.institution || 'Institution'}} \\hfill ${school.location || ''}\\\\
    ${school.degree || 'Degree'} ${school.field ? `in ${school.field}` : ''} ${school.gpa ? `\\textit{GPA: ${school.gpa}}` : ''} \\hfill ${school.graduationDate || ''}\\\\
    \\vspace{0.1in}
    `).join('\n')}
    ` : ''}

    % Skills Section
    ${skills.length > 0 ? `
    \\textbf{\\large Skills}\\\\
    \\rule{\\textwidth}{0.4pt}
    \\vspace{0.1in}
    ${skills.map(skill => `\\textbf{${skill.category || 'Skills'}:} ${skill.items ? skill.items.join(', ') : skill.name || ''}\\\\`).join('\n')}
    \\vspace{0.1in}
    ` : ''}

    \\end{document}
  `;
}

// Browser pool management
async function getBrowserFromPool() {
  if (isShuttingDown) throw new Error('Server is shutting down');

  // Try to get a browser from the pool
  if (browserPool.length > 0) {
    const browser = browserPool.pop();
    try {
      // Check if browser is still connected
      await browser.version();
      console.log('♻️ Reusing browser from pool');
      return browser;
    } catch (error) {
      console.log('🗑️ Browser from pool is dead, creating new one');
    }
  }

  // Create new browser if pool is empty or browser is dead
  return await createNewBrowser();
}

async function returnBrowserToPool(browser) {
  if (isShuttingDown) {
    try {
      await browser.close();
    } catch (e) { }
    return;
  }

  if (browserPool.length < MAX_BROWSER_POOL_SIZE) {
    try {
      // Check if browser is still alive
      await browser.version();
      browserPool.push(browser);
      console.log(`♻️ Browser returned to pool (${browserPool.length}/${MAX_BROWSER_POOL_SIZE})`);
    } catch (error) {
      console.log('🗑️ Browser is dead, not returning to pool');
      try {
        await browser.close();
      } catch (e) { }
    }
  } else {
    // Pool is full, close the browser
    try {
      await browser.close();
      console.log('🗑️ Browser pool full, closing browser');
    } catch (e) { }
  }
}

async function closeBrowserPool() {
  console.log(`🧹 Closing browser pool (${browserPool.length} browsers)`);
  const closePromises = browserPool.map(browser => {
    return browser.close().catch(e => console.log('Error closing browser:', e.message));
  });
  await Promise.all(closePromises);
  browserPool = [];
}

async function createNewBrowser() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isRender = process.env.RENDER || process.env.RENDER_SERVICE_ID;

  console.log('🚀 Creating new browser instance');

  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--memory-pressure-off',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-images', // Faster loading by disabling image loading
      '--disable-javascript', // We don't need JS for PDF generation
      '--no-default-browser-check'
    ]
  };

  // Platform-specific optimizations
  if (process.platform !== 'win32' || isProduction || isRender) {
    launchOptions.args.push('--single-process', '--no-zygote');
  }

  // Production Chrome path detection (optimized)
  if (isProduction || isRender) {
    const chromePath = await findChromePath();
    if (chromePath) {
      launchOptions.executablePath = chromePath;
    }
  }

  return await puppeteer.launch(launchOptions);
}

async function findChromePath() {
  const possiblePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_BIN,
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable'
  ].filter(Boolean);

  // Check project cache directory
  const projectCacheDir = `${process.cwd()}/.puppeteer_cache`;
  try {
    const glob = require('glob');
    const cachedChromes = glob.sync(`${projectCacheDir}/chrome/*/chrome-linux64/chrome`);
    possiblePaths.unshift(...cachedChromes);
  } catch (e) { }

  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      console.log(`✅ Found Chrome at: ${path}`);
      return path;
    }
  }

  console.log('⚠️ No Chrome found, will use default');
  return null;
}

// Generate cache key for PDF generation
function generateCacheKey(resumeData) {
  const keyData = {
    name: resumeData.name,
    experience: resumeData.experience,
    education: resumeData.education,
    skills: resumeData.skills,
    projects: resumeData.projects,
    awards: resumeData.awards,
    selectedTemplate: resumeData.selectedTemplate,
    formatting: resumeData.formatting,
    sections: resumeData.sections // ✅ FIXED: Include sections order in cache key
  };
  return require('crypto').createHash('md5').update(JSON.stringify(keyData)).digest('hex');
}

// Optimized HTML generation with caching
function generateResumeHTMLCached(resumeData) {
  const cacheKey = generateCacheKey(resumeData);
  const cached = HTML_TEMPLATE_CACHE.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📋 Using cached HTML template');
    return cached.html;
  }

  const html = generateResumeHTML(resumeData);
  HTML_TEMPLATE_CACHE.set(cacheKey, {
    html,
    timestamp: Date.now()
  });

  return html;
}

function getTemplateStyles(templateId) {
  try {
    const templatePath = path.join(__dirname, 'templates', `template${templateId}.css`);
    if (fs.existsSync(templatePath)) {
      console.log(`🎨 Loading style for template ${templateId} from: ${templatePath}`);
      return fs.readFileSync(templatePath, 'utf8');
    }
    console.warn(`⚠️ Template ${templateId} style file not found at: ${templatePath}, falling back to basic`);
    // Fallback to basic style if file is missing
    return `
            body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; color: #000; line-height: 1.5; font-size: 11pt; }
            .header { text-align: center; margin-bottom: 25px; }
            .name { font-size: 24pt; font-weight: bold; margin-bottom: 8px; }
            .section-title { font-size: 12pt; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #000; padding-bottom: 2px; }
        `;
  } catch (error) {
    console.error('Error reading template style:', error);
    return '';
  }
}

function getFormattingStyles(formatting) {
  if (!formatting) return '';

  const {
    fontFamily = 'default',
    baseFontSize = '11pt',
    nameSize = 'large',
    sectionTitleSize = 'normal',
    sectionTitleBold = true,
    sectionTitleUnderline = true,
    sectionTitleSmallCaps = false,
    companyBold = true,
    companyItalic = false,
    lineSpacing = '1.0',
    sectionSpacing = 'normal',
    paragraphSpacing = 'normal',
    pageMargins = 'normal',
    marginTop = '0',
    marginBottom = '0',
    marginLeft = '0',
    marginRight = '0',
    bulletStyle = 'bullet',
    bulletSize = 'normal',
    bulletIndent = '5',
    bulletSpacing = 'normal',
    bulletIndentValue = '5mm',
    listMarginVertical = '2',
    listMarginLeft = '10',
    hangingIndent = false,
    alignBullets = true,
    compactLists = false,
    colorTheme = 'black',
    customColor = '#000000',
    sectionDividers = 'line',
    headerAlignment = 'center'
  } = formatting;

  // Font family mapping
  const fontFamilyMap = {
    'default': '"Computer Modern", "Latin Modern Roman", serif',
    'times': '"Times New Roman", Times, serif',
    'arial': 'Arial, Helvetica, sans-serif',
    'calibri': 'Calibri, "Segoe UI", sans-serif',
    'georgia': 'Georgia, serif',
    'helvetica': 'Helvetica, Arial, sans-serif',
    'palatino': 'Palatino, "Book Antiqua", serif',
    'garamond': 'Garamond, "Times New Roman", serif'
  };

  // Font size mapping
  const nameSizeMap = {
    'huge': '24pt',
    'large': '20pt',
    'large2': '18pt',
    'normal': '16pt'
  };

  const sectionTitleSizeMap = {
    'large': '14pt',
    'normal': '12pt',
    'small': '11pt'
  };

  // Color theme mapping
  const colorThemeMap = {
    'black': '#000000',
    'navy': '#000080',
    'darkblue': '#003366',
    'darkgreen': '#006600',
    'maroon': '#800000',
    'purple': '#663399'
  };

  // Get the primary color
  const primaryColor = colorTheme === 'custom' ? customColor : colorThemeMap[colorTheme] || '#000000';

  // Margin calculations - always use individual margin values
  const margins = `${marginTop}in ${marginRight}in ${marginBottom}in ${marginLeft}in`;

  // Spacing calculations
  const sectionSpacingMap = {
    'compact': '15px',
    'normal': '20px',
    'relaxed': '25px',
    'spacious': '30px'
  };

  const paragraphSpacingMap = {
    'tight': '8px',
    'normal': '12px',
    'relaxed': '16px'
  };

  // Bullet spacing
  const bulletSpacingMap = {
    'tight': '0pt',
    'normal': '1pt',
    'relaxed': '2pt',
    'spacious': '3pt'
  };

  return `
    /* Custom formatting overrides */
    body {
      font-family: ${fontFamilyMap[fontFamily]};
      font-size: ${baseFontSize};
      line-height: ${lineSpacing};
      padding: ${margins};
    }

    .header {
      text-align: ${headerAlignment};
      margin-bottom: ${sectionSpacingMap[sectionSpacing]};
    }

    .name {
      font-size: ${nameSizeMap[nameSize]};
      color: ${primaryColor};
    }

    .section {
      margin: ${sectionSpacingMap[sectionSpacing]} 0;
    }

    .section-title {
      font-size: ${sectionTitleSizeMap[sectionTitleSize]};
      font-weight: ${sectionTitleBold ? 'bold' : 'normal'};
      text-decoration: ${sectionTitleUnderline ? 'underline' : 'none'};
      font-variant: ${sectionTitleSmallCaps ? 'small-caps' : 'normal'};
      color: ${primaryColor};
      border-bottom: ${sectionDividers === 'line' ? `1px solid ${primaryColor}` :
      sectionDividers === 'double' ? `3px double ${primaryColor}` :
        sectionDividers === 'thick' ? `2px solid ${primaryColor}` :
          sectionDividers === 'dotted' ? `1px dotted ${primaryColor}` : 'none'};
    }

    .company, .institution {
      font-weight: ${companyBold ? 'bold' : 'normal'};
      font-style: ${companyItalic ? 'italic' : 'normal'};
    }

    .job, .edu-item {
      margin-bottom: ${paragraphSpacingMap[paragraphSpacing]};
    }

    .description ul {
      margin: ${listMarginVertical}mm 0;
      padding-left: ${listMarginLeft}mm;
      list-style-type: ${bulletStyle === 'bullet' ? 'disc' :
      bulletStyle === 'dash' ? 'none' :
        bulletStyle === 'arrow' ? 'none' :
          bulletStyle === 'circle' ? 'circle' :
            bulletStyle === 'square' ? 'square' : 'disc'};
    }

    .description li {
      margin-bottom: ${bulletSpacingMap[bulletSpacing]} !important;
      ${bulletStyle === 'dash' ? 'list-style: none; position: relative;' : ''}
      ${bulletStyle === 'arrow' ? 'list-style: none; position: relative;' : ''}
      ${bulletStyle === 'chevron' ? 'list-style: none; position: relative;' : ''}
      ${bulletStyle === 'diamond' ? 'list-style: none; position: relative;' : ''}
      ${bulletStyle === 'star' ? 'list-style: none; position: relative;' : ''}
    }

    ${bulletStyle === 'dash' ? `.description li::before { content: '–'; position: absolute; left: -${bulletIndent}mm; }` : ''}
    ${bulletStyle === 'arrow' ? `.description li::before { content: '→'; position: absolute; left: -${bulletIndent}mm; }` : ''}
    ${bulletStyle === 'chevron' ? `.description li::before { content: '»'; position: absolute; left: -${bulletIndent}mm; }` : ''}
    ${bulletStyle === 'diamond' ? `.description li::before { content: '◆'; position: absolute; left: -${bulletIndent}mm; }` : ''}
    ${bulletStyle === 'star' ? `.description li::before { content: '★'; position: absolute; left: -${bulletIndent}mm; }` : ''}
  `;
}

function generateResumeHTML(resumeData) {
  console.log('🚨🚨🚨 HTML GENERATION STARTED 🚨🚨🚨');
  // Debug: log the actual data structure
  console.log('Resume data received:', JSON.stringify(resumeData, null, 2));

  const {
    name, email, phone, address, websites = [],
    experience = [], education = [], skills = [], projects = [], awards = [],
    selectedTemplate = 1, sections = ['profile', 'education', 'work', 'skills', 'projects', 'awards'],
    bulletSpacing = '4px', formatting = {}
  } = resumeData;

  console.log('🔗 Websites array:', websites);
  console.log('🔗 Websites count:', websites.length);
  console.log('📏 Bullet spacing:', bulletSpacing);
  console.log('🎨 Formatting settings:', formatting);

  // Handle sections - if it's an object, convert to array of keys
  const sectionsArray = Array.isArray(sections) ? sections :
    (sections && typeof sections === 'object') ?
      ['profile', 'education', 'work', 'skills', 'projects', 'awards'] :
      ['profile', 'education', 'work', 'skills', 'projects', 'awards'];

  const baseStyles = getTemplateStyles(selectedTemplate);
  const customStyles = getFormattingStyles(formatting);

  // Ensure arrays are actually arrays
  const safeExperience = Array.isArray(experience) ? experience : [];
  const safeEducation = Array.isArray(education) ? education : [];
  const safeSkills = Array.isArray(skills) ? skills : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeAwards = Array.isArray(awards) ? awards : [];

  return stripIndent`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            ${baseStyles}
            ${customStyles}
            .job-header, .edu-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
            .description { margin-top: 8px; }
            .description ul { 
                margin: 0 !important; 
                padding-left: 16px !important; 
                list-style-type: disc !important;
                display: block !important;
            }
            .description li { 
                margin-bottom: 2px !important; 
                display: list-item !important;
                list-style-position: outside !important;
            }
            .skill-items { margin-top: 3px; }
            @media print { 
              body { padding: 20px; } 
              .section { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="name">${name || 'Your Name'}</div>
            <div class="contact">${[
      email,
      phone,
      address,
      ...(websites.map(website => `<a href="${website.url}" target="_blank">${website.name}</a>`))
    ].filter(Boolean).join(' • ')}</div>
        </div>

        ${sectionsArray.map(section => {
      console.log('Processing section:', section);
      switch (section) {
        case 'profile':
          return ''; // Profile is already in header

        case 'work':
        case 'experience':
          return safeExperience && safeExperience.length > 0 ? `
              <div class="section">
                  <div class="section-title">Experience</div>
                  ${safeExperience.map(job => {
            console.log('🔥 SERVER: Processing job description:', JSON.stringify(job.description));
            return `
                      <div class="job">
                          <div class="job-header">
                              <div>
                                  <div class="company">${job.company || 'Company'}</div>
                                  <div class="position">${job.position || 'Position'}</div>
                              </div>
                              <div style="text-align: right;">
                                  <div class="location">${job.location || ''}</div>
                                  <div class="date">${job.startDate || ''} - ${job.endDate || 'Present'}</div>
                              </div>
                          </div>
                          ${job.description ? `<div class="description" style="margin-top: 8px;">
                              <table style="width: 100%; border: none; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;">
                                  ${job.description.split('\n').filter(line => line.trim()).map(line => {
              const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
              return cleanLine ? `<tr style="border: none; margin: 0; padding: 0;">
                                          <td style="border: none; padding: 0; margin: 0; vertical-align: top; width: 15px; text-align: left;">•</td>
                                          <td style="border: none; padding: 0 0 4px 5px; margin: 0; vertical-align: top; width: auto;">${cleanLine}</td>
                                      </tr>` : '';
            }).join('')}
                              </table>
                          </div>` : ''}
                          ${job.highlights && job.highlights.length > 0 ? `
                              <ul class="highlights">
                                  ${job.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                              </ul>
                          ` : ''}
                      </div>
                  `;
          }).join('')}
              </div>` : '';

        case 'education':
          return safeEducation && safeEducation.length > 0 ? `
              <div class="section">
                  <div class="section-title">Education</div>
                  ${safeEducation.map(school => `
                      <div class="edu-item">
                          <div class="edu-header">
                              <div>
                                  <div class="institution">${school.institution || 'Institution'}</div>
                                  <div class="degree">${school.degree || 'Degree'}${school.field ? ` in ${school.field}` : ''}</div>
                                  ${school.gpa ? `<div style="font-size: 9pt; color: #666;">GPA: ${school.gpa}</div>` : ''}
                              </div>
                              <div style="text-align: right;">
                                  <div class="location">${school.location || ''}</div>
                                  <div class="date">${school.graduationDate || ''}</div>
                              </div>
                          </div>
                          ${school.description ? `<div class="description" style="margin-top: 8px;">
                              <table style="width: 100%; border: none; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;">
                                  ${school.description.split('\n').filter(line => line.trim()).map(line => {
            const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
            return cleanLine ? `<tr style="border: none; margin: 0; padding: 0;">
                                          <td style="border: none; padding: 0; margin: 0; vertical-align: top; width: 15px; text-align: left;">•</td>
                                          <td style="border: none; padding: 0 0 4px 5px; margin: 0; vertical-align: top; width: auto;">${cleanLine}</td>
                                      </tr>` : '';
          }).join('')}
                              </table>
                          </div>` : ''}
                      </div>
                  `).join('')}
              </div>` : '';

        case 'skills':
          return safeSkills && safeSkills.length > 0 ? `
              <div class="section">
                  <div class="section-title">Skills</div>
                  <div class="skills-grid">
                      ${safeSkills.map(skill => `
                          <div class="skill-item">
                              <span class="skill-category">${skill.category || 'Skills'}:</span>
                              <span class="skill-items">${skill.items ? skill.items.join(', ') : skill.name || ''}</span>
                          </div>
                      `).join('')}
                  </div>
              </div>` : '';

        case 'projects':
          console.log('Projects section - safeProjects:', safeProjects, 'length:', safeProjects?.length);
          return safeProjects && safeProjects.length > 0 ? `
              <div class="section">
                  <div class="section-title">Projects</div>
                  ${safeProjects.map(project => `
                      <div class="edu-item">
                          <div class="edu-header">
                              <div>
                                  <div class="institution">${project.name || 'Project'}</div>
                                  ${project.keywords && project.keywords.length > 0 ? `<div style="font-size: 9pt; color: #666;">Technologies: ${project.keywords.join(', ')}</div>` : ''}
                              </div>
                              <div style="text-align: right;">
                                  ${project.url ? `<div class="location"><a href="${project.url}" target="_blank">${project.urlName || project.url}</a></div>` : ''}
                                  <div class="date">${[project.startDate, project.endDate].filter(Boolean).join(' - ') || ''}</div>
                              </div>
                          </div>
                          ${project.description ? `<div class="description" style="margin-top: 8px;">
                              <table style="width: 100%; border: none; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;">
                                  ${project.description.split('\n').filter(line => line.trim()).map(line => {
            const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
            return cleanLine ? `<tr style="border: none; margin: 0; padding: 0;">
                                          <td style="border: none; padding: 0; margin: 0; vertical-align: top; width: 15px; text-align: left;">•</td>
                                          <td style="border: none; padding: 0 0 4px 5px; margin: 0; vertical-align: top; width: auto;">${cleanLine}</td>
                                      </tr>` : '';
          }).join('')}
                              </table>
                          </div>` : ''}
                      </div>
                  `).join('')}
              </div>` : '';

        case 'awards':
          console.log('Awards section - safeAwards:', safeAwards, 'length:', safeAwards?.length);
          return safeAwards && safeAwards.length > 0 ? `
              <div class="section">
                  <div class="section-title">Awards</div>
                  ${safeAwards.map(award => `
                      <div class="edu-item">
                          <div class="edu-header">
                              <div>
                                  <div class="institution">${award.title || 'Award'}</div>
                              </div>
                              <div style="text-align: right;">
                                  <div class="location">${award.awarder || ''}</div>
                                  <div class="date">${award.date || ''}</div>
                              </div>
                          </div>
                          ${award.summary ? `<div class="description" style="margin-top: 8px;">
                              <table style="width: 100%; border: none; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;">
                                  ${award.summary.split('\n').filter(line => line.trim()).map(line => {
            const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
            return cleanLine ? `<tr style="border: none; margin: 0; padding: 0;">
                                          <td style="border: none; padding: 0; margin: 0; vertical-align: top; width: 15px; text-align: left;">•</td>
                                          <td style="border: none; padding: 0 0 4px 5px; margin: 0; vertical-align: top; width: auto;">${cleanLine}</td>
                                      </tr>` : '';
          }).join('')}
                              </table>
                          </div>` : ''}
                      </div>
                  `).join('')}
              </div>` : '';

        default:
          return '';
      }
    }).join('')}
    </body>
    </html>
  `;
}

async function generateResumePDF(resumeData, userId = 'anonymous') {
  console.log('⚡ Fast PDF generation started');
  const startTime = Date.now();

  // Check cache first
  const cacheKey = generateCacheKey(resumeData);
  const cached = PDF_GENERATION_CACHE.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('🚀 Returning cached PDF (ultra-fast!)');
    return cached.pdfBuffer;
  }

  // Check if user already has an active PDF generation
  if (activePdfGenerations.has(userId)) {
    throw new Error('PDF generation already in progress. Please wait for it to complete.');
  }

  // Check global generation limit
  if (activePdfGenerations.size >= config.MAX_CONCURRENT_PDF_GENERATIONS) {
    throw new Error('Server is busy generating PDFs. Please try again in a moment.');
  }

  let browser;
  let page;
  try {
    // Track this generation
    activePdfGenerations.set(userId, Date.now());

    // Generate HTML content with caching
    console.log('🎨 Generating optimized HTML...');
    const htmlContent = generateResumeHTMLCached(resumeData);

    // Get browser from pool (much faster than launching new browser)
    console.log('🔄 Getting browser from pool...');
    browser = await getBrowserFromPool();

    page = await browser.newPage();

    // Optimized page setup
    await Promise.all([
      page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 }),
      page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
      // Disable CSS animations for faster rendering
      page.evaluateOnNewDocument(() => {
        const style = document.createElement('style');
        style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
        document.head.appendChild(style);
      })
    ]);

    // Set optimized timeout
    const timeout = 15000; // Reduced timeout for faster generation
    page.setDefaultTimeout(timeout);
    page.setDefaultNavigationTimeout(timeout);

    console.log('📄 Setting page content (optimized)...');
    // Ultra-fast content loading - no waiting for network
    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded',
      timeout: timeout
    });

    // No additional delays - we're optimized now!

    console.log('⚡ Generating PDF (ultra-fast mode)...');

    // Extract margin values with defaults
    const formatting = resumeData.formatting || {};
    const margins = {
      top: `${formatting.marginTop || '0.75'}in`,
      right: `${formatting.marginRight || '0.75'}in`,
      bottom: `${formatting.marginBottom || '0.75'}in`,
      left: `${formatting.marginLeft || '0.75'}in`
    };

    // Ultra-optimized PDF generation
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      margin: margins,
      omitBackground: false,
      timeout: 10000, // Reduced timeout
      tagged: false, // Faster generation without accessibility tags
      outline: false // Faster generation without document outline
    });

    const generationTime = Date.now() - startTime;
    console.log(`⚡ PDF generated successfully in ${generationTime}ms, size: ${pdfBuffer.length} bytes`);

    // Cache the result for future requests
    PDF_GENERATION_CACHE.set(cacheKey, {
      pdfBuffer,
      timestamp: Date.now()
    });

    return pdfBuffer;

  } catch (error) {
    // Clean up tracking on error
    activePdfGenerations.delete(userId);
    console.error('❌ PDF generation error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    const isProduction = process.env.NODE_ENV === 'production';
    const isRender = process.env.RENDER || process.env.RENDER_SERVICE_ID;

    console.error('Environment info:', {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      isProduction,
      isRender,
      memoryUsage: process.memoryUsage()
    });

    // More specific error detection
    const errorMessage = error.message.toLowerCase();
    const isLaunchError = errorMessage.includes('failed to launch') ||
      errorMessage.includes('could not find browser') ||
      errorMessage.includes('no usable sandbox') ||
      errorMessage.includes('connect') ||
      errorMessage.includes('timeout');

    if (isLaunchError) {
      console.error('🔍 This appears to be a browser launch issue on hosting platform');
      const fallbackError = new Error(
        'PDF preview is not available on this hosting platform. Please use the LaTeX download option instead. ' +
        'This is a common limitation on hosted environments due to browser dependencies.'
      );
      fallbackError.code = 'HOSTING_LIMITATION';
      throw fallbackError;
    }

    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    // Always clean up tracking
    activePdfGenerations.delete(userId);

    // Close page but return browser to pool for reuse
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.error('⚠️ Error closing page:', e.message);
      }
    }

    if (browser) {
      try {
        await returnBrowserToPool(browser);
      } catch (e) {
        console.error('⚠️ Error returning browser to pool:', e.message);
        try {
          await browser.close();
        } catch (closeError) {
          console.error('⚠️ Error closing browser:', closeError.message);
        }
      }
    }
  }
}


async function generateResumeTeX(resumeData) {
  try {
    console.log('📄 Generating LaTeX source for template:', resumeData.selectedTemplate);

    // Ensure section order is present
    if (!resumeData.sections) {
      resumeData.sections = ['profile', 'education', 'work', 'skills', 'projects', 'awards'];
    }

    // Prepare data for LaTeX generators
    const transformedData = {
      ...resumeData,
      basics: {
        name: resumeData.name || '',
        email: resumeData.email || '',
        phone: resumeData.phone || '',
        location: { address: resumeData.address || '' },
        websites: resumeData.websites || []
      },
      work: resumeData.experience || [],
      education: resumeData.education || [],
      skills: resumeData.skills || [],
      projects: resumeData.projects || [],
      awards: resumeData.awards || []
    };

    // Use the template system for LaTeX generation
    const getTemplateData = require('./templates');
    const { texDoc } = getTemplateData(transformedData);
    return texDoc;

  } catch (error) {
    console.error('TeX generation error:', error);
    // Minimal fallback
    return `% Error generating TeX: ${error.message}\n\\documentclass{article}\n\\begin{document}\nResume generation failed.\n\\end{document}`;
  }
}

module.exports = {
  generateResumePDF,
  generateResumeTeX
};