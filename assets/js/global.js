import { refreshSky } from './horizon/horizon.js'

refreshSky();

// Listen for changes to dark mode preference and update the sky color
mediaQuery.addEventListener("change", refreshSky);