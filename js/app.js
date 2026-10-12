/* ==========================================================================
   Manual de Referencia de Claude — App JavaScript
   Vanilla ES6+ — Hash Router — Search — Tabs — Copy — Theme — Progress
   ========================================================================== */

(() => {
  'use strict';

  /* --------------------------------------------------------------------------
     STATE & CONFIG
     -------------------------------------------------------------------------- */
  const state = {
    currentSection: 'introduccion',
    theme: 'light',
    searchQuery: '',
    searchResults: [],
    selectedResultIndex: -1,
    sections: [],
    progress: 0,
    readSections: new Set()
  };

  const config = {
    storageKeys: {
      theme: 'claude-manual-theme',
      readSections: 'claude-manual-read',
      sidebarOpen: 'claude-manual-sidebar'
    },
    search: {
      minQueryLength: 2,
      maxResults: 10,
      debounceMs: 120
    }
  };

  /* --------------------------------------------------------------------------
     DOM ELEMENTS (cached)
     -------------------------------------------------------------------------- */
  const els = {
    // Layout
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.querySelector('.sidebar-overlay'),
    mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
    mainContent: document.getElementById('main-content'),

    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    docSections: document.querySelectorAll('.doc-section'),

    // Theme
    themeToggle: document.getElementById('theme-toggle'),

    // Search
    searchInput: document.getElementById('search-input'),
    searchResults: document.getElementById('search-results'),

    // Progress
    progressFill: document.querySelector('.progress-fill'),
    progressText: document.querySelector('.progress-text'),

    // Code blocks
    copyButtons: document.querySelectorAll('.copy-btn'),

    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),

    // FAQ
    faqQuestions: document.querySelectorAll('.faq-question')
  };

  /* --------------------------------------------------------------------------
     UTILITIES
     -------------------------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const debounce = (fn, ms) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  const escapeHtml = (str) => str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, ''');

  const highlightMatch = (text, query) => {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  };

  const getSectionId = (el) => el.id || el.getAttribute('data-section');

  /* --------------------------------------------------------------------------
     THEME MANAGEMENT
     -------------------------------------------------------------------------- */
  function initTheme() {
    const saved = localStorage.getItem(config.storageKeys.theme);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    state.theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(state.theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    state.theme = theme;
    localStorage.setItem(config.storageKeys.theme, theme);
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  /* --------------------------------------------------------------------------
     HASH ROUTING & NAVIGATION
     -------------------------------------------------------------------------- */
  function initRouter() {
    // Collect all sections
    state.sections = $$('.doc-section').map(el => ({
      id: el.id,
      element: el,
      heading: el.querySelector('h2')?.textContent || '',
      keywords: extractKeywords(el)
    }));

    // Initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
  }

  function extractKeywords(section) {
    const text = section.textContent.toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];
    return [...new Set(words)].slice(0, 50);
  }

  function handleHashChange() {
    const hash = window.location.hash.slice(1) || 'introduccion';
    navigateTo(hash, false);
  }

  function navigateTo(sectionId, pushState = true) {
    const section = state.sections.find(s => s.id === sectionId);
    if (!section) return false;

    // Update URL
    if (pushState) {
      history.pushState(null, '', `#${sectionId}`);
    }

    // Update active states
    state.currentSection = sectionId;
    updateNavActive(sectionId);
    showSection(sectionId);

    // Close mobile sidebar
    closeSidebar();

    // Mark as read
    markSectionRead(sectionId);

    // Update progress
    updateProgress();

    // Scroll to top of main content
    els.mainContent.scrollTo({ top: 0, behavior: 'smooth' });

    return true;
  }

  function updateNavActive(sectionId) {
    els.navLinks.forEach(link => {
      const isActive = link.dataset.section === sectionId;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  function showSection(sectionId) {
    els.docSections.forEach(section => {
      const isActive = section.id === sectionId;
      section.hidden = !isActive;
      section.style.display = isActive ? 'block' : 'none';
      if (isActive) {
        section.setAttribute('aria-hidden', 'false');
        // Focus first heading for accessibility
        const heading = section.querySelector('h2');
        if (heading) heading.focus({ preventScroll: true });
      } else {
        section.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* --------------------------------------------------------------------------
     SEARCH FUNCTIONALITY
     -------------------------------------------------------------------------- */
  function initSearch() {
    const debouncedSearch = debounce(performSearch, config.search.debounceMs);

    els.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      debouncedSearch();
    });

    els.searchInput.addEventListener('focus', () => {
      if (state.searchQuery.length >= config.search.minQueryLength) {
        performSearch();
      }
    });

    // Close results on click outside
    document.addEventListener('click', (e) => {
      if (!els.searchInput.contains(e.target) && !els.searchResults.contains(e.target)) {
        closeSearchResults();
      }
    });

    // Keyboard navigation
    els.searchInput.addEventListener('keydown', (e) => handleSearchKeydown(e));
    els.searchResults.addEventListener('keydown', (e) => handleSearchResultsKeydown(e));
  }

  function performSearch() {
    const query = state.searchQuery;
    if (query.length < config.search.minQueryLength) {
      closeSearchResults();
      return;
    }

    state.searchResults = state.sections
      .map(section => {
        let score = 0;
        const matches = [];

        // Check section ID
        if (section.id.includes(query)) score += 100;

        // Check heading
        if (section.heading.toLowerCase().includes(query)) score += 50;

        // Check keywords
        section.keywords.forEach(kw => {
          if (kw.includes(query)) score += 10;
        });

        // Check full text (expensive, limit)
        if (section.element.textContent.toLowerCase().includes(query)) score += 5;

        if (score > 0) {
          // Find context snippets
          const snippet = extractSnippet(section.element, query);
          return { section, score, snippet };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, config.search.maxResults);

    state.selectedResultIndex = -1;
    renderSearchResults();
    openSearchResults();
  }

  function extractSnippet(sectionEl, query) {
    const text = sectionEl.textContent;
    const index = text.toLowerCase().indexOf(query);
    if (index === -1) return '';
    const start = Math.max(0, index - 80);
    const end = Math.min(text.length, index + query.length + 80);
    return '…' + text.slice(start, end) + '…';
  }

  function renderSearchResults() {
    if (state.searchResults.length === 0) {
      els.searchResults.innerHTML = `
        <div class="search-result-item" style="padding: var(--space-4); text-align: center; color: var(--text-tertiary);">
          Sin resultados para "${escapeHtml(state.searchQuery)}"
        </div>`;
      return;
    }

    els.searchResults.innerHTML = state.searchResults.map((result, index) => `
      <div class="search-result-item" role="option" data-index="${index}" ${index === state.selectedResultIndex ? 'aria-selected="true"' : ''}>
        <div class="result-title">${highlightMatch(result.section.heading, state.searchQuery)}</div>
        <div class="result-section">${highlightMatch(result.snippet, state.searchQuery)}</div>
      </div>
    `).join('');
  }

  function openSearchResults() {
    els.searchResults.classList.add('open');
  }

  function closeSearchResults() {
    els.searchResults.classList.remove('open');
    state.selectedResultIndex = -1;
  }

  function handleSearchKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectNextResult();
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectPrevResult();
        break;
      case 'Enter':
        e.preventDefault();
        if (state.selectedResultIndex >= 0) {
          selectCurrentResult();
        }
        break;
      case 'Escape':
        closeSearchResults();
        els.searchInput.blur();
        break;
    }
  }

  function handleSearchResultsKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const item = e.target.closest('.search-result-item');
      if (item) selectResultByIndex(Number(item.dataset.index));
    }
  }

  function selectNextResult() {
    if (state.searchResults.length === 0) return;
    state.selectedResultIndex = (state.selectedResultIndex + 1) % state.searchResults.length;
    updateSearchSelection();
  }

  function selectPrevResult() {
    if (state.searchResults.length === 0) return;
    state.selectedResultIndex = (state.selectedResultIndex - 1 + state.searchResults.length) % state.searchResults.length;
    updateSearchSelection();
  }

  function updateSearchSelection() {
    $$('.search-result-item', els.searchResults).forEach((item, i) => {
      item.setAttribute('aria-selected', i === state.selectedResultIndex);
    });
    // Scroll into view
    const selected = $(`.search-result-item[data-index="${state.selectedResultIndex}"]`, els.searchResults);
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }

  function selectCurrentResult() {
    selectResultByIndex(state.selectedResultIndex);
  }

  function selectResultByIndex(index) {
    const result = state.searchResults[index];
    if (!result) return;
    navigateTo(result.section.id);
    closeSearchResults();
    els.searchInput.value = '';
    state.searchQuery = '';
    els.searchInput.blur();
  }

  /* --------------------------------------------------------------------------
     TABS
     -------------------------------------------------------------------------- */
  function initTabs() {
    els.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn));
      btn.addEventListener('keydown', (e) => handleTabKeydown(e, btn));
    });
  }

  function switchTab(btn) {
    const tabId = btn.getAttribute('aria-controls');
    const panel = $('#' + tabId);
    if (!panel) return;

    // Update buttons
    const group = btn.closest('[role="tablist"]');
    if (group) {
      $$('.tab-btn', group).forEach(b => {
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('tabindex', '-1');
      });
    }
    btn.setAttribute('aria-selected', 'true');
    btn.setAttribute('tabindex', '0');

    // Update panels
    $$('.tab-panel', panel.parentElement).forEach(p => p.hidden = true);
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
  }

  function handleTabKeydown(e, btn) {
    const group = btn.closest('[role="tablist"]');
    const tabs = $$('.tab-btn', group);
    const currentIndex = tabs.indexOf(btn);

    let newIndex = currentIndex;
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    tabs[newIndex].focus();
    switchTab(tabs[newIndex]);
  }

  /* --------------------------------------------------------------------------
     COPY TO CLIPBOARD
     -------------------------------------------------------------------------- */
  function initCopyCode() {
    els.copyButtons.forEach(btn => {
      btn.addEventListener('click', () => copyCode(btn));
    });
  }

  async function copyCode(btn) {
    const codeBlock = btn.closest('.code-block');
    const pre = codeBlock?.querySelector('pre');
    const code = pre?.querySelector('code');
    if (!code) return;

    const text = code.textContent;
    try {
      await navigator.clipboard.writeText(text);
      showCopyFeedback(btn, true);
    } catch (err) {
      // Fallback for older browsers
      fallbackCopy(text);
      showCopyFeedback(btn, true);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  function showCopyFeedback(btn, success) {
    const originalText = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Copiado</span>
    `;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = originalText;
    }, 2000);
  }

  /* --------------------------------------------------------------------------
     PROGRESS TRACKING
     -------------------------------------------------------------------------- */
  function initProgress() {
    // Load read sections from storage
    const saved = localStorage.getItem(config.storageKeys.readSections);
    if (saved) {
      try {
        state.readSections = new Set(JSON.parse(saved));
      } catch { /* ignore */ }
    }

    // IntersectionObserver for scroll spy
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          markSectionRead(sectionId);
          updateProgress();
          updateNavActive(sectionId);
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0.1
    });

    els.docSections.forEach(section => observer.observe(section));

    // Initial progress
    updateProgress();
  }

  function markSectionRead(sectionId) {
    if (!state.readSections.has(sectionId)) {
      state.readSections.add(sectionId);
      saveReadSections();
    }
  }

  function saveReadSections() {
    localStorage.setItem(config.storageKeys.readSections, JSON.stringify([...state.readSections]));
  }

  function updateProgress() {
    const total = state.sections.length;
    const read = [...state.readSections].filter(id => state.sections.some(s => s.id === id)).length;
    state.progress = total > 0 ? Math.round((read / total) * 100) : 0;

    // Update progress ring
    const circumference = 2 * Math.PI * 20; // r=20
    const offset = circumference - (state.progress / 100) * circumference;
    if (els.progressFill) {
      els.progressFill.style.strokeDashoffset = offset;
    }
    if (els.progressText) {
      els.progressText.textContent = `${state.progress}%`;
    }
    // Update aria-valuenow
    const progressRing = document.querySelector('.progress-ring[role="progressbar"]');
    if (progressRing) progressRing.setAttribute('aria-valuenow', state.progress);
  }

  /* --------------------------------------------------------------------------
     MOBILE SIDEBAR
     -------------------------------------------------------------------------- */
  function initMobileSidebar() {
    els.mobileMenuToggle.addEventListener('click', toggleSidebar);
    els.sidebarOverlay.addEventListener('click', closeSidebar);

    // Close on nav link click (mobile)
    els.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) closeSidebar();
      });
    });

    // Handle resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeSidebar();
      }
    });
  }

  function toggleSidebar() {
    const isOpen = els.sidebar.classList.toggle('open');
    els.sidebarOverlay.classList.toggle('open', isOpen);
    els.mobileMenuToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeSidebar() {
    els.sidebar.classList.remove('open');
    els.sidebarOverlay.classList.remove('open');
    els.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* --------------------------------------------------------------------------
     FAQ ACCORDION
     -------------------------------------------------------------------------- */
  function initFaq() {
    els.faqQuestions.forEach(btn => {
      btn.addEventListener('click', () => toggleFaq(btn));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFaq(btn);
        }
      });
    });
  }

  function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  }

  /* --------------------------------------------------------------------------
     KEYBOARD SHORTCUTS
     -------------------------------------------------------------------------- */
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K -> Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        els.searchInput.focus();
        els.searchInput.select();
      }

      // Escape -> Close search, sidebar, modals
      if (e.key === 'Escape') {
        closeSearchResults();
        closeSidebar();
      }

      // Ctrl/Cmd + Shift + L -> Toggle theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  /* --------------------------------------------------------------------------
     SMOOTH SCROLL FOR ANCHOR LINKS
     -------------------------------------------------------------------------- */
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL without scrolling
        history.pushState(null, '', href);
      }
    });
  }

  /* --------------------------------------------------------------------------
     INITIALIZATION
     -------------------------------------------------------------------------- */
  function init() {
    // Core
    initTheme();
    initRouter();
    initProgress();

    // UI Components
    initSearch();
    initTabs();
    initCopyCode();
    initFaq();
    initMobileSidebar();
    initKeyboardShortcuts();
    initSmoothScroll();

    // Nav link clicks
    els.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.dataset.section;
        if (sectionId) navigateTo(sectionId);
      });
    });

    // Theme toggle
    els.themeToggle.addEventListener('click', toggleTheme);

    // Announce ready
    console.log('📚 Manual de Referencia de Claude — Loaded');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* --------------------------------------------------------------------------
     PUBLIC API (for debugging/extension)
     -------------------------------------------------------------------------- */
  window.ClaudeManual = {
    navigateTo,
    toggleTheme,
    getState: () => ({ ...state }),
    getConfig: () => ({ ...config }),
    markSectionRead,
    updateProgress
  };
})();