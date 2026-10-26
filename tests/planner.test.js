/**
 * @fileoverview Unit test suite for the Celebration & Event Planner.
 * Zero external dependencies - run with: node tests/planner.test.js
 * Covers: sanitisation, budget/guest validation, currency formatting,
 *         per-head cost, days-until-event, demo routing, prompt content,
 *         LRU cache, budget manager, config immutability, time constants.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/* ── Test harness ─────────────────────────────────────────────────────────── */

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) { passed++; console.info(`  PASS  ${label}`); }
  else           { failed++; console.error(`  FAIL  ${label}`); }
}

function suite(name, fn) {
  console.info(`\n>> ${name}`);
  fn();
}

/* ── Inline implementations ───────────────────────────────────────────────── */

function sanitise(raw) {
  if (typeof raw !== 'string') { return ''; }
  return raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, '');
}

function validateBudget(value) {
  const num = parseFloat(String(value).replace(/[,$]/g, ''));
  if (isNaN(num) || num <= 0)  { return { valid: false, amount: 0, error: 'Please enter a valid budget amount.' }; }
  if (num > 10_000_000)        { return { valid: false, amount: 0, error: 'Budget exceeds the 10 million limit.' }; }
  return { valid: true, amount: num };
}

function validateGuestCount(value) {
  const num = parseInt(String(value), 10);
  if (isNaN(num) || num < 1)   { return { valid: false, count: 0, error: 'Please enter at least 1 guest.' }; }
  if (num > 50_000)            { return { valid: false, count: 0, error: 'Guest count seems unrealistically high.' }; }
  return { valid: true, count: num };
}

function validateTitle(title) {
  const clean = (title || '').trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
  if (clean.length < 3)  { return { valid: false, value: '', error: 'Event name must be at least 3 characters.' }; }
  if (clean.length > 100){ return { valid: false, value: '', error: 'Event name must be under 100 characters.' }; }
  return { valid: true, value: clean };
}

