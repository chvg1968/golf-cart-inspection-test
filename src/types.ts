export interface Property {
  id: string;
  name: string;
  type: string;
  required: boolean;
  cartNumber: string;
  diagramType: string;
  cartType?: string;
}

export interface Point {
  x: number;
  y: number;
  color: string;
  size: number;
  type?: 'x' | 'check';
}

export interface DiagramData {
  points: Point[];
  width: number;
  height: number;
  diagramType: string;
}

export interface DiagramMarks {
  id: string;
  diagram_name: string;
  points: Point[];
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  inspection_date: string;
  property: string;
  cart_type: string;
  cart_number: string;
  observations: string;
  diagram_data?: DiagramData;
  diagram_marks_id?: string;
  diagram_marks?: DiagramMarks;
  signature_data?: string;
  status: 'pending' | 'completed';
  created_at: string;
  completed_at?: string;
}

export interface FormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  inspectionDate: string;
  property: string;
  cartType?: string;
  cartNumber: string;
  observations: string;
}

export const PROPERTIES: Property[] = [
  { 
    id: 'rental_6_passenger_150', 
    name: 'Rental #150', 
    type: 'string', 
    required: false, 
    cartNumber: '150', 
    diagramType: 'rental_150.jpg',
    cartType: '6-Seater'
  },
  { 
    id: 'rental_6_passenger_144', 
    name: 'Rental #144', 
    type: 'string', 
    required: false, 
    cartNumber: '144', 
    diagramType: 'rental_144.jpg',
    cartType: '6-Seater'
  },
  { 
    id: 'villa_flora_10180', 
    name: 'Villa Flora 10180', 
    type: 'string', 
    required: false, 
    cartNumber: '18', 
    diagramType: 'villaflora_10180.jpg',
    cartType: '4-Seater'  
  },
  { 
    id: 'ocean_haven_208', 
    name: 'Ocean Haven 208', 
    type: 'string', 
    required: false, 
    cartNumber: '71', 
    diagramType: 'oceanhaven_208.jpg',
    cartType: '4-Seater'

  },
  { 
    id: 'casa_prestige_g7_4_passenger', 
    name: 'Casa Prestige G7 (4 passenger)', 
    type: 'string', 
    required: false, 
    cartNumber: '22', 
    diagramType: 'casaprestige_4.jpg',
    cartType: '4-Seater'
  },
  { 
    id: 'casa_prestige_g7_6_passenger', 
    name: 'Casa Prestige G7 (6 passenger)', 
    type: 'string', 
    required: false, 
    cartNumber: '193', 
    diagramType: 'casaprestige_6.jpg',
    cartType: '6-Seater'
  },
  { 
    id: 'villa_tiffany_10389', 
    name: 'Villa Tiffany 10389', 
    type: 'string', 
    required: false, 
    cartNumber: '136', 
    diagramType: 'villatiffany_10389.jpg',
    cartType: '6-Seater'
  },
  { 
    id: 'villa_palacio_7256', 
    name: 'Villa Palacio 7256', 
    type: 'string', 
    required: false, 
    cartNumber: '130', 
    diagramType: 'villapalacio_7256.jpg',
    cartType: '6-Seater'
  },
  { 
    id: 'villa_clara_3325', 
    name: 'Villa Clara 3325', 
    type: 'string', 
    required: false, 
    cartNumber: '119', 
    diagramType: 'villaclara_3325.jpg',
    cartType: '6-Seater'
  },
  { 
    id: 'apt_2_102_72', 
    name: 'Ocean Bliss Villa 2-102', 
    type: 'string', 
    required: false, 
    cartNumber: '72', 
    diagramType: 'apt2102_72.jpg',
    cartType: '4-Seater'
  },
  { 
    id: 'villa_paloma_5138', 
    name: 'Villa Paloma 5138', 
    type: 'string', 
    required: false, 
    cartNumber: '101', 
    diagramType: 'villapaloma_5138.jpg',
    cartType: '6-Seater'
  },
  { 
    id: 'ocean_sound_2_103', 
    name: 'Ocean Sound Villa 2-103', 
    type: 'string', 
    required: false, 
    cartNumber: '174', 
    diagramType: 'oceansound_2_103.jpg',
    cartType: '4-Seater'
  },
  { 
    id: 'ocean_grace_2_105', 
    name: 'Ocean Grace Villa 2-105', 
    type: 'string', 
    required: false, 
    cartNumber: '76', 
    diagramType: 'oceangrace_2_105.jpg',
    cartType: '4-Seater'
  },
  { 
    id: 'ocean_serenity_2_101', 
    name: 'Ocean Serenity Villa 2-101', 
    type: 'string', 
    required: false, 
    cartNumber: '104', 
    diagramType: 'oceanserenity_2_101.jpg',
    cartType: '6-Seater'
  },
  { 
    id: 'ocean_view_2_315', 
    name: 'Ocean View Villa 2-315', 
    type: 'string', 
    required: false, 
    cartNumber: '315', 
    diagramType: 'oceanview_2_315.jpg',
    cartType: '4-Seater'
  }
];

export const diagramNameToId = {
  "rental_150": "rental_6_passenger_150",
  "rental_144": "rental_6_passenger_144",
  "villaflora_10180": "villa_flora_10180",
  "oceanhaven_208": "ocean_haven_208",
  "casaprestige_4": "casa_prestige_g7_4_passenger",
  "casaprestige_6": "casa_prestige_g7_6_passenger",
  "villatiffany_10389": "villa_tiffany_10389",
  "villapalacio_7256": "villa_palacio_7256",
  "villaclara_3325": "villa_clara_3325",
  "apt2102_72": "apt_2_102_72",
  "villapaloma_5138": "villa_paloma_5138",
  "ocean_sound_2_103": "ocean_sound_2_103",
  "ocean_grace_2_105": "ocean_grace_2_105",
  "ocean_serenity_2_101": "ocean_serenity_2_101",
  "ocean_view_2_315": "ocean_view_2_315"
};