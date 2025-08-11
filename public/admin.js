// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginMessage = document.getElementById('loginMessage');
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    const totalBookings = document.getElementById('totalBookings');
    const paidBookings = document.getElementById('paidBookings');
    const pendingBookings = document.getElementById('pendingBookings');

    // Check if admin is already logged in
    checkAuthStatus();

    // Login form handler
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Login successful!', 'success', loginMessage);
                setTimeout(() => {
                    showDashboard();
                    loadBookings();
                }, 1000);
            } else {
                showMessage(result.message || 'Login failed', 'error', loginMessage);
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error', loginMessage);
        }
    });

    // Logout handler
    logoutBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        try {
            await fetch('/api/admin/logout', {
                method: 'POST'
            });
            
            showLogin();
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    // Check authentication status
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/admin/bookings');
            if (response.ok) {
                showDashboard();
                loadBookings();
            } else {
                showLogin();
            }
        } catch (error) {
            showLogin();
        }
    }

    // Show dashboard
    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        logoutBtn.style.display = 'block';
    }

    // Show login
    function showLogin() {
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        logoutBtn.style.display = 'none';
    }

    // Load bookings
    async function loadBookings() {
        try {
            const response = await fetch('/api/admin/bookings');
            const bookings = await response.json();

            displayBookings(bookings);
            updateStats(bookings);
        } catch (error) {
            console.error('Error loading bookings:', error);
        }
    }

    // Display bookings in table
    function displayBookings(bookings) {
        bookingsTableBody.innerHTML = '';

        bookings.forEach(booking => {
            // Support both MongoDB (_id) and SQLite (id) formats
            const bookingId = booking._id || booking.id;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.name}</td>
                <td>${booking.email}</td>
                <td>${booking.service.replace('-', ' ').toUpperCase()}</td>
                <td>${new Date(booking.date).toLocaleDateString()}</td>
                <td>${booking.time}</td>
                <td>
                    <div class="project-details" title="${booking.notes || 'No details provided'}">
                        ${booking.notes ? (booking.notes.length > 50 ? booking.notes.substring(0, 50) + '...' : booking.notes) : 'No details'}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${booking.paid ? 'paid' : 'pending'}">
                        ${booking.paid ? 'Paid' : 'Pending'}
                    </span>
                </td>
                <td>
                    ${!booking.paid ? 
                        `<button onclick="markAsPaid('${bookingId}')" class="btn btn-secondary btn-sm">Mark Paid</button>` : 
                        ''
                    }
                    <button onclick="deleteBooking('${bookingId}')" class="btn btn-danger btn-sm">Delete</button>
                </td>
            `;
            bookingsTableBody.appendChild(row);
        });
    }

    // Update statistics
    function updateStats(bookings) {
        const total = bookings.length;
        const paid = bookings.filter(b => b.paid).length;
        const pending = total - paid;

        totalBookings.textContent = total;
        paidBookings.textContent = paid;
        pendingBookings.textContent = pending;
    }

    // Mark booking as paid
    window.markAsPaid = async function(bookingId) {
        if (!confirm('Mark this booking as paid?')) return;

        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}/paid`, {
                method: 'PUT'
            });

            if (response.ok) {
                loadBookings(); // Reload to update display
            } else {
                alert('Failed to update booking');
            }
        } catch (error) {
            console.error('Error marking as paid:', error);
            alert('Error updating booking');
        }
    };

    // Delete booking
    window.deleteBooking = async function(bookingId) {
        if (!confirm('Are you sure you want to delete this booking?')) return;

        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadBookings(); // Reload to update display
            } else {
                alert('Failed to delete booking');
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Error deleting booking');
        }
    };

    // Show message helper
    function showMessage(text, type, element) {
        element.className = `message message-${type}`;
        element.textContent = text;
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }
});
