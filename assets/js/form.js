// Enhanced form handling: theme toggle, per-user resumes, preview, select & apply
const cvForm = document.getElementById('cvForm');
const saveBtn = document.getElementById('saveBtn');
const saveCvBtn = document.getElementById('saveCvBtn');
const applyBtn = document.getElementById('applyBtn');
const templatesGrid = document.getElementById('templatesGrid');
const logoutBtn = document.getElementById('logoutBtn');
const savedList = document.getElementById('savedList');
const themeToggle = document.getElementById('themeToggle');

const templateDefs = [
  {id:'template1', title:'Modern Minimal', file:'templates/template1.html', css:'templates/template1.css'},
  {id:'template2', title:'Bold Classic', file:'templates/template2.html', css:'templates/template2.css'},
  {id:'template3', title:'Creative', file:'templates/template3.html', css:'templates/template3.css'},
  {id:'template4', title:'Corporate', file:'templates/template4.html', css:'templates/template4.css'},
];
let selectedTemplate = localStorage.getItem('cv_selected_template') || templateDefs[0].id;
let editingId = localStorage.getItem('cv_edit_id') || null;

function getCurrentUser(){
  const u = JSON.parse(localStorage.getItem('cv_current_user')||'null');
  if(!u){ window.location.href='index.html'; return null; }
  return u;
}

function createTemplateCard(tmpl){
  const card = document.createElement('div'); card.className='template-card'; card.dataset.id=tmpl.id;
  if(tmpl.id===selectedTemplate) card.classList.add('selected');
  const preview = document.createElement('div'); preview.className='template-preview'; preview.innerHTML='<div style="font-size:12px;color:#9ca3af;">Loading preview...</div>';
  Promise.all([fetch(tmpl.file).then(r=>r.text()), fetch(tmpl.css).then(r=>r.text())])
    .then(([html, css])=>{ preview.innerHTML = html; const styleTag = document.createElement('style'); styleTag.textContent = css; preview.prepend(styleTag); })
    .catch(()=>{preview.innerHTML='<div style="font-size:12px;color:#9ca3af;">Preview unavailable</div>'});
  const footer = document.createElement('div'); footer.className='template-actions';
  const title = document.createElement('div'); title.textContent=tmpl.title; title.style.fontWeight='600';
  const btn = document.createElement('button'); btn.className='btn secondary'; btn.textContent='Select'; btn.onclick=(e)=>{document.querySelectorAll('.template-card').forEach(c=>c.classList.remove('selected')); card.classList.add('selected'); selectedTemplate=tmpl.id; localStorage.setItem('cv_selected_template', selectedTemplate)};
  footer.appendChild(title); footer.appendChild(btn);
  card.appendChild(preview); card.appendChild(footer);
  return card;
}

function loadTemplates(){templatesGrid.innerHTML=''; templateDefs.forEach(t=>templatesGrid.appendChild(createTemplateCard(t)))}

// Save draft locally
saveBtn.addEventListener('click', ()=>{const data = getFormData(); localStorage.setItem('cv_form_data', JSON.stringify(data)); alert('Draft saved locally ✅');});

// Save a named CV to resumes array (per user)
saveCvBtn.addEventListener('click', ()=>{
  const data = getFormData(); if(!data.fullName){alert('Please enter Full Name'); return}
  const user = getCurrentUser(); if(!user) return;
  const name = prompt('Enter CV name', data.title || data.fullName) || (data.fullName || ('CV '+new Date().toLocaleString()));
  const resumes = JSON.parse(localStorage.getItem('cv_resumes')||'[]');
  if(editingId){
    // update existing
    const idx = resumes.findIndex(r=>r.id===editingId);
    if(idx>-1){ resumes[idx] = {...resumes[idx], title:name, data, template:selectedTemplate, updated:Date.now()}; }
  } else {
    const item = {id:'r_'+Date.now(), title:name, data, template:selectedTemplate, created:Date.now(), ownerId:user.id};
    resumes.unshift(item);
  }
  localStorage.setItem('cv_resumes', JSON.stringify(resumes));
  localStorage.removeItem('cv_edit_id'); editingId=null;
  renderSavedList(); alert('CV saved ✅');
});

