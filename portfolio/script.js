// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            
            // Toggle menu visibility
            navMenu.classList.toggle('active');
            
            // Update ARIA attribute
            navToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Animate hamburger menu
            const hamburgers = navToggle.querySelectorAll('.hamburger');
            hamburgers.forEach((hamburger, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) hamburger.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) hamburger.style.opacity = '0';
                    if (index === 2) hamburger.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    hamburger.style.transform = 'none';
                    hamburger.style.opacity = '1';
                }
            });
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                
                // Reset hamburger animation
                const hamburgers = navToggle.querySelectorAll('.hamburger');
                hamburgers.forEach(hamburger => {
                    hamburger.style.transform = 'none';
                    hamburger.style.opacity = '1';
                });
            });
        });
    }
});

// Smooth Scrolling for Navigation Links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Active Navigation Link Highlighting
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Call once on load
});

// Form Validation and Submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        
        // Real-time validation
        function validateField(field, validationFn, errorMessage) {
            const errorElement = document.getElementById(`${field.id}-error`);
            
            function validate() {
                if (field.value.trim() === '' && field.hasAttribute('required')) {
                    showError(errorElement, `${field.labels[0].textContent.replace('*', '').trim()} is required`);
                    return false;
                } else if (field.value.trim() !== '' && !validationFn(field.value)) {
                    showError(errorElement, errorMessage);
                    return false;
                } else {
                    clearError(errorElement);
                    return true;
                }
            }
            
            field.addEventListener('blur', validate);
            field.addEventListener('input', () => {
                if (errorElement.textContent) {
                    validate();
                }
            });
            
            return validate;
        }
        
        function showError(errorElement, message) {
            errorElement.textContent = message;
            errorElement.parentElement.querySelector('input, textarea').style.borderColor = '#dc2626';
        }
        
        function clearError(errorElement) {
            errorElement.textContent = '';
            errorElement.parentElement.querySelector('input, textarea').style.borderColor = '#d1d5db';
        }
        
        // Validation functions
        const validateName = (name) => name.length >= 2;
        const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const validateMessage = (message) => message.length >= 10;
        
        // Set up field validation
        const nameValidator = validateField(nameInput, validateName, 'Name must be at least 2 characters long');
        const emailValidator = validateField(emailInput, validateEmail, 'Please enter a valid email address');
        const messageValidator = validateField(messageInput, validateMessage, 'Message must be at least 10 characters long');
        
        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields
            const isNameValid = nameValidator();
            const isEmailValid = emailValidator();
            const isMessageValid = messageValidator();
            
            if (isNameValid && isEmailValid && isMessageValid) {
                // Simulate form submission
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    alert('Thank you for your message! I\'ll get back to you soon.');
                    contactForm.reset();
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    
                    // Clear any error messages
                    document.querySelectorAll('.error-message').forEach(error => {
                        error.textContent = '';
                    });
                    
                    // Reset field styles
                    document.querySelectorAll('input, textarea').forEach(field => {
                        field.style.borderColor = '#d1d5db';
                    });
                }, 2000);
            } else {
                // Focus on first invalid field
                const firstInvalidField = contactForm.querySelector('input:invalid, textarea:invalid') || 
                                        (isNameValid ? null : nameInput) ||
                                        (isEmailValid ? null : emailInput) ||
                                        (isMessageValid ? null : messageInput);
                
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
            }
        });
    }
});

// Intersection Observer for Animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.project-card, .skill-category, .highlight');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Keyboard Navigation Enhancement
document.addEventListener('DOMContentLoaded', function() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #2563eb;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1001;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Enhanced keyboard navigation for project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
        
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const firstLink = card.querySelector('.project-link');
                if (firstLink) {
                    firstLink.click();
                }
            }
        });
    });
});

// Performance Optimization - Lazy Loading for Images
document.addEventListener('DOMContentLoaded', function() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// Theme Detection and Respect User Preferences
document.addEventListener('DOMContentLoaded', function() {
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        document.documentElement.style.setProperty('--transition-duration', '0.01ms');
    }
    
    // Respect user's color scheme preferences
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    function updateTheme(e) {
        if (e.matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
    
    prefersDark.addEventListener('change', updateTheme);
    updateTheme(prefersDark);
});

// Error Handling and Graceful Degradation
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    
    // Graceful degradation - ensure basic functionality works
    if (e.error && e.error.message.includes('IntersectionObserver')) {
        // Fallback for browsers without IntersectionObserver
        const animatedElements = document.querySelectorAll('.project-card, .skill-category, .highlight');
        animatedElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
});

// Analytics and Performance Monitoring (placeholder)
document.addEventListener('DOMContentLoaded', function() {
    // Track page load performance
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        });
    }
    
    // Track user interactions (placeholder for analytics)
    document.addEventListener('click', (e) => {
        if (e.target.matches('a, button')) {
            console.log('User interaction:', e.target.textContent.trim());
        }
    });
});
