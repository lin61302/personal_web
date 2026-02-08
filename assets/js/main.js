// Tabbed single-page navigation (no frameworks).
// - Click tabs to switch panels
// - Supports deep-link via hash (#overview, #deployments, #links)
// - Keyboard: Left/Right arrows to change tabs; Enter/Space to activate

(function () {
  const tabs = Array.from(document.querySelectorAll('.tab[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('.panel[role="tabpanel"]'));

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  function setActive(name, { focusPanel = false, updateHash = true } = {}) {
    tabs.forEach(t => {
      const isActive = t.dataset.tab === name;
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.classList.toggle('active', isActive);
      t.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach(p => {
      const isActive = p.dataset.panel === name;
      p.classList.toggle('active', isActive);
      p.hidden = !isActive;
    });

    if (updateHash) history.replaceState(null, '', `#${name}`);
    if (focusPanel) {
      const panel = panels.find(p => p.dataset.panel === name);
      if (panel) panel.focus({ preventScroll: false });
    }
  }

  function fromHash() {
    const name = (location.hash || '').replace('#', '').trim();
    const valid = tabs.some(t => t.dataset.tab === name);
    return valid ? name : 'overview';
  }

  // Init: hide non-active panels for a11y
  panels.forEach(p => p.hidden = true);
  setActive(fromHash(), { focusPanel: false, updateHash: false });

  // Click tabs + keyboard navigation
  tabs.forEach(tab => {
    tab.addEventListener('click', () => setActive(tab.dataset.tab, { focusPanel: true }));
    tab.addEventListener('keydown', (e) => {
      const idx = tabs.indexOf(tab);

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const next = (idx + dir + tabs.length) % tabs.length;
        tabs[next].focus();
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActive(tab.dataset.tab, { focusPanel: true });
      }
    });
  });

  // Buttons/links that jump to sections
  document.querySelectorAll('[data-jump]').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = el.getAttribute('data-jump');
      if (!target) return;
      e.preventDefault();
      setActive(target, { focusPanel: true });
    });
  });

  // Copy-to-clipboard (email, etc.)
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.getAttribute('data-copy');
      if (!value) return;

      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(value);
        btn.textContent = 'Copied';
      } catch (err) {
        // Fallback for older browsers / blocked permissions
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', 'true');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); btn.textContent = 'Copied'; } catch (e) {}
        document.body.removeChild(ta);
      }
      window.setTimeout(() => { btn.textContent = original; }, 1200);
    });
  });

  // Workflow diagram toggle (generic vs example)
  const diagram = document.getElementById('workflow-diagram');
  const diagramCaption = document.getElementById('diagram-caption');
  const diagramConfig = document.getElementById('diagram-config');
  const segBtns = Array.from(document.querySelectorAll('.seg-btn[data-diagram]'));

  function setDiagram(kind) {
    if (!diagram) return;

    const src = diagram.getAttribute(`data-${kind}`);
    if (!src) return;

    diagram.classList.add('is-switching');
    diagram.setAttribute('src', src);

    if (diagramCaption) {
      diagramCaption.textContent = (kind === 'example')
        ? 'Example configuration: coverage + source policy → patch tool → translation routing → multi‑head classifiers → geoparse + 2‑stage subnational reconciliation → standardized counts → surge + forecast → dashboards.'
        : 'Generic blueprint: connectors → patch+schema → retrieval + models → geo/time analytics → products, with evaluation + audit attached.';
    }

    if (diagramConfig) {
      diagramConfig.textContent = (kind === 'example')
        ? `policy:
  coverage: countries + sources (scoring / leaning tags)
acquire:
  scrape + parse + de-dup + provenance
patch:
  canonicalize HTML → doc schema (versioned fixes)
nlp:
  translate + QA; multi-head suite (civic / influence / env / usg)
geo:
  CLIFF + LLM geoparse → 2-stage subnational reconcile
series:
  modifiers + standardized counts → surge/changepoints → forecast
deliver:
  maps + dashboards + briefs (+audit logs)`
        : `pipeline:
  - ingest: connectors + schedulers + provenance
  - normalize: patch+schema → language routing → QA
  - retrieve: embeddings + KB index (RAG-style)
  - model: multi-task heads + extraction + calibration
  - geo_time: reconcile → changepoints → forecast
  - serve: dashboards + alerts + API
guardrails: drift tests + sampling QA + audit logs`;
    }

    segBtns.forEach(b => {
      const active = b.getAttribute('data-diagram') === kind;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    window.setTimeout(() => diagram.classList.remove('is-switching'), 220);
  }

  segBtns.forEach(btn => {
    btn.addEventListener('click', () => setDiagram(btn.getAttribute('data-diagram') || 'generic'));
  });

  // Outcome map toggle (conceptual vs deployed)
  const mapEl = document.querySelector('.build-map');
  const mapBtns = Array.from(document.querySelectorAll('.seg-btn[data-map]'));

  function setOutcomeMap(mode) {
    if (!mapEl) return;

    const kicker = mapEl.querySelector('.build-kicker');
    const kickerText = mapEl.getAttribute(`data-${mode}-kicker`);
    if (kicker && kickerText) kicker.textContent = kickerText;

    mapEl.querySelectorAll('.build-row').forEach((row) => {
      const title = row.querySelector('.build-title');
      const text = row.querySelector('.build-text');
      const out = row.querySelector('.build-out');

      const t = row.getAttribute(`data-${mode}-title`);
      const tx = row.getAttribute(`data-${mode}-text`);
      const o = row.getAttribute(`data-${mode}-out`);

      if (title && t) title.textContent = t;
      if (text && tx) text.textContent = tx;
      if (out && o) out.textContent = o;
    });

    mapBtns.forEach((b) => {
      const active = b.getAttribute('data-map') === mode;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  mapBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOutcomeMap(btn.getAttribute('data-map') || 'concept');
    });
  });

  if (mapEl && mapBtns.length){
    const initial = mapBtns.find(b => b.classList.contains('active'))?.getAttribute('data-map') || 'concept';
    setOutcomeMap(initial);
  }

  // Pointer-follow glow (sets CSS vars used by .glow-follow::before)
  const followEls = Array.from(document.querySelectorAll('.glow-follow'));
  followEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
    });

    el.addEventListener('mouseleave', () => {
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    });
  });

  // React to hash changes (deep links)
  window.addEventListener('hashchange', () => setActive(fromHash(), { focusPanel: true, updateHash: false }));

  // Floating dock tooltips (cute, low-key)
  const dockItems = Array.from(document.querySelectorAll('.dock-item[data-tip]'));
  const dockTooltip = document.getElementById('dock-tooltip');

  function showDockTip(text) {
    if (!dockTooltip) return;
    dockTooltip.textContent = text;
    dockTooltip.classList.add('show');
    dockTooltip.setAttribute('aria-hidden', 'false');
  }

  function hideDockTip() {
    if (!dockTooltip) return;
    dockTooltip.classList.remove('show');
    dockTooltip.setAttribute('aria-hidden', 'true');
  }

  dockItems.forEach((it) => {
    const tip = it.getAttribute('data-tip') || '';
    it.addEventListener('mouseenter', () => showDockTip(tip));
    it.addEventListener('mouseleave', hideDockTip);
    // Mobile: tap to briefly show
    it.addEventListener('click', () => {
      showDockTip(tip);
      window.setTimeout(hideDockTip, 1400);
    });
  });

  // Rotating words (headline) + tiny "spray" trail for a sketchy/graffiti vibe
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setupRotate(el){
    const raw = (el.getAttribute('data-words') || '').trim();
    if (!raw) return;
    const words = raw.split('|').map(s => s.trim()).filter(Boolean);
    if (words.length < 2) return;

    let i = 0;
    window.setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % words.length;
      el.classList.add('is-switching');
      window.setTimeout(() => {
        el.textContent = words[i];
        el.classList.remove('is-switching');
      }, 170);
    }, 2200);
  }

  if (!reduceMotion){
    document.querySelectorAll('.rotate[data-words]').forEach(setupRotate);

    // Very light cursor "spray" (throttled)
    let last = 0;
    document.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - last < 180) return;
      last = now;

      const dot = document.createElement('span');
      dot.className = 'spray-dot';
      const dx = (Math.random() * 12) - 6;
      const dy = (Math.random() * 12) - 6;
      dot.style.left = (e.clientX + dx) + 'px';
      dot.style.top = (e.clientY + dy) + 'px';
      document.body.appendChild(dot);
      window.setTimeout(() => dot.remove(), 920);
    }, { passive: true });
  }

})();
