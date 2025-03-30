import type { CartPart, CartTypeOption, DamageType, Properties } from './types/base-types';

export enum CartPartCategory {
  EXTERIOR,
  SEATS,
  INTERIOR,
  MECHANICAL,
}

export const CART_PARTS: CartPart[] = [
  {
    id: 'front_bumper',
    name: 'Front Bumper',
    category: 'Exterior',
  },
  {
    id: 'rear_bumper',
    name: 'Rear Bumper',
    category: 'Exterior',
  },
  {
    id: 'left_front_fender',
    name: 'Left Front Fender',
    category: 'Exterior',
  },
  {
    id: 'right_front_fender',
    name: 'Right Front Fender',
    category: 'Exterior',
  },
  {
    id: 'left_rear_fender',
    name: 'Left Rear Fender',
    category: 'Exterior',
  },
  {
    id: 'right_rear_fender',
    name: 'Right Rear Fender',
    category: 'Exterior',
  },
  {
    id: 'left_side_panel',
    name: 'Left Side Panel',
    category: 'Exterior',
  },
  {
    id: 'right_side_panel',
    name: 'Right Side Panel',
    category: 'Exterior',
  },
  {
    id: 'windshield',
    name: 'Windshield',
    category: 'Exterior',
  },
  {
    id: 'roof',
    name: 'Roof',
    category: 'Exterior',
  },
  {
    id: 'seats_front',
    name: 'Front Seats',
    category: 'Seats',
  },
  {
    id: 'seats_rear',
    name: 'Rear Seats',
    category: 'Seats',
  },
  {
    id: 'seat_covers',
    name: 'Seat Covers',
    category: 'Seats',
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'Interior',
  },
  {
    id: 'steering_wheel',
    name: 'Steering Wheel',
    category: 'Interior',
  },
  {
    id: 'floor_mat',
    name: 'Floor Mat',
    category: 'Interior',
  },
  {
    id: 'battery',
    name: 'Battery',
    category: 'Mechanical',
  },
  {
    id: 'motor',
    name: 'Motor',
    category: 'Mechanical',
  },
  {
    id: 'controller',
    name: 'Controller',
    category: 'Mechanical',
  },
  {
    id: 'suspension_system',
    name: 'Suspension System',
    category: 'Mechanical',
  },
  {
    id: 'left_front_wheel_rim',
    name: 'Left Front Wheel Rim',
    category: 'Mechanical',
  },
  {
    id: 'right_front_wheel_rim',
    name: 'Right Front Wheel Rim',
    category: 'Mechanical',
  },
  {
    id: 'left_rear_wheel_rim',
    name: 'Left Rear Wheel Rim',
    category: 'Mechanical',
  },
  {
    id: 'right_rear_wheel_rim',
    name: 'Right Rear Wheel Rim',
    category: 'Mechanical',
  },
  {
    id: 'left_front_tire',
    name: 'Left Front Tire',
    category: 'Mechanical',
  },
  {
    id: 'right_front_tire',
    name: 'Right Front Tire',
    category: 'Mechanical',
  },
  {
    id: 'left_rear_tire',
    name: 'Left Rear Tire',
    category: 'Mechanical',
  },
  {
    id: 'right_rear_tire',
    name: 'Right Rear Tire',
    category: 'Mechanical',
  },
  {
    id: 'chassis_frame',
    name: 'Chassis Frame',
    category: 'Mechanical',
  },
  {
    id: 'left_mirror',
    name: 'Left Mirror',
    category: 'Exterior',
  },
  {
    id: 'right_mirror',
    name: 'Right Mirror',
    category: 'Exterior',
  },
  {
    id: 'front_lights',
    name: 'Front Lights',
    category: 'Exterior',
  },
  {
    id: 'rear_lights',
    name: 'Rear Lights',
    category: 'Exterior',
  },
  {
    id: 'left_door__if_applicable_',
    name: 'Left Door (if applicable)',
    category: 'Exterior',
  },
  {
    id: 'right_door__if_applicable_',
    name: 'Right Door (if applicable)',
    category: 'Exterior',
  },
  {
    id: 'roof_supports__front___rear_',
    name: 'Roof Supports (Front & Rear)',
    category: 'Exterior',
  },
  {
    id: 'grab_handles',
    name: 'Grab Handles',
    category: 'Exterior',
  },
  {
    id: 'rear_cargo_rack___rear_step',
    name: 'Rear Cargo Rack / Rear Step',
    category: 'Exterior',
  },
  {
    id: 'roof_brackets',
    name: 'Roof Brackets',
    category: 'Exterior',
  },
  {
    id: 'side_grab_bars',
    name: 'Side Grab Bars',
    category: 'Exterior',
  },
  {
    id: 'rear_safety_bar',
    name: 'Rear Safety Bar',
    category: 'Exterior',
  },
  {
    id: 'front_row___driver_seat_cushion',
    name: 'Front Row - Driver Seat Cushion',
    category: 'Seats',
  },
  {
    id: 'front_row___driver_seat_backrest',
    name: 'Front Row - Driver Seat Backrest',
    category: 'Seats',
  },
  {
    id: 'front_row___passenger_seat_cushion',
    name: 'Front Row - Passenger Seat Cushion',
    category: 'Seats',
  },
  {
    id: 'front_row___passenger_seat_backrest',
    name: 'Front Row - Passenger Seat Backrest',
    category: 'Seats',
  },
  {
    id: 'middle_row___left_seat_cushion',
    name: 'Middle Row - Left Seat Cushion',
    category: 'Seats',
  },
  {
    id: 'middle_row___left_seat_backrest',
    name: 'Middle Row - Left Seat Backrest',
    category: 'Seats',
  },
  {
    id: 'middle_row___right_seat_cushion',
    name: 'Middle Row - Right Seat Cushion',
    category: 'Seats',
  },
  {
    id: 'middle_row___right_seat_backrest',
    name: 'Middle Row - Right Seat Backrest',
    category: 'Seats',
  },
  {
    id: 'rear_row___left_seat_cushion',
    name: 'Rear Row - Left Seat Cushion',
    category: 'Seats',
  },
  {
    id: 'rear_row___left_seat_backrest',
    name: 'Rear Row - Left Seat Backrest',
    category: 'Seats',
  },
  {
    id: 'rear_row___right_seat_cushion',
    name: 'Rear Row - Right Seat Cushion',
    category: 'Seats',
  },
  {
    id: 'rear_row___right_seat_backrest',
    name: 'Rear Row - Right Seat Backrest',
    category: 'Seats',
  },
  {
    id: 'pedals',
    name: 'Pedals',
    category: 'Interior',
  },
  {
    id: 'speedometer__if_applicable_',
    name: 'Speedometer (if applicable)',
    category: 'Interior',
  },
  {
    id: 'ignition_switch___key_slot',
    name: 'Ignition Switch / Key Slot',
    category: 'Interior',
  },
  {
    id: 'horn_button',
    name: 'Horn Button',
    category: 'Interior',
  },
]

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