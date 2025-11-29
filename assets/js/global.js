import { refreshSky } from './horizon/horizon.js'

refreshSky();

// Listen for changes to dark mode preference and update the sky color
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

mediaQuery.addEventListener('change', refreshSky);