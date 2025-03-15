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
    diagramPath: 'assets/images/4seaters.png',
    value: '4 Seaters'
  },
  { 
    id: 2, 
    name: '6 Seaters', 
    diagramPath: 'assets/images/6seaters.png',
    value: '6 Seaters'
  }
]

export const DAMAGE_TYPES: DamageType[] = [
  { 
    id: 1, 
    name: 'Scratches',
    value: 'Scratches',
    severity: 'Low'
  },
  { 
    id: 2, 
    name: 'Missing Parts',
    value: 'Missing Parts', 
    severity: 'Medium'
  },
  { 
    id: 3, 
    name: 'Damage/Bumps',
    value: 'Damage/Bumps',
    severity: 'High'
  }
]

export const PROPERTIES: Properties[] = [
  { id: 'atl_g7_casa_prestige', name: 'Atl. G7 Casa Prestige', type: 'string', required: false },
  { id: 'est_24_casa_paraiso', name: 'Est. 24 Casa Paraiso', type: 'string', required: false },
  { id: '3325_villa_clara', name: '3325 Villa Clara', type: 'string', required: false },
  { id: '7256_villa_palacio', name: '7256 Villa Palacio', type: 'string', required: false },
  { id: '10180_villa_flora', name: '10180 Villa Flora', type: 'string', required: false },
  { id: '5138_villa_paloma', name: '5138 Villa Paloma', type: 'string', required: false },
  { id: 'temporal', name: 'Temporal', type: 'string', required: false },
  { id: '2_102_villa_ocean_bliss', name: '2-102 Villa Ocean Bliss', type: 'string', required: false },
  { id: '10389_villa_tiffany', name: '10389 Villa Tiffany', type: 'string', required: false },
  { id: '2_208_ocean_haven_villa', name: '2-208 Ocean Haven Villa', type: 'string', required: false }
]