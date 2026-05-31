/**
 * Map common user-input country names to the canonical names used by
 * world-atlas TopoJSON so the heatmap can match countries reliably.
 * Keys are lowercased; values match world-atlas country names.
 */
export const COUNTRY_ALIASES: Record<string, string> = {
  usa: "United States of America",
  "u.s.a.": "United States of America",
  us: "United States of America",
  "united states": "United States of America",
  uk: "United Kingdom",
  "u.k.": "United Kingdom",
  "great britain": "United Kingdom",
  britain: "United Kingdom",
  england: "United Kingdom",
  uae: "United Arab Emirates",
  "south korea": "South Korea",
  "north korea": "North Korea",
  "ivory coast": "Ivory Coast",
  "czech republic": "Czechia",
  burma: "Myanmar",
  "russian federation": "Russia",
  vietnam: "Vietnam",
};

export function canonicalizeCountry(input: string): string {
  const key = input.trim().toLowerCase();
  return COUNTRY_ALIASES[key] ?? input.trim();
}
