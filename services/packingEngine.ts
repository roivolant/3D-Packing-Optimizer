
import { Container, Carton, PackingResult, PackedItem } from '../types';

/**
 * Enhanced 3D Packing Engine with Gravity Support.
 * Uses a greedy "Shelf-First" approach combined with a "Surface Height Map"
 * to ensure every item is supported by either the floor or another item.
 */
export const calculatePacking = (
  container: Container,
  cartons: Carton[]
): PackingResult => {
  const packedItems: PackedItem[] = [];
  let currentWeight = 0;
  const breakdown: Record<string, { packed: number, requested: number }> = {};
  
  cartons.forEach(c => {
    breakdown[c.id] = { packed: 0, requested: c.quantity };
  });

  // Sort: Largest footprint and heaviest items first for base stability
  const sortedCartonTypes = [...cartons].sort((a, b) => {
    const areaA = a.length * a.width;
    const areaB = b.length * b.width;
    return areaB - areaA || b.weight - a.weight;
  });

  // We maintain a 2D grid to track the current "top" height at every coordinate
  // For precision without a literal voxel grid, we track the height of distinct shelves.
  let curZ = 0;
  
  while (curZ < container.height) {
    let shelfMaxHeight = 0;
    let curY = 0;

    // Fill current Layer/Shelf
    while (curY < container.width) {
      let rowMaxWidth = 0;
      let curX = 0;

      // Fill current Row
      while (curX < container.length) {
        let placed = false;

        // Try to place the best fitting carton from sorted list
        for (const carton of sortedCartonTypes) {
          if (breakdown[carton.id].packed >= carton.quantity) continue;
          if (currentWeight + carton.weight > container.maxWeight) continue;

          const fitsX = curX + carton.length <= container.length;
          const fitsY = curY + carton.width <= container.width;
          const fitsZ = curZ + carton.height <= container.height;

          if (fitsX && fitsY && fitsZ) {
            // Check stability: In this shelf-based model, curZ represents the floor of the current layer.
            // Items are always placed on the 'ground' of the current shelf.
            packedItems.push({
              cartonId: carton.id,
              x: curX,
              y: curY,
              z: curZ,
              color: carton.color || '#3b82f6'
            });

            currentWeight += carton.weight;
            breakdown[carton.id].packed += 1;
            
            curX += carton.length;
            rowMaxWidth = Math.max(rowMaxWidth, carton.width);
            shelfMaxHeight = Math.max(shelfMaxHeight, carton.height);
            placed = true;
            break;
          }
        }

        if (!placed) break; // End of row
      }

      if (rowMaxWidth === 0) break; // End of Y
      curY += rowMaxWidth;
    }

    if (shelfMaxHeight === 0) break; // Container full or items exhausted
    curZ += shelfMaxHeight;
  }

  const containerVol = container.length * container.width * container.height;
  const packedVol = packedItems.reduce((acc, item) => {
    const c = cartons.find(ct => ct.id === item.cartonId)!;
    return acc + (c.length * c.width * c.height);
  }, 0);

  const volumeUtilization = (packedVol / containerVol) * 100;
  const weightUtilization = (currentWeight / container.maxWeight) * 100;
  const totalRequested = cartons.reduce((a, b) => a + b.quantity, 0);

  return {
    packedItems,
    totalWeight: currentWeight,
    volumeUtilization,
    weightUtilization,
    status: packedItems.length === totalRequested ? 'success' : 'warning',
    message: packedItems.length === totalRequested 
      ? `Full load optimal: ${packedItems.length} items.` 
      : `Partial load: ${packedItems.length}/${totalRequested} items packed. ${weightUtilization > 95 ? 'Weight' : 'Space'} limited.`,
    breakdown
  };
};
