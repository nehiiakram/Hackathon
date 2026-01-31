// CV Renderer
document.addEventListener('DOMContentLoaded', () => {
    // 1. Get data from LS
    const cvDataString = localStorage.getItem('cv_data');
    if (!cvDataString) {
        alert("No CV data found. Redirecting to form...");
        window.location.href = '../form.html';
        return;
    }

    const data = JSON.parse(cvDataString);

    // 2. Map fields
    const fields = {
        'cv-name': data.fullName,
        'cv-title': 'Professional Profile', // Static or derived
        'cv-email': data.email,
        'cv-phone': data.phone,
        'cv-education': data.education,
        'cv-experience': data.experience,
        'cv-skills': data.skills.join(' • '), // Join array
        // Extra fields specifics
        'cv-father': data.fatherName,
        'cv-cnic': data.cnic,
        'cv-dob': data.dob
    };

    // 3. Inject into DOM
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            // Handle new lines for textareas
            if (id === 'cv-experience') {
                element.innerHTML = value.replace(/\n/g, '<br>');
            } else {
                element.textContent = value;
            }
        }
    }

    // Print Prompt
    setTimeout(() => {
        window.print();
    }, 1000);
});
