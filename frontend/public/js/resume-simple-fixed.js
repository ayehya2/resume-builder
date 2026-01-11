// Global variables
let selectedTemplate = 1;
window.selectedTemplate = selectedTemplate;

// PDF Generation Cache for faster subsequent generations
const pdfCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Preload optimization
let lastFormDataHash = null;
let preloadTimer = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeTemplateSelection();
    initializeDynamicSections();
    initializePreview();

    // Initialize drag and drop after a short delay to ensure DOM is fully ready
    setTimeout(() => {
        initializeDragAndDrop();
    }, 100);

    initializeMobilePreview();
    initializeBulletPointStyling();
    initializeFormattingUpdates();
    
    // Generate PDF button
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener('click', async function() {
            await generateResume('pdf');
        });
    }
    
    // Generate TeX button  
    const generateTexBtn = document.getElementById('generateResumeBtn');
    if (generateTexBtn) {
        generateTexBtn.addEventListener('click', async function() {
            await generateResume('tex');
        });
    }
    
    // Listen for theme changes and update PDF viewer
    document.addEventListener('themeChanged', function(e) {
        updatePdfViewerForTheme(e.detail.theme);
    });
});

// Function to update PDF viewer elements when theme changes
function updatePdfViewerForTheme(theme) {
    // Force recalculation of CSS variables for PDF viewer elements
    const pdfViewerContainer = document.querySelector('.pdf-viewer-container');
    const pdfToolbar = document.querySelector('.pdf-toolbar');
    const pdfCanvasContainer = document.querySelector('.pdf-canvas-container');
    const pdfBtns = document.querySelectorAll('.pdf-btn');
    
    console.log(`Updating PDF viewer for theme: ${theme}`);
    
    if (pdfViewerContainer) {
        // Force reflow to ensure CSS variables are updated
        pdfViewerContainer.style.display = 'none';
        pdfViewerContainer.offsetHeight; // Trigger reflow
        pdfViewerContainer.style.display = '';
        console.log('Updated PDF viewer container');
    }
    
    if (pdfToolbar) {
        // Force recalculation of toolbar styles
        pdfToolbar.style.display = 'none';
        pdfToolbar.offsetHeight; // Trigger reflow
        pdfToolbar.style.display = '';
        console.log('Updated PDF toolbar');
    }
    
    if (pdfCanvasContainer) {
        // Specifically force the canvas container to update
        pdfCanvasContainer.style.display = 'none';
        pdfCanvasContainer.offsetHeight; // Trigger reflow
        pdfCanvasContainer.style.display = '';
        
        // Also force a style recalculation by temporarily changing a property
        const originalBackground = pdfCanvasContainer.style.background;
        pdfCanvasContainer.style.background = 'transparent';
        pdfCanvasContainer.offsetHeight; // Trigger reflow
        pdfCanvasContainer.style.background = originalBackground;
        
        console.log('Updated PDF canvas container');
    }
    
    // Update all PDF buttons
    pdfBtns.forEach((btn, index) => {
        btn.style.display = 'none';
        btn.offsetHeight; // Trigger reflow
        btn.style.display = '';
        console.log(`Updated PDF button ${index + 1}`);
    });
    
    console.log(`PDF viewer update complete for theme: ${theme}`);
}

// Section navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    const sections = document.querySelectorAll('.section-content');

    console.log('Found nav items:', navItems.length);
    console.log('Found sections:', sections.length);

    navItems.forEach(item => {
        let dragStarted = false;
        let clickTimer = null;

        // Only add drag detection for draggable sections
        if (item.classList.contains('draggable-section')) {
            // Handle mousedown to detect if this is start of a drag
            item.addEventListener('mousedown', function(e) {
                dragStarted = false;
                clickTimer = setTimeout(() => {
                    dragStarted = false;
                }, 200);
            });

            // Handle dragstart to mark that we're dragging
            item.addEventListener('dragstart', function(e) {
                dragStarted = true;
                if (clickTimer) {
                    clearTimeout(clickTimer);
                }
            });
        }

        item.addEventListener('click', function(e) {
            // If drag was started, don't handle click
            if (dragStarted) {
                console.log('🚫 Ignoring click due to drag');
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));

            // Show selected section
            const sectionId = this.dataset.section + '-section';
            console.log('Switching to section:', sectionId);
            const targetSection = document.getElementById(sectionId);
            console.log('Target section found:', targetSection);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('Section activated:', sectionId);
            } else {
                console.log('Section not found:', sectionId);
            }
        });
    });
}

// Template selection
function initializeTemplateSelection() {
    const templateOptions = document.querySelectorAll('.template-option');
    
    templateOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all templates
            templateOptions.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked template
            this.classList.add('active');
            
            // Store selected template
            selectedTemplate = parseInt(this.dataset.template);
            window.selectedTemplate = selectedTemplate;
            console.log('Selected template:', selectedTemplate);
            
            // Update preview
            debouncedUpdatePreview(); // Update preview when form changes
        });
    });
}

// Dynamic sections (add/remove buttons)
function initializeDynamicSections() {
    // Add buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-button') || e.target.closest('.add-button')) {
            e.preventDefault();
            const button = e.target.classList.contains('add-button') ? e.target : e.target.closest('.add-button');
            const text = button.textContent.toLowerCase();
            
            if (text.includes('work')) {
                addWorkSection();
            } else if (text.includes('education')) {
                addEducationSection();
            } else if (text.includes('skill')) {
                addSkillSection();
            } else if (text.includes('project')) {
                addProjectSection();
            } else if (text.includes('award')) {
                addAwardSection();
            } else if (text.includes('website') || text.includes('link')) {
                addWebsiteSection();
            }
        }
    });
    
    // Remove buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-button') || e.target.closest('.remove-button')) {
            e.preventDefault();
            const button = e.target.classList.contains('remove-button') ? e.target : e.target.closest('.remove-button');
            const section = button.closest('.dynamic-section');
            if (section) {
                section.remove();
                throttledPreviewUpdate(); // Use throttled update for better performance
            }
        }
    });
    
    // Bullet points functionality
    document.addEventListener('click', function(e) {
        // Add bullet point
        if (e.target.classList.contains('add-bullet-btn') || e.target.closest('.add-bullet-btn')) {
            e.preventDefault();
            const button = e.target.classList.contains('add-bullet-btn') ? e.target : e.target.closest('.add-bullet-btn');
            const container = button.parentElement.querySelector('.bullet-points-container');
            if (container) {
                addBulletPoint(container);
                throttledPreviewUpdate(); // Use throttled update for better performance
            }
        }
        
        // Remove bullet point
        if (e.target.classList.contains('remove-bullet-btn') || e.target.closest('.remove-bullet-btn')) {
            e.preventDefault();
            const button = e.target.classList.contains('remove-bullet-btn') ? e.target : e.target.closest('.remove-bullet-btn');
            const bulletItem = button.closest('.bullet-point-item');
            const container = button.closest('.bullet-points-container');
            
            if (bulletItem && container && container.children.length > 1) {
                bulletItem.remove();
                updateBulletPointStyling(container);
                throttledPreviewUpdate(); // Use throttled update for better performance
            }
        }

        // Add skill keyword
        if (e.target.classList.contains('add-skill-keyword-btn') || e.target.closest('.add-skill-keyword-btn')) {
            e.preventDefault();
            const button = e.target.classList.contains('add-skill-keyword-btn') ? e.target : e.target.closest('.add-skill-keyword-btn');
            const container = button.parentElement.querySelector('.skill-keywords-container');
            if (container) {
                addSkillKeyword(container);
                throttledPreviewUpdate(); // Use throttled update for better performance
            }
        }

        // Remove skill keyword
        if (e.target.classList.contains('remove-skill-keyword-btn') || e.target.closest('.remove-skill-keyword-btn')) {
            e.preventDefault();
            const button = e.target.classList.contains('remove-skill-keyword-btn') ? e.target : e.target.closest('.remove-skill-keyword-btn');
            const keywordItem = button.closest('.skill-keyword-item');
            const container = button.closest('.skill-keywords-container');
            
            if (keywordItem && container && container.children.length > 1) {
                keywordItem.remove();
                updateSkillKeywordStyling(container);
                throttledPreviewUpdate(); // Use throttled update for better performance
            }
        }
    });
}

// Add section functions
function addWorkSection() {
    const container = document.getElementById('workList');
    if (container) {
        const newSection = createWorkSection();
        container.appendChild(newSection);
        debouncedUpdatePreview(); // Update preview when form changes
    }
}

function addEducationSection() {
    const container = document.getElementById('educationList');
    if (container) {
        const newSection = createEducationSection();
        container.appendChild(newSection);
        debouncedUpdatePreview(); // Update preview when form changes
    }
}

function addSkillSection() {
    const container = document.getElementById('skillsList');
    if (container) {
        const newSection = createSkillSection();
        container.appendChild(newSection);
        debouncedUpdatePreview(); // Update preview when form changes
    }
}

function addProjectSection() {
    const container = document.getElementById('projectsList');
    if (container) {
        const newSection = createProjectSection();
        container.appendChild(newSection);
        debouncedUpdatePreview(); // Update preview when form changes
    }
}

function addAwardSection() {
    const container = document.getElementById('awardsList');
    if (container) {
        const newSection = createAwardSection();
        container.appendChild(newSection);
        debouncedUpdatePreview(); // Update preview when form changes
    }
}

function addWebsiteSection() {
    const container = document.getElementById('websitesList');
    if (container) {
        const newSection = createWebsiteSection();
        container.appendChild(newSection);
        debouncedUpdatePreview(); // Update preview when form changes
    }
}

// Create section functions
function createWorkSection() {
    const div = document.createElement('div');
    div.className = 'dynamic-section work-item';
    div.innerHTML = `
        <button type="button" class="remove-button">Remove</button>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Position</label>
                <input type="text" class="glass-input work-position" placeholder="Software Engineer">
            </div>
            <div class="form-group">
                <label class="form-label">Company</label>
                <input type="text" class="glass-input work-company" placeholder="Tech Corp">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="month" class="glass-input work-start">
            </div>
            <div class="form-group">
                <label class="form-label">End Date</label>
                <input type="month" class="glass-input work-end" placeholder="Leave blank for current">
            </div>
        </div>
        <div class="form-row-full">
            <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" class="glass-input work-location" placeholder="San Francisco, CA">
            </div>
        </div>
        <div class="form-row-full">
            <div class="form-group">
                <label class="form-label">Description</label>
                <div class="bullet-points-container work-bullets">
                    <div class="bullet-point-item">
                        <input type="text" class="glass-input bullet-point-input" placeholder="• Describe your role and achievements...">
                        <button type="button" class="remove-bullet-btn">×</button>
                    </div>
                </div>
                <button type="button" class="add-bullet-btn" data-target="work-bullets">
                    <i class="fas fa-plus"></i> Add bullet point
                </button>
            </div>
        </div>
    `;
    return div;
}

