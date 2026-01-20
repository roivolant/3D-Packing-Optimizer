
export interface Container {
  name: string;
  length: number;
  width: number;
  height: number;
  maxWeight: number; // in kg
}

export interface Carton {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  weight: number; // in kg
  quantity: number;
  color?: string;
}

export interface PackedItem {
  cartonId: string;
  x: number;
  y: number;
  z: number;
  color: string;
}

export interface PackingResult {
  packedItems: PackedItem[];
  totalWeight: number;
  volumeUtilization: number;
  weightUtilization: number;
  status: 'success' | 'warning' | 'error';
  message: string;
  breakdown: Record<string, { packed: number, requested: number }>;
}
