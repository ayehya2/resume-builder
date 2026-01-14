/**
 * Data Manager for Resume Builder
 * Handles form collection, population, and server interaction
 */

const DataManager = {
    currentResumeId: null,

    /**
     * Collects all resume data from the form
     */
    collectResumeData: function () {
        try {
            console.log('🔍 DATA: Collecting resume data');

            const fullNameField = document.getElementById('fullName');
            const emailField = document.getElementById('email');
            const phoneField = document.getElementById('phone');
            const addressField = document.getElementById('address');

            const fullName = fullNameField?.value || '';

            const resumeData = {
                name: fullName,
                email: emailField?.value || '',
                phone: phoneField?.value || '',
                address: addressField?.value || '',
                websites: [],
                experience: [],
                education: [],
                skills: [],
                projects: [],
                awards: [],
                selectedTemplate: window.selectedTemplate || 1,
                formatting: this.collectFormattingData()
            };

            // Collect websites
            const websitesList = document.getElementById('websitesList');
            if (websitesList) {
                const websiteItems = websitesList.querySelectorAll('.website-item');
                websiteItems.forEach(item => {
                    const url = item.querySelector('.website-url')?.value;
                    const name = item.querySelector('.website-name')?.value;
                    if (url) resumeData.websites.push({
                        url: url || '',
                        name: name || url
                    });
                });
            }

            // Collect dynamic sections
            const sections = ['education', 'work', 'skills', 'projects', 'awards'];
            sections.forEach(section => {
                const list = document.getElementById(section + 'List');
                if (list) {
                    const items = list.querySelectorAll('.dynamic-section');
                    items.forEach(item => {
                        const entry = {};
                        const inputs = item.querySelectorAll('input, select, textarea');
                        const bulletPoints = [];
                        const skillKeywords = [];

                        inputs.forEach(input => {
                            const val = input.value.trim();
                            if (!val) return;

                            if (input.classList.contains('bullet-point-input')) {
                                // Remove leading bullet if user added one
                                const cleanValue = val.replace(/^[•\-\*]\s*/, '');
                                bulletPoints.push(cleanValue);
                            } else if (input.classList.contains('skill-keyword-input')) {
                                skillKeywords.push(val);
                            } else {
                                // Extract class name as key (e.g., work-position -> position)
                                const classList = Array.from(input.classList);
                                const relevantClass = classList.find(c => c.startsWith(section + '-'));
                                if (relevantClass) {
                                    const key = relevantClass.replace(section + '-', '');
                                    entry[key] = val;
                                } else if (input.name) {
                                    entry[input.name] = val;
                                }
                            }
                        });

                        // Post-process bullets/keywords for compatibility
                        if (bulletPoints.length > 0) {
                            entry.description = '• ' + bulletPoints.join('\n• ');
                        }
                        if (skillKeywords.length > 0) {
                            if (section === 'skills') {
                                entry.items = skillKeywords;
                            } else {
                                entry.keywords = skillKeywords;
                            }
                        }

                        if (Object.keys(entry).length > 0) {
                            const targetKey = section === 'work' ? 'experience' : section;
                            resumeData[targetKey].push(entry);
                        }
                    });
                }
            });

            // Section Order
            if (typeof window.sectionOrder !== 'undefined') {
                resumeData.sections = window.sectionOrder;
            } else {
                resumeData.sections = ['profile', 'education', 'work', 'skills', 'projects', 'awards'];
            }

            return resumeData;
        } catch (error) {
            console.error('Error collecting resume data:', error);
            return null;
        }
    },

    /**
     * Collects formatting settings
     */
    collectFormattingData: function () {
        const formatting = {};
        const section = document.getElementById('formatting-section');
        if (section) {
            const inputs = section.querySelectorAll('input, select');
            inputs.forEach(input => {
                formatting[input.id || input.name] = input.value;
            });
        }
        return formatting;
    },

    /**
     * Populates the form with resume data
     */
    populateForm: function (data) {
        if (!data) return;
        console.log('🔄 DATA: Populating form with data', data);

        // Profile
        if (data.name) {
            if (document.getElementById('fullName')) document.getElementById('fullName').value = data.name;
            if (document.getElementById('email')) document.getElementById('email').value = data.email || '';
            if (document.getElementById('phone')) document.getElementById('phone').value = data.phone || '';
            if (document.getElementById('address')) document.getElementById('address').value = data.address || '';
        } else if (data.profile) {
            const fullName = [data.profile.firstName, data.profile.lastName].filter(Boolean).join(' ');
            if (document.getElementById('fullName')) document.getElementById('fullName').value = fullName;
            if (document.getElementById('email')) document.getElementById('email').value = data.profile.email || '';
            if (document.getElementById('phone')) document.getElementById('phone').value = data.profile.phone || '';
            if (document.getElementById('address')) document.getElementById('address').value = data.profile.address || '';
        }

        // Websites
        const websitesList = document.getElementById('websitesList');
        if (websitesList && data.websites) {
            websitesList.innerHTML = '';
            data.websites.forEach(site => {
                this.addWebsiteEntry(site);
            });
        }

        // Sections
        const sections = ['education', 'work', 'skills', 'projects', 'awards'];
        sections.forEach(section => {
            const list = document.getElementById(section + 'List');
            const targetKey = section === 'work' ? 'experience' : section;
            const entries = data[targetKey] || data.sections?.[section] || [];

            if (list && entries.length > 0) {
                // capture template before wiping
                const template = list.querySelector('.dynamic-section');
                if (template) {
                    list.innerHTML = '';
                    entries.forEach(entry => {
                        this.addSectionEntry(section, entry, template);
                    });
                }
            }
        });

        // Formatting
        if (data.formatting) {
            Object.entries(data.formatting).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) {
                    el.value = value;
                    el.dispatchEvent(new Event('change'));
                }
            });
        }
    },

    /**
     * Helper to add a website entry
     */
    addWebsiteEntry: function (data = {}) {
        const list = document.getElementById('websitesList');
        const template = `
            <div class="dynamic-section website-item">
                <button type="button" class="remove-button">Remove</button>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">URL</label>
                        <input type="url" class="glass-input website-url" value="${data.url || ''}" placeholder="https://johndoe.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Display Name</label>
                        <input type="text" class="glass-input website-name" value="${data.name || ''}" placeholder="Portfolio">
                    </div>
                </div>
            </div>`;
        list.insertAdjacentHTML('beforeend', template);
    },

    /**
     * Helper to add a section entry (work, edu, etc.)
     */
    addSectionEntry: function (section, data = {}, providedTemplate = null) {
        const list = document.getElementById(section + 'List');
        if (!list) return;

        // Find the template (first item in the list) or use provided one
        const templateItem = providedTemplate || list.querySelector('.dynamic-section');
        if (!templateItem) {
            console.error('No template item found for section:', section);
            return;
        }

        // Clone the template
        const newItem = templateItem.cloneNode(true);

        // Clear all inputs in the clone
        newItem.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        // Clear extra bullet points (keep only first one)
        const bulletContainers = newItem.querySelectorAll('.bullet-points-container, .skill-keywords-container');
        bulletContainers.forEach(container => {
            const items = container.children;
            for (let i = items.length - 1; i > 0; i--) {
                items[i].remove();
            }
        });

        // Append to list
        list.appendChild(newItem);

        // Fill with data if provided
        if (Object.keys(data).length > 0) {
            this.fillEntry(section, newItem, data);
        }

        // Trigger UI updates
        this.triggerPreviewUpdate();

        return newItem;
    },

    /**
     * Fills a dynamic section entry with data
     */
    fillEntry: function (section, element, data) {
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'bulletPoints' && Array.isArray(value)) {
                const container = element.querySelector('.bullet-points-container');
                const addBulletBtn = element.querySelector('.add-bullet-btn');
                value.forEach((bullet, idx) => {
                    if (idx > 0 && addBulletBtn) addBulletBtn.click();
                    const inputs = element.querySelectorAll('.bullet-point-input');
                    if (inputs[idx]) inputs[idx].value = bullet;
                });
            } else if (key === 'keywords' && Array.isArray(value)) {
                const addKeywordBtn = element.querySelector('.add-skill-keyword-btn');
                value.forEach((keyword, idx) => {
                    if (idx > 0 && addKeywordBtn) addKeywordBtn.click();
                    const inputs = element.querySelectorAll('.skill-keyword-input');
                    if (inputs[idx]) inputs[idx].value = keyword;
                });
            } else {
                const input = element.querySelector(`.${section}-${key}`) || element.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });
    },

    /**
     * Loads a resume from the server
     */
    loadResumeFromServer: function (resumeId) {
        fetch(`/api/load-resume?resumeId=${resumeId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data) {
                    this.populateForm(data.data);
                    this.currentResumeId = resumeId;
                    if (window.showNotification) window.showNotification(`Loaded: ${data.title || 'Resume'}`, 'success');
                    this.triggerPreviewUpdate();
                } else {
                    if (window.showNotification) window.showNotification('Error loading resume', 'error');
                }
            })
            .catch(error => {
                console.error('Error loading resume:', error);
                if (window.showNotification) window.showNotification('Error loading resume', 'error');
            });
    },

    /**
     * Clears all dynamic sections
     */
    clearAllSections: function () {
        ['education', 'work', 'skills', 'projects', 'awards'].forEach(section => {
            const list = document.getElementById(section + 'List');
            if (list) {
                const items = list.querySelectorAll('.dynamic-section');
                for (let i = items.length - 1; i > 0; i--) items[i].remove();
                if (items[0]) {
                    items[0].querySelectorAll('input, textarea').forEach(input => input.value = '');
                }
            }
        });
    },

    /**
     * Triggers a preview update
     */
    triggerPreviewUpdate: function () {
        if (window.PreviewManager) {
            window.PreviewManager.debouncedUpdatePreview();
        }
    },

    /**
     * Loads example data into the form
     */
    /**
     * Returns example data object
     */
    getExampleData: function () {
        return {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "(555) 123-4567",
            address: "San Francisco, CA",
            websites: [
                { name: "Portfolio", url: "https://johndoe.design" },
                { name: "LinkedIn", url: "https://linkedin.com/in/johndoe" }
            ],
            education: [
                {
                    institution: "University of Technology",
                    degree: "Bachelor of Science",
                    area: "Computer Science",
                    startDate: "2018-09",
                    endDate: "2022-05",
                    score: "3.8 GPA",
                    location: "Boston, MA"
                }
            ],
            experience: [
                {
                    company: "Tech Solutions Inc.",
                    position: "Senior Software Engineer",
                    location: "San Francisco, CA",
                    startDate: "2022-06",
                    endDate: "",
                    description: "• Led a team of 5 engineers to develop a cloud-based highly scalable application.\n• Improved system performance by 40% through code optimization and caching strategies.\n• Mentored junior developers and conducted code reviews."
                },
                {
                    company: "Startup Lab",
                    position: "Full Stack Developer",
                    location: "New York, NY",
                    startDate: "2020-01",
                    endDate: "2022-05",
                    description: "• Built and launched a MVP for a fintech product using React and Node.js.\n• Integrated third-party payment gateways and designed a secure RESTful API."
                }
            ],
            skills: [
                {
                    category: "Languages",
                    items: ["JavaScript", "TypeScript", "Python", "SQL", "HTML/CSS"]
                },
                {
                    category: "Frameworks",
                    items: ["React", "Node.js", "Express", "Next.js", "PostgreSQL"]
                }
            ],
            projects: [
                {
                    name: "E-Commerce Platform",
                    description: "• Developed a full-featured e-commerce site with cart, checkout, and admin dashboard.\n• Implemented secure authentication and Stripe payment integration.",
                    keywords: ["React", "Redux", "Node.js", "Stripe"],
                    url: "https://github.com/johndoe/ecommerce",
                    urlName: "Source Code"
                },
                {
                    name: "Task Management App",
                    description: "• Created a real-time task collaboration tool using WebSockets.",
                    keywords: ["Vue.js", "Firebase", "Socket.io"],
                    url: "https://taskapp.demo",
                    urlName: "Live Demo"
                }
            ],
            awards: [
                {
                    title: "Best Innovation Award",
                    awarder: "Tech Hackathon 2023",
                    date: "2023-11",
                    summary: "Recognized for creating the most innovative solution using AI."
                }
            ]
        };
    },

    /**
     * Loads example data into the form
     */
    loadExampleData: function () {
        const exampleData = this.getExampleData();
        this.populateForm(exampleData);
        if (window.showNotification) window.showNotification('Example data loaded!', 'success');
        this.triggerPreviewUpdate();
    },

    /**
     * Debounce utility
     */
    debounce: function (func, wait) {
        let timeout;
        return function () {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
};

window.DataManager = DataManager;