function createEducationSection() {
    const div = document.createElement('div');
    div.className = 'dynamic-section education-item';
    div.innerHTML = `
        <button type="button" class="remove-button">Remove</button>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Institution</label>
                <input type="text" class="glass-input education-institution" placeholder="University of Technology">
            </div>
            <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" class="glass-input education-location" placeholder="Boston, MA">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Degree</label>
                <input type="text" class="glass-input education-degree" placeholder="Bachelor of Science">
            </div>
            <div class="form-group">
                <label class="form-label">Field of Study</label>
                <input type="text" class="glass-input education-area" placeholder="Computer Science">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="month" class="glass-input education-start">
            </div>
            <div class="form-group">
                <label class="form-label">End Date</label>
                <input type="month" class="glass-input education-end">
            </div>
        </div>
        <div class="form-row-full">
            <div class="form-group">
                <label class="form-label">GPA</label>
                <input type="text" class="glass-input education-gpa" placeholder="3.8/4.0">
            </div>
        </div>
        <div class="form-row-full">
            <div class="form-group">
                <label class="form-label">Additional Details</label>
                <div class="bullet-points-container education-bullets">
                    <div class="bullet-point-item">
                        <input type="text" class="glass-input bullet-point-input" placeholder="• Relevant coursework, achievements, activities...">
                        <button type="button" class="remove-bullet-btn">×</button>
                    </div>
                </div>
                <button type="button" class="add-bullet-btn" data-target="education-bullets">
                    <i class="fas fa-plus"></i> Add bullet point
                </button>
            </div>
        </div>
    `;
    return div;
}

function createSkillSection() {
    const div = document.createElement('div');
    div.className = 'dynamic-section skill-item';
    div.innerHTML = `
        <button type="button" class="remove-button">Remove</button>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" class="glass-input skill-name" placeholder="Programming Languages">
            </div>
            <div class="form-group">
                <label class="form-label">Keywords</label>
                <div class="skill-keywords-container">
                    <div class="skill-keyword-item">
                        <input type="text" class="glass-input skill-keyword-input" placeholder="Add a skill...">
                        <button type="button" class="remove-skill-keyword-btn">×</button>
                    </div>
                </div>
                <button type="button" class="add-skill-keyword-btn">
                    <i class="fas fa-plus"></i> Add keyword
                </button>
            </div>
        </div>
    `;
    return div;
}

function createProjectSection() {
    const div = document.createElement('div');
    div.className = 'dynamic-section project-item';
    div.innerHTML = `
        <button type="button" class="remove-button">Remove</button>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Project Name</label>
                <input type="text" class="glass-input project-name" placeholder="Portfolio Website">
            </div>
            <div class="form-group">
                <label class="form-label">URL</label>
                <input type="url" class="glass-input project-url" placeholder="https://github.com/username/project">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">URL Display Name (optional)</label>
                <input type="text" class="glass-input project-url-name" placeholder="View on GitHub">
            </div>
            <div class="form-group">
                <label class="form-label">Technologies</label>
                <input type="text" class="glass-input project-keywords" placeholder="React, Node.js, MongoDB">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="month" class="glass-input project-start">
            </div>
            <div class="form-group">
                <label class="form-label">End Date</label>
                <input type="month" class="glass-input project-end">
            </div>
        </div>
        <div class="form-row-full">
            <div class="form-group">
                <label class="form-label">Description</label>
                <div class="bullet-points-container project-bullets">
                    <div class="bullet-point-item">
                        <input type="text" class="glass-input bullet-point-input" placeholder="• Describe project features and achievements...">
                        <button type="button" class="remove-bullet-btn">×</button>
                    </div>
                </div>
                <button type="button" class="add-bullet-btn" data-target="project-bullets">
                    <i class="fas fa-plus"></i> Add bullet point
                </button>
            </div>
        </div>
    `;
    return div;
}

function createAwardSection() {
    const div = document.createElement('div');
    div.className = 'dynamic-section award-item';
    div.innerHTML = `
        <button type="button" class="remove-button">Remove</button>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Award Title</label>
                <input type="text" class="glass-input award-title" placeholder="Employee of the Month">
            </div>
            <div class="form-group">
                <label class="form-label">Awarder</label>
                <input type="text" class="glass-input award-awarder" placeholder="Tech Corp">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Date</label>
                <input type="month" class="glass-input award-date">
            </div>
            <div class="form-group"></div>
        </div>
        <div class="form-row-full">
            <div class="form-group">
                <label class="form-label">Summary</label>
                <div class="bullet-points-container award-bullets">
                    <div class="bullet-point-item">
                        <input type="text" class="glass-input bullet-point-input" placeholder="• Describe the award and its significance...">
                        <button type="button" class="remove-bullet-btn">×</button>
                    </div>
                </div>
                <button type="button" class="add-bullet-btn" data-target="award-bullets">
                    <i class="fas fa-plus"></i> Add bullet point
                </button>
            </div>
        </div>
    `;
    return div;
}

function createWebsiteSection() {
    const div = document.createElement('div');
    div.className = 'dynamic-section website-item';
    div.innerHTML = `
        <button type="button" class="remove-button">Remove</button>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">URL</label>
                <input type="url" class="glass-input website-url" placeholder="https://johndoe.com">
            </div>
            <div class="form-group">
                <label class="form-label">Display Name</label>
                <input type="text" class="glass-input website-name" placeholder="Portfolio">
            </div>
        </div>
    `;
    return div;
}

// Bullet points functionality
function addBulletPoint(container) {
    // Create new bullet point item div
    const bulletItem = document.createElement('div');
    bulletItem.className = 'bullet-point-item';
    
    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'glass-input bullet-point-input';
    input.placeholder = '• Add your achievement or responsibility...';
    bulletItem.appendChild(input);
    
    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-bullet-btn';
    removeBtn.textContent = '×';
    bulletItem.appendChild(removeBtn);
    
    container.appendChild(bulletItem);
    
    // Update single bullet styling
    updateBulletPointStyling(container);
    
    // Focus on the new input
    const newInput = bulletItem.querySelector('.bullet-point-input');
    if (newInput) {
        newInput.focus();
    }
}

function updateBulletPointStyling(container) {
    if (container.children.length === 1) {
        container.classList.add('single-bullet');
    } else {
        container.classList.remove('single-bullet');
    }
}

// Skill keyword functions
function addSkillKeyword(container) {
    // Create new skill keyword item div
    const keywordItem = document.createElement('div');
    keywordItem.className = 'skill-keyword-item';
    
    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'glass-input skill-keyword-input';
    input.placeholder = 'Add a skill...';
    keywordItem.appendChild(input);
    
    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-skill-keyword-btn';
    removeBtn.textContent = '×';
    keywordItem.appendChild(removeBtn);
    
    container.appendChild(keywordItem);
    
    // Update single keyword styling
    updateSkillKeywordStyling(container);
    
    // Focus on the new input
    const newInput = keywordItem.querySelector('.skill-keyword-input');
    if (newInput) {
        newInput.focus();
    }
}

function updateSkillKeywordStyling(container) {
    if (container.children.length === 1) {
        container.classList.add('single-keyword');
    } else {
        container.classList.remove('single-keyword');
    }
}

function initializeBulletPointStyling() {
    // Initialize styling for all existing bullet point containers
    document.querySelectorAll('.bullet-points-container').forEach(container => {
        updateBulletPointStyling(container);

        // DEBUG: Log the container structure
        console.log('DEBUG: Bullet container found:', container);
        console.log('DEBUG: Container children:', container.children.length);
        Array.from(container.children).forEach((child, index) => {
            console.log(`DEBUG: Child ${index}:`, child, child.className);
        });
    });

    // Initialize styling for all existing skill keyword containers
    document.querySelectorAll('.skill-keywords-container').forEach(container => {
        updateSkillKeywordStyling(container);
    });
}

// Initialize formatting controls to update preview automatically
function initializeFormattingUpdates() {
    // Add throttled event listeners to formatting controls for better performance
    const formattingInputs = document.querySelectorAll('#formatting-section input, #formatting-section select');

    formattingInputs.forEach(input => {
        const eventType = input.type === 'range' ? 'input' : 'change';
        input.addEventListener(eventType, function() {
            throttledPreviewUpdate();
        });
    });

    console.log('✅ Initialized formatting controls for preview updates:', formattingInputs.length);
}

// Preview functionality
function initializePreview() {
    // Manual preview update button
    const updateBtn = document.getElementById('updatePreviewBtn');
    if (updateBtn) {
        updateBtn.addEventListener('click', function() {
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1" style="font-size: 1.2rem;"></i>Loading...';
            updateBtn.disabled = true;
            
            // Cancel any pending debounced updates and run immediately
            if (previewUpdateTimeout) {
                clearTimeout(previewUpdateTimeout);
                previewUpdateTimeout = null;
            }
            
            updatePreview().then(() => {
                updateBtn.innerHTML = '<i class="fas fa-sync me-1"></i>Update Preview';
                updateBtn.disabled = false;
            }).catch(() => {
                updateBtn.innerHTML = '<i class="fas fa-sync me-1"></i>Update Preview';
                updateBtn.disabled = false;
            });
        });
    }
    
    // Initial preview update with slight delay to ensure DOM is ready
    setTimeout(() => {
        debouncedUpdatePreview(); // Update preview when form changes
    }, 100);
}

// Global variables for debouncing and request management
let previewUpdateTimeout = null;
let currentPreviewRequest = null;
let lastResumeDataHash = null;
let lastPDFBlob = null;
let cachedResumeData = null;
let cacheTimestamp = null;

// Request queue and deduplication
let requestQueue = [];
let isProcessingQueue = false;
let lastRequestSignature = null;
let pendingRequest = null;

// Expose cache variables globally for external access
window.lastResumeDataHash = lastResumeDataHash;
window.lastPDFBlob = lastPDFBlob;

// Global throttled preview update function
const throttledPreviewUpdate = throttle(() => {
    debouncedUpdatePreview();
}, 100);

// Simple hash function for caching
function hashObject(obj) {
    return JSON.stringify(obj).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
}

// Smart preview update with request deduplication and queuing
function debouncedUpdatePreview() {
    // Generate request signature for deduplication
    const resumeData = collectResumeData();
    if (!resumeData) return;

    const dataWithSectionOrder = { ...resumeData, currentSectionOrder: sectionOrder };
    const requestSignature = hashObject(dataWithSectionOrder);

    // If this exact request is already pending or the last completed one, skip it
    if (requestSignature === lastRequestSignature ||
        (pendingRequest && pendingRequest.signature === requestSignature)) {
        console.log('🔄 Skipping duplicate preview request');
        return;
    }

    // Clear any pending timeout
    if (previewUpdateTimeout) {
        clearTimeout(previewUpdateTimeout);
    }

    // Cancel any pending request
    if (pendingRequest) {
        if (pendingRequest.controller) {
            pendingRequest.controller.abort();
        }
        pendingRequest = null;
    }

    // Store this request as pending
    pendingRequest = {
        signature: requestSignature,
        timestamp: Date.now(),
        controller: null
    };

    // Use debounced timeout for better UX
    previewUpdateTimeout = setTimeout(() => {
        if (pendingRequest && pendingRequest.signature === requestSignature) {
            processPreviewUpdate(requestSignature);
        }
    }, 150); // Slightly longer timeout to reduce rapid-fire requests
}

