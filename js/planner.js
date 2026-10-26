/**
 * @fileoverview AI prompt builders for all planner features.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @namespace Planner */
const Planner = (() => {
  const BASE = 'You are a professional event planner and creative consultant. You help users plan beautiful, memorable celebrations. Always be encouraging, practical, and specific. Provide organized, actionable suggestions.';

  /**
   * Builds the system prompt for personalized event ideas.
   * @returns {string}
   */
  function ideasPrompt() {
    return `${BASE} Generate creative, personalized event ideas including theme concepts, entertainment options, and unique touches. Organize by category with practical details.`;
  }

  /**
   * Builds the system prompt for budget planning.
   * @returns {string}
   */
  function budgetPrompt() {
    return `${BASE} Create a detailed budget breakdown for the event. Use a markdown table with category, estimated cost, and percentage of total. Include money-saving tips and flag essential vs optional items.`;
  }

  /**
   * Builds the system prompt for timeline generation.
   * @returns {string}
   */
  function timelinePrompt() {
    return `${BASE} Generate a comprehensive event planning timeline with checkbox tasks organized by time periods (months before the event). Cover all essential planning milestones.`;
  }

  /**
   * Builds the system prompt for vendor checklist generation.
   * @returns {string}
   */
  function vendorPrompt() {
    return `${BASE} Generate a detailed vendor checklist with checkbox items for both essential and secondary vendors. Include key questions to ask each vendor type.`;
  }

  /**
   * Builds the system prompt for theme and decor suggestions.
   * @returns {string}
   */
  function themePrompt() {
    return `${BASE} Suggest a cohesive theme and decor plan including color palette, table settings, lighting ideas, and unique favor suggestions. Be specific and visually descriptive.`;
  }

  /**
   * Builds the system prompt for guest messaging.
   * @returns {string}
   */
  function guestMessagePrompt() {
    return `${BASE} Generate message and wording templates for guest communications including formal and casual invitation wording, RSVP reminders, and thank-you message templates.`;
  }

  /**
   * Builds the user prompt from event form data.
   * @param {{ type: string, title: string, date: string, guests: number, budget: number, notes: string }} data
   * @returns {string}
   */
  function buildUserPrompt(data) {
    const { type, title, date, guests, budget, notes } = data;
    return [
      `Event Type: ${type}`,
      `Event Title: ${title}`,
      `Date: ${date}`,
      `Number of Guests: ${guests}`,
      `Total Budget: $${budget}`,
      notes ? `Additional Notes: ${notes}` : '',
    ].filter(Boolean).join('\n');
  }

  return Object.freeze({ ideasPrompt, budgetPrompt, timelinePrompt, vendorPrompt, themePrompt, guestMessagePrompt, buildUserPrompt });
})();
