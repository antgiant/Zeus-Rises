import { refreshSky } from './horizon/horizon.js'

const slider = document.getElementById('timeSlider');
const lightPollutionToggle = document.getElementById('lightPollution')

lightPollutionStatus = JSON.parse(localStorage.getItem("lightPollution"));
if (lightPollutionStatus == null) {
  localStorage.setItem("lightPollution", JSON.stringify(lightPollutionToggle ? lightPollutionToggle.checked : true));
} else {
  // Set the checkbox status to match the variable
  lightPollutionToggle.checked = lightPollutionStatus;
  
}

function set_element(element_name, element_value, data = "localStorage") {
  if (data === "localStorage") {
    
  } else {
    data[element_name] = element_value;
  }
}

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