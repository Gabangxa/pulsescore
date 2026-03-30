/* PulseScore — Dashboard JS */

let chart = null;
let allResponses = [];

// Initial data load
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  buildPreviewWidget();
  updateSnippet();
});

async function loadData() {
  try {
    const res = await fetch('/api/responses?projectId=proj-demo-001');
    const data = await res.json();
    renderOverview(data);
    renderResponseTable(data.responses.slice(0, 10), 'responses-tbody');
    renderResponseTable(data.responses, 'all-responses-tbody');
    allResponses = data.responses;
  } catch (err) {
    console.error('Failed to load data:', err);
  }
}

function renderOverview(data) {
  // NPS score
  const scoreEl = document.getElementById('nps-score');
  const score = data.nps;
  scoreEl.textContent = (score >= 0 ? '+' : '') + score;
  scoreEl.className = 'nps-number ' + (score >= 30 ? 'positive' : score >= 0 ? 'neutral' : 'negative');
  document.getElementById('nps-total').textContent = data.total + ' responses';

  // Breakdown bars
  document.getElementById('bar-promoter').style.width = data.promoterPct + '%';
  document.getElementById('bar-passive').style.width = data.passivePct + '%';
  document.getElementById('bar-detractor').style.width = data.detractorPct + '%';
  document.getElementById('pct-promoter').textContent = data.promoterPct + '%';
  document.getElementById('pct-passive').textContent = data.passivePct + '%';
  document.getElementById('pct-detractor').textContent = data.detractorPct + '%';

  // Chart
  const ctx = document.getElementById('npsChart').getContext('2d');
  if (chart) chart.destroy();

  // Fill nulls with interpolated values for a smooth line
  const chartData = interpolateNulls(data.chartData);

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.chartLabels,
      datasets: [{
        label: 'NPS',
        data: chartData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#6366f1',
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => 'NPS: ' + (ctx.parsed.y >= 0 ? '+' : '') + ctx.parsed.y
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#9ca3af', maxTicksLimit: 8 }
        },
        y: {
          min: -100, max: 100,
          grid: { color: '#f3f4f6' },
          ticks: {
            font: { size: 11 }, color: '#9ca3af',
            callback: v => (v >= 0 ? '+' : '') + v
          }
        }
      }
    }
  });

  document.getElementById('chart-meta').textContent =
    'Promoters: ' + data.promoters + ' · Passives: ' + data.passives + ' · Detractors: ' + data.detractors;
}

function interpolateNulls(arr) {
  const result = [...arr];
  for (let i = 0; i < result.length; i++) {
    if (result[i] === null) {
      // find previous and next non-null
      let prev = null, next = null;
      for (let j = i - 1; j >= 0; j--) { if (result[j] !== null) { prev = result[j]; break; } }
      for (let j = i + 1; j < result.length; j++) { if (result[j] !== null) { next = result[j]; break; } }
      if (prev !== null && next !== null) result[i] = Math.round((prev + next) / 2);
      else if (prev !== null) result[i] = prev;
      else if (next !== null) result[i] = next;
      else result[i] = 0;
    }
  }
  return result;
}

function renderResponseTable(responses, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!responses || responses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:32px">No responses yet.</td></tr>';
    return;
  }
  tbody.innerHTML = responses.map(r => {
    const date = new Date(r.created_at);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `
      <tr>
        <td style="color:#9ca3af;font-size:12px;white-space:nowrap">${dateStr}</td>
        <td><span class="score-badge ${r.segment}">${r.score}</span></td>
        <td class="comment-cell" title="${escapeHtml(r.comment || '')}">${escapeHtml(r.comment || '—')}</td>
        <td style="font-size:12px;color:#6b7280">${escapeHtml(r.respondent_email || '—')}</td>
        <td><span class="segment-tag ${r.segment}">${r.segment}</span></td>
      </tr>`;
  }).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Tab switching
function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    const ids = ['overview', 'responses', 'send-survey', 'install-widget', 'settings'];
    t.classList.toggle('active', ids[i] === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
}

// Send survey
async function sendSurvey() {
  const emails = document.getElementById('email-list').value.trim();
  if (!emails) { showToast('Please enter at least one email address.'); return; }

  try {
    const res = await fetch('/api/send-survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails, projectId: 'proj-demo-001' })
    });
    const data = await res.json();
    if (data.ok) {
      showToast('Sent to ' + data.sent + ' recipient' + (data.sent !== 1 ? 's' : '') + ' ✓');
      document.getElementById('email-list').value = '';
    } else {
      showToast('Error: ' + data.error);
    }
  } catch {
    showToast('Network error. Please try again.');
  }
}

// Copy embed snippet
function copySnippet() {
  const text = document.getElementById('snippet-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Snippet copied to clipboard ✓');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    showToast('Snippet copied ✓');
  });
}

function updateSnippet() {
  const origin = window.location.origin;
  document.getElementById('snippet-text').textContent =
    `<script src="${origin}/widget.js" data-survey-id="proj-demo-001"><\/script>`;
}

// Preview widget
function buildPreviewWidget() {
  const container = document.getElementById('preview-btns');
  if (!container) return;
  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.className = 'score-btn';
    btn.textContent = i;
    btn.onclick = () => {
      container.querySelectorAll('.score-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('preview-comment-row').style.display = 'block';
    };
    container.appendChild(btn);
  }
}

// Test webhook
async function testWebhook() {
  const url = document.getElementById('webhook-url').value.trim();
  if (!url) { showToast('Enter a webhook URL first.'); return; }
  try {
    const res = await fetch('/api/webhook-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: url })
    });
    const data = await res.json();
    showToast(data.ok ? 'Webhook fired — status ' + data.status + ' ✓' : 'Failed: ' + data.error);
  } catch {
    showToast('Network error firing webhook.');
  }
}

// New project dialog (simple prompt)
function showNewProjectDialog() {
  const name = window.prompt('Project name:');
  if (!name) return;
  fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type: 'nps' })
  }).then(r => r.json()).then(data => {
    if (data.ok) { showToast('Project "' + data.name + '" created ✓'); }
  });
}

// Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
