/**
 * Contact form handler for lead generation
 * 
 * Captures form submissions, validates data, and sends to backend API.
 * Provides user feedback and handles loading states to improve UX.
 */

// Initialize form listener when DOM is ready
document.getElementById('contactForm').addEventListener('submit', handleFormSubmit);

/**
 * Processes contact form submission and sends data to backend
 * 
 * @param {Event} event - The form submit event
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    // Convert FormData to plain object for JSON serialization
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // File uploads require different handling, remove for now
    // TODO: Implement proper file upload with multipart/form-data
    delete data.file;

    // Prevent duplicate submissions during API call
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> SENDING...';
    submitButton.disabled = true;

    try {
        // Send authenticated request to backend API
        const response = await fetch(`${window.RocketApiConfig.getBaseUrl()}/contact-us`, {
            method: 'POST',
            headers: window.RocketApiConfig.buildHeaders({ json: true, requireAuth: true }),
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Success: clear form and show confirmation
            showFeedback('Thank you! Your submission has been received.', 'success');
            document.getElementById('contactForm').reset();
        } else {
            // Backend validation or business logic error
            showFeedback(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        // Network or server error - generic message for security
        showFeedback('Error: Unable to submit form. Please try again.', 'error');
    } finally {
        // Always restore button state regardless of outcome
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

/**
 * Displays user feedback with appropriate styling and auto-dismiss
 * 
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success' or 'error')
 */
function showFeedback(message, type) {
    const feedbackDiv = document.getElementById('feedbackMessage');
    feedbackDiv.textContent = message;
    feedbackDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
    feedbackDiv.style.display = 'block';

    // Auto-hide feedback to prevent UI clutter
    setTimeout(() => {
        feedbackDiv.style.display = 'none';
    }, 5000);
}