function showRetryMessage(container, message, duration) {
    // Check if there's already a PDF viewer and preserve it
    const existingViewer = container.querySelector('.pdf-viewer-container');

    if (existingViewer) {
        // Just show a subtle message in the toolbar
        const toolbar = existingViewer.querySelector('.pdf-toolbar');
        if (toolbar) {
            const existingMessage = toolbar.querySelector('.retry-message');
            if (existingMessage) existingMessage.remove();

            const retryMessage = document.createElement('div');
            retryMessage.className = 'retry-message';
            retryMessage.style.cssText = 'display: flex; align-items: center; color: #f39c12; font-size: 0.9rem; margin-left: 10px;';
            retryMessage.innerHTML = `<i class="fas fa-clock" style="margin-right: 5px;"></i>${message}`;
            toolbar.appendChild(retryMessage);

            setTimeout(() => {
                if (retryMessage.parentNode) {
                    retryMessage.remove();
                }
            }, duration);
        }
    } else {
        // Show full loading state
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #f39c12; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px;">
                <i class="fas fa-clock" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
                <div style="font-size: 1.1rem;">${message}</div>
            </div>
        `;
    }
}

async function processPreviewUpdate(requestSignature) {
    try {
        // Mark this signature as the one being processed
        lastRequestSignature = requestSignature;

        // Create controller for this specific request
        const controller = new AbortController();
        if (pendingRequest) {
            pendingRequest.controller = controller;
        }

        await updatePreview(controller, requestSignature);

    } catch (error) {
        console.error('Error in processPreviewUpdate:', error);
        // Don't set lastRequestSignature if it failed, allow retry
        if (error.name !== 'AbortError') {
            lastRequestSignature = null;
        }
    } finally {
        // Clean up pending request if it matches our signature
        if (pendingRequest && pendingRequest.signature === requestSignature) {
            pendingRequest = null;
        }
    }
}

async function updatePreview(controller = null, requestSignature = null) {
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) return;

    try {

        // Collect form data
        const resumeData = collectResumeData();

        if (!resumeData) {
            console.log('⚠️ No resume data available');
            previewContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">Fill out the form to see preview</div>';
            return;
        }

        // Check if data hasn't changed (caching) - more aggressive caching
        // Include current section order in hash to invalidate cache when order changes
        const dataWithSectionOrder = { ...resumeData, currentSectionOrder: sectionOrder };
        const currentHash = hashObject(dataWithSectionOrder);
        if (lastResumeDataHash === currentHash && lastPDFBlob) {
            await renderPDFWithCustomViewer(lastPDFBlob, previewContainer);
            return;
        }

        // Show minimal loading indicator for immediate feedback
        const existingViewer = previewContainer.querySelector('.pdf-viewer-container');
        if (existingViewer) {
            const toolbar = existingViewer.querySelector('.pdf-toolbar');
            if (toolbar) {
                const spinner = toolbar.querySelector('.loading-spinner');
                if (!spinner) {
                    const loadingSpinner = document.createElement('div');
                    loadingSpinner.className = 'loading-spinner';
                    loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: #007bff; font-size: 1.3rem;"></i>';
                    toolbar.appendChild(loadingSpinner);
                }
            }
        } else {
            // Show minimal loading state only if no viewer exists
            previewContainer.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #6c757d; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px;"><i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; margin-bottom: 15px;"></i><div style="font-size: 1.1rem;">Loading...</div></div>';
        }

        // Remove the redundant loading state since we handle it above


        // Use provided controller or create a new one
        const requestController = controller || new AbortController();
        currentPreviewRequest = requestController;

        // Generate PDF via server with abort signal
        const response = await fetch('/generate-resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ formData: resumeData, format: 'pdf' }),
            signal: requestController.signal
        });

        // Clear the current request since it completed
        currentPreviewRequest = null;

        if (!response.ok) {
            // Handle specific server errors more gracefully
            const errorText = await response.text();

            if (response.status === 429 || errorText.includes('already in progress')) {
                // Server conflict - retry after a delay
                console.log('⏳ Server busy, scheduling retry...');

                // Show user-friendly message
                showRetryMessage(previewContainer, 'Preview is updating, please wait...', 2000);

                setTimeout(() => {
                    if (requestSignature) {
                        // Only retry if this request signature isn't stale
                        const now = Date.now();
                        if (pendingRequest && pendingRequest.signature === requestSignature &&
                            now - pendingRequest.timestamp < 10000) { // 10 second timeout
                            console.log('🔄 Retrying PDF generation...');
                            processPreviewUpdate(requestSignature);
                        }
                    } else {
                        // Fallback for non-signature requests
                        debouncedUpdatePreview();
                    }
                }, 2000); // 2 second delay
                return;
            }

            if (response.status === 503 || errorText.includes('Server is busy')) {
                // Server overloaded - longer retry delay
                console.log('⏳ Server overloaded, scheduling retry...');

                // Show user-friendly message for server overload
                showRetryMessage(previewContainer, 'Server is busy. Retrying in 5 seconds...', 5000);

                setTimeout(() => {
                    debouncedUpdatePreview();
                }, 5000); // 5 second delay
                return;
            }

            throw new Error(`PDF generation failed: ${response.statusText} - ${errorText}`);
        }

        // Get PDF blob and cache it
        const pdfBlob = await response.blob();
        lastPDFBlob = pdfBlob;
        window.lastPDFBlob = lastPDFBlob;
        lastResumeDataHash = currentHash;
        window.lastResumeDataHash = lastResumeDataHash;

        // Remove loading spinner from toolbar
        const toolbar = previewContainer.querySelector('.pdf-toolbar');
        if (toolbar) {
            const spinner = toolbar.querySelector('.loading-spinner');
            if (spinner) spinner.remove();
        }

        // Render PDF with optimized viewer
        await renderPDFWithCustomViewer(pdfBlob, previewContainer);


    } catch (error) {
        currentPreviewRequest = null;

        // Handle AbortError (request was cancelled)
        if (error.name === 'AbortError') {
            console.log('Preview request cancelled');
            return;
        }

        console.error('Preview update error:', error);
        previewContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle"></i>
                Error updating preview: ${error.message}
            </div>
        `;
    }
}

// Old preview functions removed - now using browser PDF preview

// Removed broken function - real collectResumeData is below

function generateClassicHTML(data) {
    console.log('🔍 PREVIEW DATA:', data);

    // Handle both old and new data formats
    const profile = data.profile || data;
    const sections = data.sections || {};

    const name = data.name || profile.firstName + ' ' + profile.lastName || profile.fullName || 'Your Name';

    // Handle websites - could be in different formats
    const websites = data.websites || [];
    const websiteLinks = websites && websites.length ?
        websites.map(website => website.name || website.url).join(' | ') : '';

    const email = data.email || profile.email || '';
    const phone = data.phone || profile.phone || '';
    const address = data.address || profile.address || profile.location || '';

    const contactInfo = [
        email,
        phone,
        address,
        websiteLinks
    ].filter(Boolean).join(' | ');

    let html = `
        <div class="preview-header">
            <div class="preview-name">${name}</div>
            <div class="preview-contact">${contactInfo}</div>
        </div>
    `;

    // Use section order - prioritize current sectionOrder from global variable, then data.sections from collectResumeData
    const currentSectionOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : (data.sections || ['profile', 'education', 'work', 'skills', 'projects', 'awards']);
    console.log('🔄 Using section order:', currentSectionOrder);
    console.log('🔍 Global sectionOrder:', sectionOrder, 'data.sections from form:', data.sections);

    // Define section generators
    const sectionGenerators = {
        work: () => {
            const workExperience = data.experience || sections.work || [];
            if (workExperience && workExperience.length > 0) {
                let sectionHtml = '<div class="preview-section-title">Work Experience</div>';
                workExperience.forEach(job => {
                    const dateRange = [job.startDate, job.endDate || 'Present'].filter(Boolean).join(' - ');
                    let description = '';
                    if (job.bulletPoints && job.bulletPoints.length > 0) {
                        description = '<ul>' + job.bulletPoints.map(bullet => `<li>${bullet}</li>`).join('') + '</ul>';
                    } else if (job.description) {
                        description = `<p>${job.description}</p>`;
                    }

                    sectionHtml += `
                        <div class="preview-item">
                            <div class="preview-item-header">
                                <span><strong>${job.position}</strong> at ${job.company}</span>
                                <span>${dateRange}</span>
                            </div>
                            ${job.location ? `<div class="preview-item-subtitle">${job.location}</div>` : ''}
                            ${description}
                        </div>
                    `;
                });
                return sectionHtml;
            }
            return '';
        },

        education: () => {
            const education = data.education || sections.education || [];
            if (education && education.length > 0) {
                let sectionHtml = '<div class="preview-section-title">Education</div>';
                education.forEach(edu => {
                    const degree = [edu.degree, edu.field || edu.area].filter(Boolean).join(' in ');
                    const graduationDate = edu.graduationDate || edu.endDate || '';

                    let description = '';
                    if (edu.bulletPoints && edu.bulletPoints.length > 0) {
                        description = '<ul>' + edu.bulletPoints.map(bullet => `<li>${bullet}</li>`).join('') + '</ul>';
                    } else if (edu.description) {
                        description = `<p>${edu.description}</p>`;
                    }

                    sectionHtml += `
                        <div class="preview-item">
                            <div class="preview-item-header">
                                <span><strong>${degree}</strong></span>
                                <span>${graduationDate}</span>
                            </div>
                            <div class="preview-item-subtitle">${edu.institution}${edu.location ? ', ' + edu.location : ''}</div>
                            ${edu.gpa ? `<div class="preview-item-subtitle">GPA: ${edu.gpa}</div>` : ''}
                            ${description}
                        </div>
                    `;
                });
                return sectionHtml;
            }
            return '';
        },

        skills: () => {
            const skills = data.skills || sections.skills || [];
            if (skills && skills.length > 0) {
                let sectionHtml = '<div class="preview-section-title">Skills</div>';
                skills.forEach(skill => {
                    const skillItems = skill.items || skill.keywords || [];
                    const skillText = Array.isArray(skillItems) ? skillItems.join(', ') : skillItems;
                    if (skill.category && skillText) {
                        sectionHtml += `
                            <div class="preview-item">
                                <strong>${skill.category}:</strong> ${skillText}
                            </div>
                        `;
                    }
                });
                return sectionHtml;
            }
            return '';
        },

        projects: () => {
            const projects = data.projects || sections.projects || [];
            if (projects && projects.length > 0) {
                let sectionHtml = '<div class="preview-section-title">Projects</div>';
                projects.forEach(project => {
                    const dateRange = [project.startDate, project.endDate].filter(Boolean).join(' - ');

                    const technologies = project.technologies || (project.keywords ? (Array.isArray(project.keywords) ? project.keywords : [project.keywords]) : []);
                    const techText = technologies && technologies.length > 0 ? technologies.join(', ') : '';

                    let description = '';
                    if (project.bulletPoints && project.bulletPoints.length > 0) {
                        description = '<ul>' + project.bulletPoints.map(bullet => `<li>${bullet}</li>`).join('') + '</ul>';
                    } else if (project.description) {
                        description = `<p>${project.description}</p>`;
                    }

                    sectionHtml += `
                        <div class="preview-item">
                            <div class="preview-item-header">
                                <span><strong>${project.name}</strong></span>
                                <span>${dateRange}</span>
                            </div>
                            ${techText ? `<div class="preview-item-subtitle">${techText}</div>` : ''}
                            ${description}
                            ${project.url ? `<p><a href="${project.url}" target="_blank">${project.urlName || project.url}</a></p>` : ''}
                        </div>
                    `;
                });
                return sectionHtml;
            }
            return '';
        },

        awards: () => {
            const awards = data.awards || sections.awards || [];
            if (awards && awards.length > 0) {
                let sectionHtml = '<div class="preview-section-title">Awards</div>';
                awards.forEach(award => {
                    let description = '';
                    if (award.bulletPoints && award.bulletPoints.length > 0) {
                        description = '<ul>' + award.bulletPoints.map(bullet => `<li>${bullet}</li>`).join('') + '</ul>';
                    } else if (award.summary) {
                        description = `<p>${award.summary}</p>`;
                    } else if (award.description) {
                        description = `<p>${award.description}</p>`;
                    }

                    sectionHtml += `
                        <div class="preview-item">
                            <div class="preview-item-header">
                                <span><strong>${award.title}</strong></span>
                                <span>${award.date || ''}</span>
                            </div>
                            ${award.awarder || award.issuer ? `<div class="preview-item-subtitle">${award.awarder || award.issuer}</div>` : ''}
                            ${description}
                        </div>
                    `;
                });
                return sectionHtml;
            }
            return '';
        }
    };

    // Generate sections in the specified order
    currentSectionOrder.forEach(sectionName => {
        if (sectionName !== 'profile' && sectionName !== 'templates' && sectionGenerators[sectionName]) {
            const sectionHtml = sectionGenerators[sectionName]();
            if (sectionHtml) {
                html += sectionHtml;
            }
        }
    });

    return html;
}

