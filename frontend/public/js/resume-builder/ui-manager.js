/**
 * UI Manager for Resume Builder
 * Handles navigation, modals, and general UI interactions
 */

const UIManager = {
    init: function () {
        this.initializeSidebarNav();
        this.initializeTemplateSelection();
        this.initializeUpdatePreviewBtn();
        this.initializeLoadExampleBtn();
        this.initializeMobileNav();
        this.initializeLogout();
        this.initializeNotifications();
        this.initializeDynamicSections();

        // Activate initial section
        const activeItem = document.querySelector('.sidebar-nav-item.active');
        if (activeItem) activeItem.click();
    },

    initializeTemplateSelection: function () {
        const options = document.querySelectorAll('.template-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                const templateId = parseInt(option.dataset.template);
                window.selectedTemplate = templateId;
                console.log('Template selected:', templateId);

                window.DataManager.triggerPreviewUpdate();
            });
        });
    },

    initializeSidebarNav: function () {
        const navItems = document.querySelectorAll('.sidebar-nav-item');
        const sections = document.querySelectorAll('.section-content');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.dataset.section;

                // Update nav UI
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Show target section
                sections.forEach(sec => sec.classList.remove('active'));
                const target = document.getElementById(`${sectionId}-section`);
                if (target) {
                    target.classList.add('active');
                    // Scroll to top of form
                    document.querySelector('.resume-form').scrollTop = 0;
                }
            });
        });
    },

    initializeUpdatePreviewBtn: function () {
        const btn = document.getElementById('updatePreviewBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Updating...';
                btn.disabled = true;

                window.DataManager.triggerPreviewUpdate();

                // Reset button after a delay or based on event
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.disabled = false;
                }, 2000);
            });
        }
    },

    initializeLoadExampleBtn: function () {
        const btn = document.getElementById('loadExampleDataBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                if (confirm('This will overwrite current form data with example data. Continue?')) {
                    window.DataManager.loadExampleData();
                }
            });
        }
    },

    initializeMobileNav: function () {
        const toggle = document.getElementById('mobileMenuToggle');
        const dropdown = document.getElementById('mobileNavDropdown');

        if (toggle && dropdown) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                dropdown.classList.toggle('active');
                const icon = toggle.querySelector('i');
                icon.className = dropdown.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            });

            document.addEventListener('click', (e) => {
                if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                    toggle.querySelector('i').className = 'fas fa-bars';
                }
            });
        }
    },

    initializeLogout: function () {
        const logoutBtns = document.querySelectorAll('#logoutBtn, a[href="/logout"]');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                fetch('/auth/logout', { method: 'POST' })
                    .then(() => window.location.href = '/login')
                    .catch(() => window.location.href = '/login');
            });
        });
    },

    initializeNotifications: function () {
        window.showNotification = (message, type = 'info') => {
            const colors = {
                success: '#2ecc71',
                error: '#e74c3c',
                info: '#3498db',
                warning: '#f1c40f'
            };
            const div = document.createElement('div');
            div.textContent = message;
            div.style.cssText = `
                position: fixed; top: 20px; right: 20px; 
                background: ${colors[type]}; color: white; 
                padding: 12px 20px; border-radius: 8px; 
                z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(div);
            setTimeout(() => {
                div.style.opacity = '0';
                setTimeout(() => div.remove(), 300);
            }, 3000);
        };
    },

    showLoadConfirmModal: function (resumeId, title) {
        const detailsDiv = document.getElementById('resumeLoadDetails');
        if (detailsDiv) {
            detailsDiv.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas fa-file-alt me-2 text-primary"></i>
                    <div>
                        <div class="fw-bold">${title}</div>
                        <small class="text-muted">ID: ${resumeId}</small>
                    </div>
                </div>`;
        }

        const modalEl = document.getElementById('resumeLoadConfirmModal');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();

            const confirmBtn = document.getElementById('confirmLoadResumeBtn');
            const handler = () => {
                window.DataManager.loadResumeFromServer(resumeId);
                modal.hide();
                confirmBtn.removeEventListener('click', handler);
            };
            confirmBtn.addEventListener('click', handler);
        }
    },

    initializeDynamicSections: function () {
        // Handle "Add" buttons
        document.querySelectorAll('.add-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const section = target.replace('List', '');

                if (target === 'websitesList') {
                    window.DataManager.addWebsiteEntry();
                } else if (section) {
                    // Clone the first item or find a way to add
                    // For now, we rely on DataManager to handle the templates
                    window.DataManager.addSectionEntry(section);
                }
            });
        });

        // Handle "Remove" buttons using delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-button')) {
                const section = e.target.closest('.dynamic-section');
                if (section) {
                    const list = section.parentElement;
                    // Keep at least one entry if desired, or just remove
                    if (list.querySelectorAll('.dynamic-section').length > 1) {
                        section.remove();
                        window.DataManager.triggerPreviewUpdate();
                    } else {
                        // Just clear inputs if it's the last one
                        section.querySelectorAll('input, textarea').forEach(i => i.value = '');
                        window.DataManager.triggerPreviewUpdate();
                    }
                }
            }
        });

        // Handle nested dynamic items (bullets, keywords)
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-bullet-btn, .add-skill-keyword-btn');
            if (btn) {
                const container = btn.previousElementSibling;
                if (!container) return;

                const isSkill = btn.classList.contains('add-skill-keyword-btn');
                const className = isSkill ? 'skill-keyword-input' : 'bullet-point-input';
                const placeholder = isSkill ? 'e.g. JavaScript' : 'Achievement or responsibility...';

                const wrapper = document.createElement('div');
                wrapper.className = 'd-flex gap-2 mb-2';
                wrapper.innerHTML = `
                    <input type="text" class="glass-input ${className}" placeholder="${placeholder}">
                    <button type="button" class="btn btn-outline-danger btn-sm remove-nested-btn"><i class="fas fa-times"></i></button>
                `;
                container.appendChild(wrapper);
            }

            if (e.target.closest('.remove-nested-btn')) {
                e.target.closest('div').remove();
                window.DataManager.triggerPreviewUpdate();
            }
        });
    }
};

window.UIManager = UIManager;
