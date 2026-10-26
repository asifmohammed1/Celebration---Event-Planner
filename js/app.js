/**
 * @fileoverview Application bootstrap: event binding, tab navigation,
 *               feature handlers, and Service Worker registration.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/* ── Service Worker ─────────────────────────────────────────────────────────── */

/**
 * Registers the service worker for offline caching.
 * @returns {void}
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) { return; }
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.warn('SW registration failed:', err);
  });
}

/* ── API Key Helper ─────────────────────────────────────────────────────────── */

/**
 * Gets the current Gemini API key from the input field.
 * @returns {string}
 */
function getApiKey() {
  const el = UIHelpers.getEl('api-key-input');
  return el ? el.value.trim() : '';
}

/* ── Event Context Builder ──────────────────────────────────────────────────── */

/**
 * Reads the shared event context form fields and returns a validated data object.
 * @returns {{ valid: boolean, data?: object, error?: string }}
 */
function getEventContext() {
  const type     = UIHelpers.getEl('event-type')?.value   || 'wedding';
  const titleEl  = UIHelpers.getEl('event-title');
  const dateEl   = UIHelpers.getEl('event-date');
  const guestsEl = UIHelpers.getEl('event-guests');
  const budgetEl = UIHelpers.getEl('event-budget');
  const notesEl  = UIHelpers.getEl('event-notes');
  const titleR   = EventData.validateTitle(titleEl?.value || '');
  if (!titleR.valid) { return { valid: false, error: titleR.error }; }
  const guestsR  = EventData.validateGuestCount(guestsEl?.value || '0');
  if (!guestsR.valid) { return { valid: false, error: guestsR.error }; }
  const budgetR  = EventData.validateBudget(budgetEl?.value || '0');
  if (!budgetR.valid) { return { valid: false, error: budgetR.error }; }
  return {
    valid: true,
    data: {
      type,
      title:  titleR.value,
      date:   dateEl?.value  || '',
      guests: guestsR.count,
      budget: budgetR.amount,
      notes:  EventData.sanitise(notesEl?.value || ''),
    },
  };
}

/* ── Generic AI Feature Handler ─────────────────────────────────────────────── */

/**
 * Runs an AI feature: validates context, calls Gemini, renders result.
 * @param {string} btnId - Button element ID.
 * @param {string} outId - Output panel element ID.
 * @param {string} systemPrompt - System instruction.
 * @param {string} successMsg - Toast message on success.
 * @returns {Promise<void>}
 */
async function runAiFeature(btnId, outId, systemPrompt, successMsg) {
  const ctx = getEventContext();
  if (!ctx.valid) { UIHelpers.toast(ctx.error, 'warn'); return; }
  const btn = UIHelpers.getEl(btnId);
  const out = UIHelpers.getEl(outId);
  if (btn && !btn.dataset.label) { btn.dataset.label = btn.textContent; }
  UIHelpers.setLoading(btn, true);
  try {
    const text = await GeminiClient.query(
      getApiKey(),
      systemPrompt,
      Planner.buildUserPrompt(ctx.data),
    );
    UIHelpers.renderMarkdown(out, text);
    if (out) { out.removeAttribute('hidden'); }
    UIHelpers.toast(successMsg, 'success');
  } catch (err) {
    UIHelpers.toast(err.message, 'error');
  } finally {
    UIHelpers.setLoading(btn, false);
  }
}

/* ── Budget Panel Handler ────────────────────────────────────────────────────── */

/**
 * Handles the Add Budget Item form submission.
 * @returns {void}
 */
