// Dashboard: list resumes for logged-in user, search, edit, delete, view
const resumesList = document.getElementById('resumesList');
const createBtn = document.getElementById('createBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const projectsBtn = document.getElementById('projectsBtn');
const projectsPanel = document.getElementById('projectsPanel');
const navThemeToggle = document.getElementById('navThemeToggle');

/* Logo upload removed */

function getCurrentUser(){const u = JSON.parse(localStorage.getItem('cv_current_user')||'null'); if(!u) { window.location.href='index.html'; return null } return u }

function loadResumes(){
  const user = getCurrentUser(); if(!user) return;
  const all = JSON.parse(localStorage.getItem('cv_resumes')||'[]');
  const mine = all.filter(r=>r.ownerId===user.id);
  renderList(mine);
}

function renderList(list){
  resumesList.innerHTML='';
  if(!list.length){ document.getElementById('noResumes').style.display='block'; return }
  document.getElementById('noResumes').style.display='none';
  list.forEach(r=>{
    const el = document.createElement('div'); el.className='saved-card d-flex justify-content-between align-items-center';
    el.innerHTML = `<div><div style="font-weight:600">${r.title||r.data.fullName||'Untitled'}</div><div style="font-size:12px;color:#6b7280">${new Date(r.created).toLocaleString()}</div></div>`;
    const actions = document.createElement('div'); actions.style.display='flex'; actions.style.gap='8px';
    const view = document.createElement('button'); view.className='btn btn-sm btn-primary'; view.textContent='View'; view.onclick=()=>{ localStorage.setItem('cv_view_id', r.id); window.location.href='final.html'};
    const edit = document.createElement('button'); edit.className='btn btn-sm btn-secondary'; edit.textContent='Edit'; edit.onclick=()=>{ localStorage.setItem('cv_edit_id', r.id); window.location.href='form.html'};
    const del = document.createElement('button'); del.className='btn btn-sm btn-danger'; del.textContent='Delete'; del.onclick=()=>{ if(confirm('Delete this resume?')){ deleteResume(r.id); }};
    actions.appendChild(view); actions.appendChild(edit); actions.appendChild(del);
    el.appendChild(actions);
    resumesList.appendChild(el);
  });
}

function deleteResume(id){ const all = JSON.parse(localStorage.getItem('cv_resumes')||'[]'); const next = all.filter(r=>r.id!==id); localStorage.setItem('cv_resumes', JSON.stringify(next)); loadResumes(); }

createBtn.addEventListener('click', ()=>{ localStorage.removeItem('cv_edit_id'); window.location.href='form.html'});

// Theme toggle for dashboard
function applyThemeFromStorage(){ const t = localStorage.getItem('cv_theme') || 'dark'; if(t==='light') { document.body.classList.add('light'); if(navThemeToggle) navThemeToggle.checked = true } else { document.body.classList.remove('light'); if(navThemeToggle) navThemeToggle.checked = false } }
if(navThemeToggle){ navThemeToggle.addEventListener('change', ()=>{ const next = navThemeToggle.checked ? 'light' : 'dark'; localStorage.setItem('cv_theme', next); applyThemeFromStorage(); }); }

/* Logo upload feature removed */

// Projects button behavior
if(projectsBtn && projectsPanel){ projectsBtn.addEventListener('click', ()=>{
  const isHidden = projectsPanel.classList.contains('hidden');
  if(isHidden){
    projectsPanel.classList.remove('hidden');
    loadResumes(); // ensure CV list is up-to-date when viewing projects
    projectsPanel.scrollIntoView({behavior:'smooth', block:'start'});
    projectsBtn.classList.add('active')
  } else {
    projectsPanel.classList.add('hidden'); projectsBtn.classList.remove('active')
  }
}) }

logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('cv_current_user'); window.location.href='index.html'});

searchInput.addEventListener('input', ()=>{ const q = searchInput.value.trim().toLowerCase(); const all = JSON.parse(localStorage.getItem('cv_resumes')||'[]'); const user = getCurrentUser(); if(!user) return; const mine = all.filter(r=>r.ownerId===user.id); const f = mine.filter(r=> (r.title||r.data.fullName||'').toLowerCase().includes(q)); renderList(f); });

window.addEventListener('DOMContentLoaded', ()=>{ applyThemeFromStorage(); loadResumes(); });