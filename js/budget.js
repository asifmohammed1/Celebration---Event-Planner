/**
 * @fileoverview Budget manager: tracks items, totals, and renders the budget table.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @namespace BudgetMgr */
const BudgetMgr = (() => {
  /** @type {Array<{id: string, category: string, estimated: number, actual: number}>} */
  let _items = [];

  /**
   * Generates a unique ID string.
   * @returns {string}
   */
  function _uid() {
    return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  /**
   * Adds a new budget item.
   * @param {string} category
   * @param {number} estimated
   * @param {number} [actual=0]
   * @returns {string} The new item ID.
   */
  function addItem(category, estimated, actual = 0) {
    const id = _uid();
    _items.push({ id, category: EventData.sanitise(category), estimated, actual });
    return id;
  }

  /**
   * Updates the actual cost of a budget item.
   * @param {string} id
   * @param {number} actual
   * @returns {boolean} True if updated, false if not found.
   */
  function updateActual(id, actual) {
    const item = _items.find((i) => i.id === id);
    if (!item) { return false; }
    item.actual = actual;
    return true;
  }

  /**
   * Removes a budget item by ID.
   * @param {string} id
   * @returns {boolean}
   */
  function removeItem(id) {
    const before = _items.length;
    _items = _items.filter((i) => i.id !== id);
    return _items.length < before;
  }

  /**
   * Calculates the total estimated and actual budget.
   * @returns {{ estimated: number, actual: number, variance: number }}
   */
  function totals() {
    const estimated = _items.reduce((s, i) => s + i.estimated, 0);
    const actual    = _items.reduce((s, i) => s + i.actual, 0);
    return { estimated, actual, variance: estimated - actual };
  }

  /**
   * Returns a copy of all budget items.
   * @returns {Array<{id: string, category: string, estimated: number, actual: number}>}
   */
  function getItems() {
    return _items.map((i) => ({ ...i }));
  }

  /**
   * Clears all budget items.
   * @returns {void}
   */
  function clear() {
    _items = [];
  }

  /**
   * Renders the budget table into a container element.
   * @param {HTMLElement|null} container
   * @param {number} [totalBudget=0]
   * @returns {void}
   */
  function renderTable(container, totalBudget = 0) {
    if (!container) { return; }
    if (_items.length === 0) {
      container.innerHTML = '<p class="empty-state">No budget items yet. Add items or generate an AI budget breakdown above.</p>';
      return;
    }
    const { estimated, actual } = totals();
    const overBudget = actual > totalBudget && totalBudget > 0;
    const rows = _items.map((item) => {
      const pct   = totalBudget > 0 ? Math.round((item.estimated / totalBudget) * 100) : 0;
      const over  = item.actual > item.estimated ? ' budget-row--over' : '';
      return `<tr class="${over}">
        <td>${item.category}</td>
        <td>${EventData.formatCurrency(item.estimated)}</td>
        <td>${EventData.formatCurrency(item.actual)}</td>
        <td>${pct}%</td>
        <td><button class="btn btn--sm btn--danger" data-remove="${item.id}" aria-label="Remove ${item.category}">Remove</button></td>
      </tr>`;
    }).join('');
    container.innerHTML = `
      <table class="budget-table" aria-label="Budget breakdown">
        <thead><tr><th>Category</th><th>Estimated</th><th>Actual</th><th>% of Budget</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr class="${overBudget ? 'budget-row--over' : ''}">
            <td><strong>Total</strong></td>
            <td><strong>${EventData.formatCurrency(estimated)}</strong></td>
            <td><strong>${EventData.formatCurrency(actual)}</strong></td>
            <td colspan="2">${overBudget ? '&#x26A0;&#xFE0F; Over budget!' : '&#x2705; Within budget'}</td>
          </tr>
        </tfoot>
      </table>`;
    container.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        removeItem(btn.dataset.remove);
        renderTable(container, totalBudget);
      });
    });
  }

  return Object.freeze({ addItem, updateActual, removeItem, totals, getItems, clear, renderTable });
})();