// Apply to template and go to final
applyBtn.addEventListener('click', ()=>{
  const data = getFormData(); if(!data.fullName){alert('Please enter Full Name');return}
  localStorage.setItem('cv_form_data', JSON.stringify(data));
  localStorage.setItem('cv_selected_template', selectedTemplate);
  window.location.href='final.html';
});

logoutBtn.addEventListener('click', ()=>{localStorage.removeItem('cv_current_user'); window.location.href='index.html'});

function getFormData(){return{
  title:document.getElementById('title')?.value || '',
  fullName:document.getElementById('fullName').value,
  fatherName:document.getElementById('fatherName').value,
  age:document.getElementById('age').value,
  education:document.getElementById('education')?.value || '',
  experience:document.getElementById('experience')?.value || '',
  profile:document.getElementById('profile')?.value || '',
  dob:document.getElementById('dob').value,
  cnic:document.getElementById('cnic').value,
  religion:document.getElementById('religion')?.value || '',
  phone:document.getElementById('phone').value,
  languages:document.getElementById('languages')?.value || '',
  skills:document.getElementById('skills')?.value || '',
};}

function renderSavedList(){
  const user = JSON.parse(localStorage.getItem('cv_current_user')||'null');
  if(!user) return; const resumes = JSON.parse(localStorage.getItem('cv_resumes')||'[]');
  const mine = resumes.filter(r=>r.ownerId===user.id);
  savedList.innerHTML='';
  if(!mine.length){savedList.innerHTML='<div class="muted">No saved CVs yet — use <strong>Save CV</strong>.</div>'; return}
  mine.forEach(item=>{
    const card = document.createElement('div'); card.style.display='flex'; card.style.justifyContent='space-between'; card.style.alignItems='center'; card.style.padding='8px'; card.style.border='1px solid #eef2f7'; card.style.borderRadius='8px';
    const left = document.createElement('div'); left.innerHTML = `<div style="font-weight:600">${item.title}</div><div style="font-size:12px;color:#6b7280">${new Date(item.created||item.updated).toLocaleString()} — ${item.template}</div>`;
    const actions = document.createElement('div'); actions.style.display='flex'; actions.style.gap='8px';
    const edit = document.createElement('button'); edit.className='btn secondary'; edit.textContent='Edit'; edit.onclick=()=>{loadSavedIntoForm(item.id)};
    const del = document.createElement('button'); del.className='btn'; del.style.background='#ef4444'; del.textContent='Delete'; del.onclick=()=>{ if(confirm('Delete this CV?')){ deleteSaved(item.id); }};
    const download = document.createElement('button'); download.className='btn secondary'; download.textContent='Download'; download.onclick=()=>{ downloadSavedAsHTML(item.id)};
    actions.appendChild(edit); actions.appendChild(download); actions.appendChild(del);
    card.appendChild(left); card.appendChild(actions); savedList.appendChild(card);
  });
}

function loadSavedIntoForm(id){
  const resumes = JSON.parse(localStorage.getItem('cv_resumes')||'[]');
  const item = resumes.find(s=>s.id===id); if(!item) return; const d = item.data || {};
  Object.keys(d).forEach(k=>{const el=document.getElementById(k); if(el) el.value = d[k]});
  selectedTemplate = item.template || selectedTemplate; localStorage.setItem('cv_selected_template', selectedTemplate);
  // highlight template
  document.querySelectorAll('.template-card').forEach(c=>c.classList.toggle('selected', c.dataset.id===selectedTemplate));
  editingId = id; localStorage.setItem('cv_edit_id', id);
  window.scrollTo({top:0,behavior:'smooth'});
}

