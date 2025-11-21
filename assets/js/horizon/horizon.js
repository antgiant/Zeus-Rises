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

  document.body.style.background = `${gradient}, url('../img/stars.png'), rgb(${topVec[0]}, ${topVec[1]}, ${topVec[2]})`;
}