import type { CartTypeOption, DamageType, Properties } from './types/base-types';

export const GOLF_CART_TYPES: CartTypeOption[] = [
  { 
    id: 1, 
    name: '4 Seaters', 
    label: '4 Seaters',
    diagramPath: 'assets/images/4seaters.png',
    value: '4_seaters'
  },
  { 
    id: 2, 
    name: '6 Seaters', 
    label: '6 Seaters',
    diagramPath: 'assets/images/6seaters.png',
    value: '6_seaters'
  }
]

export const DAMAGE_TYPES: DamageType[] = [
  { 
    id: 1, 
    name: 'Scratches',
    value: 'Scratches',
    severity: 'Low',
    label: 'Scratches'
  },
  { 
    id: 2, 
    name: 'Missing Parts',
    value: 'Missing Parts', 
    severity: 'Medium',
    label: 'Missing Parts'
  },
  { 
    id: 3, 
    name: 'Damage/Bumps',
    value: 'Damage/Bumps',
    severity: 'High',
    label: 'Damage/Bumps'
  }
]

export const PROPERTIES: Properties[] = [
  { 
    id: 'rental_6_passenger_150', 
    name: 'Rental #150', 
    type: 'string', 
    required: false, 
    cartNumber: '150', 
    diagramType: '6seaters.png' 
  },
  { 
    id: 'rental_6_passenger_144', 
    name: 'Rental #144', 
    type: 'string', 
    required: false, 
    cartNumber: '144', 
    diagramType: '6seaters.png' 
  },
  { 
    id: 'villa_flora_10180', 
    name: 'Villa Flora 10180', 
    type: 'string', 
    required: false, 
    cartNumber: '18', 
    diagramType: '4seaters.png' 
  },
  { 
    id: 'ocean_haven_208', 
    name: 'Ocean Haven 208', 
    type: 'string', 
    required: false, 
    cartNumber: '71', 
    diagramType: '4seaters.png' 
  },
  { 
    id: 'casa_prestige_g7_4_passenger', 
    name: 'Casa Prestige G7 (4 passenger)', 
    type: 'string', 
    required: false, 
    cartNumber: '22', 
    diagramType: '4seaters.png' 
  },
  { 
    id: 'casa_prestige_g7_6_passenger', 
    name: 'Casa Prestige G7 (6 passenger)', 
    type: 'string', 
    required: false, 
    cartNumber: '193', 
    diagramType: '6seaters.png' 
  },
  { 
    id: 'villa_tiffany_10389', 
    name: 'Villa Tiffany 10389', 
    type: 'string', 
    required: false, 
    cartNumber: '136', 
    diagramType: '6seaters.png' 
  },
  { 
    id: 'villa_palacio_7256', 
    name: 'Villa Palacio 7256', 
    type: 'string', 
    required: false, 
    cartNumber: '130', 
    diagramType: '6seaters.png' 
  },
  { 
    id: 'villa_clara_3325', 
    name: 'Villa Clara 3325', 
    type: 'string', 
    required: false, 
    cartNumber: '119', 
    diagramType: '6seaters.png' 
  },
  { 
    id: 'villa_paloma_5138', 
    name: 'Villa Paloma 5138', 
    type: 'string', 
    required: false, 
    cartNumber: '101', 
    diagramType: '6seaters.png' 
  }
]