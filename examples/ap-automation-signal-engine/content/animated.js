// Builds the graphic from window.__RESULTS (results.js, written by capture.mjs) and drives one
// deterministic timeline: window.__setTime(seconds), window.__duration. Opened in a browser it plays.
(function () {
  const R = window.__RESULTS;
  const NAMES = !!window.__NAMES;
  if (!R) { document.body.insertAdjacentHTML('afterbegin', '<p style="padding:40px">No results.js</p>'); return; }
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const cap = (s) => (s || '').charAt(0).toUpperCase() + (s || '').slice(1);

  const fitAB = R.fit.A + R.fit.B, tierAB = R.tier.A + R.tier.B;
  const co = (R.buyers.emails_by_provider || {}).ContactOut || 0;
  $('#sub').textContent = `A blank OXYGEN folder to ${R.accounts.total} scored accounts and ${R.buyers.total} buyers with outreach.`;
  $('#kit-url').textContent = R.kit_url;
  $('#promo').textContent = R.promo;

  const rows = [
    ['Accounts in', `${R.accounts.sourced} sourced + ${R.accounts.added_from_signals} from job ads`, R.accounts.total],
    ['Fit A or B', 'AI fit score against the ICP', fitAB],
    ['Fit + a fresh signal', `${R.signals_kept_total} in-house job ads · ${R.new_finance_leaders_accounts} new finance leaders`, R.fit_ab_with_fresh_signal],
    ['Tier A or B', `${R.tier.A} Tier A · ${R.tier.B} Tier B`, tierAB],
    ['Buyers found', `${R.buyers.emails_found} emails · ${co} found by ContactOut`, R.buyers.total],
    ['Copy ready', 'AI research + trigger + pain', R.buyers.copy_ready],
  ];
  const max = Math.max(...rows.map((r) => r[2]), 1);
  const funnel = $('#funnel');
  const rowEls = rows.map(([label, note, value], i) => {
    const row = el('div', 'row');
    const lbl = el('div', 'lbl', label); lbl.appendChild(el('span', 'note', note));
    const track = el('div', 'track'); const fill = el('div', 'fill'); track.appendChild(fill);
    const val = el('div', 'val', '0');
    row.append(lbl, track, val); funnel.appendChild(row);
    return { row, fill, val, value, width: Math.max(2.5, Math.sqrt(value / max) * 100), start: 0.8 + i * 0.42 };
  });

  const tops = $('#tops');
  const cards = (R.top_accounts || []).slice(0, 2).map((a, i) => {
    const card = el('div', 'glass acct');
    const top = el('div', 'top');
    const name = el('div', 'name', NAMES ? a.name : cap(a.descriptor));
    const meta = [NAMES ? a.descriptor : null, a.employees ? `${a.employees} staff` : null].filter(Boolean).join(' · ');
    if (meta) name.appendChild(el('span', 'meta', meta));
    top.append(name, el('span', 'tier', `Tier ${a.tier} · ${a.score}`));
    const chips = el('div', 'chips');
    const chipEls = (a.chips || []).slice(0, 3).map((c) => { const ch = el('span', 'chip', c); chips.appendChild(ch); return ch; });
    card.append(top, chips); tops.appendChild(card);
    return { card, chipEls, start: 3.7 + i * 0.35 };
  });

  const ease = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const prog = (t, start, dur) => ease(Math.min(1, Math.max(0, (t - start) / dur)));
  const show = (node, p, dy = 24, scale = 1) => {
    node.style.opacity = p;
    node.style.transform = `translateY(${(1 - p) * dy}px) scale(${scale + (1 - scale) * p})`;
  };

  function setTime(t) {
    show(document.querySelector('[data-anim="hdr"]'), prog(t, 0, 0.6));
    show(funnel, prog(t, 0.35, 0.6), 30, 0.96);
    rowEls.forEach((r) => {
      const p = prog(t, r.start, 0.75);
      r.row.style.opacity = Math.min(1, prog(t, r.start - 0.1, 0.3));
      r.fill.style.width = `${p * r.width}%`;
      r.val.textContent = Math.round(p * r.value).toLocaleString('en-US');
    });
    show(document.querySelector('[data-anim="tops-label"]'), prog(t, 3.5, 0.4), 12);
    cards.forEach((c) => {
      show(c.card, prog(t, c.start, 0.55), 26, 0.97);
      c.chipEls.forEach((ch, j) => { ch.style.opacity = prog(t, c.start + 0.25 + j * 0.09, 0.35); });
    });
    show(document.querySelector('[data-anim="cta"]'), prog(t, 5.0, 0.6), 30, 0.97);
    const q = prog(t, 5.3, 0.6);
    document.querySelector('[data-anim="qr"]').style.transform = `scale(${0.88 + 0.12 * q})`;
    document.querySelector('[data-anim="qr"]').style.opacity = q;
  }

  window.__duration = 6.4;
  window.__setTime = setTime;
  if (window.__CAPTURE) { setTime(0); return; }
  const t0 = performance.now();
  (function loop(now) { const t = ((now - t0) / 1000) % (window.__duration + 1.6); setTime(t); requestAnimationFrame(loop); })(t0);
})();
