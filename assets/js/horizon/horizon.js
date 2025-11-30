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

  // Maximum offset occurs around twilight (-6 to -10 degrees)
  // This is when multiple scattering is most significant relative to direct light
  const maxOffset = 16.0 * Math.PI / 180; // ~16 degrees

  // Minimum offset for high sun (diminishing returns above 45 degrees)
  const minOffset = 3.0 * Math.PI / 180; // ~3 degrees

  // Center the peak effect around -8 degrees (civil twilight)
  const peakAltitude = -8.0;

  // Width of the transition (how quickly the effect falls off)
  const transitionWidth = 25.0;

  // Gaussian-like falloff centered at twilight
  // This creates a smooth curve that peaks during twilight and decreases
  // as the sun gets higher or lower
  const gaussian = Math.exp(-Math.pow((altDeg - peakAltitude) / transitionWidth, 2));

  // Blend between min and max offset based on the gaussian
  const offset = minOffset + (maxOffset - minOffset) * gaussian;

  // For very low sun angles (deep twilight), use an exponential decay
  // to avoid the sky being too bright when sun is far below horizon
  if (altDeg < -12) {
    const deepTwilightFactor = Math.exp((altDeg + 12) / 8.0); // decay over ~8 degrees
    return offset * deepTwilightFactor;
  }

  return offset;
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
  let alt = sunPos.altitude + getMultipleScatteringOffset(sunPos.altitude);
  console.log("Refreshing Sky ("+now.toLocaleTimeString() + " - " + (sunPos.altitude * 180) / Math.PI+" + " + (getMultipleScatteringOffset(sunPos.altitude) * 180) / Math.PI+" = " + alt + ")");

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    alt = Math.PI / -2;
  }
  
  const [gradient, topVec, bottomVec] = renderGradient(alt);
  
  document.body.style.setProperty('--bg-gradient', `${gradient}`);
  document.body.style.setProperty('--bg-color', `rgb(${bottomVec[0]}, ${bottomVec[1]}, ${bottomVec[2]})`);
}