function generateAwesomeCVHTML(data) {
    const name = data.name || 'Your Name';
    const names = name.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';
    
    return `
        <div style="text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 3px solid #2196F3;">
            <div style="font-size: 28px; font-weight: 300; color: #333; margin-bottom: 0.5rem;">
                <span style="font-weight: 100;">${firstName}</span> 
                <span style="font-weight: 700;">${lastName}</span>
            </div>
            <div style="font-size: 11px; color: #666; margin-top: 8px;">
                📧 ${data.email || 'email@example.com'} | 📱 ${data.phone || 'phone'} | 📍 ${data.address || 'address'}
            </div>
        </div>
        ${generateClassicHTML(data).replace(/<div class="preview-header">.*?<\/div>/s, '')}
    `;
}

function generateBankingHTML(data) {
    const name = data.name || 'Your Name';
    return `
        <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #2c3e50; text-align: center;">${name}</div>
            <div style="font-size: 11px; color: #34495e; text-align: center; margin-top: 0.5rem;">
                ${[data.email, data.phone, data.address].filter(Boolean).join(' • ')}
            </div>
        </div>
        ${generateClassicHTML(data).replace(/<div class="preview-header">.*?<\/div>/s, '')}
    `;
}

function generateDeedyHTML(data) {
    const name = data.name || 'Your Name';
    const names = name.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';
    
    return `
        <div style="margin-bottom: 2rem;">
            <div style="font-size: 32px; font-weight: 300; color: #333; margin-bottom: 0.5rem;">
                ${firstName} <span style="font-weight: 100; color: #666;">${lastName}</span>
            </div>
            <div style="height: 2px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); margin: 0.5rem 0;"></div>
            <div style="font-size: 11px; color: #666;">
                ${[data.email, data.phone].filter(Boolean).join(' | ')}
            </div>
        </div>
        ${generateClassicHTML(data).replace(/<div class="preview-header">.*?<\/div>/s, '')}
    `;
}

function applyTemplateStyles(container, templateId) {
    // Remove existing template classes
    container.className = container.className.replace(/template-\d+/g, '').trim();
    
    // Add new template class
    container.classList.add(`template-${templateId}`);
    
    // Apply template-specific styles
    switch(templateId) {
        case 1: // Classic
            container.style.fontFamily = "'Times New Roman', serif";
            container.style.fontSize = '12px';
            container.style.lineHeight = '1.4';
            break;
        case 2: // Awesome CV
            container.style.fontFamily = "'Roboto', sans-serif";
            container.style.fontSize = '11px';
            container.style.lineHeight = '1.3';
            container.style.color = '#333';
            break;
        case 3: // Banking
            container.style.fontFamily = "'Arial', sans-serif";
            container.style.fontSize = '11px';
            container.style.lineHeight = '1.2';
            break;
        case 4: // Deedy
            container.style.fontFamily = "'Lato', sans-serif";
            container.style.fontSize = '11px';
            container.style.lineHeight = '1.25';
            break;
        default:
            container.style.fontFamily = "'Times New Roman', serif";
            container.style.fontSize = '12px';
            container.style.lineHeight = '1.4';
    }
}

function getCurrentSectionOrderFromDOM() {
    const navSections = document.getElementById('nav-sections');
    if (!navSections) return [];

    const sections = navSections.querySelectorAll('.sidebar-nav-item[data-section]');
    const orderFromDOM = [];

    // Only include content sections that can be rendered in the preview
    const validContentSections = ['work', 'education', 'skills', 'projects', 'awards'];

    sections.forEach(section => {
        const sectionName = section.getAttribute('data-section');
        if (sectionName && validContentSections.includes(sectionName)) {
            orderFromDOM.push(sectionName);
        }
    });

    return orderFromDOM;
}

function collectResumeData() {
    // Collect basic information from profile section
    const name = document.getElementById('fullName')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const address = document.getElementById('address')?.value || '';
    
    // Collect websites
    const websites = [];
    document.querySelectorAll('.website-item').forEach(item => {
        const url = item.querySelector('.website-url')?.value || '';
        const name = item.querySelector('.website-name')?.value || '';
        
        if (url) {
            websites.push({
                url,
                name: name || url
            });
        }
    });
    
    // Collect experience
    const experience = [];
    document.querySelectorAll('.work-item').forEach(item => {
        const company = item.querySelector('.work-company')?.value || '';
        const position = item.querySelector('.work-position')?.value || '';
        const location = item.querySelector('.work-location')?.value || '';
        const startDate = item.querySelector('.work-start')?.value || '';
        const endDate = item.querySelector('.work-end')?.value || '';
        
        // Collect bullet points for description
        const bulletPoints = [];
        item.querySelectorAll('.bullet-point-input').forEach(input => {
            const value = input.value.trim();
            if (value) {
                // Remove leading bullet if user added one
                const cleanValue = value.replace(/^[•\-\*]\s*/, '');
                bulletPoints.push(cleanValue);
            }
        });
        
        const description = bulletPoints.length > 0 ? bulletPoints.join('\n• ') : '';
        
        
        if (company || position) {
            experience.push({
                company,
                position,
                location,
                startDate,
                endDate,
                description: description ? '• ' + description : ''
            });
        }
    });
    
    // Collect education
    const education = [];
    console.log('🔍 EDUCATION DEBUG: Looking for education items...');
    console.log('Education items found:', document.querySelectorAll('.education-item').length);
    document.querySelectorAll('.education-item').forEach((item, index) => {
        console.log(`Education item ${index}:`, item);
        const institution = item.querySelector('.education-institution')?.value || '';
        const degree = item.querySelector('.education-degree')?.value || '';
        const field = item.querySelector('.education-area')?.value || '';
        const location = item.querySelector('.education-location')?.value || '';
        const graduationDate = item.querySelector('.education-end')?.value || '';
        const gpa = item.querySelector('.education-gpa')?.value || '';
        
        // Collect bullet points for additional details
        const bulletPoints = [];
        console.log(`Education ${index} - Looking for bullet points...`);
        console.log(`Education ${index} - Bullet inputs found:`, item.querySelectorAll('.bullet-point-input').length);
        item.querySelectorAll('.bullet-point-input').forEach(input => {
            const value = input.value.trim();
            console.log(`Education ${index} - Bullet input value:`, value);
            if (value) {
                // Remove leading bullet if user added one
                const cleanValue = value.replace(/^[•\-\*]\s*/, '');
                bulletPoints.push(cleanValue);
            }
        });
        
        const description = bulletPoints.length > 0 ? bulletPoints.join('\n• ') : '';
        console.log(`Education ${index} data:`, { institution, degree, field, location, graduationDate, gpa, description });
        
        if (institution || degree || description) {
            education.push({
                institution,
                degree,
                field,
                location,
                graduationDate,
                gpa,
                description: description ? '• ' + description : ''
            });
        }
    });
    
    // Collect skills
    const skills = [];
    document.querySelectorAll('.skill-item').forEach(item => {
        const category = item.querySelector('.skill-name')?.value || '';
        
        // Collect individual skill keywords
        const keywords = [];
        item.querySelectorAll('.skill-keyword-input').forEach(input => {
            const value = input.value.trim();
            if (value) {
                keywords.push(value);
            }
        });
        
        if (category || keywords.length > 0) {
            skills.push({
                category,
                items: keywords
            });
        }
    });
    
    // Collect projects
    const projects = [];
    console.log('Looking for project items...');
    document.querySelectorAll('.project-item').forEach((item, index) => {
        console.log(`Project item ${index}:`, item);
        const name = item.querySelector('.project-name')?.value || '';
        const url = item.querySelector('.project-url')?.value || '';
        const urlName = item.querySelector('.project-url-name')?.value || '';
        const startDate = item.querySelector('.project-start')?.value || '';
        const endDate = item.querySelector('.project-end')?.value || '';
        const technologies = item.querySelector('.project-keywords')?.value || '';
        
        // Collect bullet points for description
        const bulletPoints = [];
        item.querySelectorAll('.bullet-point-input').forEach(input => {
            const value = input.value.trim();
            if (value) {
                // Remove leading bullet if user added one
                const cleanValue = value.replace(/^[•\-\*]\s*/, '');
                bulletPoints.push(cleanValue);
            }
        });
        
        const description = bulletPoints.length > 0 ? bulletPoints.join('\n• ') : '';
        
        console.log(`Project ${index} data:`, { name, url, urlName, description, technologies });
        
        if (name || description) {
            projects.push({
                name,
                url,
                urlName,
                startDate,
                endDate,
                keywords: technologies.split(',').map(s => s.trim()).filter(s => s),
                description: description ? '• ' + description : ''
            });
        }
    });
    console.log('Total projects collected:', projects);
    
    // Collect awards
    const awards = [];
    console.log('Looking for award items...');
    document.querySelectorAll('.award-item').forEach((item, index) => {
        console.log(`Award item ${index}:`, item);
        const title = item.querySelector('.award-title')?.value || '';
        const awarder = item.querySelector('.award-awarder')?.value || '';
        const date = item.querySelector('.award-date')?.value || '';
        
        // Collect bullet points for summary
        const bulletPoints = [];
        item.querySelectorAll('.bullet-point-input').forEach(input => {
            const value = input.value.trim();
            if (value) {
                // Remove leading bullet if user added one
                const cleanValue = value.replace(/^[•\-\*]\s*/, '');
                bulletPoints.push(cleanValue);
            }
        });
        
        const summary = bulletPoints.length > 0 ? bulletPoints.join('\n• ') : '';
        
        console.log(`Award ${index} data:`, { title, awarder, date, summary });
        
        if (title || summary) {
            awards.push({
                title,
                awarder,
                date,
                summary: summary ? '• ' + summary : ''
            });
        }
    });
    console.log('Total awards collected:', awards);
    
    // Get current section order from DOM (this is the most reliable source)
    const currentDOMOrder = getCurrentSectionOrderFromDOM();
    console.log('Current section order from DOM:', currentDOMOrder);
    console.log('Global sectionOrder variable:', sectionOrder);

    // Get bullet point spacing setting
    const bulletSpacing = document.getElementById('bullet-spacing')?.value || '15';

    // Collect formatting settings from the formatting tab
    const formatting = {};
    const formattingInputs = document.querySelectorAll('#formatting-section input, #formatting-section select');
    formattingInputs.forEach(input => {
        if (input.type === 'checkbox') {
            formatting[input.id] = input.checked;
        } else if (input.type === 'radio') {
            if (input.checked) formatting[input.name] = input.value;
        } else {
            formatting[input.id] = input.value;
        }
    });

    console.log('Collected formatting settings:', formatting);

    const result = {
        name,
        email,
        phone,
        address,
        websites,
        experience,
        education,
        skills,
        projects,
        awards,
        selectedTemplate,
        sections: currentDOMOrder.length > 0 ? currentDOMOrder : sectionOrder,
        bulletSpacing: bulletSpacing + 'px',
        formatting: formatting
    };
    
    console.log('Final resume data being sent:', result);
    return result;
}

