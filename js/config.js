/**
 * @fileoverview Application-wide constants for the Celebration & Event Planner.
 * All objects are frozen to prevent accidental mutation.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @type {Readonly<{MODEL: string, MAX_TOKENS: number, CACHE_SIZE: number}>} */
const CONFIG = Object.freeze({
  MODEL:      'gemini-2.0-flash-exp',
  MAX_TOKENS: 2048,
  CACHE_SIZE: 50,
});

/** @type {Readonly<{SECOND: number, MINUTE: number, DEBOUNCE: number, TIMEOUT: number, RATE_LIMIT: number}>} */
const TIME_MS = Object.freeze({
  SECOND:     1000,
  MINUTE:     60000,
  DEBOUNCE:   400,
  TIMEOUT:    15000,
  RATE_LIMIT: 1500,
});

/** @type {Readonly<{TIMEOUT: string, RATE: string, NETWORK: string, SAFETY: string, GENERIC: string}>} */
const AI_ERROR = Object.freeze({
  TIMEOUT: 'Request timed out. Please try again.',
  RATE:    'Too many requests. Please wait a moment.',
  NETWORK: 'Network error. Check your connection.',
  SAFETY:  'Content blocked by safety filters.',
  GENERIC: 'An unexpected error occurred.',
});

/** @type {Readonly<{WEDDING: string, BIRTHDAY: string, COMMUNITY: string, CORPORATE: string}>} */
const EVENT_TYPES = Object.freeze({
  WEDDING:   'wedding',
  BIRTHDAY:  'birthday',
  COMMUNITY: 'community',
  CORPORATE: 'corporate',
});

