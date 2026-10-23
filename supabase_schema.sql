-- Smart Campus Transportation Management System (CampusGo)
-- Supabase Schema & Initial Data Migration (OAU SWEP Project)

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends Supabase auth.users or standalone)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  matric_number TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'driver', 'park_admin', 'central_admin')),
  avatar_url TEXT,
  park_scope TEXT CHECK (park_scope IN ('Campus Gate', 'SUB', 'All')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Pending approval', 'Rejected')),
  vehicle_assigned TEXT,
  permissions JSONB DEFAULT '{"update_driver_status": true, "record_vehicle_location": true, "accept_charters_on_behalf": true, "correct_records": true, "manage_bookings_other_parks": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Parks Table
CREATE TABLE IF NOT EXISTS public.parks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  status TEXT DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Unconfirmed')),
  bus_count INT DEFAULT 0,
  last_confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 3. Vehicles Table (Shared Fleet across parks)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  vehicle_number TEXT NOT NULL UNIQUE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('bus', 'tricycle')),
  current_location TEXT NOT NULL CHECK (current_location IN ('Campus Gate', 'SUB', 'En route', 'Unknown / Other')),
  en_route_destination TEXT CHECK (en_route_destination IN ('Campus Gate', 'SUB')),
  assigned_driver_id TEXT,
  assigned_driver_name TEXT,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'On trip', 'On break', 'Unconfirmed')),
  image_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'System'
);

-- 4. Drivers Table
CREATE TABLE IF NOT EXISTS public.drivers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id UUID,
  name TEXT NOT NULL,
  phone TEXT,
  vehicle_assigned TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('bus', 'tricycle')),
  shift_status TEXT NOT NULL DEFAULT 'Not checked in' CHECK (shift_status IN ('Not checked in', 'On duty', 'Shift ended')),
  operational_status TEXT NOT NULL DEFAULT 'Available' CHECK (operational_status IN ('Available', 'On trip', 'On break', 'Unconfirmed')),
  current_location TEXT NOT NULL DEFAULT 'Campus Gate',
  en_route_destination TEXT,
  shift_started_at TEXT,
  last_confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'driver',
  updated_by_role TEXT DEFAULT 'driver' CHECK (updated_by_role IN ('driver', 'admin', 'system')),
  avatar_url TEXT,
  trips_today INT DEFAULT 0,
  charters_completed INT DEFAULT 0
);

-- 5. Charter Bookings Table
CREATE TABLE IF NOT EXISTS public.charter_bookings (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_phone TEXT,
  pickup TEXT NOT NULL,
  destination TEXT NOT NULL,
  pickup_note TEXT,
  pickup_image_url TEXT,
  when_type TEXT NOT NULL DEFAULT 'Now',
  scheduled_time TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'In progress', 'Completed', 'Cancelled', 'Rejected', 'Needs review')),
  assigned_driver_id TEXT,
  assigned_driver_name TEXT,
  assigned_vehicle TEXT,
  driver_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  left_open_at_closing BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- 6. Activity Log (Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  time TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  entity TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Driver status', 'Vehicle location', 'Bookings', 'Corrections')),
  change TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Admin', 'Driver app', 'On behalf', 'Automatic', 'Student app', 'Correction'))
);

-- 7. Shift Closing Config
CREATE TABLE IF NOT EXISTS public.shift_closing_settings (
  id INT PRIMARY KEY DEFAULT 1,
  daily_closing_time TEXT DEFAULT '21:00',
  auto_flag_unresolved BOOLEAN DEFAULT TRUE,
  is_active_today BOOLEAN DEFAULT TRUE,
  last_closing_run TIMESTAMPTZ
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charter_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_closing_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated & anonymous users for demo/prototype view
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Parks" ON public.parks FOR SELECT USING (true);
CREATE POLICY "Public Read Vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Public Read Drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Public Read Charter Bookings" ON public.charter_bookings FOR SELECT USING (true);
CREATE POLICY "Public Read Activity Logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Public Read Shift Config" ON public.shift_closing_settings FOR SELECT USING (true);

-- Allow inserts and updates
CREATE POLICY "Public Insert Bookings" ON public.charter_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Bookings" ON public.charter_bookings FOR UPDATE USING (true);
CREATE POLICY "Public Mutate Activity" ON public.activity_logs FOR ALL USING (true);
CREATE POLICY "Public Mutate Drivers" ON public.drivers FOR ALL USING (true);
CREATE POLICY "Public Mutate Vehicles" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Public Mutate Parks" ON public.parks FOR ALL USING (true);
CREATE POLICY "Public Mutate Profiles" ON public.profiles FOR ALL USING (true);

-- Insert Initial Seed Data Matching UI Mockups
INSERT INTO public.parks (id, name, short_name, status, bus_count, last_confirmed_at)
VALUES 
  ('campus-gate', 'Campus Gate Car Park', 'Campus Gate', 'Confirmed', 3, NOW() - INTERVAL '4 minutes'),
  ('sub', 'SUB Car Park', 'SUB', 'Unconfirmed', 1, NOW() - INTERVAL '130 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.shift_closing_settings (id, daily_closing_time, auto_flag_unresolved, is_active_today)
VALUES (1, '21:00', true, true)
ON CONFLICT (id) DO NOTHING;
