// Load the selected template, apply form data and enable print
const cvContainer = document.getElementById('cvContainer');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const saveHtmlBtn = document.getElementById('saveHtmlBtn');

const templates = {
  template1:{file:'templates/template1.html', css:'templates/template1.css'},
  template2:{file:'templates/template2.html', css:'templates/template2.css'},
  template3:{file:'templates/template3.html', css:'templates/template3.css'},
  template4:{file:'templates/template4.html', css:'templates/template4.css'},
};

function applyDataToNode(root, data){
  root.querySelectorAll('[data-field]').forEach(el=>{
    const key = el.getAttribute('data-field');
    if(!key) return;
    if(data[key]) el.textContent = data[key];
  });
}

function applyThemeFromStorage(){ const t = localStorage.getItem('cv_theme') || 'dark'; if(t==='light'){ document.body.classList.add('light'); if(document.getElementById('navThemeToggle')) document.getElementById('navThemeToggle').checked = true } else { document.body.classList.remove('light'); if(document.getElementById('navThemeToggle')) document.getElementById('navThemeToggle').checked = false } }

// Navbar hooks (logout, create, theme)
const navThemeToggle = document.getElementById('navThemeToggle');
const navCreate = document.getElementById('createBtn');
const navLogout = document.getElementById('logoutBtn');
if(navThemeToggle){ navThemeToggle.addEventListener('change', ()=>{ const next = navThemeToggle.checked ? 'light' : 'dark'; localStorage.setItem('cv_theme', next); applyThemeFromStorage(); }); }
if(navCreate){ navCreate.addEventListener('click', ()=>{ localStorage.removeItem('cv_edit_id'); window.location.href='form.html'; }); }
if(navLogout){ navLogout.addEventListener('click', ()=>{ localStorage.removeItem('cv_current_user'); window.location.href='index.html'; }); }

function loadTemplate(){
  if(!localStorage.getItem('cv_current_user')){ window.location.href='index.html'; return; }
  // apply theme
  applyThemeFromStorage();
  // If viewing a saved resume from dashboard, load it by id
  const viewId = localStorage.getItem('cv_view_id');
  let data = {};
  let selected = localStorage.getItem('cv_selected_template') || 'template1';
  if(viewId){
    const resumes = JSON.parse(localStorage.getItem('cv_resumes')||'[]');
    const item = resumes.find(r=>r.id===viewId);
    if(item){ data = item.data || {}; selected = item.template || selected; }
    // keep viewId on the container so save/download know current resume
    cvContainer.dataset.viewId = viewId || '';
    // remove view token from storage
    localStorage.removeItem('cv_view_id');
  } else {
    data = JSON.parse(localStorage.getItem('cv_form_data')||'{}');
    selected = localStorage.getItem('cv_selected_template')||selected;
    cvContainer.dataset.viewId = '';
  }

  const meta = templates[selected];
  if(!meta){cvContainer.innerHTML='<p>Template not found</p>'; return}
  // Load CSS
  const existing = document.getElementById('template-css'); if(existing) existing.remove();
  const link = document.createElement('link'); link.rel='stylesheet'; link.id='template-css'; link.href = meta.css; document.head.appendChild(link);

  fetch(meta.file).then(r=>r.text()).then(html=>{
    cvContainer.innerHTML = html;
    applyDataToNode(cvContainer, data);
    // apply theme class to inner container so saved HTML/PDF reflects theme where possible
    if(localStorage.getItem('cv_theme')==='light') cvContainer.classList.add('light'); else cvContainer.classList.remove('light');
  }).catch(err=>{cvContainer.innerHTML='<p>Failed to load template</p>'});
}

// Save current CV as standalone HTML file (includes global CSS and theme)
saveHtmlBtn.addEventListener('click', ()=>{
  // Determine filename from viewed resume or current form
  const viewId = cvContainer.dataset.viewId || '';
  let filenameBase = 'cv';
  if(viewId){ const r = JSON.parse(localStorage.getItem('cv_resumes')||'[]').find(x=>x.id===viewId); if(r) filenameBase = r.title || r.data.fullName || filenameBase }
  else { const data = JSON.parse(localStorage.getItem('cv_form_data')||'{}'); filenameBase = data.title || data.fullName || filenameBase }
  const filename = `${(filenameBase).replace(/\s+/g,'_')}.html`;
  const cssHref = document.getElementById('template-css')?.href || '';
  const globalCss = 'assets/css/style.css';
  const theme = localStorage.getItem('cv_theme') || 'dark';
  const bodyClass = theme==='light' ? ' class="light"' : '';
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${filenameBase}</title><link rel="stylesheet" href="${globalCss}">${cssHref?`<link rel="stylesheet" href="${cssHref}">`:''}<body${bodyClass}><div>${cvContainer.innerHTML}</div></body>`;
  const blob = new Blob([html], {type:'text/html'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
});

// Download CV as PDF using html2pdf (A4, good quality)
downloadPdfBtn.addEventListener('click', ()=>{
  const viewId = cvContainer.dataset.viewId || '';
  let filenameBase = 'cv';
  if(viewId){ const r = JSON.parse(localStorage.getItem('cv_resumes')||'[]').find(x=>x.id===viewId); if(r) filenameBase = r.title || r.data.fullName || filenameBase }
  else { const data = JSON.parse(localStorage.getItem('cv_form_data')||'{}'); filenameBase = data.title || data.fullName || filenameBase }
  const filename = `${(filenameBase).replace(/\s+/g,'_')}.pdf`;
  const opt = {
    margin: 0.4,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  // Use html2pdf to create a PDF from the CV container
  if(typeof html2pdf === 'undefined'){alert('PDF library not loaded. Check your connection.'); return}
  html2pdf().set(opt).from(cvContainer).save();
});

window.addEventListener('DOMContentLoaded', loadTemplate);
