// Listen for form submission
document.getElementById('contactForm').addEventListener('submit', handleFormSubmit);

/**
 * Handles the contact form submission
 * @param {Event} event - The form submit event
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    // Collect form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Remove file field (can't be sent as JSON)
    delete data.file;

    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> SENDING...';
    submitButton.disabled = true;

    try {
        // Send POST request
        const response = await fetch('http://127.0.0.1:3001/contact-us', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'mySecretKey123'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Success
            showFeedback('Thank you! Your submission has been received.', 'success');
            document.getElementById('contactForm').reset();
        } else {
            // Error
            showFeedback(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        showFeedback('Error: Unable to submit form. Please try again.', 'error');
    } finally {
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

/**
 * Shows feedback message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success' or 'error')
 */
function showFeedback(message, type) {
    const feedbackDiv = document.getElementById('feedbackMessage');
    feedbackDiv.textContent = message;
    feedbackDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
    feedbackDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        feedbackDiv.style.display = 'none';
    }, 5000);
}