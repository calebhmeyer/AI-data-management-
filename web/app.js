const REPO  = 'calebhmeyer/AI-data-management-';
const API   = 'https://api.github.com';
const TOKEN_KEY = 'showlog_token';

// ── State ──────────────────────────────────────────────────────────────────
let allShows = [];
let activeFilters = { type: null, role: null, company: null };
let selectedId   = null;
let searchQuery  = '';

// ── Auth ───────────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function saveToken(t) { localStorage.setItem(TOKEN_KEY, t.trim()); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function githubFetch(path) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `token ${getToken()}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`);
  return res.json();
}

// ── Boot ───────────────────────────────────────────────────────────────────
async function boot() {
  if (getToken()) {
    showApp();
    await loadShows();
  } else {
    showAuth();
  }
}

function showAuth() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function showApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

document.getElementById('auth-btn').addEventListener('click', async () => {
  const token = document.getElementById('token-input').value.trim();
  if (!token) return;
  saveToken(token);
  try {
    // quick test call
    await githubFetch(`/repos/${REPO}`);
    showApp();
    await loadShows();
  } catch (e) {
    clearToken();
    document.getElementById('auth-error').textContent = 'Invalid token or no access to repo.';
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  clearToken();
  location.reload();
});

// ── Load Shows ─────────────────────────────────────────────────────────────
async function loadShows() {
  document.getElementById('loading').classList.remove('hidden');
  try {
    const files = await githubFetch(`/repos/${REPO}/contents/shows`);
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    allShows = await Promise.all(jsonFiles.map(async f => {
      const data = await githubFetch(`/repos/${REPO}/contents/shows/${f.name}`);
      const json = JSON.parse(atob(data.content.replace(/\n/g, '')));
      json._filename = f.name;
      return json;
    }));

    allShows.sort((a, b) => {
      const da = a.show?.date || '0000';
      const db = b.show?.date || '0000';
      return db.localeCompare(da);
    });

    document.getElementById('loading').classList.add('hidden');
    buildFilters();
    render();
    updateStats();
  } catch (e) {
    document.getElementById('loading').textContent = `Error loading shows: ${e.message}`;
  }
}

// ── Filters ────────────────────────────────────────────────────────────────
function buildFilters() {
  const types     = [...new Set(allShows.map(s => s.show?.type).filter(Boolean))];
  const roles     = [...new Set(allShows.map(s => s.my_role?.title).filter(Boolean))];
  const companies = [...new Set(allShows.flatMap(s => (s.companies || []).map(c => c.name)))];

  renderChips('type-filters',    types,     'type');
  renderChips('role-filters',    roles,     'role');
  renderChips('company-filters', companies, 'company');
}

function renderChips(containerId, values, filterKey) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  values.forEach(val => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = humanize(val);
    chip.title = val;
    chip.addEventListener('click', () => {
      activeFilters[filterKey] = activeFilters[filterKey] === val ? null : val;
      chip.classList.toggle('active', activeFilters[filterKey] === val);
      // deactivate siblings
      el.querySelectorAll('.chip').forEach(c => {
        c.classList.toggle('active', c === chip && activeFilters[filterKey] !== null);
      });
      render();
    });
    el.appendChild(chip);
  });
}

// ── Search ─────────────────────────────────────────────────────────────────
document.getElementById('search-input').addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase();
  render();
});

function matchesSearch(show, q) {
  if (!q) return true;
  const haystack = JSON.stringify(show).toLowerCase();
  return q.split(' ').every(term => haystack.includes(term));
}

// ── Render List ────────────────────────────────────────────────────────────
function render() {
  const filtered = allShows.filter(s => {
    if (activeFilters.type    && s.show?.type !== activeFilters.type) return false;
    if (activeFilters.role    && s.my_role?.title !== activeFilters.role) return false;
    if (activeFilters.company && !(s.companies || []).some(c => c.name === activeFilters.company)) return false;
    if (!matchesSearch(s, searchQuery)) return false;
    return true;
  });

  const list  = document.getElementById('show-list');
  const empty = document.getElementById('empty');
  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  filtered.forEach(show => {
    const card = document.createElement('div');
    card.className = 'show-card' + (show._filename === selectedId ? ' active' : '');
    card.innerHTML = `
      <div class="card-top">
        <span class="card-title">${esc(show.show?.name || 'Untitled')}</span>
        <span class="card-client">${esc(show.show?.client || '')}</span>
        <span class="card-date">${esc(show.show?.date || show.show?.date_notes || '')}</span>
        <span class="card-type">${esc(humanize(show.show?.type || ''))}</span>
      </div>
      <div class="card-role">${esc(show.my_role?.title || '')}${show.my_role?.area ? ` — ${esc(show.my_role.area)}` : ''}</div>
      <div class="card-pills">
        ${(show.companies || []).map(c => `<span class="pill pill-company">${esc(c.name)}</span>`).join('')}
        ${(show.incidents || []).length ? `<span class="pill pill-incident">⚠ ${show.incidents.length} incident${show.incidents.length > 1 ? 's' : ''}</span>` : ''}
      </div>
    `;
    card.addEventListener('click', () => selectShow(show));
    list.appendChild(card);
  });
}

function updateStats() {
  const n = allShows.length;
  document.getElementById('nav-stats').textContent = `${n} show${n !== 1 ? 's' : ''}`;
}

