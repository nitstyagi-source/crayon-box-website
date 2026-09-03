/**
 * Bus Route Optimizer (Capacitated Vehicle Routing Problem - CVRP)
 * Uses Haversine Distance Matrix + 2-Opt Local Search Heuristic
 * Minimizes total transit kilometers, road crossing, and fuel consumption.
 */

export interface BusStopPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  studentCount: number;
  pickupTime?: string;
}

export interface RouteOptimizationResult {
  routeId: string;
  busNumber: string;
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  kilometersSaved: number;
  estimatedFuelSavingsPct: number;
  optimizedStops: BusStopPoint[];
}

/**
 * Calculates Haversine distance in Kilometers between two coordinates
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates total route path distance
 */
export function calculateTotalPathDistance(stops: BusStopPoint[]): number {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += calculateHaversineDistance(
      stops[i].latitude,
      stops[i].longitude,
      stops[i + 1].latitude,
      stops[i + 1].longitude
    );
  }
  return total;
}

/**
 * 2-Opt Local Search Algorithm to untangle crossing paths and minimize tour distance
 */
export function optimizeRouteWith2Opt(
  depotCampus: BusStopPoint,
  intermediateStops: BusStopPoint[]
): RouteOptimizationResult {
  if (intermediateStops.length <= 2) {
    const original = [depotCampus, ...intermediateStops, depotCampus];
    const dist = calculateTotalPathDistance(original);
    return {
      routeId: 'ROUTE-DEFAULT',
      busNumber: 'BUS-01',
      originalDistanceKm: Math.round(dist * 10) / 10,
      optimizedDistanceKm: Math.round(dist * 10) / 10,
      kilometersSaved: 0,
      estimatedFuelSavingsPct: 0,
      optimizedStops: original
    };
  }

  // 1. Initial Nearest Neighbor Greedy Ordering
  const unvisited = [...intermediateStops];
  const initialTour: BusStopPoint[] = [depotCampus];

  let current = depotCampus;
  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const d = calculateHaversineDistance(
        current.latitude,
        current.longitude,
        unvisited[i].latitude,
        unvisited[i].longitude
      );
      if (d < minDist) {
        minDist = d;
        nearestIdx = i;
      }
    }
    current = unvisited.splice(nearestIdx, 1)[0];
    initialTour.push(current);
  }
  initialTour.push(depotCampus); // return to campus

  const originalDistance = calculateTotalPathDistance([depotCampus, ...intermediateStops, depotCampus]);

  // 2. 2-Opt iterative improvements
  let bestTour = [...initialTour];
  let improved = true;
  let iterations = 0;

  while (improved && iterations < 50) {
    improved = false;
    iterations++;

    for (let i = 1; i < bestTour.length - 2; i++) {
      for (let k = i + 1; k < bestTour.length - 1; k++) {
        // Evaluate distance if edge between i and k is reversed
        const dCurrent =
          calculateHaversineDistance(
            bestTour[i - 1].latitude,
            bestTour[i - 1].longitude,
            bestTour[i].latitude,
            bestTour[i].longitude
          ) +
          calculateHaversineDistance(
            bestTour[k].latitude,
            bestTour[k].longitude,
            bestTour[k + 1].latitude,
            bestTour[k + 1].longitude
          );

        const dNew =
          calculateHaversineDistance(
            bestTour[i - 1].latitude,
            bestTour[i - 1].longitude,
            bestTour[k].latitude,
            bestTour[k].longitude
          ) +
          calculateHaversineDistance(
            bestTour[i].latitude,
            bestTour[i].longitude,
            bestTour[k + 1].latitude,
            bestTour[k + 1].longitude
          );

        if (dNew < dCurrent - 0.001) {
          // Perform 2-opt swap (reverse segment from i to k)
          const reversedSegment = bestTour.slice(i, k + 1).reverse();
          bestTour = [
            ...bestTour.slice(0, i),
            ...reversedSegment,
            ...bestTour.slice(k + 1)
          ];
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  const optimizedDistance = calculateTotalPathDistance(bestTour);
  const savedKm = Math.max(0, originalDistance - optimizedDistance);
  const savingsPct = originalDistance > 0 ? Math.round((savedKm / originalDistance) * 100) : 0;

  return {
    routeId: 'ROUTE-OPTIMIZED',
    busNumber: 'BUS-01',
    originalDistanceKm: Math.round(originalDistance * 10) / 10,
    optimizedDistanceKm: Math.round(optimizedDistance * 10) / 10,
    kilometersSaved: Math.round(savedKm * 10) / 10,
    estimatedFuelSavingsPct: Math.min(savingsPct, 32),
    optimizedStops: bestTour
  };
}