function deleteSaved(id){
  const resumes = JSON.parse(localStorage.getItem('cv_resumes')||'[]');
  const next = resumes.filter(s=>s.id!==id); localStorage.setItem('cv_resumes', JSON.stringify(next)); renderSavedList();
}

function downloadSavedAsHTML(id){
  const resumes = JSON.parse(localStorage.getItem('cv_resumes')||'[]');
  const item = resumes.find(s=>s.id===id); if(!item) return; const data = item.data; const cssHref = templateDefs.find(t=>t.id===item.template)?.css || '';
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${item.title}</title><link rel="stylesheet" href="assets/css/style.css"><link rel="stylesheet" href="${cssHref}"><div>${generateTemplatePreview(item.template,data)}</div>`;
  const blob = new Blob([html], {type:'text/html'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${item.title.replace(/\s+/g,'_')}.html`; document.body.appendChild(a); a.click(); a.remove();
}

function generateTemplatePreview(templateId, data){
  // Basic preview generation by fetching template html and replacing placeholders
  const t = templateDefs.find(x=>x.id===templateId);
  if(!t) return '<div>Template not found</div>';
  // Basic placeholder: informing user to use final page for full rendering
  let html = '<div style="padding:20px;border:1px solid #eee">Preview saved CV — open in app to generate full view.</div>';
  return html;
}

// Theme handling
function applyTheme(theme){ if(theme==='light') document.body.classList.add('light'); else document.body.classList.remove('light'); localStorage.setItem('cv_theme', theme); }
function toggleTheme(){ const next = document.body.classList.contains('light') ? 'dark' : 'light'; applyTheme(next); }
themeToggle.addEventListener('click', ()=>toggleTheme());

// Navbar behavior (if present on this page)
const navThemeToggle = document.getElementById('navThemeToggle');
const createBtnNav = document.getElementById('createBtn');
if(navThemeToggle){ // reflect current theme
  navThemeToggle.checked = (localStorage.getItem('cv_theme')||'dark') === 'light';
  navThemeToggle.addEventListener('change', ()=>{ const next = navThemeToggle.checked ? 'light' : 'dark'; applyTheme(next); });
}
if(createBtnNav){ createBtnNav.addEventListener('click', ()=>{ // clear form for new resume
  localStorage.removeItem('cv_edit_id'); editingId=null; document.getElementById('cvForm').reset(); window.scrollTo({top:0,behavior:'smooth'});
}); }

// Load saved form when present and check auth
window.addEventListener('DOMContentLoaded', ()=>{
  if(!localStorage.getItem('cv_current_user')){ window.location.href='index.html'; return; }
  const saved=JSON.parse(localStorage.getItem('cv_form_data')||'null'); if(saved){Object.keys(saved).forEach(k=>{const el=document.getElementById(k); if(el) el.value = saved[k]});}
  // apply theme
  const t = localStorage.getItem('cv_theme') || 'dark'; applyTheme(t);
  // sync nav toggle if present
  if(navThemeToggle) navThemeToggle.checked = (t === 'light');
  loadTemplates();
  renderSavedList();
  // if editing an existing resume, load it into the form
  if(editingId){ loadSavedIntoForm(editingId); }

  // Toggle visibility for saved-list panel (for small/desktop quick access)
  const toggleSaved = document.getElementById('toggleSaved'); const sidePanel = document.querySelector('.side-panel');
  if(toggleSaved && sidePanel){ toggleSaved.addEventListener('click', ()=>{ sidePanel.classList.toggle('visible'); toggleSaved.textContent = sidePanel.classList.contains('visible') ? 'Hide' : 'Saved'; }); }
});

// Navbar logout (use the navbar's logout if present)
const navLogout = document.getElementById('logoutBtn'); if(navLogout){ navLogout.addEventListener('click', ()=>{ localStorage.removeItem('cv_current_user'); window.location.href = 'index.html'; }); }
