(() => {
  'use strict';
  const panels = [...document.querySelectorAll('[data-panel]')];
  const nav = document.querySelector('.navigation');
  const tabs = [...nav.querySelectorAll('[data-tab-link]')];
  const aliases = { overview: 'work', deployments: 'work', links: 'about' };
  const names = new Set(panels.map(panel => panel.dataset.panel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = sessionStorage.getItem('site-motion-paused') === 'true'; } catch {}
  let syncMotion = () => {};
  let syncTyping = () => {};
  let jumpFrame;
  let arrivalTimer;
  let arrivalTarget;
  const hashTab = () => {
    const hash = window.location.hash.slice(1);
    const parentPanel = document.getElementById(hash)?.closest('[data-panel]')?.dataset.panel;
    return names.has(hash) ? hash : aliases[hash] || parentPanel || 'work';
  };

  const readingOptions = document.querySelector('.reading-options');
  if (readingOptions) {
    const toggle = readingOptions.querySelector('.reading-toggle');
    const panel = document.getElementById('reading-panel');
    const slider = document.getElementById('reading-size');
    const output = document.getElementById('reading-value');
    const applySize = value => {
      const number = Number(value);
      const percent = Number.isFinite(number) ? Math.max(100, Math.min(125, 100 + Math.round((number - 100) / 5) * 5)) : 100;
      document.documentElement.style.setProperty('--reading-scale', String(percent / 100));
      slider.value = String(percent);
      slider.setAttribute('aria-valuetext', percent + '%');
      output.textContent = percent + '%';
      try { localStorage.setItem('site-reading-size', String(percent)); } catch {}
    };
    let savedSize = 100;
    try { savedSize = localStorage.getItem('site-reading-size') || 100; } catch {}
    applySize(savedSize);
    readingOptions.hidden = false;
    const closeOptions = returnFocus => {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (returnFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => {
      const opening = panel.hidden;
      panel.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));
      if (opening) slider.focus();
    });
    slider.addEventListener('input', () => applySize(slider.value));
    readingOptions.querySelector('.reading-reset').addEventListener('click', () => applySize(100));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault();
        closeOptions(true);
      }
    });
    readingOptions.addEventListener('focusout', event => {
      if (!readingOptions.contains(event.relatedTarget)) closeOptions(false);
    });
    document.addEventListener('pointerdown', event => {
      if (!readingOptions.contains(event.target)) closeOptions(false);
    });
  }

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
    cancelAnimationFrame(jumpFrame);
    clearTimeout(arrivalTimer);
    if (arrivalTarget) arrivalTarget.classList.remove('is-arrival', 'is-arrival-static');
    panels.forEach(panel => { panel.hidden = panel.dataset.panel !== name; });
    tabs.forEach(tab => {
      const selected = tab.dataset.tabLink === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    if (scroll) window.scrollTo({ top: 0, behavior: 'instant' });
    syncMotion();
    syncTyping();
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

  const jumpToResearch = (target, animate = true) => {
    cancelAnimationFrame(jumpFrame);
    clearTimeout(arrivalTimer);
    if (arrivalTarget) arrivalTarget.classList.remove('is-arrival', 'is-arrival-static');
    arrivalTarget = target;
    const launchFocus = document.activeElement;
    const moving = animate && !reducedMotion.matches && !paused;
    const arrive = () => {
      const heading = target.querySelector('h2');
      if (heading && document.activeElement === launchFocus) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
      target.classList.remove('is-arrival', 'is-arrival-static');
      void target.offsetWidth;
      target.classList.add(moving ? 'is-arrival' : 'is-arrival-static');
      arrivalTimer = setTimeout(() => target.classList.remove('is-arrival', 'is-arrival-static'), 1700);
    };
    document.querySelectorAll('.research-index a').forEach(link => {
      if (link.hash === '#' + target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    target.scrollIntoView({ behavior: moving ? 'smooth' : 'instant', block: 'start' });
    if (!moving) { arrive(); return; }
    const started = performance.now();
    let previousY = window.scrollY;
    let stillFrames = 0;
    const afterScroll = now => {
      const nextY = window.scrollY;
      stillFrames = Math.abs(nextY - previousY) < 0.5 ? stillFrames + 1 : 0;
      previousY = nextY;
      if ((stillFrames >= 3 && now - started > 120) || now - started > 1400) arrive();
      else jumpFrame = requestAnimationFrame(afterScroll);
    };
    jumpFrame = requestAnimationFrame(afterScroll);
  };
  document.querySelectorAll('.research-index a').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      if (window.location.hash !== link.hash) window.history.pushState(null, '', link.hash);
      activate('research');
      jumpToResearch(target);
    });
  });

  const syncHistory = () => {
    const hash = window.location.hash.slice(1);
    const target = document.getElementById(hash);
    if (!hash || names.has(hash) || aliases[hash]) {
      activate(hashTab(), { scroll: true });
    } else if (target?.closest('[data-panel]')) {
      activate(hashTab());
      if (target.classList.contains('research-card')) jumpToResearch(target, false);
      else target.scrollIntoView({ behavior: 'instant', block: 'start' });
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
    const workPanel = panels.find(panel => panel.dataset.panel === 'work');
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
      rotationTimer = setTimeout(advance, 3500);
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
        if (rotationTimer === undefined) rotationTimer = setTimeout(advance, 3500);
      } else {
        stopRotation();
        rotator.dataset.motion = 'paused';
      }
    };
    motionButton.addEventListener('click', () => {
      paused = !paused;
      try { sessionStorage.setItem('site-motion-paused', String(paused)); } catch {}
      syncMotion();
      syncTyping();
    });
    syncMotion();
  }

  const codePanel = document.querySelector('.code-panel');
  const codeContent = document.querySelector('.code-content');
  const codeSource = document.querySelector('.code-source code');
  if (codePanel && codeContent && codeSource) {
    const aboutPanel = panels.find(panel => panel.dataset.panel === 'about');
    const fullCode = codeSource.cloneNode(true);
    const length = fullCode.textContent.length;
    const overlay = document.createElement('pre');
    overlay.className = 'typed-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    codeContent.appendChild(overlay);
    const caret = () => {
      const element = document.createElement('span');
      element.className = 'code-caret';
      element.setAttribute('aria-hidden', 'true');
      element.textContent = '▍';
      return element;
    };
    codeSource.appendChild(caret());
    let typingFrame;
    let state = 'idle';
    let codeInView = false;
    const finishTyping = () => {
      cancelAnimationFrame(typingFrame);
      state = 'complete';
      codePanel.classList.remove('is-typing');
      codePanel.dataset.typing = 'complete';
      overlay.hidden = true;
    };
    const showCharacters = count => {
      const code = fullCode.cloneNode(true);
      const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
      let remaining = count;
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent;
        node.textContent = text.slice(0, Math.max(0, remaining));
        remaining -= text.length;
      }
      code.appendChild(caret());
      overlay.replaceChildren(code);
    };
    syncTyping = () => {
      if (state === 'complete') return;
      if (document.hidden || aboutPanel.hidden || !codeInView) {
        if (state === 'writing') finishTyping();
        return;
      }
      if (reducedMotion.matches || paused) { finishTyping(); return; }
      if (state === 'writing') return;
      state = 'writing';
      codePanel.dataset.typing = 'writing';
      codePanel.classList.add('is-typing');
      overlay.hidden = false;
      showCharacters(0);
      const started = performance.now();
      const type = now => {
        const progress = Math.min(1, (now - started) / 3600);
        showCharacters(Math.floor(length * progress));
        if (progress >= 1) finishTyping();
        else typingFrame = requestAnimationFrame(type);
      };
      typingFrame = requestAnimationFrame(type);
    };
    codeContent.addEventListener('pointerdown', finishTyping);
    if ('IntersectionObserver' in window) {
      const visibility = new IntersectionObserver(entries => {
        codeInView = entries[0].isIntersecting;
        syncTyping();
      }, { threshold: 0.15 });
      visibility.observe(codePanel);
    } else {
      codeInView = true;
    }
    syncTyping();
  }
  const syncEffects = () => { syncMotion(); syncTyping(); };
  reducedMotion.addEventListener('change', syncEffects);
  document.addEventListener('visibilitychange', syncEffects);

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
