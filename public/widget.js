/* PulseScore embeddable NPS widget — served at /widget.js */
(function () {
  'use strict';

  var script = document.currentScript ||
    document.querySelector('script[data-survey-id]');
  if (!script) return;

  var surveyId = script.getAttribute('data-survey-id') || 'proj-demo-001';
  var baseUrl = script.src.replace(/\/widget\.js.*$/, '');

  // Only show once per session
  if (sessionStorage.getItem('ps_shown_' + surveyId)) return;

  var INDIGO = '#6366f1';

  // Inject CSS
  var style = document.createElement('style');
  style.textContent = [
    '#ps-widget{position:fixed;bottom:24px;right:24px;z-index:99999;font-family:system-ui,-apple-system,sans-serif}',
    '#ps-card{background:#fff;border-radius:14px;padding:20px 22px;width:360px;max-width:calc(100vw - 48px)',
    ';box-shadow:0 16px 48px rgba(0,0,0,0.14),0 4px 12px rgba(0,0,0,0.06)',
    ';border:1px solid #e5e7eb;transform:translateY(16px);opacity:0',
    ';transition:transform 0.25s ease,opacity 0.25s ease}',
    '#ps-card.ps-visible{transform:translateY(0);opacity:1}',
    '#ps-close{position:absolute;top:10px;right:12px;background:none;border:none;cursor:pointer',
    ';color:#9ca3af;font-size:18px;line-height:1;padding:4px}',
    '#ps-close:hover{color:#374151}',
    '#ps-q{font-size:14px;font-weight:700;color:#1a1a2e;margin:0 0 14px;line-height:1.4}',
    '#ps-scores{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px}',
    '.ps-score{width:32px;height:32px;border:1.5px solid #d1d5db;border-radius:6px',
    ';font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:#374151',
    ';transition:all 0.1s}',
    '.ps-score:hover,.ps-score.ps-sel{background:' + INDIGO + ';color:#fff;border-color:' + INDIGO + '}',
    '#ps-labels{display:flex;justify-content:space-between;font-size:11px;color:#9ca3af;margin-bottom:14px}',
    '#ps-comment-row{display:none;margin-top:4px}',
    '#ps-comment-row.ps-show{display:block}',
    '#ps-comment{width:100%;border:1.5px solid #d1d5db;border-radius:7px;padding:8px 10px',
    ';font-size:13px;font-family:inherit;resize:none;color:#1a1a2e;transition:border-color 0.15s}',
    '#ps-comment:focus{outline:none;border-color:' + INDIGO + '}',
    '#ps-submit{display:block;width:100%;background:' + INDIGO + ';color:#fff;border:none',
    ';border-radius:7px;padding:10px;font-size:14px;font-weight:700;cursor:pointer;margin-top:10px',
    ';transition:background 0.15s}',
    '#ps-submit:hover{background:#4f46e5}',
    '#ps-submit:disabled{background:#c7d2fe;cursor:not-allowed}',
    '#ps-thanks{text-align:center;padding:8px 0}',
    '#ps-thanks-icon{font-size:40px;margin-bottom:8px}',
    '#ps-thanks h4{font-size:16px;font-weight:800;margin:0 0 6px;color:#1a1a2e}',
    '#ps-thanks p{font-size:13px;color:#6b7280;margin:0}',
    '#ps-brand{font-size:10px;color:#d1d5db;text-align:center;margin-top:12px}',
  ].join('');
  document.head.appendChild(style);

  // Build widget HTML
  var widget = document.createElement('div');
  widget.id = 'ps-widget';

  var card = document.createElement('div');
  card.id = 'ps-card';

  var btnHtml = '';
  for (var n = 0; n <= 10; n++) {
    btnHtml += '<button class="ps-score" data-score="' + n + '">' + n + '</button>';
  }

  card.innerHTML = [
    '<button id="ps-close" aria-label="Close">×</button>',
    '<p id="ps-q">How likely are you to recommend us to a friend or colleague?</p>',
    '<div id="ps-scores">' + btnHtml + '</div>',
    '<div id="ps-labels"><span>Not likely</span><span>Extremely likely</span></div>',
    '<div id="ps-comment-row">',
    '  <textarea id="ps-comment" rows="2" placeholder="What\'s the main reason? (optional)"></textarea>',
    '  <button id="ps-submit">Submit feedback →</button>',
    '</div>',
    '<div id="ps-thanks" style="display:none">',
    '  <div id="ps-thanks-icon">🙏</div>',
    '  <h4>Thanks for your feedback!</h4>',
    '  <p>We read every response.</p>',
    '</div>',
    '<div id="ps-brand">Powered by PulseScore</div>'
  ].join('');

  widget.appendChild(card);
  document.body.appendChild(widget);

  // Animate in after short delay
  setTimeout(function () { card.classList.add('ps-visible'); }, 600);

  var selectedScore = null;

  // Score buttons
  card.querySelectorAll('.ps-score').forEach(function (btn) {
    btn.addEventListener('click', function () {
      card.querySelectorAll('.ps-score').forEach(function (b) { b.classList.remove('ps-sel'); });
      btn.classList.add('ps-sel');
      selectedScore = parseInt(btn.getAttribute('data-score'));
      document.getElementById('ps-comment-row').classList.add('ps-show');
      document.getElementById('ps-comment').focus();
    });
  });

  // Submit
  document.getElementById('ps-submit').addEventListener('click', function () {
    if (selectedScore === null) return;
    var submitBtn = document.getElementById('ps-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    var comment = document.getElementById('ps-comment').value;

    fetch(baseUrl + '/api/response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surveyId: surveyId, score: selectedScore, comment: comment })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          document.getElementById('ps-scores').style.display = 'none';
          document.getElementById('ps-labels').style.display = 'none';
          document.getElementById('ps-q').style.display = 'none';
          document.getElementById('ps-comment-row').style.display = 'none';
          document.getElementById('ps-thanks').style.display = 'block';
          sessionStorage.setItem('ps_shown_' + surveyId, '1');
          setTimeout(function () { card.classList.remove('ps-visible'); }, 3000);
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit feedback →';
      });
  });

  // Close button
  document.getElementById('ps-close').addEventListener('click', function () {
    card.classList.remove('ps-visible');
    sessionStorage.setItem('ps_shown_' + surveyId, '1');
  });

})();
