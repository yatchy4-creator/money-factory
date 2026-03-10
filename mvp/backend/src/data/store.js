export const db = {
  leads: new Map(),
  events: [],
  deadLetter: [],
  processedStripeEvents: new Set()
};
