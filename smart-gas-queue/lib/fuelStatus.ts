/** Stock thresholds (liters) that determine a fuel's availability status. */
export const FUEL_STOCK_AVAILABLE = 1000;
export const FUEL_STOCK_LOW = 300;

export interface FuelStatus {
  label: string;
  /** Tailwind classes for the status dot. */
  dot: string;
  /** Tailwind classes for the status badge (text + background). */
  badge: string;
}

/**
 * Map a stock level (liters) to a human status. Single source of truth used by
 * both the admin dashboard and the fuel management cards.
 */
export function getFuelStatus(stockLiters: number): FuelStatus {
  if (stockLiters > FUEL_STOCK_AVAILABLE)
    return { label: 'Available', dot: 'bg-emerald-500', badge: 'text-emerald-700 bg-emerald-50' };
  if (stockLiters > FUEL_STOCK_LOW)
    return { label: 'Low Stock', dot: 'bg-amber-500', badge: 'text-amber-700 bg-amber-50' };
  return { label: 'Critical', dot: 'bg-red-500', badge: 'text-red-700 bg-red-50' };
}
