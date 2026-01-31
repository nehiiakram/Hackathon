// Auth Logic

function toggleAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    loginForm.classList.toggle('hidden');
    signupForm.classList.toggle('hidden');

    // Clear errors
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('signup-error').style.display = 'none';
}

function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const errorMsg = document.getElementById('signup-error');

    if (!name || !email || !password) {
        showError(errorMsg, "All fields are required");
        return;
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('cv_users')) || [];
    if (users.find(u => u.email === email)) {
        showError(errorMsg, "Email already registered");
        return;
    }

    // Register user
    users.push({ name, email, password });
    localStorage.setItem('cv_users', JSON.stringify(users));

    // Auto login
    localStorage.setItem('cv_current_user', JSON.stringify({ name, email }));
    window.location.href = 'form.html';
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');

    const users = JSON.parse(localStorage.getItem('cv_users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('cv_current_user', JSON.stringify({ name: user.name, email: user.email }));
        window.location.href = 'form.html';
    } else {
        showError(errorMsg, "Invalid email or password");
    }
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

// Redirect if already logged in
window.onload = function () {
    if (localStorage.getItem('cv_current_user')) {
        window.location.href = 'form.html';
    }
}
