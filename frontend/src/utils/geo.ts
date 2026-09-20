/**
 * Calculates the geodesic distance between two latitude/longitude points in kilometers.
 */
export function getDistanceKm(
  lat1: number | null | undefined,
  lon1: number | null | undefined,
  lat2: number | null | undefined,
  lon2: number | null | undefined
): number | null {
  if (
    lat1 === null ||
    lat1 === undefined ||
    lon1 === null ||
    lon1 === undefined ||
    lat2 === null ||
    lat2 === undefined ||
    lon2 === null ||
    lon2 === undefined ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return null;
  }

  const R = 6371; // Earth's radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Returns estimated transit time in minutes given distance in kilometers.
 * Assumes average transit speed of 35 km/h for emergency vehicle response.
 */
export function getEstimatedEtaMinutes(distanceKm: number | null): number | null {
  if (distanceKm === null || isNaN(distanceKm)) return null;
  return Math.max(Math.round((distanceKm / 35) * 60), 3);
}

/**
 * Formats distance in readable string.
 */
export function formatDistance(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return "Distance unknown";
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} meters away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}
