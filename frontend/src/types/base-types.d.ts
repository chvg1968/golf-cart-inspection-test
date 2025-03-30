// Base Types for Golf Cart Inspection
export const CartPartCategory = {
  EXTERIOR: 'Exterior',
  INTERIOR: 'Interior',
  SEATS: 'Seats',
  MECHANICAL: 'Mechanical',
  OTHER: 'Other'
} as const;

// Asegurarse de que CartPartCategoryType coincida exactamente con los valores de CartPartCategory
const _checkType: CartPartCategoryType = CartPartCategory.EXTERIOR;

export type CartPartCategoryType = typeof CartPartCategory[keyof typeof CartPartCategory];

export interface Point {
  x: number;
  y: number;
}

export interface GuestInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export type CartPart = {
  id: string;
  name: string;
  category: CartPartCategoryType;
};

export type CartTypeOption = {
  id: number | string;
  name: string;
  label: string;
  diagramPath: string;
  value: string;
};

export type DamageType = {
  id: number | string;
  name: string;
  value: string;
  severity?: string;
  label: string;
};

export type Properties = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  cartNumber?: string;
  diagramType?: string;
};

export type Damage = {
  part: string;
  type: string;
  quantity: number;
  description?: string;
  category: CartPartCategoryType;
  x: number;
  y: number;
};
