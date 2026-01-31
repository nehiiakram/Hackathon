// Check auth
const currentUser = JSON.parse(localStorage.getItem('cv_current_user'));
if (!currentUser) {
    window.location.href = 'index.html';
}

// Display User Name
document.getElementById('user-greeting').textContent = `Welcome, ${currentUser.name}`;
document.getElementById('email').value = currentUser.email; // Auto-fill email

let selectedTemplateId = 1;

function logout() {
    localStorage.removeItem('cv_current_user');
    window.location.href = 'index.html';
}

function selectTemplate(id) {
    selectedTemplateId = id;

    // Update UI
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    // Add selected class to the clicked card (finding by index/order is tricky, so simpler to re-query or use event bubbling, but here logic matches order)
    const cards = document.querySelectorAll('.template-card');
    if (cards[id - 1]) {
        cards[id - 1].classList.add('selected');
    }
}

function generateCV() {
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        fatherName: document.getElementById('fatherName').value,
        dob: document.getElementById('dob').value,
        age: document.getElementById('age').value,
        cnic: document.getElementById('cnic').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        education: document.getElementById('education').value,
        skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
        experience: document.getElementById('experience').value,
        templateId: selectedTemplateId
    };

    // Validation
    if (!formData.fullName || !formData.phone || !formData.education) {
        alert("Please fill in at least Name, Phone, and Education to proceed.");
        return;
    }

    // Save to Local Storage
    localStorage.setItem('cv_data', JSON.stringify(formData));

    // Redirect to Template Page
    const templateFiles = {
        1: 'templates/template1.html',
        2: 'templates/template2.html',
        3: 'templates/template3.html',
        4: 'templates/template4.html'
    };

    window.location.href = templateFiles[selectedTemplateId];
}
