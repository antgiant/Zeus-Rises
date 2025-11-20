import { refreshSky } from '/assets/js//horizon/horizon.js'

function initalize() {
  
    document.addEventListener('DOMContentLoaded', () => {
        refreshSky();
    });
  
  refreshSky();
}

initalize();