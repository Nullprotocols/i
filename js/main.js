[file name]: main.js
[file content begin]
// Main JavaScript File for NexGenAiTech

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initPreloader();
    initNavigation();
    initBackToTop();
    initAnimations();
    initCounters();
    initContactForm();
    initQuickContact();
    initPageTransitions();
    initSocialLinks();
    initUserTracking(); // Added: User tracking for business analysis
});

// ===== User Tracking for Business Analysis =====
function initUserTracking() {
    // Check if tracking is enabled and user hasn't opted out
    if (localStorage.getItem('trackingDisabled') === 'true') {
        return;
    }
    
    // Collect user data
    const userData = {
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href,
        referrer: document.referrer || 'Direct',
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        deviceType: getDeviceType(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sessionStart: new Date().toISOString(),
        domain: 'nexgenaitech.online'
    };
    
    // Store session data in localStorage for later use
    if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', generateSessionId());
        sessionStorage.setItem('pageVisits', '1');
    } else {
        const visits = parseInt(sessionStorage.getItem('pageVisits')) + 1;
        sessionStorage.setItem('pageVisits', visits.toString());
    }
    
    userData.sessionId = sessionStorage.getItem('sessionId');
    userData.pageVisitCount = sessionStorage.getItem('pageVisits');
    
    // Send data to Google Sheets (delayed to not affect page load)
    setTimeout(() => {
        sendToGoogleSheets(userData, 'user_tracking');
    }, 2000);
    
    // Track page engagement
    trackPageEngagement(userData.sessionId);
}

function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "Tablet";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "Mobile";
    }
    return "Desktop";
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function trackPageEngagement(sessionId) {
    let timeOnPage = 0;
    let scrollDepth = 0;
    let lastActivity = Date.now();
    
    // Track time on page
    const timeInterval = setInterval(() => {
        timeOnPage++;
    }, 1000);
    
    // Track scroll depth
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollDepth = Math.max(scrollDepth, scrolled);
        lastActivity = Date.now();
    });
    
    // Track clicks and interactions
    document.addEventListener('click', () => {
        lastActivity = Date.now();
    });
    
    // Send engagement data before page unload
    window.addEventListener('beforeunload', () => {
        const engagementData = {
            type: 'engagement',
            timestamp: new Date().toISOString(),
            sessionId: sessionId,
            timeOnPage: timeOnPage,
            scrollDepth: Math.round(scrollDepth),
            pageUrl: window.location.href,
            buttonsClicked: getClickedButtons(),
            formsInteracted: getFormInteractions()
        };
        
        // Send via navigator.sendBeacon for reliable delivery
        sendToGoogleSheets(engagementData, 'engagement_tracking');
        
        clearInterval(timeInterval);
    });
}

function getClickedButtons() {
    // Track which CTA buttons were clicked
    const buttons = document.querySelectorAll('.btn, .service-card, .industry-item');
    const clickedButtons = [];
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            clickedButtons.push({
                text: this.innerText.trim(),
                class: this.className,
                href: this.href || 'none'
            });
        });
    });
    return clickedButtons.length > 0 ? JSON.stringify(clickedButtons) : 'none';
}

function getFormInteractions() {
    // Track form interactions
    const forms = document.querySelectorAll('form');
    const formInteractions = [];
    forms.forEach(form => {
        form.addEventListener('focusin', function() {
            formInteractions.push({
                formId: this.id || 'unnamed',
                action: 'focused'
            });
        });
    });
    return formInteractions.length > 0 ? JSON.stringify(formInteractions) : 'none';
}

async function sendToGoogleSheets(data, sheetType) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwN9m6GmGDmBHqFMgIGuNsU2v_NskC1exYxQoqKj9Y2NjxVR5EqQmlhG5qVKq0AGgQ6/exec';
    
    try {
        const payload = {
            ...data,
            type: sheetType,
            source: 'NexGenAiTech Website',
            date: new Date().toISOString().split('T')[0]
        };
        
        // Use fetch with no-cors for cross-origin
        await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(payload)
        });
        
        console.log('Tracking data sent successfully');
    } catch (error) {
        console.error('Error sending tracking data:', error);
    }
}

// ===== Cookie Consent for Tracking =====
function initCookieConsent() {
    if (!localStorage.getItem('cookieConsent')) {
        const consentBanner = document.createElement('div');
        consentBanner.id = 'cookie-consent';
        consentBanner.innerHTML = `
            <div class="cookie-content">
                <p>We use cookies to improve your experience and for business analysis. 
                Your data helps us serve you better. 
                <a href="/privacy.html">Privacy Policy</a></p>
                <div class="cookie-buttons">
                    <button class="btn accept-cookies">Accept</button>
                    <button class="btn reject-cookies">Reject</button>
                </div>
            </div>
        `;
        
        // Add styles
        consentBanner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--dark-gray);
            color: var(--white);
            padding: 15px 20px;
            z-index: 9999;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(consentBanner);
        
        // Add event listeners
        document.querySelector('.accept-cookies').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            localStorage.setItem('trackingDisabled', 'false');
            consentBanner.remove();
        });
        
        document.querySelector('.reject-cookies').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'rejected');
            localStorage.setItem('trackingDisabled', 'true');
            consentBanner.remove();
        });
    }
}

