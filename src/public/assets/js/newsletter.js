class NewsletterManager {
    constructor() {
        this.subscribers = this.loadSubscribers();
        this.phpEndpoint = null;
        this.systemReady = false;
        this.init();
    }

    loadSubscribers() {
        const stored = localStorage.getItem('newsletter_subscribers');
        return stored ? JSON.parse(stored) : [];
    }

    saveSubscribers() {
        localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isAlreadySubscribed(email) {
        return this.subscribers.some(sub => sub.email.toLowerCase() === email.toLowerCase());
    }

    async checkPhpFileExists(endpoint) {
        try {
            return (await fetch(endpoint, { method: 'HEAD' })).ok;
        } catch {
            return false;
        }
    }

    subscribe(email) {
        if (!this.isValidEmail(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        if (this.isAlreadySubscribed(email)) {
            return { success: false, message: 'This email is already subscribed to our newsletter', alreadySubscribed: true, email };
        }

        this.subscribers.push({
            email: email.toLowerCase().trim(),
            subscribedAt: new Date().toISOString(),
            status: 'active'
        });
        this.saveSubscribers();

        return { success: true, message: 'Thank you for subscribing! You will receive our newsletter soon.', showUnsubscribe: true, email };
    }

    unsubscribe(email) {
        const index = this.subscribers.findIndex(sub => sub.email.toLowerCase() === email.toLowerCase());
        if (index === -1) return { success: false, message: 'This email address is not subscribed' };

        this.subscribers.splice(index, 1);
        this.saveSubscribers();
        return { success: true, message: 'You have been successfully unsubscribed from our newsletter' };
    }

    init() {
        document.readyState === 'loading' 
            ? document.addEventListener('DOMContentLoaded', () => this.attachEventListeners())
            : this.attachEventListeners();
    }

    async attachEventListeners() {
        const forms = document.querySelectorAll('form[action*="newsletter.php"]');
        if (!forms.length) return;

        for (const form of forms) {
            const endpoint = form.getAttribute('action');
            if (!endpoint?.trim() || !await this.checkPhpFileExists(endpoint)) continue;

            this.phpEndpoint = endpoint;
            this.systemReady = true;
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit(e, form);
            });
        }
    }

    handleSubmit(event, form) {
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput?.value.trim();
        if (!email) return;

        const btn = form.querySelector('button[type="submit"]');
        this.toggleButton(btn, true, '<i class="fa fa-spinner fa-spin"></i> Processing...');
        
        setTimeout(() => {
            const result = this.subscribe(email);
            this.showNotification(result.message, result.success ? 'success' : 'error', result);
            if (result.success) emailInput.value = '';
            this.toggleButton(btn, false, 'Subscribe');
        }, 800);
    }

    toggleButton(btn, disabled, html) {
        if (!btn) return;
        btn.disabled = disabled;
        btn.innerHTML = html;
    }

    showNotification(message, type = 'success', data = {}) {
        document.querySelector('.newsletter-notification')?.remove();

        const notification = this.createElement('div', 'newsletter-notification alert alert-' + (type === 'success' ? 'success' : 'danger'), `
            position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;
            animation: slideIn 0.3s ease-out; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `);

        const unsubLink = (data.showUnsubscribe || data.alreadySubscribed) && data.email
            ? `<hr style="margin: 10px 0;"><small><a href="#" class="unsubscribe-link" data-email="${data.email}" 
                style="color: ${data.alreadySubscribed ? '#dc3545' : '#6c757d'}; text-decoration: underline; font-weight: ${data.alreadySubscribed ? 'bold' : 'normal'};">
                ${data.alreadySubscribed ? '🗑️ ' : ''}Click here to unsubscribe</a></small>`
            : '';

        notification.innerHTML = `
            <button type="button" class="close" onclick="this.parentElement.remove()">&times;</button>
            <strong>${type === 'success' ? '✅ Success!' : '⚠️ Notice'}</strong> ${message}${unsubLink}
        `;

        document.body.appendChild(notification);

        notification.querySelector('.unsubscribe-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showUnsubscribePrompt(e.target.dataset.email);
            notification.remove();
        });

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 8000);
    }

    showUnsubscribePrompt(email) {
        const modal = this.createElement('div', 'newsletter-modal', `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5);
            display: flex; align-items: center; justify-content: center; z-index: 10000; animation: fadeIn 0.3s;
        `);

        modal.innerHTML = `
            <div class="modal-content" style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; 
                width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.2); animation: slideIn 0.3s;">
                <h3 style="margin-top: 0; color: #dc3545;"><i class="fa fa-exclamation-triangle"></i> Unsubscribe from Newsletter</h3>
                <p style="color: #6c757d;">Are you sure you want to unsubscribe <strong>${email}</strong> from our newsletter?</p>
                <p style="color: #6c757d; font-size: 14px;">You will no longer receive updates, news, and special offers.</p>
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn btn-secondary cancel-btn" style="margin-right: 10px;">Cancel</button>
                    <button class="btn btn-danger confirm-btn"><i class="fa fa-trash"></i> Unsubscribe</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('.confirm-btn').addEventListener('click', (e) => {
            e.target.disabled = true;
            e.target.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Processing...';
            setTimeout(() => {
                this.showNotification(this.unsubscribe(email).message, 'success');
                modal.remove();
            }, 800);
        });
        modal.addEventListener('click', (e) => e.target === modal && modal.remove());
    }

    createElement(tag, className, css) {
        const el = document.createElement(tag);
        el.className = className;
        el.style.cssText = css;
        return el;
    }

    getAllSubscribers() {
        console.table(this.subscribers);
        return [...this.subscribers];
    }

    clearAllSubscribers() {
        this.subscribers = [];
        this.saveSubscribers();
    }

    manualUnsubscribe(email) {
        return this.unsubscribe(email);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .unsubscribe-link:hover {
        color: #dc3545 !important;
    }
`;
document.head.appendChild(style);

const newsletterManager = new NewsletterManager();
window.newsletterManager = newsletterManager;