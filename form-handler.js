// Google Sheets Form Submission Handler for NexGenAiTech
class FormHandler {
    constructor() {
        this.scriptURL = 'https://script.google.com/macros/s/AKfycbxb1RwbEM6Z46wm4LypQd1btaQDoxi35DYb9AOHsV_6f3hWRBHIqi7ybEPffRkvshva3w/exec';
        this.init();
    }

    init() {
        // Add form submission event listener
        document.addEventListener('DOMContentLoaded', () => {
            this.setupFormSubmission();
            this.setupQuickContact();
        });
    }

    setupFormSubmission() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.submit-btn');
            const successMessage = document.getElementById('successMessage');
            
            // Show loading state
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }
            
            try {
                // Prepare form data
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Add metadata
                data.timestamp = new Date().toISOString();
                data.source = window.location.pathname.includes('contact') ? 
                    'NexGenAiTech Contact Page' : 'NexGenAiTech Website';
                data.pageURL = window.location.href;
                data.domain = 'nexgenaitech.online';
                
                // Send to Google Sheets
                await this.sendToGoogleSheets(data);
                
                // Show success
                if (successMessage) {
                    successMessage.style.display = 'block';
                    form.reset();
                    
                    // Scroll to success message
                    setTimeout(() => {
                        successMessage.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 300);
                    
                    // Hide after 5 seconds
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 5000);
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                this.showError('There was an error sending your message. Please try again or email us directly at nexgenaitech7@gmail.com');
            } finally {
                // Reset button state
                if (submitBtn) {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
            }
        });
    }

    async sendToGoogleSheets(data) {
        try {
            const response = await fetch(this.scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            return response;
        } catch (error) {
            console.error('Google Sheets submission error:', error);
            throw error;
        }
    }

    showError(message) {
        alert(message);
    }

    setupQuickContact() {
        // Setup quick contact buttons
        const quickButtons = document.querySelectorAll('.quick-contact-btn');
        quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                
                if (action === 'whatsapp') {
                    window.open('https://wa.me/918055698328?text=Hi%20NexGenAiTech%2C%20I%27m%20interested%20in%20your%20services', '_blank');
                } else if (action === 'call') {
                    window.location.href = 'tel:+918055698328';
                } else if (action === 'email') {
                    window.location.href = 'mailto:nexgenaitech7@gmail.com';
                }
            });
        });
    }
}

// Initialize form handler
if (typeof window !== 'undefined') {
    window.FormHandler = new FormHandler();
}
