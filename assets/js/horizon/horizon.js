import renderGradient from "./gradient.js";
import { getPosition } from "./suncalc/suncalc.js";
import Virgo from '../virgo/virgo.js';

export function refreshSky() {
  //Estimate location based on timezone
  const temp = Virgo.getLocation();
  const now = new Date();
  const sunPos = getPosition(
    now,
    parseFloat(temp.latitude),
    parseFloat(temp.longitude),
  );

  const [gradient, topVec, bottomVec] = renderGradient(sunPos.altitude);

  document.documentElement.style.setProperty('--bg-gradient',  `${gradient}`);
  document.documentElement.style.setProperty('--bg-color',  `rgb(${bottomVec[0]}, ${bottomVec[1]}, ${bottomVec[2]})`);
}