// Make collectResumeData available globally for JSON export
window.collectResumeData = collectResumeData;

// Performance optimization functions
function generateDataHash(data, format) {
    // Create a simple hash from the data for caching
    const str = JSON.stringify({
        name: data.name,
        experience: data.experience,
        education: data.education,
        skills: data.skills,
        projects: data.projects,
        awards: data.awards,
        selectedTemplate: data.selectedTemplate,
        formatting: data.formatting,
        sections: data.sections,
        format: format
    });

    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

// Intelligent preloading - prepare PDF in background when user is likely to generate
function scheduleIntelligentPreload() {
    clearTimeout(preloadTimer);

    preloadTimer = setTimeout(async () => {
        const currentData = collectResumeData();
        const currentHash = generateDataHash(currentData, 'pdf');

        // Only preload if data has changed and user seems active
        if (currentHash !== lastFormDataHash && isUserActive()) {
            console.log('🧠 Intelligent preload: preparing PDF in background...');
            lastFormDataHash = currentHash;

            try {
                // Preload PDF in background without UI updates
                await preloadPDF(currentData);
            } catch (error) {
                console.log('Preload failed (normal):', error.message);
            }
        }
    }, 3000); // Wait 3 seconds after last change
}

function isUserActive() {
    // Simple heuristic - user is active if they've made changes recently
    return document.hasFocus() && (Date.now() - lastUserActivity) < 60000; // 1 minute
}

let lastUserActivity = Date.now();

// Track user activity
document.addEventListener('input', () => {
    lastUserActivity = Date.now();
    scheduleIntelligentPreload();
});

document.addEventListener('change', () => {
    lastUserActivity = Date.now();
    scheduleIntelligentPreload();
});

async function preloadPDF(formData) {
    const cacheKey = generateDataHash(formData, 'pdf');

    // Don't preload if already cached
    if (pdfCache.has(cacheKey)) return;

    const response = await fetch('/generate-resume', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Preload': 'true' // Hint to server this is a preload request
        },
        body: JSON.stringify({
            formData: {
                ...formData,
                _clientHints: {
                    preload: true,
                    timestamp: Date.now()
                }
            },
            format: 'pdf'
        })
    });

    if (response.ok) {
        const pdfBlob = await response.blob();
        const buffer = await pdfBlob.arrayBuffer();

        pdfCache.set(cacheKey, {
            data: buffer,
            timestamp: Date.now(),
            type: 'application/pdf'
        });

        console.log('🚀 PDF preloaded successfully - next generation will be instant!');
    }
}

// Utility functions for debouncing and throttling
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

