/**
 * @fileoverview Gemini AI client with LRU caching, rate limiting,
 *               AbortController timeout, and Gemini safety settings.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @namespace GeminiClient */
const GeminiClient = (() => {
  /** @type {Map<string, string>} LRU cache keyed by prompt hash */
  const _cache = new Map();
  /** @type {number} Timestamp of last API call */
  let _lastCall = 0;

  /**
   * Builds the Gemini REST endpoint URL.
   * @param {string} key - Gemini API key.
   * @returns {string}
   */
  function _endpoint(key) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  }

  /**
   * Evicts the oldest LRU entry if the cache is at capacity.
   * @returns {void}
   */
  function _evictIfFull() {
    if (_cache.size >= CONFIG.CACHE_SIZE) {
      _cache.delete(_cache.keys().next().value);
    }
  }

  /**
   * Enforces a minimum interval between consecutive API calls.
   * @returns {Promise<void>}
   */
  async function _enforceRateLimit() {
    const elapsed = Date.now() - _lastCall;
    if (elapsed < TIME_MS.RATE_LIMIT) {
      await new Promise((res) => setTimeout(res, TIME_MS.RATE_LIMIT - elapsed));
    }
    _lastCall = Date.now();
  }

  /**
   * Performs a fetch request with an AbortController timeout.
   * @param {string} url
   * @param {RequestInit} options
   * @returns {Promise<Response>}
   */
  async function _fetchWithTimeout(url, options) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIME_MS.TIMEOUT);
    try {
      return await fetch(url, { ...options, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Constructs the Gemini API request body.
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @returns {object}
   */
  function _buildBody(systemPrompt, userPrompt) {
    return {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: CONFIG.MAX_TOKENS, temperature: 0.7 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };
  }

  /**
   * Extracts the text content from a Gemini API response.
   * @param {object} data - Parsed response JSON.
   * @returns {string}
   * @throws {Error} If blocked or malformed.
   */
  function _extractText(data) {
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      throw new Error(AI_ERROR.SAFETY);
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) { throw new Error(AI_ERROR.GENERIC); }
    return text;
  }

  /**
   * Returns a demo response matched to the system prompt keyword.
   * @param {string} systemPrompt
   * @returns {string}
   */
  function _getDemoResponse(systemPrompt) {
    const lower = systemPrompt.toLowerCase();
    if (lower.includes('decor') || lower.includes('cohesive theme') || (lower.includes('theme') && !lower.includes('event ideas'))) {
      return DEMO.theme;
    }
    if (lower.includes('budget')) {
      return DEMO.budget;
    }
    if (lower.includes('timeline') || (lower.includes('checklist') && lower.includes('month'))) {
      return DEMO.timeline;
    }
    if (lower.includes('vendor')) {
      return DEMO.vendors;
    }
    if (lower.includes('message') || lower.includes('wording') || lower.includes('guest')) {
      return DEMO.guestmsg;
    }
    return DEMO.ideas;
  }

  /**
   * Sends a prompt to the Gemini API; returns cached result if available.
   * Falls back to demo mode when no API key is provided.
   * @param {string} key - Gemini API key (empty = demo mode).
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @returns {Promise<string>}
   * @throws {Error} On timeout, network failure, or safety block.
   */
  async function query(key, systemPrompt, userPrompt) {
    if (!key) { return _getDemoResponse(systemPrompt); }
    const cacheKey = `${systemPrompt}|||${userPrompt}`;
    if (_cache.has(cacheKey)) { return _cache.get(cacheKey); }
    await _enforceRateLimit();
    let response;
    try {
      response = await _fetchWithTimeout(_endpoint(key), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(_buildBody(systemPrompt, userPrompt)),
      });
    } catch (err) {
      const msg = err.name === 'AbortError' ? AI_ERROR.TIMEOUT : AI_ERROR.NETWORK;
      throw new Error(msg);
    }
    if (!response.ok) { throw new Error(`${AI_ERROR.GENERIC} (HTTP ${response.status})`); }
    const data = await response.json();
    const text = _extractText(data);
    _evictIfFull();
    _cache.set(cacheKey, text);
    return text;
  }

  return Object.freeze({ query });
})();
