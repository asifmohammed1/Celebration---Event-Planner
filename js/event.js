/**
 * @fileoverview Event data processor: input validation, sanitisation,
 *               budget math, and guest list management.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @namespace EventData */
const EventData = (() => {
  /**
   * Sanitises a string to prevent XSS.
   * @param {*} raw
   * @returns {string}
   */
  function sanitise(raw) {
    if (typeof raw !== 'string') { return ''; }
    return raw
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
      .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, '');
  }

  /**
   * Validates a budget value.
   * @param {string|number} value
   * @returns {{ valid: boolean, amount: number, error?: string }}
   */
  function validateBudget(value) {
    const num = parseFloat(String(value).replace(/[,$]/g, ''));
    if (isNaN(num) || num <= 0)    { return { valid: false, amount: 0, error: 'Please enter a valid budget amount.' }; }
    if (num > 10_000_000)          { return { valid: false, amount: 0, error: 'Budget exceeds the 10 million limit.' }; }
    return { valid: true, amount: num };
  }

  /**
   * Validates a guest count input.
   * @param {string|number} value
   * @returns {{ valid: boolean, count: number, error?: string }}
   */
  function validateGuestCount(value) {
    const num = parseInt(String(value), 10);
    if (isNaN(num) || num < 1)     { return { valid: false, count: 0, error: 'Please enter at least 1 guest.' }; }
    if (num > 50_000)              { return { valid: false, count: 0, error: 'Guest count seems unrealistically high.' }; }
    return { valid: true, count: num };
  }

  /**
   * Validates an event title input.
   * @param {string} title
   * @returns {{ valid: boolean, value: string, error?: string }}
   */
  function validateTitle(title) {
    const clean = sanitise((title || '').trim());
    if (clean.length < 3)          { return { valid: false, value: '', error: 'Event name must be at least 3 characters.' }; }
    if (clean.length > 100)        { return { valid: false, value: '', error: 'Event name must be under 100 characters.' }; }
    return { valid: true, value: clean };
  }

  /**
   * Calculates per-head cost from budget and guest count.
   * @param {number} budget
   * @param {number} guests
   * @returns {number} Per-guest cost rounded to 2 decimal places.
   */
  function perHeadCost(budget, guests) {
    if (guests <= 0) { return 0; }
    return Math.round((budget / guests) * 100) / 100;
  }

  /**
   * Formats a number as a currency string.
   * @param {number} amount
   * @param {string} [currency='USD']
   * @returns {string}
   */
  function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  /**
   * Calculates the number of days until the event.
   * @param {string} dateStr - ISO date string (YYYY-MM-DD).
   * @returns {number} Days remaining (negative if past).
   */
  function daysUntilEvent(dateStr) {
    if (!dateStr) { return 0; }
    const event = new Date(dateStr);
    const now   = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((event - now) / (1000 * 60 * 60 * 24));
  }

  /**
   * Builds a human-readable event summary from form data.
   * @param {{ type: string, title: string, date: string, guests: number, budget: number }} data
   * @returns {string}
   */
  function buildSummary(data) {
    const { type, title, date, guests, budget } = data;
    const days = daysUntilEvent(date);
    const countdown = days > 0 ? `${days} days away` : (days === 0 ? 'Today!' : 'Past event');
    return [
      `Event Type: ${sanitise(type)}`,
      `Title: ${sanitise(title)}`,
      `Date: ${sanitise(date)} (${countdown})`,
      `Guests: ${guests}`,
      `Total Budget: ${formatCurrency(budget)}`,
      `Per-Head Budget: ${formatCurrency(perHeadCost(budget, guests))}`,
    ].join('\n');
  }

  return Object.freeze({ sanitise, validateBudget, validateGuestCount, validateTitle, perHeadCost, formatCurrency, daysUntilEvent, buildSummary });
})();