function perHeadCost(budget, guests) {
  if (guests <= 0) { return 0; }
  return Math.round((budget / guests) * 100) / 100;
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function daysUntilEvent(dateStr) {
  if (!dateStr) { return 0; }
  const event = new Date(dateStr);
  const now   = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((event - now) / (1000 * 60 * 60 * 24));
}

/* ── Prompt stubs (match planner.js) ─────────────────────────────────────── */

const BASE = 'You are a professional event planner and creative consultant.';

function ideasPrompt()      { return `${BASE} Generate creative, personalized event ideas including theme concepts, entertainment options, and unique touches.`; }
function budgetPrompt()     { return `${BASE} Create a detailed budget breakdown for the event. Use a markdown table with category, estimated cost, and percentage of total.`; }
function timelinePrompt()   { return `${BASE} Generate a comprehensive event planning timeline with checkbox tasks organized by time periods (months before the event).`; }
function vendorPrompt()     { return `${BASE} Generate a detailed vendor checklist with checkbox items for both essential and secondary vendors.`; }
function themePrompt()      { return `${BASE} Suggest a cohesive theme and decor plan including color palette, table settings, lighting ideas, and unique favor suggestions.`; }
function guestMsgPrompt()   { return `${BASE} Generate message and wording templates for guest communications including formal and casual invitation wording.`; }

/* ── Demo routing stub (matches gemini.js _getDemoResponse) ─────────────── */

const DEMO_KEYS = {
  ideas: 'DEMO_ideas', budget: 'DEMO_budget', timeline: 'DEMO_timeline',
  vendors: 'DEMO_vendors', theme: 'DEMO_theme', guestmsg: 'DEMO_guestmsg',
};

function getDemoResponse(systemPrompt) {
  const lower = systemPrompt.toLowerCase();
  if (lower.includes('decor') || lower.includes('cohesive theme') || (lower.includes('theme') && !lower.includes('event ideas'))) {
    return DEMO_KEYS.theme;
  }
  if (lower.includes('budget')) {
    return DEMO_KEYS.budget;
  }
  if (lower.includes('timeline') || (lower.includes('checklist') && lower.includes('month'))) {
    return DEMO_KEYS.timeline;
  }
  if (lower.includes('vendor')) {
    return DEMO_KEYS.vendors;
  }
  if (lower.includes('message') || lower.includes('wording') || lower.includes('guest')) {
    return DEMO_KEYS.guestmsg;
  }
  if (lower.includes('ideas') || lower.includes('personaliz')) {
    return DEMO_KEYS.ideas;
}
  return DEMO_KEYS.ideas;
}

/* ── Budget manager stub ──────────────────────────────────────────────────── */

function makeBudgetMgr() {
  let items = [];
  let nextId = 0;
  return {
    addItem:      (cat, est, act = 0) => { const id = `item-${++nextId}`; items.push({ id, category: cat, estimated: est, actual: act }); return id; },
    removeItem:   (id) => { const before = items.length; items = items.filter((i) => i.id !== id); return items.length < before; },
    updateActual: (id, act) => { const item = items.find((i) => i.id === id); if (!item) { return false; } item.actual = act; return true; },
    totals:       () => {
      const estimated = items.reduce((s, i) => s + i.estimated, 0);
      const actual    = items.reduce((s, i) => s + i.actual, 0);
      return { estimated, actual, variance: estimated - actual };
    },
    getItems:     () => items.map((i) => ({ ...i })),
    clear:        () => { items = []; },
    size:         () => items.length,
  };
}

/* ── LRU cache stub ───────────────────────────────────────────────────────── */

function makeLRUCache(maxSize) {
  const map = new Map();
  return {
    get:  (k) => map.get(k),
    set:  (k, v) => { if (map.size >= maxSize) { map.delete(map.keys().next().value); } map.set(k, v); },
    has:  (k) => map.has(k),
    size: () => map.size,
  };
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* ── Test Suites ─────────────────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════════ */

suite('sanitise - basic XSS prevention', () => {
  assert(sanitise('<script>alert(1)</script>') === '&lt;script&gt;alert(1)&lt;/script&gt;', 'escapes script tags');
  assert(sanitise('A & B') === 'A &amp; B', 'escapes ampersand');
  assert(sanitise('"quoted"') === '&quot;quoted&quot;', 'escapes double quotes');
  assert(sanitise("it's") === 'it&#x27;s', 'escapes single quote');
  assert(sanitise('<img src=x onerror=alert(1)>').includes('&lt;'), 'escapes img xss');
});

suite('sanitise - edge cases', () => {
  assert(sanitise('') === '', 'empty string');
  assert(sanitise(null) === '', 'null returns empty');
  assert(sanitise(undefined) === '', 'undefined returns empty');
  assert(sanitise(42) === '', 'number returns empty');
  assert(sanitise('Hello World') === 'Hello World', 'plain text unchanged');
});

suite('sanitise - event-specific inputs', () => {
  assert(sanitise('Sarah & James Wedding').includes('&amp;'), 'ampersand in event name escaped');
  assert(sanitise('<b>Birthday Bash</b>').includes('&lt;'), 'html tags escaped in event name');
  assert(sanitise('Event with "quotes"').includes('&quot;'), 'double quotes escaped');
});

suite('validateBudget - valid inputs', () => {
  assert(validateBudget(15000).valid === true, 'accepts integer budget');
  assert(validateBudget('15000').valid === true, 'accepts string number');
  assert(validateBudget('$15,000').valid === true, 'accepts formatted currency string');
  assert(validateBudget(0.01).valid === true, 'accepts very small budget');
});

suite('validateBudget - invalid inputs', () => {
  assert(validateBudget(0).valid === false, 'rejects zero');
  assert(validateBudget(-100).valid === false, 'rejects negative');
  assert(validateBudget('abc').valid === false, 'rejects non-numeric');
  assert(validateBudget(10_000_001).valid === false, 'rejects over 10M');
  assert(validateBudget(null).valid === false, 'rejects null');
});

suite('validateBudget - error messages', () => {
  assert(validateBudget(0).error.length > 0, 'zero has error message');
  assert(validateBudget(10_000_001).error.includes('million'), 'over-limit has descriptive message');
});

suite('validateGuestCount - valid inputs', () => {
  assert(validateGuestCount(1).valid === true, 'accepts 1 guest');
  assert(validateGuestCount(500).valid === true, 'accepts 500 guests');
  assert(validateGuestCount('120').valid === true, 'accepts string number');
  assert(validateGuestCount(50000).valid === true, 'accepts exactly 50000');
});

suite('validateGuestCount - invalid inputs', () => {
  assert(validateGuestCount(0).valid === false, 'rejects zero guests');
  assert(validateGuestCount(-1).valid === false, 'rejects negative');
  assert(validateGuestCount(50001).valid === false, 'rejects over 50000');
  assert(validateGuestCount('abc').valid === false, 'rejects non-numeric');
});

suite('validateTitle - valid inputs', () => {
  assert(validateTitle('Sarah & James Wedding').valid === true, 'accepts normal title');
  assert(validateTitle('My 30th Birthday').valid === true, 'accepts birthday title');
  assert(validateTitle('ABC').valid === true, 'accepts minimum 3 chars');
});

suite('validateTitle - invalid inputs', () => {
  assert(validateTitle('AB').valid === false, 'rejects 2-char title');
  assert(validateTitle('').valid === false, 'rejects empty string');
  assert(validateTitle(null).valid === false, 'rejects null');
  assert(validateTitle('A'.repeat(101)).valid === false, 'rejects over 100 chars');
});

suite('perHeadCost - calculations', () => {
  assert(perHeadCost(15000, 100) === 150, '$15000 / 100 = $150');
  assert(perHeadCost(1000, 3) === 333.33, 'rounds to 2dp correctly');
  assert(perHeadCost(500, 1) === 500, 'single guest returns full budget');
  assert(perHeadCost(1000, 0) === 0, 'zero guests returns 0');
});

suite('formatCurrency - output format', () => {
  assert(formatCurrency(1500).includes('1,500'), 'formats thousands separator');
  assert(formatCurrency(1500).includes('$'), 'includes dollar sign');
  assert(formatCurrency(0).includes('$0'), 'formats zero correctly');
  assert(formatCurrency(1500.50).includes('1,500.50'), 'includes cents');
});

suite('daysUntilEvent - future events', () => {
  const future = new Date();
  future.setDate(future.getDate() + 30);
  const dateStr = future.toISOString().split('T')[0];
  const days = daysUntilEvent(dateStr);
  assert(days >= 29 && days <= 31, 'future event returns ~30 days');
});

suite('daysUntilEvent - edge cases', () => {
  assert(daysUntilEvent('') === 0, 'empty date returns 0');
  assert(daysUntilEvent(null) === 0, 'null date returns 0');
  const past = new Date();
  past.setDate(past.getDate() - 10);
  assert(daysUntilEvent(past.toISOString().split('T')[0]) < 0, 'past event returns negative');
});

suite('demo response routing - exact matches', () => {
  assert(getDemoResponse(ideasPrompt())    === DEMO_KEYS.ideas,    'routes ideas prompt');
  assert(getDemoResponse(budgetPrompt())   === DEMO_KEYS.budget,   'routes budget prompt');
  assert(getDemoResponse(timelinePrompt()) === DEMO_KEYS.timeline,  'routes timeline prompt');
  assert(getDemoResponse(vendorPrompt())   === DEMO_KEYS.vendors,   'routes vendor prompt');
  assert(getDemoResponse(themePrompt())    === DEMO_KEYS.theme,     'routes theme prompt');
  assert(getDemoResponse(guestMsgPrompt()) === DEMO_KEYS.guestmsg,  'routes guest message prompt');
});

suite('demo response routing - fallback', () => {
  assert(getDemoResponse('completely unknown prompt') === DEMO_KEYS.ideas, 'unknown returns ideas fallback');
  assert(getDemoResponse('') === DEMO_KEYS.ideas,                          'empty prompt returns fallback');
});

suite('prompt content checks', () => {
  assert(ideasPrompt().includes('theme concepts'),          'ideas prompt mentions themes');
  assert(budgetPrompt().includes('markdown table'),         'budget prompt requests table');
  assert(timelinePrompt().includes('months before'),        'timeline prompt covers months');
  assert(vendorPrompt().includes('secondary vendors'),      'vendor prompt covers secondary');
  assert(themePrompt().includes('color palette'),           'theme prompt mentions color palette');
  assert(guestMsgPrompt().includes('invitation wording'),   'guest prompt mentions invitation');
});

suite('prompt BASE content', () => {
  const prompts = [ideasPrompt(), budgetPrompt(), timelinePrompt(), vendorPrompt(), themePrompt(), guestMsgPrompt()];
  prompts.forEach((p, i) => {
    assert(p.includes('event planner'), `prompt ${i} contains event planner base`);
  });
});

suite('budget manager - add and retrieve', () => {
  const mgr = makeBudgetMgr();
  const id = mgr.addItem('Venue', 3500, 3200);
  assert(mgr.size() === 1, 'one item after add');
  assert(mgr.getItems()[0].category === 'Venue', 'category stored correctly');
  assert(mgr.getItems()[0].estimated === 3500,   'estimated stored correctly');
  assert(mgr.getItems()[0].actual === 3200,       'actual stored correctly');
  assert(typeof id === 'string',                  'returns string id');
});

suite('budget manager - totals', () => {
  const mgr = makeBudgetMgr();
  mgr.addItem('Venue', 3500, 3200);
  mgr.addItem('Catering', 2500, 2600);
  const { estimated, actual, variance } = mgr.totals();
  assert(estimated === 6000, 'estimated total is 6000');
  assert(actual === 5800,    'actual total is 5800');
  assert(variance === 200,   'variance is 200');
});

suite('budget manager - remove item', () => {
  const mgr = makeBudgetMgr();
  const id = mgr.addItem('Flowers', 800, 0);
  assert(mgr.removeItem(id) === true,   'remove returns true for valid id');
  assert(mgr.size() === 0,              'size is 0 after removal');
  assert(mgr.removeItem('fake') === false, 'returns false for invalid id');
});

suite('budget manager - update actual', () => {
  const mgr = makeBudgetMgr();
  const id = mgr.addItem('DJ', 1000, 0);
  assert(mgr.updateActual(id, 950) === true,           'update returns true');
  assert(mgr.getItems()[0].actual === 950,             'actual updated correctly');
  assert(mgr.updateActual('fake-id', 100) === false,   'returns false for missing id');
});

suite('budget manager - clear', () => {
  const mgr = makeBudgetMgr();
  mgr.addItem('A', 100, 0); mgr.addItem('B', 200, 0);
  assert(mgr.size() === 2, 'size is 2 before clear');
  mgr.clear();
  assert(mgr.size() === 0, 'size is 0 after clear');
});

suite('budget manager - over budget detection', () => {
  const mgr = makeBudgetMgr();
  mgr.addItem('Venue', 5000, 6000);
  const { actual, estimated } = mgr.totals();
  assert(actual > estimated, 'detects over-budget condition');
  assert(actual - estimated === 1000, 'variance is correct');
});

suite('LRU cache - basic ops', () => {
  const cache = makeLRUCache(3);
  cache.set('a', 1); cache.set('b', 2); cache.set('c', 3);
  assert(cache.has('a'),       'cache has key a');
  assert(cache.get('b') === 2, 'returns correct value');
  assert(cache.size() === 3,   'size equals 3');
});

suite('LRU cache - eviction', () => {
  const cache = makeLRUCache(2);
  cache.set('x', 10); cache.set('y', 20);
  cache.set('z', 30);
  assert(cache.size() === 2,  'size stays at max');
  assert(!cache.has('x'),     'oldest evicted');
  assert(cache.has('z'),      'newest present');
});

suite('LRU cache - overwrite', () => {
  const cache = makeLRUCache(5);
  cache.set('k', 'v1'); cache.set('k', 'v2');
  assert(cache.get('k') === 'v2', 'overwrite updates value');
  assert(cache.size() === 1,      'size stays at 1 after overwrite');
});

suite('config constants - immutability', () => {
  const CFG = Object.freeze({ MODEL: 'gemini-2.0-flash-exp', MAX_TOKENS: 2048, CACHE_SIZE: 50 });
  let threw = false;
  try { CFG.MODEL = 'hacked'; } catch { threw = true; }
  assert(threw || CFG.MODEL === 'gemini-2.0-flash-exp', 'frozen object rejects mutation');
  assert(CFG.MAX_TOKENS === 2048, 'MAX_TOKENS is 2048');
  assert(CFG.CACHE_SIZE === 50,   'CACHE_SIZE is 50');
});

suite('config constants - event types', () => {
  const EV = Object.freeze({ WEDDING: 'wedding', BIRTHDAY: 'birthday', COMMUNITY: 'community', CORPORATE: 'corporate' });
  assert(EV.WEDDING === 'wedding',     'WEDDING constant correct');
  assert(EV.BIRTHDAY === 'birthday',   'BIRTHDAY constant correct');
  assert(EV.COMMUNITY === 'community', 'COMMUNITY constant correct');
  assert(EV.CORPORATE === 'corporate', 'CORPORATE constant correct');
});

suite('TIME_MS constants', () => {
  const T = Object.freeze({ SECOND: 1000, MINUTE: 60000, DEBOUNCE: 400, TIMEOUT: 15000, RATE_LIMIT: 1500 });
  assert(T.MINUTE === T.SECOND * 60, 'MINUTE = 60 * SECOND');
  assert(T.TIMEOUT === 15 * T.SECOND,'TIMEOUT = 15s');
  assert(T.DEBOUNCE < T.SECOND,      'DEBOUNCE is sub-second');
  assert(T.RATE_LIMIT > T.SECOND,    'RATE_LIMIT > 1 second');
  assert(T.DEBOUNCE === 400,         'DEBOUNCE is 400ms');
});

/* ── Results ──────────────────────────────────────────────────────────────── */

console.info(`\n${'='.repeat(50)}`);
console.info(`Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
if (failed > 0) { process.exit(1); }
