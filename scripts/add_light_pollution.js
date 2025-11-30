/**
 * Script to add light pollution data to timezone_centroids.js
 *
 * Light pollution is measured using the Bortle Scale (1-9):
 * 1 - Excellent dark sky (0.00-0.11 mcd/m²)
 * 2 - Typical dark sky (0.11-0.33 mcd/m²)
 * 3 - Rural sky (0.33-1.0 mcd/m²)
 * 4 - Rural/suburban transition (1.0-3.3 mcd/m²)
 * 5 - Suburban sky (3.3-10 mcd/m²)
 * 6 - Bright suburban (10-33 mcd/m²)
 * 7 - Suburban/urban transition (33-100 mcd/m²)
 * 8 - City sky (100-330 mcd/m²)
 * 9 - Inner-city sky (>330 mcd/m²)
 *
 * This script uses a simplified model based on:
 * - Major city proximity
 * - Population density estimates
 * - Geographic location (remote areas, polar regions, etc.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Major cities with known high light pollution (Bortle 8-9)
const majorCities = {
  // America
  "America/New_York": 8, "America/Los_Angeles": 8, "America/Chicago": 8,
  "America/Phoenix": 7, "America/Denver": 7, "America/Detroit": 7,
  "America/Toronto": 8, "America/Mexico_City": 9, "America/Sao_Paulo": 9,
  "America/Buenos_Aires": 8, "America/Bogota": 7, "America/Santiago": 7,
  "America/Lima": 7, "America/Caracas": 7, "America/Monterrey": 7,
  "America/Tijuana": 7, "America/Havana": 6,

  // Europe
  "Europe/London": 8, "Europe/Paris": 8, "Europe/Berlin": 7,
  "Europe/Madrid": 7, "Europe/Rome": 7, "Europe/Amsterdam": 7,
  "Europe/Brussels": 7, "Europe/Vienna": 7, "Europe/Athens": 7,
  "Europe/Moscow": 8, "Europe/Istanbul": 8, "Europe/Kyiv": 7,
  "Europe/Warsaw": 7, "Europe/Budapest": 7, "Europe/Prague": 7,
  "Europe/Bucharest": 7, "Europe/Stockholm": 6, "Europe/Copenhagen": 6,

  // Asia
  "Asia/Tokyo": 9, "Asia/Shanghai": 9, "Asia/Hong_Kong": 9,
  "Asia/Singapore": 8, "Asia/Seoul": 9, "Asia/Bangkok": 8,
  "Asia/Manila": 8, "Asia/Jakarta": 8, "Asia/Dubai": 8,
  "Asia/Riyadh": 7, "Asia/Tehran": 8, "Asia/Baghdad": 7,
  "Asia/Karachi": 8, "Asia/Kolkata": 8, "Asia/Dhaka": 8,
  "Asia/Taipei": 8, "Asia/Kuala_Lumpur": 7,

  // Africa
  "Africa/Cairo": 8, "Africa/Lagos": 7, "Africa/Johannesburg": 7,
  "Africa/Nairobi": 6, "Africa/Casablanca": 6, "Africa/Algiers": 6,

  // Oceania
  "Australia/Sydney": 7, "Australia/Melbourne": 7,
  "Pacific/Auckland": 6, "Pacific/Honolulu": 6,
};

// Remote/rural areas with excellent dark skies (Bortle 1-3)
const darkSkyAreas = {
  // Antarctica (Bortle 1)
  "Antarctica/": 1,

  // Remote Arctic
  "America/Thule": 1, "America/Danmarkshavn": 1, "America/Scoresbysund": 2,
  "Arctic/Longyearbyen": 2,

  // Remote islands and territories
  "Atlantic/South_Georgia": 1, "Pacific/Easter": 2, "Pacific/Pitcairn": 1,
  "Indian/Kerguelen": 1, "Pacific/Wake": 2, "Pacific/Midway": 2,

  // Remote mainland areas
  "America/Yellowknife": 2, "America/Whitehorse": 2, "America/Dawson": 2,
  "America/Cambridge_Bay": 1, "America/Rankin_Inlet": 1, "America/Resolute": 1,
  "America/Iqaluit": 2, "America/Inuvik": 2,

  // Australian outback
  "Australia/Eucla": 2, "Australia/Perth": 4, // Perth is a city, but remote

  // Remote Pacific
  "Pacific/Fakaofo": 1, "Pacific/Niue": 1, "Pacific/Palau": 2,
  "Pacific/Pohnpei": 2, "Pacific/Majuro": 2, "Pacific/Tarawa": 2,

  // Sahara region
  "Africa/El_Aaiun": 2, "Africa/Nouakchott": 3,
};

/**
 * Estimate light pollution based on location characteristics
 */
