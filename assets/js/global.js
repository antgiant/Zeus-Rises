import { refreshSky } from './horizon/horizon.js'

const slider = document.getElementById('timeSlider');
const lightPollutionToggle = document.getElementById('lightPollution');

// No state variable needed!

let lightPollutionStatus = JSON.parse(localStorage.getItem("lightPollution"));
if (lightPollutionStatus == null) {
  localStorage.setItem("lightPollution", JSON.stringify(lightPollutionToggle ? lightPollutionToggle.checked : true));
} else {
  // Set the checkbox status to match the variable
  lightPollutionToggle.checked = lightPollutionStatus;
}

// Function to update the slider's value to the current time
function updateSliderToCurrentTime() {
  // 1. Get the current date and time
  const now = new Date();
  
  // 2. Calculate the total minutes past midnight
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const minutesPastMidnight = (currentHours * 60) + currentMinutes;
  
  // 3. Set the slider's position
  slider.value = minutesPastMidnight;

  // 4. Refresh the sky after the auto-update
  refreshSky(); 
}

// Run the function to set the initial time when the page loads
updateSliderToCurrentTime();

// NEW: Set the interval and store the ID globally
const minuteIntervalID = setInterval(updateSliderToCurrentTime, 60000); 

// Attach the event listener for user input
slider.addEventListener('input', () => {
    // NEW: Stop the interval immediately on manual interaction
    clearInterval(minuteIntervalID); 
    
    // Call the original refresh function based on the user's input
    refreshSky();
});

if (lightPollutionToggle) {
  lightPollutionToggle.addEventListener('change', refreshSky);
}

// Listen for changes to dark mode preference and update the sky color
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

mediaQuery.addEventListener('change', refreshSky);