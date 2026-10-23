export type UserRole = 'student' | 'driver' | 'park_admin' | 'central_admin';

export type ParkLocation = 'Campus Gate Car Park' | 'SUB Car Park';
export type VehicleLocation = 'Campus Gate' | 'SUB' | 'En route' | 'Unknown / Other';

export type DriverShiftStatus = 'Not checked in' | 'On duty' | 'Shift ended';
export type OperationalStatus = 'Available' | 'On trip' | 'On break' | 'Unconfirmed';

export type VehicleType = 'bus' | 'tricycle';

export type CharterStatus = 
  | 'Pending' 
  | 'Accepted' 
  | 'In progress' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Rejected' 
  | 'Needs review';

export interface AdminPermissions {
  update_driver_status: boolean;
  record_vehicle_location: boolean;
  accept_charters_on_behalf: boolean;
  correct_records: boolean;
  manage_bookings_other_parks: boolean;
}

export type UserAccountStatus = 'Active' | 'Suspended' | 'Pending approval' | 'Rejected' | 'Deactivated';

export interface WarningItem {
  id: string;
  date: string;
  reason: string;
  issued_by: string;
  issued_by_role: 'park_admin' | 'central_admin';
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  matric_number?: string;
  role: UserRole;
  avatar_url?: string;
  park_scope?: 'Campus Gate' | 'SUB' | 'All';
  status: UserAccountStatus;
  permissions?: AdminPermissions;
  phone?: string;
  vehicle_assigned?: string;
  preferred_vehicle_type?: VehicleType;
  approved_by?: string;
  approved_at?: string;
  warnings?: WarningItem[];
  suspended_until?: string; // ISO date/time; undefined or null if indefinite
  suspension_reason?: string;
  suspended_by?: string;
  suspended_by_role?: 'park_admin' | 'central_admin';
  created_at: string;
}

export interface Vehicle {
  id: string;
  vehicle_number: string; // e.g. "Bus 04", "Bus 11", "Tricycle 02"
  vehicle_type: VehicleType;
  current_location: VehicleLocation;
  en_route_destination?: 'Campus Gate' | 'SUB';
  assigned_driver_id?: string;
  assigned_driver_name?: string;
  status: OperationalStatus;
  last_updated: string;
  updated_by: string;
  image_url?: string;
}

export interface DriverRecord {
  id: string;
  user_id: string;
  name: string; // e.g. "Emeka A."
  phone?: string;
  vehicle_assigned: string; // e.g. "Bus 04"
  vehicle_type: VehicleType;
  shift_status: DriverShiftStatus;
  operational_status: OperationalStatus;
  current_location: VehicleLocation;
  en_route_destination?: 'Campus Gate' | 'SUB';
  shift_started_at?: string;
  last_confirmed_at: string;
  updated_by: string; // e.g. "driver", "Folake T.", "System"
  updated_by_role: 'driver' | 'admin' | 'system';
  avatar_url?: string;
  trips_today: number;
  charters_completed: number;
}

export interface CharterBooking {
  id: string; // e.g. "BK-0147"
  requester_id: string;
  requester_name: string; // e.g. "Adaeze N."
  requester_phone?: string;
  pickup: string; // e.g. "SUB Car Park"
  destination: string; // e.g. "Main Library"
  pickup_note?: string; // Exact location note / description (e.g. "Under tree by ATM")
  pickup_image_url?: string; // Photo of where student is standing
  when_type: 'Now' | 'In 15 min' | 'Pick time';
  scheduled_time?: string;
  preferred_driver_id?: string;
  preferred_driver_name?: string;
  status: CharterStatus;
  assigned_driver_id?: string;
  assigned_driver_name?: string;
  assigned_vehicle?: string;
  driver_phone?: string; // Driver phone number for student to call
  accepted_by?: string; // e.g. "Folake T. (Park Admin on behalf of Sade I.)" or "Sade I."
  accepted_by_role?: 'driver' | 'park_admin' | 'central_admin';
  accepted_on_behalf?: boolean;
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
  left_open_at_closing?: boolean;
  notes?: string;
}

export interface ActivityLogItem {
  id: string;
  time: string; // e.g. "2:38 PM"
  timestamp: string; // ISO
  entity: string; // e.g. "Bus 04", "Emeka A.", "BK-0145"
  category: 'All' | 'Driver status' | 'Vehicle location' | 'Bookings' | 'Corrections';
  change: string; // e.g. "Location: Campus Gate → En route"
  changed_by: string; // e.g. "Folake T.", "Emeka A.", "System"
  method: 'Admin' | 'Driver app' | 'On behalf' | 'Automatic' | 'Student app' | 'Correction';
}

export interface ParkSummary {
  id: string;
  name: ParkLocation;
  short_name: 'Campus Gate' | 'SUB';
  status: 'Confirmed' | 'Unconfirmed';
  bus_count: number;
  last_confirmed_text: string;
  last_confirmed_at: string;
  en_route_count: number;
}

export interface ShiftClosingConfig {
  daily_closing_time: string; // "21:00" (9:00 PM)
  auto_flag_unresolved: boolean;
  is_active_today: boolean;
  last_closing_run?: string;
}
