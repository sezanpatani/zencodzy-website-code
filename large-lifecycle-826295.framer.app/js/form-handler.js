/**
 * ZENCODZY Form Handler with Upstash Redis
 * Handles form submissions and stores data in Upstash Redis via serverless function
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Update this URL after deploying to Vercel/Netlify
    API_ENDPOINT: '/api/submit-form',
    SHOW_SUCCESS_MESSAGE: true,
    REDIRECT_ON_SUCCESS: false,
    REDIRECT_URL: '/thank-you.html'
  };

  /**
   * Initialize form handlers when DOM is ready
   */
  function initFormHandlers() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
    });

    console.log(`✅ Form handler initialized for ${forms.length} form(s)`);
  }

  /**
   * Handle form submission
   */
  async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : 'Send Request';

    try {
      // Disable submit button
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      // Collect form data
      const formData = collectFormData(form);
      
      // Determine form type
      formData.formType = determineFormType();
      
      // Add page URL
      formData.pageUrl = window.location.href;

      console.log('📤 Submitting form data:', formData);

      // Submit to serverless function
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Form submitted successfully:', result.submissionId);
        
        // Show success message
        if (CONFIG.SHOW_SUCCESS_MESSAGE) {
          showSuccessMessage(form);
        }

        // Reset form
        form.reset();

        // Redirect if configured
        if (CONFIG.REDIRECT_ON_SUCCESS) {
          setTimeout(() => {
            window.location.href = CONFIG.REDIRECT_URL;
          }, 2000);
        }

        // Fire custom event
        window.dispatchEvent(new CustomEvent('formSubmitted', { 
          detail: { 
            formType: formData.formType,
            submissionId: result.submissionId 
          } 
        }));

      } else {
        throw new Error(result.message || 'Submission failed');
      }

    } catch (error) {
      console.error('❌ Form submission error:', error);
      showErrorMessage(form, error.message);
    } finally {
      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  }

  /**
   * Collect all form data including checkboxes and select fields
   */
  function collectFormData(form) {
    const formData = {};
    const formElements = form.elements;

    for (let element of formElements) {
      if (!element.name) continue;

      if (element.type === 'checkbox') {
        // Collect all checked checkboxes
        if (element.checked) {
          if (!formData.servicesInterested) {
            formData.servicesInterested = [];
          }
          formData.servicesInterested.push(element.name);
        }
      } else if (element.type === 'radio') {
        // Only collect checked radio button
        if (element.checked) {
          formData[element.name] = element.value;
        }
      } else if (element.type !== 'submit' && element.type !== 'button') {
        // Collect all other inputs
        formData[normalizeFieldName(element.name)] = element.value;
      }
    }

    // Convert services array to comma-separated string
    if (formData.servicesInterested && Array.isArray(formData.servicesInterested)) {
      formData.servicesInterested = formData.servicesInterested.join(', ');
    }

    return formData;
  }

  /**
   * Normalize field names for consistency
   */
  function normalizeFieldName(name) {
    const fieldMap = {
      'Name': 'name',
      'Email': 'email',
      'Phone Number': 'phone',
      'Company Name': 'company',
      'Role/Posittion': 'budget', // Note: typo in original HTML
      'Project Details': 'message'
    };

    return fieldMap[name] || name.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Determine which form type is being submitted
   */
  function determineFormType() {
    const path = window.location.pathname;
    
    if (path.includes('get-a-quote')) {
      return 'get-a-quote';
    } else if (path.includes('join-our-team')) {
      return 'join-our-team';
    } else {
      return 'contact';
    }
  }

  /**
   * Show success message
   */
  function showSuccessMessage(form) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message success-message';
    messageDiv.innerHTML = `
      <div style="
        background: #4c2d4390;
        color: #9cff33;
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: center;
        font-size: 16px;
        border: 2px solid #9cff33;
      ">
        ✅ <strong>Success!</strong> Your form has been submitted. We'll get back to you soon!
      </div>
    `;

    // Insert after form
    form.parentNode.insertBefore(messageDiv, form.nextSibling);

    // Remove after 5 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }

  /**
   * Show error message
   */
  function showErrorMessage(form, errorMessage) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message error-message';
    messageDiv.innerHTML = `
      <div style="
        background: rgba(255, 50, 50, 0.1);
        color: #ff3333;
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: center;
        font-size: 16px;
        border: 2px solid #ff3333;
      ">
        ❌ <strong>Error!</strong> ${errorMessage || 'Something went wrong. Please try again.'}
      </div>
    `;

    // Insert after form
    form.parentNode.insertBefore(messageDiv, form.nextSibling);

    // Remove after 5 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormHandlers);
  } else {
    initFormHandlers();
  }

})();