async function generateResume(format, buttonElement = null) {
    // If no button element is passed, try to find the original buttons (for backwards compatibility)
    if (!buttonElement) {
        const generatePdfBtn = document.getElementById('generatePdfBtn');
        const generateTexBtn = document.getElementById('generateResumeBtn');
        buttonElement = format === 'pdf' ? generatePdfBtn : generateTexBtn;
    }
    
    let originalText = '';
    
    try {
        // Show loading state only if button exists
        if (buttonElement) {
            originalText = buttonElement.innerHTML;
            buttonElement.disabled = true;
            buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Generating ${format.toUpperCase()}...`;
        }
        
        // Collect form data with optimizations
        const formData = collectResumeData();

        // Generate cache key for potential caching
        const cacheKey = generateDataHash(formData, format);

        // Check cache first for ultra-fast results
        const cached = pdfCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('🚀 Using cached PDF - instant generation!');

            // Create blob from cached data
            const blob = new Blob([cached.data], {
                type: format === 'pdf' ? 'application/pdf' : 'text/plain'
            });

            // Get filename
            const filenameInput = document.getElementById('pdfFilename');
            const customFilename = filenameInput ? filenameInput.value.trim() : '';
            const filename = customFilename || (format === 'pdf' ? 'resume.pdf' : 'resume.tex');

            // Download immediately
            downloadFile(blob, filename, blob.type);
            return;
        }

        // Add client-side performance hints
        const optimizedData = {
            ...formData,
            _clientHints: {
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                requestId: Math.random().toString(36).substr(2, 9),
                cacheKey: cacheKey
            }
        };

        // Choose the correct endpoint
        const endpoint = '/generate-resume';

        // Enhanced fetch with optimizations
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/pdf, application/octet-stream',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ formData: optimizedData, format }),
            // Add timeout and signal for better UX
            signal: AbortSignal.timeout(60000) // 60 second timeout
        });
        
        if (!response.ok) {
            // If PDF generation failed, check if it's a LaTeX issue
            const errorText = await response.text();
            if (format === 'pdf' && errorText.includes('pdflatex')) {
                console.warn('⚠️ PDF generation failed - LaTeX not available. Downloading TeX source instead.');
                // Fall back to generating TeX source
                const texResponse = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ formData, format: 'tex' })
                });
                
                if (texResponse.ok) {
                    const texContent = await texResponse.text();
                    const blob = new Blob([texContent], { type: 'text/plain' });
                    const filenameInput = document.getElementById('pdfFilename');
                    const customFilename = filenameInput ? filenameInput.value.trim() : '';
                    const baseFilename = customFilename ? customFilename.replace(/\.pdf$/i, '') : 'resume';
                    const texFilename = baseFilename + '.tex';
                    downloadFile(blob, texFilename, 'text/plain');
                    return;
                }
            }
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        // Get custom filename from PDF toolbar if available
        const filenameInput = document.getElementById('pdfFilename');
        let customFilename = filenameInput ? filenameInput.value.trim() : '';
        
        // Handle the response based on format
        if (format === 'pdf') {
            // For PDF, the server already compiled it - just download
            console.log('✅ PDF generated successfully on server');
            const pdfBlob = await response.blob();
            const filename = customFilename || 'resume.pdf';

            // Cache the PDF for future requests
            pdfBlob.arrayBuffer().then(buffer => {
                pdfCache.set(cacheKey, {
                    data: buffer,
                    timestamp: Date.now(),
                    type: 'application/pdf'
                });
                console.log('📦 PDF cached for future requests');
            });

            downloadFile(pdfBlob, filename, 'application/pdf');
        } else {
            const texContent = await response.text();
            const blob = new Blob([texContent], { type: 'text/plain' });

            // Cache the TeX content
            pdfCache.set(cacheKey, {
                data: new TextEncoder().encode(texContent),
                timestamp: Date.now(),
                type: 'text/plain'
            });

            // For TEX files, change extension
            const baseFilename = customFilename ? customFilename.replace(/\.pdf$/i, '') : 'resume';
            const texFilename = baseFilename + '.tex';
            downloadFile(blob, texFilename, 'text/plain');
        }
        
    } catch (error) {
        console.error('Error generating resume:', error);
        alert(`Error generating ${format.toUpperCase()}: ${error.message}`);
    } finally {
        // Restore button only if it exists
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalText;
        }
    }
}

async function printResume() {
    try {
        const data = collectResumeData();
        
        // Generate PDF for printing
        const response = await fetch('/generate-resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ formData: data, format: 'pdf' })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate PDF for printing');
        }
        
        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Open PDF in new tab and trigger print dialog
        const printWindow = window.open(pdfUrl, '_blank');
        printWindow.addEventListener('load', () => {
            printWindow.print();
        });
        
        // Clean up URL after some delay
        setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
        }, 10000);
        
    } catch (error) {
        console.error('Print error:', error);
        alert('Failed to prepare resume for printing. Please try again.');
    }
}

async function renderPDFWithCustomViewer(pdfBlob, container) {
    try {
        // Set up PDF.js worker (only once)
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const pdfData = await pdfBlob.arrayBuffer();

        // Use promise caching for PDF loading
        const pdf = await pdfjsLib.getDocument({
            data: pdfData,
            disableFontFace: false,
            disableAutoFetch: false,
            disableStream: false
        }).promise;

        let currentPage = 1;
        let scale = 1.2;
        let isRendering = false;
        
        // Create custom PDF viewer HTML
        container.innerHTML = `
            <div class="pdf-viewer-container">
                <div class="pdf-toolbar">
                    <div class="pdf-controls">
                        <button class="pdf-btn" id="prevPage" title="Previous Page">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span class="pdf-page-info">
                            Page <span id="currentPageNum">1</span> of <span id="totalPages">${pdf.numPages}</span>
                        </span>
                        <button class="pdf-btn" id="nextPage" title="Next Page">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    
                    <div class="pdf-filename-container">
                        <i class="fas fa-file-pdf" style="color: #e74c3c; margin-right: 0.5rem;"></i>
                        <input type="text" id="pdfFilename" class="pdf-filename-input" value="resume.pdf" title="Click to edit filename">
                    </div>
                    
                    <div class="pdf-controls">
                        <button class="pdf-btn" id="zoomOut" title="Zoom Out">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        <button class="pdf-btn" id="zoomIn" title="Zoom In">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button class="pdf-btn" onclick="generateResume('tex', this)" title="Download LaTeX" style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;">
                            <i class="fas fa-file-code me-1"></i>TEX
                        </button>
                        <button class="pdf-btn" onclick="generateResume('pdf', this)" title="Download PDF" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;">
                            <i class="fas fa-file-pdf me-1"></i>PDF
                        </button>
                        <button class="pdf-btn" onclick="printResume()" title="Print" style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%) !important;">
                            <i class="fas fa-print me-1"></i>PRINT
                        </button>
                    </div>
                </div>
                <div class="pdf-canvas-container">
                    <canvas id="pdfCanvas" class="pdf-canvas"></canvas>
                </div>
            </div>
        `;
        
        const canvas = document.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');
        const currentPageSpan = document.getElementById('currentPageNum');
        
        // Optimized render page function with debouncing
        async function renderPage(pageNum) {
            if (isRendering) return;
            isRendering = true;

            try {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({scale: scale});

                // Only update canvas dimensions if they changed
                if (canvas.height !== viewport.height || canvas.width !== viewport.width) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Batch DOM updates
                    requestAnimationFrame(() => {
                        canvas.style.maxWidth = 'none';
                        canvas.style.width = viewport.width + 'px';
                        canvas.style.height = viewport.height + 'px';
                        canvas.style.display = 'block';
                        canvas.style.margin = '0 auto';
                    });
                }

                // Clear canvas efficiently
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport,
                    enableWebGL: true
                };

                await page.render(renderContext).promise;
                currentPageSpan.textContent = pageNum;

            } finally {
                isRendering = false;
            }
        }
        
        // Throttled event handlers for better performance
        const throttledPrevPage = throttle(async () => {
            if (currentPage > 1) {
                currentPage--;
                await renderPage(currentPage);
            }
        }, 200);

        const throttledNextPage = throttle(async () => {
            if (currentPage < pdf.numPages) {
                currentPage++;
                await renderPage(currentPage);
            }
        }, 200);

        const throttledZoomOut = throttle(async () => {
            if (scale > 0.5) {
                scale = Math.round((scale - 0.2) * 10) / 10;
                await renderPage(currentPage);
                updateButtons();
            }
        }, 300);

        const throttledZoomIn = throttle(async () => {
            if (scale < 3.0) {
                scale = Math.round((scale + 0.2) * 10) / 10;
                await renderPage(currentPage);
                updateButtons();
            }
        }, 300);

        // Event listeners with throttling
        document.getElementById('prevPage').addEventListener('click', throttledPrevPage);
        document.getElementById('nextPage').addEventListener('click', throttledNextPage);
        document.getElementById('zoomOut').addEventListener('click', throttledZoomOut);
        document.getElementById('zoomIn').addEventListener('click', throttledZoomIn);
        
        // Optimized button state updates with requestAnimationFrame
        function updateButtons() {
            requestAnimationFrame(() => {
                const prevBtn = document.getElementById('prevPage');
                const nextBtn = document.getElementById('nextPage');
                const zoomOutBtn = document.getElementById('zoomOut');
                const zoomInBtn = document.getElementById('zoomIn');

                if (prevBtn) prevBtn.disabled = currentPage <= 1;
                if (nextBtn) nextBtn.disabled = currentPage >= pdf.numPages;
                if (zoomOutBtn) zoomOutBtn.disabled = scale <= 0.5;
                if (zoomInBtn) zoomInBtn.disabled = scale >= 3.0;
            });
        }
        
        // Initialize filename functionality
        const filenameInput = document.getElementById('pdfFilename');
        const resumeData = collectResumeData();
        const defaultName = (resumeData.name || 'resume').replace(/\s+/g, '_');
        filenameInput.value = defaultName + '.pdf';
        
        // Auto-update filename when name changes
        filenameInput.addEventListener('blur', function() {
            let filename = this.value.trim();
            if (!filename) {
                filename = defaultName + '.pdf';
                this.value = filename;
            } else if (!filename.toLowerCase().endsWith('.pdf')) {
                filename += '.pdf';
                this.value = filename;
            }
        });
        
        filenameInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                this.blur();
            }
        });

        // Initial render
        await renderPage(currentPage);
        updateButtons();
        
        // Update buttons on page change
        const observer = new MutationObserver(updateButtons);
        observer.observe(currentPageSpan, { childList: true });
        
    } catch (error) {
        console.error('PDF.js rendering error:', error);
        // Fallback to iframe if PDF.js fails
        const pdfUrl = URL.createObjectURL(pdfBlob);
        container.innerHTML = `
            <iframe src="${pdfUrl}" width="100%" height="100%" frameborder="0"></iframe>
        `;
    }
}

// Removed compileLatexToPDF function - now using server-side PDF compilation
async function removedFunction_compileLatexToPDF(texSource) {
    // This function is no longer needed
        // Wait for SwiftLaTeX to be ready
        console.log('🔄 Waiting for SwiftLaTeX to load...');
        let PdfTeXEngine;
        
        if (window.swiftLatexReady) {
            try {
                PdfTeXEngine = await window.swiftLatexReady;
                console.log('📦 SwiftLaTeX Promise resolved with:', typeof PdfTeXEngine);
            } catch (loadError) {
                console.error('SwiftLaTeX loading failed:', loadError);
                throw new Error('SwiftLaTeX PdfTeX engine not available - downloading TeX source instead');
            }
        } else {
            // Fallback: check if already loaded
            PdfTeXEngine = window.PdfTeXEngine;
            console.log('📦 Fallback PdfTeXEngine type:', typeof PdfTeXEngine);
            if (!PdfTeXEngine) {
                throw new Error('SwiftLaTeX PdfTeX engine not available - downloading TeX source instead');
            }
        }
        
        // Verify it's a constructor
        if (typeof PdfTeXEngine !== 'function') {
            console.error('❌ PdfTeXEngine is not a function/constructor, type:', typeof PdfTeXEngine);
            console.log('🔍 PdfTeXEngine value:', PdfTeXEngine);
            throw new Error('SwiftLaTeX PdfTeX engine not available as constructor - downloading TeX source instead');
        }
        
        try {
            console.log('🔄 Initializing SwiftLaTeX engine...');
            const engine = new PdfTeXEngine();
            
            // Initialize the engine
            console.log('🔄 Loading SwiftLaTeX engine...');
            await engine.loadEngine();
            console.log('✅ SwiftLaTeX engine loaded');
            
            // Write the TeX file to memory
            console.log('🔄 Writing TeX file to memory...');
            console.log('📄 LaTeX source preview:', texSource.substring(0, 500) + '...');
            await engine.writeMemFSFile('resume.tex', texSource);
            console.log('✅ TeX file written to memory');
            
            // Set the main file
            console.log('🔄 Setting main file...');
            await engine.setEngineMainFile('resume.tex');
            console.log('✅ Main file set to resume.tex');
            
            // Compile LaTeX to PDF
            console.log('🔄 Starting LaTeX compilation...');
            const result = await engine.compileLaTeX();
            console.log('✅ LaTeX compilation completed, result:', result);
            
            // Get compilation log for debugging
            const logText = await engine.getStdout();
            console.log('📄 LaTeX compilation log:', logText);
            
            if (!result || !result.pdf) {
                console.error('❌ No PDF output generated');
                console.error('📄 Full compilation log:', logText);
                throw new Error('LaTeX compilation failed - no PDF output generated. Check console for compilation log.');
            }
            
            console.log('✅ PDF compilation successful! PDF size:', result.pdf.length, 'bytes');
            return new Blob([result.pdf], { type: 'application/pdf' });
        
    } catch (error) {
        console.error('PDF compilation error:', error);
        throw error;
    }
}

function downloadFile(blob, filename, mimeType) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Section ordering for resume generation - make it globally accessible
let sectionOrder = ['profile', 'education', 'work', 'skills', 'projects', 'awards'];
window.sectionOrder = sectionOrder;

function initializeDragAndDrop() {
    console.log('🔄 Initializing drag and drop...');
    const navSections = document.getElementById('nav-sections');
    if (!navSections) {
        console.warn('⚠️ nav-sections element not found');
        return;
    }

    // Clean up any existing event listeners and data
    const existingDraggables = navSections.querySelectorAll('.draggable-section');
    existingDraggables.forEach(section => {
        section.removeEventListener('dragstart', handleDragStart);
        section.removeEventListener('dragend', handleDragEnd);
    });

    navSections.removeEventListener('dragover', handleDragOver);
    navSections.removeEventListener('drop', handleDrop);
    navSections.removeEventListener('dragenter', handleDragEnter);
    navSections.removeEventListener('dragleave', handleDragLeave);

    // Add event listeners to draggable sections (exclude fixed sections)
    const draggableSections = navSections.querySelectorAll('.draggable-section:not([data-fixed="true"])');
    console.log('🎯 Found draggable sections:', draggableSections.length);

    draggableSections.forEach((section, index) => {
        console.log(`📎 Adding listeners to section ${index}:`, section.getAttribute('data-section'));

        // Ensure draggable attribute is set
        section.setAttribute('draggable', 'true');
        section.style.cursor = 'grab';

        // Add drag event listeners with proper options
        section.addEventListener('dragstart', handleDragStart, { passive: false });
        section.addEventListener('dragend', handleDragEnd, { passive: false });
    });

    // Add drop zone listeners to nav container with proper options
    navSections.addEventListener('dragover', handleDragOver, { passive: false });
    navSections.addEventListener('drop', handleDrop, { passive: false });
    navSections.addEventListener('dragenter', handleDragEnter, { passive: false });
    navSections.addEventListener('dragleave', handleDragLeave, { passive: false });

    console.log('✅ Drag and drop initialization complete');

    // Debug: Test if elements are actually draggable
    setTimeout(() => {
        const testDraggable = navSections.querySelector('.draggable-section');
        if (testDraggable) {
            console.log('🧪 Testing draggable element:', testDraggable.getAttribute('data-section'), 'draggable:', testDraggable.draggable);
        }
    }, 100);
}

// Helper function to re-initialize drag and drop if needed
function reinitializeDragAndDrop() {
    console.log('🔄 Re-initializing drag and drop...');
    initializeDragAndDrop();
}

// Make it globally accessible for debugging
window.reinitializeDragAndDrop = reinitializeDragAndDrop;

let draggedElement = null;

function handleDragStart(e) {
    console.log('🖱️ Drag started on:', this.getAttribute('data-section'));

    // Prevent dragging fixed sections (templates and profile)
    if (this.getAttribute('data-fixed') === 'true') {
        console.log('🚫 Preventing drag on fixed section');
        e.preventDefault();
        return false;
    }

    // Ensure we're dragging the section, not a child element
    if (e.target !== this && !this.contains(e.target)) {
        e.preventDefault();
        return false;
    }

    draggedElement = this;
    this.classList.add('dragging');
    this.style.cursor = 'grabbing';

    // Set proper drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-section'));

    // Create a drag image
    e.dataTransfer.setDragImage(this, e.offsetX, e.offsetY);

    console.log('✅ Drag start completed for section:', this.getAttribute('data-section'));
}

function handleDragEnd(e) {
    console.log('🔚 Drag ended for:', this.getAttribute('data-section'));

    this.classList.remove('dragging');
    this.style.cursor = 'grab';

    // Clean up any drop indicators
    document.querySelectorAll('.drop-indicator').forEach(indicator => {
        indicator.remove();
    });

    // Reset drag state
    draggedElement = null;

    console.log('✅ Drag end cleanup complete');
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();

    // Only allow drop if we have a valid dragged element
    if (!draggedElement || draggedElement.getAttribute('data-fixed') === 'true') {
        e.dataTransfer.dropEffect = 'none';
        return false;
    }

    e.dataTransfer.dropEffect = 'move';

    // Show drop indicator only in valid zones
    const afterElement = getDragAfterElement(this, e.clientY);
    const existingIndicator = document.querySelector('.drop-indicator');

    if (existingIndicator) {
        existingIndicator.remove();
    }

    // Check if the proposed drop location is valid
    const topFixedSections = [...this.querySelectorAll('.sidebar-nav-item[data-section="templates"], .sidebar-nav-item[data-section="profile"]')];
    const bottomFixedSections = [...this.querySelectorAll('.sidebar-nav-item[data-section="analysis"]')];

    let showIndicator = true;
    let insertLocation = afterElement;

    if (afterElement == null) {
        // Trying to drop at the end - only allow if no bottom fixed sections exist
        if (bottomFixedSections.length > 0) {
            // Redirect to before the analysis section
            insertLocation = bottomFixedSections[0];
        }
    } else if (afterElement.getAttribute('data-section') === 'analysis') {
        // Trying to drop after analysis - redirect to before analysis
        insertLocation = afterElement;
    } else if (topFixedSections.includes(afterElement)) {
        // Trying to drop before templates/profile - find first draggable section
        const firstDraggableSection = this.querySelector('.sidebar-nav-item:not([data-fixed="true"])');
        if (firstDraggableSection) {
            insertLocation = firstDraggableSection;
        } else if (bottomFixedSections.length > 0) {
            insertLocation = bottomFixedSections[0];
        } else {
            showIndicator = false;
        }
    }

    if (showIndicator && insertLocation && insertLocation !== draggedElement) {
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator';
        this.insertBefore(indicator, insertLocation);
    }

    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    console.log('🎯 Drop event triggered');
    e.preventDefault();
    e.stopPropagation();

    // Clean up any drop indicators
    document.querySelectorAll('.drop-indicator').forEach(indicator => {
        indicator.remove();
    });

    if (draggedElement !== null) {
        console.log('📦 Handling drop for:', draggedElement.getAttribute('data-section'));
        const afterElement = getDragAfterElement(this, e.clientY);
        const originalParent = draggedElement.parentNode;

        // Get top fixed sections (templates, profile) and bottom fixed sections (analysis)
        const topFixedSections = [...this.querySelectorAll('.sidebar-nav-item[data-section="templates"], .sidebar-nav-item[data-section="profile"], .sidebar-nav-item[data-section="formatting"]')];
        const bottomFixedSections = [...this.querySelectorAll('.sidebar-nav-item[data-section="analysis"]')];

        console.log('Drop afterElement:', afterElement ? afterElement.getAttribute('data-section') : 'null');

        let targetLocation = null;

        // Determine where to insert the element
        if (afterElement && afterElement.getAttribute('data-section') === 'analysis') {
            // Insert before the analysis section
            console.log('Inserting before analysis section');
            targetLocation = afterElement;
        } else if (afterElement == null) {
            // Check if we're trying to append at the end
            if (bottomFixedSections.length > 0) {
                // Insert before the first bottom fixed section (analysis)
                console.log('Inserting before analysis at end');
                targetLocation = bottomFixedSections[0];
            } else {
                console.log('Appending at end');
                targetLocation = null; // Append at end
            }
        } else {
            // Normal insertion - but check if we're trying to insert before top fixed sections
            if (topFixedSections.includes(afterElement)) {
                // Don't allow insertion before templates/profile - find first draggable section
                const firstDraggableSection = this.querySelector('.draggable-section:not(.dragging)');
                if (firstDraggableSection && firstDraggableSection !== draggedElement) {
                    console.log('Inserting before first draggable section');
                    targetLocation = firstDraggableSection;
                } else {
                    // If no draggable sections exist, insert before analysis
                    if (bottomFixedSections.length > 0) {
                        console.log('No draggable sections, inserting before analysis');
                        targetLocation = bottomFixedSections[0];
                    }
                }
            } else {
                console.log('Normal insertion before:', afterElement.getAttribute('data-section'));
                targetLocation = afterElement;
            }
        }

        // Perform the actual move
        if (targetLocation) {
            this.insertBefore(draggedElement, targetLocation);
        } else {
            this.appendChild(draggedElement);
        }

        // Update section order after successful drop
        updateSectionOrder();
        console.log('✅ Drop completed and section order updated');
    }

    this.classList.remove('drag-over');
    return false;
}

function getDragAfterElement(container, y) {
    // Include top fixed sections (templates, profile) but exclude bottom fixed sections (analysis)
    // and exclude dragging elements
    const draggableElements = [...container.querySelectorAll('.sidebar-nav-item:not(.dragging):not([data-section="analysis"])')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateSectionOrder() {
    const navSections = document.getElementById('nav-sections');
    if (!navSections) return;

    const sections = navSections.querySelectorAll('.sidebar-nav-item[data-section]');
    const newOrder = [];

    // Only include content sections that can be rendered in the preview
    const validContentSections = ['work', 'education', 'skills', 'projects', 'awards'];

    sections.forEach(section => {
        const sectionName = section.getAttribute('data-section');
        if (sectionName && validContentSections.includes(sectionName)) {
            newOrder.push(sectionName);
        }
    });

    sectionOrder = newOrder;
    window.sectionOrder = sectionOrder;
    console.log('New section order:', sectionOrder);

    // Clear cache to ensure preview updates with new section order
    lastResumeDataHash = null;
    window.lastResumeDataHash = null;
    lastPDFBlob = null;
    window.lastPDFBlob = null;

    // Update preview to reflect the new section order
    debouncedUpdatePreview();
}

// Mobile preview functionality
function initializeMobilePreview() {
    const mobilePreviewBtn = document.getElementById('mobilePreviewBtn');

    if (!mobilePreviewBtn) return;

    mobilePreviewBtn.addEventListener('click', async function() {
        try {
            // Show loading state
            const originalHtml = mobilePreviewBtn.innerHTML;
            mobilePreviewBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Generating...';
            mobilePreviewBtn.disabled = true;

            const data = collectResumeData();
            const response = await fetch('/generate-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ formData: data, format: 'pdf' })
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const pdfBlob = await response.blob();
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Open PDF in new tab/window
            window.open(pdfUrl, '_blank');

        } catch (error) {
            console.error('Error generating mobile preview:', error);
            alert('Failed to generate PDF preview');
        } finally {
            mobilePreviewBtn.innerHTML = '<i class="fas fa-eye me-1"></i>VIEW PREVIEW';
            mobilePreviewBtn.disabled = false;
        }
        mobilePreviewContent.innerHTML = '';
    });
}

// Bullet point spacing control
function initializeBulletSpacing() {
    const spacingSlider = document.getElementById('bullet-spacing');
    const spacingValue = document.getElementById('spacing-value');
    
    if (spacingSlider && spacingValue) {
        // Update display value
        spacingSlider.addEventListener('input', function() {
            const value = this.value;
            spacingValue.textContent = value + 'px';
            
            // Apply the spacing to all bullet point items
            document.documentElement.style.setProperty('--bullet-spacing', value + 'px');
            
            // Update preview automatically
            debouncedUpdatePreview(); // Update preview when form changes
        });
        
        // Set initial value
        document.documentElement.style.setProperty('--bullet-spacing', '15px');
    }
}

// Initialize bullet spacing when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if template is handling initialization (avoid conflicts)
    if (!window.templateHandlesInit) {
        console.log('🔧 External JS initializing...');
        initializeBulletSpacing();
        initializeAutoSave();
        loadExistingResumeData();
    } else {
        console.log('📋 Template handling initialization, external JS providing support functions only');
        // Still initialize features that don't conflict with data loading
        initializeBulletSpacing();
        initializeAutoSave();
        
        // Don't call loadExistingResumeData() to prevent duplicate loading
    }
});

// Auto-save functionality
let autoSaveTimer;
let currentResumeId = null;
let hasUnsavedChanges = false;

function initializeAutoSave() {
    // Get resume ID from URL if editing existing resume
    const urlParams = new URLSearchParams(window.location.search);
    currentResumeId = urlParams.get('id');
    
    // Set up auto-save on form changes
    const form = document.getElementById('resume-form');
    if (form) {
        form.addEventListener('input', handleFormChange);
        form.addEventListener('change', handleFormChange);
    }
    
    // Show save status indicator
    createSaveStatusIndicator();
    
    // Prevent leaving with unsaved changes
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}

// Optimized form change handler with throttling
const handleFormChange = throttle(() => {
    hasUnsavedChanges = true;
    updateSaveStatus('unsaved');

    // Clear existing timer
    clearTimeout(autoSaveTimer);

    // Set new timer for auto-save (3 seconds after last change)
    autoSaveTimer = setTimeout(autoSaveResume, 3000);
}, 100);

async function autoSaveResume() {
    if (!hasUnsavedChanges) return;
    
    try {
        updateSaveStatus('saving');
        const resumeData = collectResumeData();
        const title = document.getElementById('name')?.value || 'My Resume';
        
        const response = await fetch('/api/save-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resumeData: resumeData,
                resumeId: currentResumeId,
                title: title
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update current resume ID if this was a new resume
            if (!currentResumeId && result.resumeId) {
                currentResumeId = result.resumeId;
                // Update URL without refreshing page
                const newUrl = `/resume-builder?id=${result.resumeId}`;
                window.history.replaceState({}, '', newUrl);
            }
            
            hasUnsavedChanges = false;
            updateSaveStatus('saved');
        } else {
            throw new Error(result.message || 'Save failed');
        }
        
    } catch (error) {
        console.error('Auto-save error:', error);
        updateSaveStatus('error');
    }
}

async function loadExistingResumeData() {
    if (!currentResumeId) return;
    
    try {
        const response = await fetch(`/api/load-resume?resumeId=${currentResumeId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            // Check if the template's populate function exists and use it instead
            if (typeof populateFormWithResumeData === 'function') {
                console.log('✅ Using template populate function');
                populateFormWithResumeData(result.data);
            } else {
                console.log('✅ Using local populate function');
                populateFormWithData(result.data);
            }
            debouncedUpdatePreview(); // Update preview when form changes
        }
        
    } catch (error) {
        console.error('Error loading resume data:', error);
    }
}

