/**
 * TalentScope - Advanced Anim            elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 150);
        });teraction System
 * Professional dark theme with smooth animations and micro-interactions
 */

class TalentScopeAnimations {
    constructor() {
        this.init();
        this.setupAnimations();
        this.setupParallax();
        this.setupScrollEffects();
        this.setupInteractions();
        this.setupPageTransitions();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        console.log('🎨 TalentScope Animation System Initialized');
        this.animateOnLoad();
        this.observeElements();
    }

    // Page Load Animations
    animateOnLoad() {
        // Stagger animation for initial page load (excluding navbar and search-card to prevent flash)
        const elements = document.querySelectorAll('.hero-section, .card:not(.search-card), .job-card');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 150);
        });

        // Animate brand logo
        const brandLogo = document.querySelector('.brand-logo');
        if (brandLogo) {
            brandLogo.addEventListener('mouseenter', () => {
                brandLogo.style.transform = 'translateY(-2px) scale(1.05)';
            });
            brandLogo.addEventListener('mouseleave', () => {
                brandLogo.style.transform = 'translateY(0) scale(1)';
            });
        }
    }

    // Intersection Observer for scroll animations
    observeElements() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    
                    // Special animations for different elements
                    if (entry.target.classList.contains('job-card')) {
                        this.animateJobCard(entry.target);
                    } else if (entry.target.classList.contains('feature-card')) {
                        this.animateFeatureCard(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const elementsToObserve = document.querySelectorAll(
            '.job-card, .feature-card, .alert, .pagination, .footer-section'
        );
        
        elementsToObserve.forEach(el => observer.observe(el));
    }

    // Job Card Animations
    animateJobCard(card) {
        card.style.transform = 'translateY(0) scale(1)';
        
        // Add hover interactions
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = 'var(--shadow-2xl)';
            
            // Animate the accent border
            const accentBorder = card.querySelector('::before');
            if (accentBorder) {
                card.style.setProperty('--accent-scale', '1');
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = 'var(--shadow-lg)';
        });

    }

    // Feature Card Animations  
    animateFeatureCard(card) {
        // Delayed animation based on position
        const cards = Array.from(document.querySelectorAll('.feature-card'));
        const index = cards.indexOf(card);
        
        setTimeout(() => {
            card.classList.add('scale-in');
        }, index * 100);

        // Add floating animation
        card.addEventListener('mouseenter', () => {
            card.style.animation = 'float 2s ease-in-out infinite';
        });

        card.addEventListener('mouseleave', () => {
            card.style.animation = 'none';
        });
    }

    // Button Interactions
    setupInteractions() {
        // Enhanced button interactions
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-3px)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });

            button.addEventListener('mousedown', () => {
                button.style.transform = 'translateY(-1px) scale(0.98)';
            });

            button.addEventListener('mouseup', () => {
                button.style.transform = 'translateY(-3px) scale(1)';
            });

        });

        // Form field interactions
        const formControls = document.querySelectorAll('.form-control, .form-select');
        formControls.forEach(field => {
            field.addEventListener('focus', () => {
                field.style.transform = 'translateY(-2px)';
                field.parentElement?.classList.add('field-focused');
            });

            field.addEventListener('blur', () => {
                field.style.transform = 'translateY(0)';
                field.parentElement?.classList.remove('field-focused');
            });
        });
    }


    // Scroll Effects
    setupScrollEffects() {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollEffects();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll);
        this.updateScrollEffects(); // Initial call
    }

    updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const navbar = document.querySelector('.navbar');
        const scrollToTopBtn = document.querySelector('#scrollToTop, .fab-scroll');

        // Navbar scroll effect
        if (navbar) {
            if (scrolled > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Show/hide scroll to top button
        if (scrollToTopBtn) {
            if (scrolled > 300) {
                scrollToTopBtn.classList.remove('d-none');
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.transform = 'scale(1)';
            } else {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    if (window.pageYOffset <= 300) {
                        scrollToTopBtn.classList.add('d-none');
                    }
                }, 300);
            }
        }

        // Parallax effect for background
        const backgroundElements = document.querySelectorAll('body::before, body::after');
        const yPos = -(scrolled / 2);
        backgroundElements.forEach(el => {
            if (el) {
                el.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });
    }

    // Parallax Setup
    setupParallax() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        const handleParallax = () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        };

        window.addEventListener('scroll', handleParallax);
    }

    // Page Transitions
    setupPageTransitions() {
        const links = document.querySelectorAll('a[href^="/"], .nav-link');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                // Only handle internal links
                const href = link.getAttribute('href');
                if (href && href.startsWith('/') && !href.includes('#')) {
                    e.preventDefault();
                    this.transitionToPage(href);
                }
            });
        });
    }

    transitionToPage(url) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-primary);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.1s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Fade in overlay
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 1);
        
        // Navigate after overlay is visible
        setTimeout(() => {
            window.location.href = url;
        }, 100);
    }

    // Advanced Animations
    setupAnimations() {
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            @keyframes shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }

            .loading-shimmer {
                background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.1), transparent);
                background-size: 1000px 100%;
                animation: shimmer 2s infinite;
            }

            .pulse {
                animation: pulse 2s infinite;
            }

            .field-focused {
                position: relative;
            }

            .field-focused::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                width: 0;
                height: 2px;
                background: var(--primary);
                transition: all 0.15s ease;
                transform: translateX(-50%);
            }

            .field-focused .form-control:focus + .field-focused::after {
                width: 100%;
            }

            /* Stagger animations */
            .stagger-animation {
                animation-delay: calc(var(--stagger-delay) * 0.05s);
            }

            /* Enhanced hover states */
            .enhanced-hover {
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .enhanced-hover:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-xl);
            }

            /* Loading states */
            .loading-skeleton {
                background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-surface) 50%, var(--bg-elevated) 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
        `;
        document.head.appendChild(style);
    }

    // Utility Methods
    addStaggerAnimation(elements, delay = 100) {
        elements.forEach((element, index) => {
            element.style.setProperty('--stagger-delay', index);
            element.classList.add('stagger-animation');
        });
    }

    createLoadingSkeleton(container) {
        const skeleton = document.createElement('div');
        skeleton.classList.add('loading-skeleton');
        skeleton.style.cssText = `
            width: 100%;
            height: 20px;
            border-radius: 4px;
            margin: 10px 0;
        `;
        container.appendChild(skeleton);
        return skeleton;
    }

    // Search animations
    animateSearchResults() {
        const jobCards = document.querySelectorAll('.job-card');
        jobCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 30);
        });
    }

    // Loading state animations
    showLoading(element) {
        element.classList.add('loading-shimmer');
        element.style.pointerEvents = 'none';
    }

    hideLoading(element) {
        element.classList.remove('loading-shimmer');
        element.style.pointerEvents = 'auto';
    }

    // Toast notifications with animations
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.textContent = message;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: var(--radius-lg);
            color: var(--text-primary);
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            backdrop-filter: var(--blur-lg);
            box-shadow: var(--shadow-xl);
        `;

        // Set background based on type
        const backgrounds = {
            success: 'rgba(16, 185, 129, 0.9)',
            error: 'rgba(239, 68, 68, 0.9)',
            warning: 'rgba(245, 158, 11, 0.9)',
            info: 'rgba(59, 130, 246, 0.9)'
        };
        
        toast.style.background = backgrounds[type] || backgrounds.info;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 50);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                toast.remove();
            }, 150);
        }, 3000);
    }

    // Public API methods
    animateElement(element, animation) {
        element.classList.add(animation);
        
        const handleAnimationEnd = () => {
            element.classList.remove(animation);
            element.removeEventListener('animationend', handleAnimationEnd);
        };
        
        element.addEventListener('animationend', handleAnimationEnd);
    }

    // Initialize specific page animations
    initializePageSpecificAnimations() {
        const currentPage = window.location.pathname;
        
        switch (currentPage) {
            case '/':
            case '/login':
                this.initializeAuthPageAnimations();
                break;
            case '/dashboard':
                this.initializeDashboardAnimations();
                break;
            case '/jobs':
                this.initializeJobSearchAnimations();
                break;
            case '/resume-builder':
                this.initializeResumeBuilderAnimations();
                break;
        }
    }

    initializeAuthPageAnimations() {
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.classList.add('scale-in');
        }

        const featureCards = document.querySelectorAll('.feature-card');
        this.addStaggerAnimation(featureCards);
    }

    initializeDashboardAnimations() {
        const cards = document.querySelectorAll('.card');
        this.addStaggerAnimation(cards);
    }

    initializeJobSearchAnimations() {
        // Search card animations disabled to prevent page load flashing
        // Job cards will still animate when search results are displayed
    }

    initializeResumeBuilderAnimations() {
        const builderElements = document.querySelectorAll('.resume-section');
        this.addStaggerAnimation(builderElements);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.talentScopeAnimations = new TalentScopeAnimations();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TalentScopeAnimations;
}