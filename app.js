const KEY = 'novahire-jobs-v1';
const COLS = [
  ['saved', 'Saved'],
  ['applied', 'Applied'],
  ['interview', 'Interview'],
  ['offer', 'Offer'],
  ['rejected', 'Rejected'],
];

const load = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const save = (jobs) => localStorage.setItem(KEY, JSON.stringify(jobs));

function uid() {
  return crypto.randomUUID();
}

function render() {
  const jobs = load();
  const stats = document.getElementById('stats');
  const board = document.getElementById('board');
  stats.innerHTML = COLS.map(([id, label]) => {
    const n = jobs.filter((j) => j.status === id).length;
    return `<div class="stat"><b>${n}</b><span>${label}</span></div>`;
  }).join('');

  board.innerHTML = COLS.map(([id, label]) => {
    const cards = jobs
      .filter((j) => j.status === id)
      .map((j) => `
        <article class="card" data-id="${j.id}">
          <strong>${escapeHtml(j.company)}</strong>
          <div>${escapeHtml(j.role)}</div>
          ${j.link ? `<a href="${escapeAttr(j.link)}" target="_blank" rel="noopener">Open listing</a>` : ''}
          ${j.note ? `<small>${escapeHtml(j.note)}</small>` : ''}
          <div class="row">
            <select data-move>
              ${COLS.map(([sid, slabel]) => `<option value="${sid}" ${sid === j.status ? 'selected' : ''}>${slabel}</option>`).join('')}
            </select>
            <button type="button" class="ghost" data-del>Delete</button>
          </div>
        </article>`)
      .join('');
    return `<div class="col"><h2>${label}</h2>${cards || '<small>Empty</small>'}</div>`;
  }).join('');
}

function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(s = '') {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

document.getElementById('addForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const jobs = load();
  jobs.unshift({ id: uid(), createdAt: Date.now(), ...data });
  save(jobs);
  e.target.reset();
  e.target.status.value = 'applied';
  render();
});

document.getElementById('board').addEventListener('change', (e) => {
  if (!e.target.matches('[data-move]')) return;
  const id = e.target.closest('.card').dataset.id;
  const jobs = load().map((j) => (j.id === id ? { ...j, status: e.target.value } : j));
  save(jobs);
  render();
});

document.getElementById('board').addEventListener('click', (e) => {
  if (!e.target.matches('[data-del]')) return;
  const id = e.target.closest('.card').dataset.id;
  save(load().filter((j) => j.id !== id));
  render();
});

document.getElementById('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(load(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'novahire-jobs.json';
  a.click();
};

document.getElementById('clearBtn').onclick = () => {
  if (confirm('Clear all jobs on this device?')) {
    save([]);
    render();
  }
};

render();
