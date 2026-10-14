(() => {
  'use strict';
  const panels = [...document.querySelectorAll('[data-panel]')];
  const nav = document.querySelector('.navigation');
  const tabs = [...nav.querySelectorAll('[data-tab-link]')];
  const aliases = { overview: 'work', deployments: 'work', links: 'about' };
  const names = new Set(panels.map(panel => panel.dataset.panel));
  let syncMotion = () => {};
  const hashTab = () => {
    const hash = window.location.hash.slice(1);
    const parentPanel = document.getElementById(hash)?.closest('[data-panel]')?.dataset.panel;
    return names.has(hash) ? hash : aliases[hash] || parentPanel || 'work';
  };

  nav.setAttribute('role', 'tablist');
  tabs.forEach(tab => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', tab.dataset.tabLink);
  });
  panels.forEach(panel => {
    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;
  });

  const activate = (name, { scroll = false, focus = false } = {}) => {
    if (!names.has(name)) return;
    panels.forEach(panel => { panel.hidden = panel.dataset.panel !== name; });
    tabs.forEach(tab => {
      const selected = tab.dataset.tabLink === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    if (scroll) window.scrollTo({ top: 0, behavior: 'instant' });
    syncMotion();
  };

  const navigate = (name, options) => {
    if (window.location.hash !== '#' + name) {
      window.history.pushState(null, '', '#' + name);
    }
    activate(name, options);
  };

  document.querySelectorAll('[data-tab-link]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const isTab = tabs.includes(link);
      navigate(link.dataset.tabLink, { scroll: true, focus: isTab });
      if (!isTab) panels.find(panel => panel.dataset.panel === link.dataset.tabLink).focus({ preventScroll: true });
    });
  });

  nav.addEventListener('keydown', event => {
    const index = tabs.indexOf(event.target);
    if (index < 0) return;
    if (event.key === ' ') {
      event.preventDefault();
      navigate(tabs[index].dataset.tabLink, { focus: true });
      return;
    }
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    navigate(tabs[next].dataset.tabLink, { scroll: true, focus: true });
  });

  const syncHistory = () => {
    const hash = window.location.hash.slice(1);
    const target = document.getElementById(hash);
    if (!hash || names.has(hash) || aliases[hash]) {
      activate(hashTab(), { scroll: true });
    } else if (target?.closest('[data-panel]')) {
      activate(hashTab());
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  };
  window.addEventListener('popstate', syncHistory);
  window.addEventListener('hashchange', syncHistory);
  activate(hashTab());
  const initialTarget = document.getElementById(window.location.hash.slice(1));
  if (initialTarget?.closest('[data-panel]') && !names.has(initialTarget.id)) initialTarget.scrollIntoView({ behavior: 'instant', block: 'start' });
  document.getElementById('year').textContent = new Date().getFullYear();

  const rotator = document.getElementById('hero-words');
  const motionButton = document.querySelector('.motion-toggle');
  if (rotator && motionButton) {
    const phrases = [...rotator.querySelectorAll('.rotating-phrase')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const workPanel = panels.find(panel => panel.dataset.panel === 'work');
    let paused = false;
    try { paused = sessionStorage.getItem('site-motion-paused') === 'true'; } catch {}
    let current = 0;
    let rotationTimer;
    let cleanupTimer;

    const stopRotation = () => {
      clearTimeout(rotationTimer);
      clearTimeout(cleanupTimer);
      rotationTimer = undefined;
      phrases.forEach(phrase => phrase.classList.remove('is-leaving'));
    };
    const canRotate = () => !paused && !reducedMotion.matches && !document.hidden && !workPanel.hidden;
    const advance = () => {
      rotationTimer = undefined;
      if (!canRotate()) return;
      const previous = phrases[current];
      current = (current + 1) % phrases.length;
      previous.classList.remove('is-current');
      previous.classList.add('is-leaving');
      phrases[current].classList.add('is-current');
      cleanupTimer = setTimeout(() => previous.classList.remove('is-leaving'), 600);
      rotationTimer = setTimeout(advance, 4800);
    };
    syncMotion = () => {
      motionButton.hidden = reducedMotion.matches;
      motionButton.querySelector('span').textContent = paused ? 'Resume motion' : 'Pause motion';
      motionButton.querySelector('path').setAttribute('d', paused ? 'M5 3l7 5-7 5Z' : 'M5 3v10m6-10v10');
      if (reducedMotion.matches) {
        stopRotation();
        current = 0;
        phrases.forEach((phrase, index) => phrase.classList.toggle('is-current', index === 0));
        rotator.dataset.motion = 'reduced';
      } else if (canRotate()) {
        rotator.dataset.motion = 'running';
        if (rotationTimer === undefined) rotationTimer = setTimeout(advance, 4800);
      } else {
        stopRotation();
        rotator.dataset.motion = 'paused';
      }
    };
    motionButton.addEventListener('click', () => {
      paused = !paused;
      try { sessionStorage.setItem('site-motion-paused', String(paused)); } catch {}
      syncMotion();
    });
    reducedMotion.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    syncMotion();
  }

  const copyButton = document.querySelector('[data-copy]');
  const copyStatus = document.getElementById('copy-status');
  if (copyButton && navigator.clipboard?.writeText && window.isSecureContext) {
    copyButton.hidden = false;
    let reset;
    copyButton.addEventListener('click', async () => {
      clearTimeout(reset);
      try {
        await navigator.clipboard.writeText(copyButton.dataset.copy);
        copyButton.textContent = 'Copied';
        copyStatus.textContent = 'Email address copied.';
      } catch {
        copyStatus.textContent = 'Select the email address to copy it, or click it to write.';
      }
      reset = setTimeout(() => { copyButton.textContent = 'Copy'; copyStatus.textContent = ''; }, 4000);
    });
  }
})();