function populateFormWithData(data) {
    console.log('🔍 Populating form with data:', data);
    
    // Basic info - handle both data formats
    const profile = data.profile || data;
    
    // Helper function to safely set field values
    function setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value) {
            field.value = value;
        } else if (!field) {
            console.warn(`⚠️ Field not found: ${fieldId}`);
        }
    }
    
    // Set basic profile fields with proper ID mapping
    if (profile.firstName && profile.lastName) {
        setFieldValue('fullName', `${profile.firstName} ${profile.lastName}`);
    } else if (profile.name) {
        setFieldValue('fullName', profile.name);
    }
    
    setFieldValue('email', profile.email);
    setFieldValue('phone', profile.phone);
    setFieldValue('website', profile.website);
    // Use 'address' instead of 'location' - this was the main issue
    setFieldValue('address', profile.location || profile.address);
    setFieldValue('linkedin', profile.linkedin);
    setFieldValue('github', profile.github);
    setFieldValue('summary', profile.summary);
    
    // Handle sections data structure
    const sections = data.sections || data;
    
    // Websites
    const websitesData = sections.websites || data.websites;
    if (websitesData && websitesData.length > 0) {
        const websitesContainer = document.getElementById('websitesList');
        if (websitesContainer) {
            console.log('🔧 Populating websites:', websitesData);
            
            websitesData.forEach((website, index) => {
                let websiteItem = websitesContainer.querySelectorAll('.dynamic-section')[index];
                
                if (!websiteItem) {
                    // Create new website item by clicking Add button
                    const addBtn = websitesContainer.querySelector('.add-button');
                    if (addBtn) {
                        addBtn.click();
                        setTimeout(() => {
                            const allItems = websitesContainer.querySelectorAll('.dynamic-section');
                            websiteItem = allItems[index];
                            populateWebsiteItem(websiteItem, website);
                        }, 50);
                    }
                } else {
                    populateWebsiteItem(websiteItem, website);
                }
            });
        }
    }
    
    // Experience
    const experienceData = sections.work || sections.experience || data.experience;
    if (experienceData && experienceData.length > 0) {
        const experienceContainer = document.getElementById('workList');
        if (experienceContainer) {
            console.log('🔧 Populating work experience:', experienceData);
            
            experienceData.forEach((exp, index) => {
                let workItem = experienceContainer.querySelectorAll('.dynamic-section')[index];
                
                if (!workItem) {
                    // Create new work item by clicking Add button
                    const addBtn = experienceContainer.querySelector('.add-button');
                    if (addBtn) {
                        addBtn.click();
                        setTimeout(() => {
                            const allItems = experienceContainer.querySelectorAll('.dynamic-section');
                            workItem = allItems[index];
                            populateWorkItem(workItem, exp);
                        }, 50);
                    }
                } else {
                    populateWorkItem(workItem, exp);
                }
            });
        }
    }
    
    // Education
    const educationData = sections.education || data.education;
    if (educationData && educationData.length > 0) {
        const educationContainer = document.getElementById('educationList');
        if (educationContainer) {
            console.log('🔧 Populating education:', educationData);
            
            educationData.forEach((edu, index) => {
                let educationItem = educationContainer.querySelectorAll('.dynamic-section')[index];
                
                if (!educationItem) {
                    // Create new education item by clicking Add button
                    const addBtn = educationContainer.querySelector('.add-button');
                    if (addBtn) {
                        addBtn.click();
                        setTimeout(() => {
                            const allItems = educationContainer.querySelectorAll('.dynamic-section');
                            educationItem = allItems[index];
                            populateEducationItem(educationItem, edu);
                        }, 50);
                    }
                } else {
                    populateEducationItem(educationItem, edu);
                }
            });
        }
    }
    
}

