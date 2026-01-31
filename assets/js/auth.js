// Simple auth using localStorage
const signinTab = document.getElementById('signinTab');
const signupTab = document.getElementById('signupTab');
const extraSignup = document.getElementById('extraSignup');
const submitBtn = document.getElementById('submitBtn');
const authForm = document.getElementById('authForm');
const message = document.getElementById('message');
let mode = 'login';

signinTab.addEventListener('click', ()=>{mode='login'; signinTab.classList.add('active'); signupTab.classList.remove('active'); extraSignup.classList.add('hidden'); submitBtn.textContent='Login'; message.textContent=''});
signupTab.addEventListener('click', ()=>{mode='signup'; signupTab.classList.add('active'); signinTab.classList.remove('active'); extraSignup.classList.remove('hidden'); submitBtn.textContent='Sign Up'; message.textContent=''});

authForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  if(!email||!password){message.style.color='red'; message.textContent='Please fill required fields';return}
  const users = JSON.parse(localStorage.getItem('cv_users')||'[]');
  if(mode==='signup'){
    const name = document.getElementById('name').value.trim();
    const confirm = document.getElementById('confirmPassword').value;
    if(!name){message.style.color='red'; message.textContent='Please enter your full name'; return}
    if(password !== confirm){message.style.color='red'; message.textContent='Passwords do not match'; return}
    if(users.find(u=>u.email===email)){message.style.color='red'; message.textContent='Email already registered';return}
    // add new user
    const user = {id:'u_'+Date.now(), email, password, name};
    users.push(user);
    localStorage.setItem('cv_users',JSON.stringify(users));
    localStorage.setItem('cv_current_user', JSON.stringify(user));
    message.style.color='green'; message.textContent='Signed up! Redirecting to dashboard...';
    setTimeout(()=>window.location.href='dashboard.html',800);
  } else {
    const user = users.find(u=>u.email===email && u.password===password);
    if(!user){message.style.color='red'; message.textContent='Invalid credentials';return}
    localStorage.setItem('cv_current_user',JSON.stringify(user));
    message.style.color='green'; message.textContent='Login successful! Redirecting to dashboard...';
    setTimeout(()=>window.location.href='dashboard.html',600);
  }
});
