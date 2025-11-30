import renderGradient from "./gradient.js";
import { getPosition } from "./suncalc/suncalc.js";
import Virgo from '../virgo/virgo.js';

/**
 * Calculate a physically-motivated altitude offset to approximate multiple scattering.
 *
 * Multiple scattering causes the sky to appear brighter than single scattering predicts,
 * especially at low sun angles. This function models that effect without full multiple
 * scattering calculation.
 *
 * @param {number} actualAltitude - True sun altitude in radians
 * @returns {number} - Effective altitude offset in radians
 */
function getMultipleScatteringOffset(actualAltitude) {
  const altDeg = actualAltitude * 180 / Math.PI;

  // Multiple scattering adds indirect illumination, but we need to be careful
  // not to shift sunset/sunrise too much. Real sunset colors begin when sun
  // is still 6-10 degrees above the horizon.

  // For high sun: minimal offset needed (single scattering is fairly accurate)
  // For low sun near horizon: moderate offset to account for path length
  // For sun below horizon: larger offset as multiple scattering dominates

  if (altDeg > 20) {
    // High sun: very minimal correction needed
    return 2.0 * Math.PI / 180;
  } else if (altDeg > -6) {
    // Sun above horizon to civil twilight: gentle increase
    // Use a smooth curve that doesn't shift sunset colors too much
    const t = (20 - altDeg) / 26; // 0 at 20°, 1 at -6°
    const smoothT = t * t * (3 - 2 * t); // smooth step function
    return (2.0 + smoothT * 6.0) * Math.PI / 180; // 2° to 8°
  } else if (altDeg > -12) {
    // Civil to nautical twilight: slower increase to avoid reverse sunset
    // The offset must increase slower than altitude decreases (rate < 1.0)
    const t = (-6 - altDeg) / 6; // 0 at -6°, 1 at -12°
    const smoothT = t * t * (3 - 2 * t);
    return (8.0 + smoothT * 3.0) * Math.PI / 180; // 8° to 11° (only 3° increase over 6° range)
  } else {
    // Deep twilight: slow linear decay to avoid overly bright night sky
    // Linear decay from 11° at -12° to 0° at -30°
    const t = Math.max(0, (-12 - altDeg) / 18); // 0 at -12°, 1 at -30°
    return (11.0 * (1 - t)) * Math.PI / 180;
  }
}

/**
 * Calculate light pollution offset based on Bortle scale and sun altitude.
 *
 * Light pollution makes the night sky appear brighter than it physically is,
 * simulating artificial sky glow by raising the effective sun altitude.
 *
 * @param {number} bortle - Bortle scale value (1-9)
 * @param {number} sunAltitude - True sun altitude in radians
 * @returns {number} - Light pollution offset in radians
 */
function getLightPollutionOffset(bortle, sunAltitude) {
  const altDeg = sunAltitude * 180 / Math.PI;

  // Base offset by Bortle class (in degrees)
  // These values are calibrated to match real-world sky brightness
  const baseOffsets = {
    1: 0,    // Pristine dark sky: no artificial brightening
    2: 0.5,  // Typical dark sky: minimal effect
    3: 1,    // Rural: slight brightening
    4: 2,    // Rural/suburban: noticeable
    5: 4,    // Suburban: significant sky glow
    6: 7,    // Bright suburban: major impact
    7: 11,   // Urban: severe light dome
    8: 16,   // City: extreme brightening
    9: 22    // Inner city: sky never truly dark
  };

  return baseOffsets[bortle] * Math.PI / 180;
}

function getSliderTimeAsDateObject() {
  const slider = document.getElementById('timeSlider');
  const totalMinutes = parseInt(slider.value, 10);

  // 2. Calculate Hours and Minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // 3. Create a new Date object for the current day
  // This maintains the current year, month, and day
  const selectedDateTime = new Date();

  // 4. Set the hours and minutes using the calculated values
  selectedDateTime.setHours(hours);
  selectedDateTime.setMinutes(minutes);
  selectedDateTime.setSeconds(0); // Optional: clear seconds and milliseconds
  selectedDateTime.setMilliseconds(0);

  // 5. Return the full Date object
  return selectedDateTime;
}

export function refreshSky(dummy) {
  //Estimate location based on timezone
  const temp = Virgo.getLocation();
  const now = getSliderTimeAsDateObject();
  const sunPos = getPosition(
    now,
    parseFloat(temp.latitude),
    parseFloat(temp.longitude),
  );

  const multipleScatteringOffset = getMultipleScatteringOffset(sunPos.altitude);

  const lightPollution = temp.lightPollution || 4; // Default to Bortle 4 if not available
  const lightPollutionOffset = getLightPollutionOffset(lightPollution, sunPos.altitude);

  // Combine offsets as floors instead of stacking additions to avoid a "reverse sunrise"
  // when the sun crosses the horizon.
  const candidateAltitudes = [
    sunPos.altitude,
    sunPos.altitude + multipleScatteringOffset,
    lightPollutionOffset,
  ];

  let alt = Math.max(...candidateAltitudes);

  console.log("Refreshing Sky (" + now.toLocaleTimeString() +
              " | Sun: " + (sunPos.altitude * 180 / Math.PI).toFixed(1) + "°" +
              " + MS: " + (multipleScatteringOffset * 180 / Math.PI).toFixed(1) + "°" +
              " + LP(B" + lightPollution + "): " + (lightPollutionOffset * 180 / Math.PI).toFixed(1) + "°" +
              " = " + (alt * 180 / Math.PI).toFixed(1) + "°)");

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    alt = Math.PI / -2;
  }

  const [gradient, topVec, bottomVec] = renderGradient(alt);

  document.body.style.setProperty('--bg-gradient', `${gradient}`);
  document.body.style.setProperty('--bg-color', `rgb(${bottomVec[0]}, ${bottomVec[1]}, ${bottomVec[2]})`);
}