function populateWebsiteItem(websiteItem, website) {
    if (!websiteItem || !website) return;
    
    console.log('🔧 Populating website item:', website);
    const nameInput = websiteItem.querySelector('.website-name');
    const urlInput = websiteItem.querySelector('.website-url');
    
    if (nameInput) nameInput.value = website.name || '';
    if (urlInput) urlInput.value = website.url || '';
}

function populateWorkItem(workItem, exp) {
    if (!workItem || !exp) return;
    
    console.log('🔧 Populating work item:', exp);
    const positionInput = workItem.querySelector('.work-position');
    const companyInput = workItem.querySelector('.work-company');
    const locationInput = workItem.querySelector('.work-location');
    const startInput = workItem.querySelector('.work-start');
    const endInput = workItem.querySelector('.work-end');
    
    if (positionInput) positionInput.value = exp.position || '';
    if (companyInput) companyInput.value = exp.company || '';
    if (locationInput) locationInput.value = exp.location || '';
    if (startInput) startInput.value = exp.startDate || '';
    if (endInput) endInput.value = exp.endDate || '';
    
    // Handle bullet points - check both formats (array or description with newlines)
    let bulletPoints = exp.bulletPoints || [];
    if (!bulletPoints.length && exp.description) {
        // Parse description into bullet points (remove bullet symbols and split by newlines)
        bulletPoints = exp.description.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[•\-\*]\s*/, '')); // Remove bullet symbols
    }
    
    if (bulletPoints && bulletPoints.length > 0) {
        const bulletsList = workItem.querySelector('.bullets-list');
        if (bulletsList) {
            console.log('🔧 Adding work bullet points:', bulletPoints);
            
            bulletPoints.forEach((bullet, index) => {
                const addBulletBtn = workItem.querySelector('.add-bullet-btn');
                if (addBulletBtn) {
                    addBulletBtn.click();
                    setTimeout(() => {
                        const bulletInputs = bulletsList.querySelectorAll('.bullet-point-input');
                        const newInput = bulletInputs[bulletInputs.length - 1];
                        if (newInput) newInput.value = bullet;
                    }, 10 + (index * 10)); // Stagger the timeouts
                }
            });
        }
    }
}

function populateEducationItem(educationItem, edu) {
    if (!educationItem || !edu) return;
    
    console.log('🔧 Populating education item:', edu);
    const institutionInput = educationItem.querySelector('.education-institution');
    const degreeInput = educationItem.querySelector('.education-degree');
    const areaInput = educationItem.querySelector('.education-area');
    const locationInput = educationItem.querySelector('.education-location');
    const startInput = educationItem.querySelector('.education-start');
    const endInput = educationItem.querySelector('.education-end');
    const gpaInput = educationItem.querySelector('.education-gpa');
    
    if (institutionInput) institutionInput.value = edu.institution || '';
    if (degreeInput) degreeInput.value = edu.degree || '';
    if (areaInput) areaInput.value = edu.area || edu.field || '';
    if (locationInput) locationInput.value = edu.location || '';
    if (startInput) startInput.value = edu.startDate || '';
    if (endInput) endInput.value = edu.endDate || edu.graduationDate || '';
    if (gpaInput) gpaInput.value = edu.gpa || '';
    
    // Handle bullet points - check both formats (array or description with newlines)
    let bulletPoints = edu.bulletPoints || [];
    if (!bulletPoints.length && edu.description) {
        // Parse description into bullet points (remove bullet symbols and split by newlines)
        bulletPoints = edu.description.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[•\-\*]\s*/, '')); // Remove bullet symbols
    }
    
    if (bulletPoints && bulletPoints.length > 0) {
        const bulletsList = educationItem.querySelector('.bullets-list');
        if (bulletsList) {
            console.log('🔧 Adding education bullet points:', bulletPoints);
            
            bulletPoints.forEach((bullet, index) => {
                const addBulletBtn = educationItem.querySelector('.add-bullet-btn');
                if (addBulletBtn) {
                    addBulletBtn.click();
                    setTimeout(() => {
                        const bulletInputs = bulletsList.querySelectorAll('.bullet-point-input');
                        const newInput = bulletInputs[bulletInputs.length - 1];
                        if (newInput) newInput.value = bullet;
                    }, 10 + (index * 10)); // Stagger the timeouts
                }
            });
        }
    }
    
    // Template selection
    if (data.selectedTemplate) {
        selectedTemplate = data.selectedTemplate;
        selectTemplate(data.selectedTemplate);
    }
    
    // Sections order
    if (data.sections) {
        sectionOrder = data.sections;
        window.sectionOrder = sectionOrder;
    }
}

function createSaveStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'save-status';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000;
        transition: all 0.3s ease;
        display: none;
    `;
    document.body.appendChild(indicator);
}

function updateSaveStatus(status) {
    const indicator = document.getElementById('save-status');
    if (!indicator) return;
    
    switch (status) {
        case 'saving':
            indicator.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';
            indicator.style.background = 'rgba(59, 130, 246, 0.9)';
            indicator.style.color = 'white';
            indicator.style.display = 'block';
            break;
        case 'saved':
            indicator.innerHTML = '<i class="fas fa-check me-1"></i>Saved';
            indicator.style.background = 'rgba(34, 197, 94, 0.9)';
            indicator.style.color = 'white';
            indicator.style.display = 'block';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 2000);
            break;
        case 'unsaved':
            indicator.innerHTML = '<i class="fas fa-circle me-1"></i>Unsaved changes';
            indicator.style.background = 'rgba(245, 158, 11, 0.9)';
            indicator.style.color = 'white';
            indicator.style.display = 'block';
            break;
        case 'error':
            indicator.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>Save failed';
            indicator.style.background = 'rgba(239, 68, 68, 0.9)';
            indicator.style.color = 'white';
            indicator.style.display = 'block';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 5000);
            break;
    }
}

// Manual save function for save button
async function manualSave() {
    await autoSaveResume();
}