// ── Detail Panel ───────────────────────────────────────────────────────────
function selectShow(show) {
  selectedId = show._filename;
  document.getElementById('detail-panel').classList.remove('hidden');
  document.getElementById('detail-content').innerHTML = buildDetail(show);
  render(); // refresh active state on cards
}

document.getElementById('close-detail').addEventListener('click', () => {
  selectedId = null;
  document.getElementById('detail-panel').classList.add('hidden');
  render();
});

function buildDetail(s) {
  const show      = s.show || {};
  const role      = s.my_role || {};
  const crew      = s.key_crew || [];
  const companies = s.companies || [];
  const area      = s.my_area || {};
  const equip     = area.equipment || {};
  const lighting  = equip.lighting || {};
  const audio     = equip.audio || {};
  const video     = equip.video || {};
  const incidents = s.incidents || [];

  return `
    <div class="detail-header">
      <h2>${esc(show.name || 'Untitled')}</h2>
      <div class="client-line">${esc(show.client || '')}</div>
      <div class="meta-line">
        ${show.date ? esc(show.date) : '<span class="unknown">Date unknown</span>'}
        ${show.location ? ' · ' + esc(show.location) : ''}
        ${show.type ? ' · ' + esc(humanize(show.type)) : ''}
      </div>
    </div>

    <div class="detail-section">
      <h3>My Role</h3>
      <div class="kv-list">
        <div class="kv"><span class="kv-key">Title</span><span class="kv-val">${esc(role.title || '—')}</span></div>
        <div class="kv"><span class="kv-key">Area</span><span class="kv-val">${esc(role.area || '—')}</span></div>
        ${role.in_hierarchy ? `<div class="kv"><span class="kv-key">Level</span><span class="kv-val">${esc(role.in_hierarchy)}</span></div>` : ''}
      </div>
    </div>

    ${companies.length ? `
    <div class="detail-section">
      <h3>Companies</h3>
      <div class="kv-list">
        ${companies.map(c => `
          <div class="kv">
            <span class="kv-key">${esc(humanize(c.role))}</span>
            <span class="kv-val">${esc(c.name)}${c.personal_connection ? ` <span class="unknown">(${esc(c.personal_connection)})</span>` : ''}</span>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    ${crew.length ? `
    <div class="detail-section">
      <h3>Key Crew</h3>
      ${crew.map(c => `
        <div class="crew-item">
          <span class="crew-name">${esc(c.name)}</span>
          <span class="crew-meta">${esc(c.role)}${c.area ? ` — ${esc(c.area)}` : ''}</span>
        </div>
      `).join('')}
    </div>` : ''}

    <div class="detail-section">
      <h3>Equipment — ${esc(area.name || 'My Area')}</h3>
      <div class="kv-list">
        ${lighting.console ? `<div class="kv"><span class="kv-key">Console</span><span class="kv-val">${esc(lighting.console)}</span></div>` : ''}
      </div>
      ${(lighting.fixtures_as_built || []).length ? `
        <div style="margin-top:10px; margin-bottom:4px; font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:.5px;">Fixtures (as built)</div>
        ${lighting.fixtures_as_built.map(f => `
          <div class="fixture-row"><span class="qty">${f.quantity}×</span>${esc(f.name)}</div>
        `).join('')}
      ` : ''}
      ${(lighting.fixtures_original_plan || []).length ? `
        <div style="margin-top:8px; margin-bottom:4px; font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:.5px;">Original Plan</div>
        ${lighting.fixtures_original_plan.map(f => `
          <div class="fixture-row fixture-strike"><span class="qty">${f.quantity}×</span>${esc(f.name)}</div>
        `).join('')}
        ${lighting.plan_vs_actual_note ? `<div style="font-size:12px; color:var(--text-muted); margin-top:4px;">${esc(lighting.plan_vs_actual_note)}</div>` : ''}
      ` : ''}
      <div class="kv-list" style="margin-top:10px;">
        ${audio.speakers ? `<div class="kv"><span class="kv-key">Speakers</span><span class="kv-val">${audio.speakers}</span></div>` : ''}
        ${audio.mixer     ? `<div class="kv"><span class="kv-key">Mixer</span><span class="kv-val">${audio.mixer_type || 'Yes'}</span></div>` : ''}
        ${video.screens   ? `<div class="kv"><span class="kv-key">Screens</span><span class="kv-val">${video.screens}× ${esc(video.screen_type || '')}</span></div>` : ''}
      </div>
    </div>

    ${incidents.length ? `
    <div class="detail-section">
      <h3>Incidents & Lessons</h3>
      ${incidents.map(inc => `
        <div class="incident-box">
          <span class="incident-label ${esc(inc.severity || '')}">${esc(humanize(inc.type))} · ${esc(inc.severity || '')}</span>
          <div class="incident-desc">${esc(inc.description)}</div>
          ${inc.client_impact ? `<div style="font-size:12px; color:var(--text-muted);">Client saw: ${esc(inc.client_impact)}</div>` : ''}
          ${inc.lesson ? `
            <div>
              <div class="lesson-label">Lesson</div>
              <div class="incident-lesson">${esc(inc.lesson)}</div>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>` : ''}

    ${s.notes ? `
    <div class="detail-section">
      <h3>Notes</h3>
      <div class="notes-text">${esc(s.notes)}</div>
    </div>` : ''}
  `;
}

// ── Utilities ──────────────────────────────────────────────────────────────
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function humanize(str) {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Start ──────────────────────────────────────────────────────────────────
boot();