/** @type {Readonly<Record<string, string>>} */
const DEMO = Object.freeze({
  ideas: [
    '## &#x2728; Personalized Event Ideas\n\n',
    '### Theme Concepts\n',
    '- **Garden Romance** — Floral arches, string lights, and pastel blooms for an ethereal outdoor setting\n',
    '- **Modern Minimalist** — Clean lines, monochrome palette, and statement florals for a sleek contemporary feel\n',
    '- **Rustic Barn Chic** — Wooden accents, wildflowers, and warm Edison bulbs for a cozy countryside vibe\n\n',
    '### Entertainment Ideas\n',
    '- Live acoustic duo during cocktail hour\n',
    '- Photo booth with custom props and instant prints\n',
    '- Interactive guest signature board as a lasting memento\n\n',
    '### Unique Touches\n',
    '- Personalized welcome bags for every guest\n',
    '- Signature cocktail named after the couple/birthday person\n',
    '- Live caricature artist for entertainment\n\n',
    '*AI-generated suggestions — customize to suit your vision!*',
  ].join(''),

  budget: [
    '## &#x1F4B0; Budget Breakdown\n\n',
    '| Category | Estimated Cost | % of Total |\n',
    '|----------|---------------|------------|\n',
    '| Venue | $3,500 | 28% |\n',
    '| Catering (per head) | $2,500 | 20% |\n',
    '| Photography & Video | $1,800 | 14% |\n',
    '| Flowers & Decor | $1,500 | 12% |\n',
    '| Music / Entertainment | $1,000 | 8% |\n',
    '| Attire & Beauty | $800 | 6% |\n',
    '| Stationery & Favors | $600 | 5% |\n',
    '| Transportation | $400 | 3% |\n',
    '| Contingency (10%) | $1,240 | 10% |\n\n',
    '**Total Estimated: $13,340**\n\n',
    '> &#x1F4A1; **Tip:** Always reserve 10–15% of your total budget as a contingency for unexpected costs.\n\n',
    '*AI-generated estimate — actual costs vary by location and vendor.*',
  ].join(''),

  timeline: [
    '## &#x1F4C5; Event Planning Timeline\n\n',
    '### 12+ Months Before\n',
    '- [ ] Set event date, type, and guest count\n',
    '- [ ] Establish total budget\n',
    '- [ ] Book the venue\n\n',
    '### 9–12 Months Before\n',
    '- [ ] Book photographer and videographer\n',
    '- [ ] Select and book catering company\n',
    '- [ ] Book live entertainment or DJ\n\n',
    '### 6–9 Months Before\n',
    '- [ ] Send save-the-date cards\n',
    '- [ ] Book florist and decorator\n',
    '- [ ] Finalise attire and beauty appointments\n\n',
    '### 3–6 Months Before\n',
    '- [ ] Send formal invitations\n',
    '- [ ] Book transportation (limo, shuttle, etc.)\n',
    '- [ ] Plan honeymoon / post-event activities\n\n',
    '### 1–3 Months Before\n',
    '- [ ] Confirm all vendor bookings\n',
    '- [ ] Arrange seating plan\n',
    '- [ ] Prepare final guest list and RSVP count\n\n',
    '### 1–4 Weeks Before\n',
    '- [ ] Final venue walkthrough\n',
    '- [ ] Confirm all final details with vendors\n',
    '- [ ] Prepare payments and gratuities\n\n',
    '### Day Before & Day Of\n',
    '- [ ] Deliver decor items and favors\n',
    '- [ ] Day-of timeline briefing with wedding/event coordinator\n',
    '- [ ] Relax and enjoy the celebration! &#x1F389;\n\n',
    '*AI-generated timeline — adjust dates to match your event.*',
  ].join(''),

  vendors: [
    '## &#x1F4CB; Vendor Checklist\n\n',
    '### Essential Vendors\n',
    '- [ ] **Venue** — Deposit paid, contract signed, capacity confirmed\n',
    '- [ ] **Caterer** — Menu tasting done, dietary requirements noted\n',
    '- [ ] **Photographer** — Shot list shared, second shooter arranged if needed\n',
    '- [ ] **Videographer** — Highlight reel package selected\n',
    '- [ ] **DJ / Band** — Song list & do-not-play list submitted\n\n',
    '### Secondary Vendors\n',
    '- [ ] **Florist** — Mockup approved, delivery time confirmed\n',
    '- [ ] **Hair & Makeup** — Trial completed, day-of schedule set\n',
    '- [ ] **Transportation** — Route and timing confirmed\n',
    '- [ ] **Officiant / MC** — Script reviewed and rehearsed\n',
    '- [ ] **Cake / Dessert** — Tasting done, delivery logistics confirmed\n\n',
    '### Questions to Ask Every Vendor\n',
    '1. What is your cancellation and refund policy?\n',
    '2. Do you have liability insurance?\n',
    '3. Have you worked at this venue before?\n',
    '4. Who is our point of contact on the day?\n\n',
    '*AI-generated checklist — adapt based on your specific vendors.*',
  ].join(''),

  theme: [
    '## &#x1F3A8; Theme & Decor Suggestions\n\n',
    '### Color Palette\n',
    '- **Primary:** Dusty Rose (#C4A3A0) — romantic and soft\n',
    '- **Secondary:** Sage Green (#8FAF8A) — natural and calming\n',
    '- **Accent:** Champagne Gold (#C9A84C) — elegant and celebratory\n\n',
    '### Table Setting Ideas\n',
    '- Linen runners in sage green with scattered dried florals\n',
    '- Mismatched vintage gold cutlery for a curated look\n',
    '- Personalized place cards with a sprig of rosemary\n\n',
    '### Lighting Ideas\n',
    '- Warm Edison globe string lights overhead\n',
    '- Candlelit centrepieces with tapered candles\n',
    '- Soft pin-spot lighting on the cake and sweetheart table\n\n',
    '### Favour Ideas\n',
    '- Mini jars of local honey with custom labels\n',
    '- Seed packets in branded envelopes\n',
    '- Small succulent plants as living keepsakes\n\n',
    '*AI-generated decor ideas — let your personality shine through!*',
  ].join(''),

  guestmsg: [
    '## &#x1F4E7; Guest Message Suggestions\n\n',
    '### Formal Invitation Wording\n',
    '*"Together with their families, [Name] and [Name] joyfully invite you to share in the celebration of their marriage..."*\n\n',
    '### Casual Invitation Wording\n',
    '*"Hey! We are getting married and we would LOVE to have you there! Come celebrate with us on [Date] at [Venue]."*\n\n',
    '### RSVP Reminder Message\n',
    '*"Hi [Name]! Just a friendly reminder that RSVPs for our event close on [Date]. We hope you can join us! Please reply to this message or use the link below."*\n\n',
    '### Thank-You Message Template\n',
    '*"Dear [Name], thank you so much for celebrating [Event] with us. Your presence (and your wonderful gift!) made the day truly special. With love and gratitude, [Host Name]."*\n\n',
    '*AI-generated message templates — personalize with names and specific details.*',
  ].join(''),
});
