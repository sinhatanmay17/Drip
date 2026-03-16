const INSPO = [
  { t: 'Quiet Luxury',        e: '🤍', h: 280, tags: ['Monochrome', 'Cashmere', 'Minimal'] },
  { t: 'Old Money Summer',    e: '⛵', h: 220, tags: ['Striped', 'Linen', 'Classic'] },
  { t: 'Dark Academia',       e: '📚', h: 340, tags: ['Plaid', 'Structured', 'Moody'] },
  { t: 'Coastal Grandmother', e: '🌊', h: 200, tags: ['Linen', 'Neutral', 'Effortless'] },
  { t: 'Tokyo Noir',          e: '🏙️', h: 300, tags: ['Layered', 'Black', 'Urban'] },
  { t: 'French Riviera',      e: '🥂', h: 240, tags: ['Stripe', 'Chic', 'Breezy'] },
  { t: 'Boho Desert',         e: '🌵', h: 260, tags: ['Earthy', 'Flowy', 'Gold'] },
  { t: 'Parisian Winter',     e: '🗼', h: 220, tags: ['Coat', 'Scarf', 'Muted'] },
  { t: 'Editorial Noir',      e: '📷', h: 320, tags: ['Black', 'Structured', 'Avant-garde'] },
];

const EMOJIS = ['🖤', '🤍', '✦', '◈', '🌙', '⬛', '🎭', '🪞'];
const BGS    = ['#0E0E12', '#141410', '#100E14', '#0C100C', '#12100E', '#0E120E', '#14101C', '#0A0A10'];

let outfits  = [];
let wardrobe = JSON.parse(localStorage.getItem('drip_wardrobe') || '[]');
let saved    = new Set(wardrobe.map(w => w.id));
let busy     = false;

/* ── INIT ── */
function init() {
  renderWardrobe();
  renderInspo();

  document.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', function () {
      const g = this.dataset.g;
      if (g) document.querySelectorAll(`.chip[data-g="${g}"]`).forEach(x => x.classList.remove('on'));
      this.classList.toggle('on');
    });
  });
}

/* ── PROFILE ── */
function getProfile() {
  return {
    occasion:  document.getElementById('occ').value,
    budget:    document.getElementById('bud').value,
    notes:     document.getElementById('notes').value || 'None',
    season:    [...document.querySelectorAll('.chip[data-g="sz"].on')].map(c => c.textContent).join(', ') || 'Any',
    aesthetic: [...document.querySelectorAll('.chip[data-g="ae"].on')].map(c => c.textContent).join(', ') || 'Any',
    palette:   [...document.querySelectorAll('.chip[data-g="pal"].on')].map(c => c.textContent).join(', ') || 'Neutrals',
  };
}

/* ── GENERATE ── */
async function generate() {
  if (busy) return;
  busy = true;

  const btn  = document.getElementById('gbtn');
  const lbl  = document.getElementById('glabel');
  const grid = document.getElementById('ogrid');
  const psub = document.getElementById('psub');

  btn.disabled   = true;
  lbl.textContent = 'Curating…';
  psub.textContent = 'AI is styling your looks…';

  grid.innerHTML = `<div class="skel-grid">
    ${[0,1,2,3].map(() => `
      <div class="skel-card">
        <div class="skel-img"></div>
        <div class="skel-body">
          <div class="skel-line" style="width:65%"></div>
          <div class="skel-line" style="width:40%"></div>
          <div class="skel-line" style="width:80%;margin-top:14px"></div>
          <div class="skel-line" style="width:50%"></div>
        </div>
      </div>`).join('')}
  </div>`;

  try {
    const profile = getProfile();

    const res = await fetch('/api/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(profile),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Server error ${res.status}: ${err.slice(0, 200)}`);
    }

    const { outfits: raw } = await res.json();
    outfits = raw.map((o, i) => ({
      ...o,
      id:    Date.now() + i,
      emoji: EMOJIS[i % EMOJIS.length],
      bg:    BGS[i % BGS.length],
    }));

    renderOutfits();
    psub.textContent = `${outfits.length} AI-generated looks · Tap to explore`;
    showToast('Looks ready');

  } catch (err) {
    console.error(err);
    grid.innerHTML = `
      <div class="err-box">
        <span class="err-title">Generation failed</span>
        ${err.message}
      </div>`;
    psub.textContent = 'Error — please try again';

  } finally {
    busy           = false;
    btn.disabled   = false;
    lbl.textContent = '✦  \u00A0Generate Looks';
  }
}