function handleAddBudgetItem() {
  const catEl  = UIHelpers.getEl('budget-category');
  const estEl  = UIHelpers.getEl('budget-estimated');
  const actEl  = UIHelpers.getEl('budget-actual');
  const cat    = EventData.sanitise((catEl?.value || '').trim());
  const estR   = EventData.validateBudget(estEl?.value || '0');
  if (!cat)       { UIHelpers.toast('Please enter a category name.', 'warn'); return; }
  if (!estR.valid){ UIHelpers.toast(estR.error, 'warn'); return; }
  const actNum = parseFloat(actEl?.value || '0') || 0;
  BudgetMgr.addItem(cat, estR.amount, actNum);
  const budgetR = EventData.validateBudget(UIHelpers.getEl('event-budget')?.value || '0');
  BudgetMgr.renderTable(UIHelpers.getEl('budget-table'), budgetR.valid ? budgetR.amount : 0);
  if (catEl)  { catEl.value  = ''; }
  if (estEl)  { estEl.value  = ''; }
  if (actEl)  { actEl.value  = ''; }
  UIHelpers.toast('Budget item added!', 'success');
}

/* ── Tab Navigation ─────────────────────────────────────────────────────────── */

/**
 * Activates a section tab and shows its panel.
 * @param {string} targetId
 * @returns {void}
 */
function activateTab(targetId) {
  document.querySelectorAll('.nav__tab').forEach((tab) => {
    const isActive = tab.dataset.target === targetId;
    tab.classList.toggle('nav__tab--active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  document.querySelectorAll('.section').forEach((sec) => {
    if (sec.id === targetId) { sec.removeAttribute('hidden'); }
    else { sec.setAttribute('hidden', ''); }
  });
}

/* ── Handler Binding Map ────────────────────────────────────────────────────── */

/** @type {Array<{id: string, event: string, fn: Function}>} */
const HANDLER_MAP = [
  { id: 'btn-ideas',    event: 'click', fn: () => runAiFeature('btn-ideas',    'out-ideas',    Planner.ideasPrompt(),        'Ideas generated!') },
  { id: 'btn-budget',   event: 'click', fn: () => runAiFeature('btn-budget',   'out-budget',   Planner.budgetPrompt(),       'Budget breakdown generated!') },
  { id: 'btn-timeline', event: 'click', fn: () => runAiFeature('btn-timeline', 'out-timeline', Planner.timelinePrompt(),     'Timeline generated!') },
  { id: 'btn-vendors',  event: 'click', fn: () => runAiFeature('btn-vendors',  'out-vendors',  Planner.vendorPrompt(),       'Vendor checklist generated!') },
  { id: 'btn-theme',    event: 'click', fn: () => runAiFeature('btn-theme',    'out-theme',    Planner.themePrompt(),        'Theme ideas generated!') },
  { id: 'btn-guestmsg', event: 'click', fn: () => runAiFeature('btn-guestmsg', 'out-guestmsg', Planner.guestMessagePrompt(), 'Message templates generated!') },
  { id: 'btn-add-item', event: 'click', fn: handleAddBudgetItem },
];

/* ── Bootstrap ──────────────────────────────────────────────────────────────── */

/**
 * Application entry point.
 * @returns {void}
 */
function init() {
  registerServiceWorker();

  // Tab navigation
  document.querySelectorAll('.nav__tab').forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.target));
  });

  // Bind all feature handlers
  HANDLER_MAP.forEach(({ id, event, fn }) => {
    const el = UIHelpers.getEl(id);
    if (el) { el.addEventListener(event, fn); }
  });

  // Animate counters
  UIHelpers.initCounters();

  // Update event summary on context change
  ['event-type', 'event-title', 'event-date', 'event-guests', 'event-budget'].forEach((id) => {
    const el = UIHelpers.getEl(id);
    if (el) { el.addEventListener('input', updateEventSummary); }
  });
}

/**
 * Updates the live event summary display in the sidebar.
 * @returns {void}
 */
function updateEventSummary() {
  const ctx = getEventContext();
  const el  = UIHelpers.getEl('event-summary');
  if (!el) { return; }
  if (!ctx.valid) { el.textContent = 'Fill in the event details to see a summary.'; return; }
  el.textContent = EventData.buildSummary(ctx.data);
}

document.addEventListener('DOMContentLoaded', init);
