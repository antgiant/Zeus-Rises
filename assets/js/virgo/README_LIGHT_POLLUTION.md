# Light Pollution Data

This document describes the light pollution data integrated into the Virgo timezone location system.

## Overview

Each timezone location now includes a `lightPollution` field that represents the typical light pollution level for that area using the **Bortle Scale**.

## Bortle Scale

The Bortle Scale is a numerical scale from 1 to 9 that measures night sky brightness:

| Bortle | Description | Sky Brightness | Characteristics |
|--------|-------------|----------------|-----------------|
| **1** | Excellent dark sky | 0.00-0.11 mcd/m² | Milky Way casts shadows, zodiacal light visible |
| **2** | Typical dark sky | 0.11-0.33 mcd/m² | Milky Way highly structured, M33 visible |
| **3** | Rural sky | 0.33-1.0 mcd/m² | Milky Way still impressive, some light pollution visible at horizon |
| **4** | Rural/suburban | 1.0-3.3 mcd/m² | Milky Way above horizon, light pollution domes visible |
| **5** | Suburban | 3.3-10 mcd/m² | Milky Way very weak, only hints visible |
| **6** | Bright suburban | 10-33 mcd/m² | Milky Way invisible, only bright objects visible |
| **7** | Suburban/urban | 33-100 mcd/m² | Entire sky has grayish color, light pollution severe |
| **8** | City sky | 100-330 mcd/m² | Sky is grayish-white, only planets and bright stars visible |
| **9** | Inner-city | >330 mcd/m² | Entire sky is brightly lit, difficult to see even bright stars |

## Usage

```javascript
import Virgo from './virgo/virgo.js';

// Get location with light pollution data
const location = Virgo.getLocation(); // Uses browser timezone
console.log(location);
// Output: { latitude: 40.7, longitude: -74.0, lightPollution: 8 }

// Get specific timezone
const tokyo = Virgo.getLocation('Asia/Tokyo');
console.log(tokyo.lightPollution); // 9 (Inner-city)

const antarctica = Virgo.getLocation('Antarctica/McMurdo');
console.log(antarctica.lightPollution); // 1 (Excellent dark sky)
```

## Data Sources

The light pollution values are estimated based on:

1. **Known major cities** - Cities with populations >5M typically rated 8-9
2. **Geographic location** - Polar regions, remote islands rated 1-3
3. **Regional characteristics** - Europe generally higher (5), Pacific islands lower (3)
4. **Population density estimates** - Based on typical development patterns

### Sample Classifications

**Bortle 1 (Pristine Dark Sky):**
- Antarctica (all stations)
- Pitcairn Island
- Remote Arctic locations (Resolute, Cambridge Bay)

**Bortle 7-9 (Urban Sky):**
- Tokyo, Shanghai, Hong Kong, Seoul (9)
- New York, Los Angeles, Mexico City, São Paulo (8-9)
- London, Paris, Moscow, Istanbul (8)

**Bortle 3-4 (Rural Sky):**
- Remote Pacific islands
- Greenland coastal areas
- Small island nations

## References

- [International Dark-Sky Association](https://www.darksky.org/)
- [Bortle Scale](https://en.wikipedia.org/wiki/Bortle_scale)
- [World Atlas of Artificial Night Sky Brightness](https://cires.colorado.edu/artificial-sky)