/* ── RENDER OUTFITS ── */
function renderOutfits() {
  const g = document.getElementById('ogrid');
  g.innerHTML = '';
  if (!outfits.length) return;

  const grid = document.createElement('div');
  grid.className = 'outfit-grid';

  outfits.forEach(o => {
    const on = saved.has(o.id);
    const d  = document.createElement('div');
    d.className = 'outfit-card';
    d.innerHTML = `
      <div class="card-img" style="background:${o.bg}">
        <span style="position:relative;z-index:1">${o.emoji}</span>
        <div class="card-gradient"></div>
        <div class="match-tag">${o.match || ''}</div>
        <button class="heart-btn ${on ? 'on' : ''}" onclick="event.stopPropagation();toggleSave(${o.id})">
          ${on ? '♥' : '♡'}
        </button>
      </div>
      <div class="card-body">
        <div class="card-name">${o.name}</div>
        <div class="card-occ">${o.occasion}</div>
        ${o.why ? `<div class="card-why">${o.why}</div>` : ''}
        <div class="card-pieces">${(o.pieces || []).map(p => `<span class="piece">${p}</span>`).join('')}</div>
        <div class="card-footer">
          <span class="card-price">${o.price || ''}</span>
          <button class="shop-trigger" onclick="event.stopPropagation();openModal(${o.id})">Shop the Look →</button>
        </div>
      </div>`;
    grid.appendChild(d);
  });

  g.appendChild(grid);
}

/* ── SAVE / WARDROBE ── */
function toggleSave(id) {
  const o = outfits.find(x => x.id === id);
  if (!o) return;

  if (saved.has(id)) {
    saved.delete(id);
    wardrobe = wardrobe.filter(w => w.id !== id);
    showToast('Removed from wardrobe');
  } else {
    saved.add(id);
    wardrobe.push({
      ...o,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    });
    showToast('Saved to wardrobe');
  }

  localStorage.setItem('drip_wardrobe', JSON.stringify(wardrobe));
  renderOutfits();
  renderWardrobe();
}

function renderWardrobe() {
  document.getElementById('ws-count').textContent = wardrobe.length;
  document.getElementById('ws-occ').textContent   = new Set(wardrobe.map(w => w.occasion)).size;
  document.getElementById('wbadge').textContent   = wardrobe.length;

  const b = document.getElementById('wrd-body');

  if (!wardrobe.length) {
    b.innerHTML = `
      <div class="empty-wrd">
        <div class="empty-ico">🧥</div>
        <div class="empty-h">Your wardrobe awaits</div>
        <div class="empty-p">Save outfits to begin your collection</div>
      </div>`;
    return;
  }

  const gr = document.createElement('div');
  gr.className = 'wrd-grid';

  wardrobe.forEach(o => {
    const d = document.createElement('div');
    d.className = 'wrd-card';
    d.innerHTML = `
      <div class="wrd-img" style="background:${o.bg || '#111'}">${o.emoji || '✦'}</div>
      <div class="wrd-body">
        <div class="wrd-name">${o.name}</div>
        <div class="wrd-date">Saved ${o.date}</div>
      </div>
      <button class="wrd-remove" onclick="removeFromWardrobe(${o.id})">✕</button>`;
    gr.appendChild(d);
  });

  b.innerHTML = '';
  b.appendChild(gr);
}

function removeFromWardrobe(id) {
  saved.delete(id);
  wardrobe = wardrobe.filter(w => w.id !== id);
  localStorage.setItem('drip_wardrobe', JSON.stringify(wardrobe));
  renderWardrobe();
  renderOutfits();
  showToast('Removed from wardrobe');
}

/* ── INSPIRATION ── */
function renderInspo() {
  const g = document.getElementById('igrid');
  INSPO.forEach(i => {
    const d = document.createElement('div');
    d.className = 'insp-item';
    d.innerHTML = `
      <div class="insp-img" style="height:${i.h}px">${i.e}</div>
      <div class="insp-overlay">
        <div class="insp-src">Pinterest</div>
        <div class="insp-title">${i.t}</div>
        <div class="insp-tags">${i.tags.map(t => `<span class="insp-tag">${t}</span>`).join('')}</div>
      </div>
      <button class="insp-save" onclick="showToast('Saved to inspiration board')">♡</button>`;
    g.appendChild(d);
  });
}

/* ── MODAL ── */
function openModal(id) {
  const o = outfits.find(x => x.id === id);
  if (!o) return;

  document.getElementById('m-title').textContent = o.name;
  document.getElementById('m-occ').textContent   = o.occasion;
  document.getElementById('m-items').innerHTML   = (o.shopItems || []).map(i => `
    <div class="shop-item">
      <div class="s-ico">${i.icon || '👗'}</div>
      <div class="s-info">
        <div class="s-name">${i.name}</div>
        <div class="s-price">${i.price}</div>
      </div>
      <button class="amz-btn" onclick="window.open('https://www.amazon.in/s?k=' + encodeURIComponent('${(i.query || i.name).replace(/'/g, "\\'")}'), '_blank')">
        Shop →
      </button>
    </div>`).join('');

  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

/* ── NAVIGATION ── */
function gotoPage(p, el) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.getElementById('page-' + p).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
  document.getElementById('tmsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

init();
