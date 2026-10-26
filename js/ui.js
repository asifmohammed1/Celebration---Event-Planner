/**
 * @fileoverview UI helper utilities: toast notifications, loading states,
 *               markdown renderer, DOM utilities, and animation helpers.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @namespace UIHelpers */
const UIHelpers = (() => {
  /** @type {Map<string, HTMLElement>} DOM element cache */
  const _cache = new Map();

  /**
   * Retrieves and caches a DOM element by ID.
   * @param {string} id
   * @returns {HTMLElement|null}
   */
  function getEl(id) {
    if (!_cache.has(id)) { _cache.set(id, document.getElementById(id)); }
    return _cache.get(id);
  }

  /**
   * Displays a dismissible toast notification.
   * @param {string} message
   * @param {'success'|'error'|'warn'|'info'} [type='info']
   * @returns {void}
   */
  function toast(message, type = 'info') {
    const container = getEl('toast-container');
    if (!container) { return; }
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', 'alert');
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  /**
   * Sets a button into a loading or idle state.
   * @param {HTMLElement|null} btn
   * @param {boolean} loading
   * @returns {void}
   */
  function setLoading(btn, loading) {
    if (!btn) { return; }
    btn.disabled = loading;
    btn.setAttribute('aria-busy', String(loading));
    btn.textContent = loading ? 'Generating…' : btn.dataset.label || btn.textContent;
  }

  /**
   * Converts a subset of markdown to safe HTML and injects it into a container.
   * Only converts bold, headings, list items, table rows, and links.
   * @param {HTMLElement|null} container
   * @param {string} raw
   * @returns {void}
   */
  function renderMarkdown(container, raw) {
    if (!container) { return; }
    const esc = (s) => s
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const lines = raw.split('\n');
    let html = '';
    let inTable = false;
    let inList  = false;
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith('| ') && t.endsWith(' |')) {
        if (!inTable) { html += '<table class="md-table"><tbody>'; inTable = true; }
        const cells = t.slice(1, -1).split('|').map((c) => `<td>${esc(c.trim())}</td>`);
        if (cells.some((c) => c.includes('---'))) { continue; }
        html += `<tr>${cells.join('')}</tr>`;
        continue;
      }
      if (inTable) { html += '</tbody></table>'; inTable = false; }
      if (t.startsWith('- [ ] ') || t.startsWith('- [x] ')) {
        if (!inList) { html += '<ul class="md-checklist">'; inList = true; }
        const done    = t.startsWith('- [x] ');
        const label   = esc(t.slice(6));
        const checked = done ? ' checked' : '';
        html += `<li><input type="checkbox" disabled${checked}> ${label}</li>`;
        continue;
      }
      if (t.startsWith('- ')) {
        if (!inList) { html += '<ul class="md-list">'; inList = true; }
        html += `<li>${esc(t.slice(2))}</li>`;
        continue;
      }
      if (inList) { html += '</ul>'; inList = false; }
      if (t.startsWith('### ')) { html += `<h3>${esc(t.slice(4))}</h3>`; continue; }
      if (t.startsWith('## '))  { html += `<h2>${esc(t.slice(3))}</h2>`; continue; }
      if (t.startsWith('# '))   { html += `<h1>${esc(t.slice(2))}</h1>`; continue; }
      if (t === '---') { html += '<hr>'; continue; }
      if (t === '') { if (inList) { html += '</ul>'; inList = false; } html += '<br>'; continue; }
      const inline = esc(t)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
      html += `<p>${inline}</p>`;
    }
    if (inTable) { html += '</tbody></table>'; }
    if (inList)  { html += '</ul>'; }
    container.innerHTML = html;
  }

  /**
   * Animates a counter element from 0 to its target value.
   * @param {HTMLElement} el
   * @returns {void}
   */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.count || '0', 10);
    const duration = 1200;
    const step     = target / (duration / 16);
    let current    = 0;
    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString();
      if (current < target) { requestAnimationFrame(tick); }
    };
    requestAnimationFrame(tick);
  }

  /**
   * Initialises IntersectionObserver-driven counter animations.
   * @returns {void}
   */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach((el) => obs.observe(el));
  }

  return Object.freeze({ getEl, toast, setLoading, renderMarkdown, initCounters });
})();