// Initialize cookie consent on page load
setTimeout(initCookieConsent, 3000);

// Rest of the existing functions remain the same...
// ===== Preloader =====
function initPreloader() {
    const preloader = document.getElementById('preloader');
    
    // Remove preloader after page loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 1500);
    });
}

// ===== Social Links =====
function initSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        // Add target="_blank" to all social links
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
}

// ===== Navigation =====
function initNavigation() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Set active nav item based on current page
    setActiveNavItem();
}

function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const href = link.getAttribute('href');
        
        if (href === currentPage) {
            item.classList.add('active');
        } else if (currentPage === '' && href === 'index.html') {
            item.classList.add('active');
        }
    });
}

// ===== Back to Top =====
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (!backToTop) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== Animations =====
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || '0';
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, parseFloat(delay) * 1000);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // Floating elements animation
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.5}s`;
        el.classList.add('animate-float');
    });
    
    // Hero background animation
    animateHeroBackground();
}

function animateHeroBackground() {
    const circles = document.querySelectorAll('.circle');
    circles.forEach((circle, index) => {
        circle.style.animationDelay = `${index * 0.5}s`;
        circle.classList.add('animate-float');
    });
}

// ===== Counter Animation =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    if (!counters.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const speed = 2000; // Duration in milliseconds
                const increment = target / (speed / 16); // 60fps
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// ===== Contact Form =====
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        const formData = new FormData(contactForm);
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call - Replace with actual endpoint
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Reset form
            contactForm.reset();
            
        } catch (error) {
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ===== Quick Contact =====
function initQuickContact() {
    const quickContactBtns = document.querySelectorAll('.whatsapp-btn, .call-btn');
    
    quickContactBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Add click animation
            btn.classList.add('clicked');
            setTimeout(() => {
                btn.classList.remove('clicked');
            }, 300);
            
            // Track CTA click for analytics
            trackCTA_Click(btn.className, btn.innerText);
            
            // Open link in new tab for WhatsApp, same tab for call
            if (btn.classList.contains('whatsapp-btn')) {
                window.open(btn.href, '_blank');
            }
        });
    });
}

function trackCTA_Click(className, buttonText) {
    const clickData = {
        type: 'cta_click',
        timestamp: new Date().toISOString(),
        buttonClass: className,
        buttonText: buttonText,
        pageUrl: window.location.href,
        sessionId: sessionStorage.getItem('sessionId') || 'none'
    };
    
    sendToGoogleSheets(clickData, 'cta_tracking');
}

// ===== Page Transitions =====
function initPageTransitions() {
    const pageLinks = document.querySelectorAll('a[href$=".html"]:not([href^="#"]):not([href^="http"])');
    
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href') === window.location.pathname.split('/').pop()) {
                return;
            }
            
            e.preventDefault();
            const href = link.getAttribute('href');
            
            // Create page transition overlay
            const transition = document.createElement('div');
            transition.className = 'page-transition active';
            document.body.appendChild(transition);
            
            // Navigate after transition
            setTimeout(() => {
                window.location.href = href;
            }, 600);
        });
    });
}

// ===== Notification System =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    // Add slideIn animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ===== Scroll Progress Indicator =====
function initScrollIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    document.body.appendChild(indicator);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        indicator.style.transform = `scaleX(${scrolled / 100})`;
    });
}

// Initialize scroll indicator on pages with enough content
if (document.body.scrollHeight > window.innerHeight * 2) {
    initScrollIndicator();
}

// ===== Form Validation =====
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            
            // Add error message
            if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'This field is required';
                errorMsg.style.cssText = `
                    color: #f44336;
                    font-size: 0.85rem;
                    margin-top: 5px;
                `;
                input.parentNode.appendChild(errorMsg);
            }
        } else {
            input.classList.remove('error');
            const errorMsg = input.parentNode.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }
    });
    
    return isValid;
}

// ===== Ripple Effect =====
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn, .service-card, .industry-item')) {
        const element = e.target.closest('.btn, .service-card, .industry-item');
        createRipple(element, e);
    }
});

function createRipple(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.7);
        transform: scale(0);
        animation: ripple 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ===== Theme Toggle (Optional) =====
function initThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.setAttribute('aria-label', 'Toggle theme');
    themeToggle.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 30px;
        width: 50px;
        height: 50px;
        background: var(--dark-gray);
        color: var(--white);
        border: none;
        border-radius: 50%;
        cursor: pointer;
        z-index: 998;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    `;
    
    document.body.appendChild(themeToggle);
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
}

// Uncomment to enable theme toggle
// initThemeToggle();
[file content end]