function estimateLightPollution(timezone, lat, lon) {
  // Check if it's a known major city
  if (majorCities[timezone]) {
    return majorCities[timezone];
  }

  // Check if it's a known dark sky area
  for (const [prefix, bortle] of Object.entries(darkSkyAreas)) {
    if (timezone.startsWith(prefix)) {
      return bortle;
    }
  }

  // Geographic heuristics
  const absLat = Math.abs(lat);

  // Extreme latitudes (polar regions) - usually dark
  if (absLat > 70) return 2;
  if (absLat > 60) return 3;

  // Ocean areas (Etc/GMT timezones over water)
  if (timezone.startsWith("Etc/GMT") && (absLat < 10 || absLat > 50)) {
    return 2;
  }

  // Small island nations and territories (typically darker)
  const smallIslands = [
    "Atlantic/Cape_Verde", "Atlantic/Azores", "Atlantic/Madeira", "Atlantic/Bermuda",
    "Indian/Christmas", "Indian/Cocos", "Indian/Maldives", "Indian/Mauritius",
    "Indian/Reunion", "Indian/Mahe", "Indian/Comoro", "Pacific/Guam",
    "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Rarotonga", "Pacific/Apia",
    "Pacific/Fiji", "Pacific/Tongatapu", "Pacific/Efate", "Pacific/Noumea",
    "America/Aruba", "America/Curacao", "America/Cayman", "America/Nassau",
  ];
  if (smallIslands.includes(timezone)) return 3;

  // Default estimates by region
  if (timezone.startsWith("America/")) {
    // US/Canada/Central America tend to be more developed
    if (timezone.includes("America/North_Dakota") ||
        timezone.includes("America/Indiana") ||
        timezone.includes("America/Kentucky")) return 5;
    return 4; // Default suburban/rural
  }

  if (timezone.startsWith("Europe/")) {
    return 5; // Europe is generally more light-polluted
  }

  if (timezone.startsWith("Asia/")) {
    return 5; // Asian cities tend to be bright
  }

  if (timezone.startsWith("Africa/")) {
    return 4; // Africa generally darker, but cities are bright
  }

  if (timezone.startsWith("Pacific/")) {
    return 3; // Pacific islands generally dark
  }

  if (timezone.startsWith("Indian/")) {
    return 3; // Indian Ocean islands generally dark
  }

  if (timezone.startsWith("Australia/")) {
    return 4; // Australian cities, but sparse population
  }

  // Default
  return 4;
}

// Read the original file
const centroidsPath = path.join(__dirname, '../assets/js/virgo/lib/timezone_centroids.js');
const centroidsContent = fs.readFileSync(centroidsPath, 'utf-8');

// Parse the export default object
const jsonMatch = centroidsContent.match(/export default (\{[\s\S]*\});/);
if (!jsonMatch) {
  throw new Error('Could not parse timezone_centroids.js');
}

const centroids = eval('(' + jsonMatch[1] + ')');

// Add light pollution to each timezone
for (const [timezone, location] of Object.entries(centroids)) {
  location.lightPollution = estimateLightPollution(
    timezone,
    location.latitude,
    location.longitude
  );
}

// Generate new file content
let newContent = 'export default {\n';
for (const [timezone, location] of Object.entries(centroids)) {
  newContent += `    "${timezone}": {\n`;
  newContent += `        "latitude": ${location.latitude},\n`;
  newContent += `        "longitude": ${location.longitude},\n`;
  newContent += `        "lightPollution": ${location.lightPollution}\n`;
  newContent += `    },\n`;
}
newContent += '};\n';

// Write the updated file
fs.writeFileSync(centroidsPath, newContent);

console.log('✓ Light pollution data added to timezone_centroids.js');
console.log('\nBortle Scale Distribution:');
const distribution = {};
for (const location of Object.values(centroids)) {
  distribution[location.lightPollution] = (distribution[location.lightPollution] || 0) + 1;
}
for (let i = 1; i <= 9; i++) {
  if (distribution[i]) {
    console.log(`  Bortle ${i}: ${distribution[i]} locations`);
  }
}
