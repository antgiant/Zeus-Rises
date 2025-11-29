import renderGradient from "./gradient.js";
import { getPosition } from "./suncalc/suncalc.js";
import Virgo from '../virgo/virgo.js';

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
  
  let alt = sunPos.altitude;
  console.log("Refreshing Sky ("+now.toLocaleTimeString() + " - " + altitude+" - "+(altitude * 180) / Math.PI+")");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    alt = Math.PI / -2;
  }
  
  const [gradient, topVec, bottomVec] = renderGradient(alt);
  
  document.body.style.setProperty('--bg-gradient', `${gradient}`);
  document.body.style.setProperty('--bg-color', `rgb(${bottomVec[0]}, ${bottomVec[1]}, ${bottomVec[2]})`);
}