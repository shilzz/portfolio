// Wait for the page to load before running our JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Get the form element
    const bookingForm = document.getElementById('booking-form');
    const messageDiv = document.getElementById('message');
    
    console.log('Form element found:', bookingForm);
    console.log('Message div found:', messageDiv);
    
    if (!bookingForm) {
        console.error('Booking form not found!');
        return;
    }
    
    if (!messageDiv) {
        console.error('Message div not found!');
        return;
    }
    
    // Add event listener to the form
    bookingForm.addEventListener('submit', handleFormSubmit);
    console.log('Event listener added to form');
    
    // Function to handle form submission
    async function handleFormSubmit(event) {
        // Prevent the default form submission
        event.preventDefault();
        
        console.log('Form submission started');
        
        // Clear any previous messages
        clearMessage();
        
        // Get form data
        const formData = new FormData(bookingForm);
        
        console.log('Form data collected:', Object.fromEntries(formData.entries()));
        
        // Validate the form data
        if (!validateForm(formData)) {
            console.log('Form validation failed');
            return; // Stop if validation fails
        }
        
        console.log('Form validation passed');
        
        // Convert form data to JSON object
        const bookingData = {
            name: formData.get('name'),
            email: formData.get('email'),
            service: formData.get('service'),
            date: formData.get('date'),
            time: formData.get('time'),
            notes: formData.get('notes')
        };
        
        // Show loading message
        showMessage('Processing your booking...', 'info');
        
        try {
            console.log('Sending booking data to server:', bookingData);
            
            // Send the booking data to the server
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });
            
            console.log('Server response status:', response.status);
            
            // Parse the response
            const result = await response.json();
            
            console.log('Server response data:', result);
            
            // Check if the response was successful
            if (response.ok) {
                // Check if we got a checkout URL (for payment)
                if (result.checkoutUrl) {
                    showMessage('Redirecting to payment...', 'success');
                    // Redirect to the checkout URL after a short delay
                    setTimeout(() => {
                        window.location.href = result.checkoutUrl;
                    }, 1500);
                } else {
                    // Show success message
                    showMessage('Booking submitted successfully! We\'ll contact you soon.', 'success');
                    // Reset the form
                    bookingForm.reset();
                }
            } else {
                // Show error message from server
                showMessage(result.message || 'Booking failed. Please try again.', 'error');
            }
            
        } catch (error) {
            // Show error message if network request fails
            console.error('Error:', error);
            showMessage('Network error. Please check your connection and try again.', 'error');
        }
    }
    
    // Function to validate form data
    function validateForm(formData) {
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const service = formData.get('service');
        const date = formData.get('date');
        const time = formData.get('time');
        
        // Check if name is provided
        if (!name) {
            showMessage('Please enter your name.', 'error');
            return false;
        }
        
        // Check if email is provided and valid
        if (!email) {
            showMessage('Please enter your email address.', 'error');
            return false;
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return false;
        }
        
        // Check if service is selected
        if (!service) {
            showMessage('Please select a service.', 'error');
            return false;
        }
        
        // Check if date is selected
        if (!date) {
            showMessage('Please select a date.', 'error');
            return false;
        }
        
        // Check if the selected date is not in the past
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        
        if (selectedDate < today) {
            showMessage('Please select a future date.', 'error');
            return false;
        }
        
        // Check if time is selected
        if (!time) {
            showMessage('Please select a time.', 'error');
            return false;
        }
        
        // All validation passed
        return true;
    }
    
    // Function to show messages to the user
    function showMessage(text, type) {
        // Remove any existing message classes
        messageDiv.className = 'message';
        
        // Add the appropriate class based on message type
        messageDiv.classList.add(`message-${type}`);
        
        // Set the message text
        messageDiv.textContent = text;
        
        // Make the message visible
        messageDiv.style.display = 'block';
    }
    
    // Function to clear messages
    function clearMessage() {
        messageDiv.style.display = 'none';
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }
    
    // Set minimum date to today (so users can't select past dates)
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
});
