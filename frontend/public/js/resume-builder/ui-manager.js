/**
 * UI Manager for Resume Builder
 * Handles navigation, modals, and general UI interactions
 */

const UIManager = {
    init: function () {
        this.initializeSidebarNav();
        this.initializeTemplateSelection();
        this.initializeUpdatePreviewBtn();
        this.initializeThemeToggle();
        this.initializeMobileNav();
        this.initializeLogout();
        this.initializeNotifications();
        this.initializeDynamicSections();
        this.initializeDragAndDrop(); // Restore Drag & Drop

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


    initializeThemeToggle: function () {
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                const isDark = document.body.classList.toggle('theme-dark');
                document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');

                const icon = btn.querySelector('i');
                const text = btn.querySelector('span');
                if (icon) icon.className = isDark ? 'fas fa-sun me-1' : 'fas fa-moon me-1';
                if (text) text.textContent = isDark ? 'Light Mode' : 'Dark Mode';
            });

            // Set initial state
            if (document.body.classList.contains('theme-dark')) {
                const icon = btn.querySelector('i');
                const text = btn.querySelector('span');
                if (icon) icon.className = 'fas fa-sun me-1';
                if (text) text.textContent = 'Light Mode';
            }
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
                    if (list.querySelectorAll('.dynamic-section').length > 1) {
                        section.remove();
                        window.DataManager.triggerPreviewUpdate();
                    } else {
                        section.querySelectorAll('input, textarea').forEach(i => i.value = '');
                        window.DataManager.triggerPreviewUpdate();
                    }
                }
            }
        });

        // Handle Bullet Points (Projects/Work)
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-bullet-btn');
            if (btn) {
                const container = btn.previousElementSibling;
                if (!container) return;

                const wrapper = document.createElement('div');
                wrapper.className = 'd-flex gap-2 mb-2 bullet-point-item';
                wrapper.innerHTML = `
                    <input type="text" class="glass-input bullet-point-input" placeholder="Achievement or responsibility...">
                    <button type="button" class="remove-bullet-btn"><i class="fas fa-times"></i></button>
                `;
                container.appendChild(wrapper);
            }

            if (e.target.closest('.remove-bullet-btn')) {
                const item = e.target.closest('.bullet-point-item');
                if (item) item.remove();
                window.DataManager.triggerPreviewUpdate();
            }
        });

        // Handle Skill Pills Interaction

        // 1. Add Pill on Enter or Tab
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('new-skill-keyword')) {
                if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    addSkillPill(e.target);
                }
            }
        });

        // 2. Remove Pill
        document.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-skill-keyword-btn');
            if (removeBtn) {
                const pill = removeBtn.closest('.skill-keyword-item');
                if (pill) {
                    pill.remove();
                    window.DataManager.triggerPreviewUpdate();
                }
            }
        });

        function addSkillPill(input) {
            const value = input.value.trim();
            if (!value) return;

            const container = input.closest('.skill-keywords-container');
            const wrapper = input.closest('.new-keyword-input-wrapper');

            const pill = document.createElement('div');
            pill.className = 'skill-keyword-item';
            pill.innerHTML = `
                 <input type="text" class="glass-input skill-keyword-input" name="skill-keyword" value="${value}" style="width: ${value.length + 1}ch">
                 <button type="button" class="remove-skill-keyword-btn"><i class="fas fa-times"></i></button>
            `;

            // Insert before the input wrapper
            container.insertBefore(pill, wrapper);

            // Clear input
            input.value = '';
            window.DataManager.triggerPreviewUpdate();
        }
    },
    initializeDragAndDrop: function () {
        const nav = document.getElementById('nav-sections');
        if (!nav) return;

        let draggedItem = null;
        const items = nav.querySelectorAll('.draggable-section');

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                setTimeout(() => item.classList.add('dragging'), 0);
                // Set data for transfer
                e.dataTransfer.effectAllowed = 'move';
                // e.dataTransfer.setData('text/html', item.outerHTML); // Not strictly needed for sorting
            });

            item.addEventListener('dragend', () => {
                draggedItem = null;
                item.classList.remove('dragging');

                // Update order in DataManager/Window
                this.updateSectionOrder();
            });

            // Required for drop to work
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                const sortableList = document.getElementById('nav-sections');
                const draggingItem = sortableList.querySelector('.dragging');

                // Find immediate siblings only (don't drag into non-draggable areas)
                const siblings = [...sortableList.querySelectorAll('.draggable-section:not(.dragging)')];

                const nextSibling = siblings.find(sibling => {
                    return e.clientY <= sibling.getBoundingClientRect().top + sibling.getBoundingClientRect().height / 2;
                });

                if (nextSibling) {
                    sortableList.insertBefore(draggingItem, nextSibling);
                } else {
                    // Check if we should append after the last draggable item
                    const lastDraggable = siblings[siblings.length - 1];
                    if (lastDraggable) {
                        sortableList.insertBefore(draggingItem, lastDraggable.nextSibling);
                    }
                }
            });
        });
    },

    updateSectionOrder: function () {
        // Collect current order of sections
        const sections = [];
        const navItems = document.querySelectorAll('.nav-sections .sidebar-nav-item');

        // Always keep fixed items at top (Profile, Formatting, Templates) if they exist
        // But for the resume rendering order, we usually only care about the draggable ones + Profile?
        // Let's grab all section IDs in current DOM order
        navItems.forEach(item => {
            const section = item.dataset.section;
            if (section && section !== 'templates' && section !== 'formatting') {
                sections.push(section);
            }
        });

        console.log('New Section Order:', sections);
        window.sectionOrder = sections; // Store for DataManager

        // Trigger generic preview update
        if (window.DataManager) {
            window.DataManager.triggerPreviewUpdate();
        }
    }
};

window.UIManager = UIManager;
