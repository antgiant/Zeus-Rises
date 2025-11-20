import { refreshSky } from './horizon/horizon.js'

function initalize() {
  
    document.addEventListener('DOMContentLoaded', () => {
        refreshSky();
    });
  
  refreshSky();
}

initalize();