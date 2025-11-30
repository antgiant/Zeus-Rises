import { refreshSky } from './horizon/horizon.js'

const slider = document.getElementById('timeSlider');
const lightPollutionToggle = document.getElementById('lightPollution');

function setDefaultTime() {
  // 1. Get the current date and time
  const now = new Date();
  
  // 2. Calculate the total minutes past midnight
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Total minutes = (Hours * 60) + Minutes
  const minutesPastMidnight = (currentHours * 60) + currentMinutes;
  
  // 3. Set the slider's default position
  slider.value = minutesPastMidnight;
}

// Attach the event listener for user input
slider.addEventListener('input', refreshSky);
if (lightPollutionToggle) {
  lightPollutionToggle.addEventListener('change', refreshSky);
}

// Run the function to set the default time when the page loads
setDefaultTime();

refreshSky();

// Listen for changes to dark mode preference and update the sky color
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

mediaQuery.addEventListener('change', refreshSky);
