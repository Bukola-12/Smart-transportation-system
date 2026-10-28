import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ParkSummary, 
  DriverRecord, 
  Vehicle, 
  CharterBooking, 
  ActivityLogItem, 
  ShiftClosingConfig,
  OperationalStatus,
  VehicleLocation,
  CharterStatus,
  UserProfile,
  VehicleType
} from '../types';
import { 
  INITIAL_PARKS, 
  INITIAL_DRIVERS, 
  INITIAL_VEHICLES, 
  INITIAL_BOOKINGS, 
  INITIAL_ACTIVITY_LOGS, 
  INITIAL_SHIFT_CONFIG 
} from '../data/mockData';

interface AppContextType {
  parks: ParkSummary[];
  drivers: DriverRecord[];
  vehicles: Vehicle[];
  bookings: CharterBooking[];
  activityLogs: ActivityLogItem[];
  shiftConfig: ShiftClosingConfig;
  
  // Counts & stats
  activeDriversCount: number;
  availableBusesCount: number;
  activeChartersCount: number;
  needsReviewCount: number;
  
  // Actions
  updateDriverOperationalStatus: (
    driverId: string, 
    newStatus: OperationalStatus, 
    actorName: string, 
    method: 'Driver app' | 'Admin' | 'On behalf' | 'Automatic' | 'Correction'
  ) => void;
  confirmDriverStatus: (driverId: string, actorName: string) => void;
  driverCheckIn: (
    driverId: string, 
    location: VehicleLocation, 
    actorName: string, 
    method: 'Driver app' | 'On behalf' | 'Admin'
  ) => void;
  driverEndShift: (
    driverId: string, 
    actorName: string, 
    method: 'Driver app' | 'On behalf' | 'Admin'
  ) => void;
  updateVehicleLocation: (
    vehicleId: string, 
    newLocation: VehicleLocation, 
    destination: 'Campus Gate' | 'SUB' | undefined, 
    actorName: string, 
    method: 'Admin' | 'Driver app' | 'Correction'
  ) => void;
  
  // Charter Actions
  submitCharterRequest: (data: {
    requesterId: string;
    requesterName: string;
    requesterPhone?: string;
    pickup: string;
    destination: string;
    pickupNote?: string;
    pickupImageUrl?: string;
    whenType: 'Now' | 'In 15 min' | 'Pick time';
    scheduledTime?: string;
    preferredDriverId?: string;
    preferredDriverName?: string;
    passengerCount?: number;
  }) => CharterBooking;
  acceptCharterRequest: (
    bookingId: string,
    driverId: string,
    actorName: string,
    actorRole?: 'driver' | 'park_admin' | 'central_admin'
  ) => { success: boolean; error?: string };
  acceptCharterOnBehalf: (
    bookingId: string,
    driverId: string,
    adminName: string,
    adminRole: 'park_admin' | 'central_admin'
  ) => { success: boolean; driverPhone?: string; driverName?: string; error?: string };
  rejectCharterRequest: (bookingId: string, driverId: string, actorName: string) => void;
  startCharterTrip: (bookingId: string, actorName: string) => void;
  completeCharterTrip: (bookingId: string, actorName: string) => void;
  cancelCharterRequest: (bookingId: string, actorName: string, isStudent?: boolean) => void;
  resolveFlaggedBooking: (bookingId: string, resolution: 'Completed' | 'Cancelled', notes: string, actorName: string) => void;

  // Shift Closing
  updateShiftConfig: (updates: Partial<ShiftClosingConfig>) => void;
  runDailyShiftClosing: (actorName: string) => { closedShifts: number; flaggedTrips: number };

  // Export
  exportActivityLogCSV: () => void;
  exportBookingsCSV: () => void;

  // Add vehicle / driver helper
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'last_updated'>, actorName: string) => void;
  addDriver: (driver: Omit<DriverRecord, 'id' | 'last_confirmed_at' | 'trips_today' | 'charters_completed'>, actorName: string) => void;
  approveAndEnrollDriver: (
    user: UserProfile,
    vehicleAssigned: string,
    vehicleType: VehicleType,
    parkLocation: VehicleLocation,
    actorName: string
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Core State with LocalStorage Persistence & Freshness Auto-Sync
  const [drivers, setDrivers] = useState<DriverRecord[]>(() => {
    try {
      const version = localStorage.getItem('campusgo_storage_version');
      if (version !== 'campusgo_v3_live') {
        localStorage.setItem('campusgo_storage_version', 'campusgo_v3_live');
        return INITIAL_DRIVERS;
      }
      const saved = localStorage.getItem('campusgo_drivers');
      if (saved) {
        const parsed: DriverRecord[] = JSON.parse(saved);
        // If stored confirmation timestamps are from an old session (> 12 hours old, e.g. 116h ago), refresh to initial live drivers
        const isStaleSession = parsed.some(
          (d) => d.shift_status === 'On duty' && Date.now() - new Date(d.last_confirmed_at).getTime() > 12 * 60 * 60 * 1000
        );
        if (isStaleSession) {
          return INITIAL_DRIVERS;
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_DRIVERS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const version = localStorage.getItem('campusgo_storage_version');
      if (version !== 'campusgo_v3_live') {
        return INITIAL_VEHICLES;
      }
      const saved = localStorage.getItem('campusgo_vehicles');
      if (saved) {
        const parsed: Vehicle[] = JSON.parse(saved);
        const isStaleSession = parsed.some(
          (v) => v.last_updated && (v.last_updated.includes('h') || v.last_updated.includes('day'))
        );
        if (isStaleSession) {
          return INITIAL_VEHICLES;
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_VEHICLES;
  });

  const [bookings, setBookings] = useState<CharterBooking[]>(() => {
    const saved = localStorage.getItem('campusgo_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    const saved = localStorage.getItem('campusgo_activity');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [shiftConfig, setShiftConfig] = useState<ShiftClosingConfig>(() => {
    const saved = localStorage.getItem('campusgo_shift_config');
    return saved ? JSON.parse(saved) : INITIAL_SHIFT_CONFIG;
  });

  // LocalStorage synchronizers
  useEffect(() => {
    localStorage.setItem('campusgo_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('campusgo_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('campusgo_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('campusgo_activity', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('campusgo_shift_config', JSON.stringify(shiftConfig));
  }, [shiftConfig]);

  // Helper to log activity
  const logActivity = useCallback((
    entity: string,
    category: ActivityLogItem['category'],
    change: string,
    changed_by: string,
    method: ActivityLogItem['method']
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: timeStr,
      timestamp: now.toISOString(),
      entity,
      category,
      change,
      changed_by,
      method,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  }, []);

  // 2. Automated Freshness Checker (FR-09 & FR-13: Status stale > 2 hours -> Unconfirmed)
  useEffect(() => {
    const checkFreshness = () => {
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
      const now = Date.now();

      setDrivers((prev) =>
        prev.map((driver) => {
          if (driver.shift_status === 'On duty' && driver.operational_status !== 'Unconfirmed') {
            const lastTime = new Date(driver.last_confirmed_at).getTime();
            if (now - lastTime > TWO_HOURS_MS) {
              logActivity(
                driver.name,
                'Driver status',
                'Status marked Unconfirmed (> 2h without update)',
                'System',
                'Automatic'
              );
              return {
                ...driver,
                operational_status: 'Unconfirmed',
                updated_by: 'System',
                updated_by_role: 'system',
              };
            }
          }
          return driver;
        })
      );
    };

    const interval = setInterval(checkFreshness, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [logActivity]);

  // 3. Dynamic Parks summary calculated from actual vehicle locations & availability (FR-14, FR-15, FR-17)
  const parks = useMemo<ParkSummary[]>(() => {
    // Campus Gate buses
    const cgBuses = vehicles.filter(
      (v) => v.vehicle_type === 'bus' && v.current_location === 'Campus Gate'
    );
    const cgDrivers = drivers.filter(
      (d) => d.vehicle_type === 'bus' && d.current_location === 'Campus Gate' && d.shift_status === 'On duty'
    );
    const cgHasStale = cgDrivers.some((d) => d.operational_status === 'Unconfirmed');

    // SUB buses
    const subBuses = vehicles.filter(
      (v) => v.vehicle_type === 'bus' && v.current_location === 'SUB'
    );
    const subDrivers = drivers.filter(
      (d) => d.vehicle_type === 'bus' && d.current_location === 'SUB' && d.shift_status === 'On duty'
    );
    const subHasStale = subDrivers.some((d) => d.operational_status === 'Unconfirmed');

    // En route count to SUB or Campus Gate
    const enRouteToSub = vehicles.filter(
      (v) => v.vehicle_type === 'bus' && v.current_location === 'En route' && v.en_route_destination === 'SUB'
    ).length;

    const enRouteToCg = vehicles.filter(
      (v) => v.vehicle_type === 'bus' && v.current_location === 'En route' && v.en_route_destination === 'Campus Gate'
    ).length;

    return [
      {
        id: 'campus-gate',
        name: 'Campus Gate Car Park',
        short_name: 'Campus Gate',
        status: cgHasStale ? 'Unconfirmed' : 'Confirmed',
        bus_count: cgBuses.length,
        last_confirmed_text: cgHasStale ? 'Last confirmed 2 h 10 min ago' : 'Confirmed 4 min ago',
        last_confirmed_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        en_route_count: enRouteToCg,
      },
      {
        id: 'sub',
        name: 'SUB Car Park',
        short_name: 'SUB',
        status: subHasStale ? 'Unconfirmed' : 'Confirmed',
        bus_count: subBuses.length,
        last_confirmed_text: subHasStale ? 'Last confirmed 2 h 10 min ago' : 'Confirmed 15 min ago',
        last_confirmed_at: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
        en_route_count: enRouteToSub,
      },
    ];
  }, [vehicles, drivers]);

  // Overall metric counts
  const activeDriversCount = useMemo(() => {
    return drivers.filter((d) => d.shift_status === 'On duty').length;
  }, [drivers]);

  const availableBusesCount = useMemo(() => {
    return vehicles.filter(
      (v) => v.vehicle_type === 'bus' && v.status === 'Available' && v.current_location !== 'En route'
    ).length;
  }, [vehicles]);

  const activeChartersCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'Accepted' || b.status === 'In progress').length;
  }, [bookings]);

  const needsReviewCount = useMemo(() => {
    const unconfirmedDrivers = drivers.filter(
      (d) => d.shift_status === 'On duty' && d.operational_status === 'Unconfirmed'
    ).length;
    const flaggedBookings = bookings.filter((b) => b.status === 'Needs review').length;
    return unconfirmedDrivers + flaggedBookings;
  }, [drivers, bookings]);

  // 4. Update Driver Operational Status (FR-07, FR-08, FR-10)
  const updateDriverOperationalStatus = (
    driverId: string,
    newStatus: OperationalStatus,
    actorName: string,
    method: 'Driver app' | 'Admin' | 'On behalf' | 'Automatic' | 'Correction'
  ) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          const oldStatus = d.operational_status;
          logActivity(
            d.name,
            'Driver status',
            `Status: ${oldStatus} → ${newStatus}`,
            actorName,
            method
          );
          return {
            ...d,
            operational_status: newStatus,
            current_location: newStatus === 'On trip' ? 'En route' : d.current_location,
            last_confirmed_at: new Date().toISOString(),
            updated_by: actorName,
            updated_by_role: method === 'Driver app' ? 'driver' : 'admin',
          };
        }
        return d;
      })
    );

    // Also sync the assigned vehicle status and location
    const targetDriver = drivers.find((d) => d.id === driverId);
    if (targetDriver) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.vehicle_number === targetDriver.vehicle_assigned || v.assigned_driver_id === targetDriver.id) {
            return {
              ...v,
              status: newStatus,
              current_location: newStatus === 'On trip' ? 'En route' : v.current_location,
              last_updated: 'Just now',
              updated_by: actorName,
            };
          }
          return v;
        })
      );
    }
  };

  // Confirm driver status (refreshes freshness timestamp)
  const confirmDriverStatus = (driverId: string, actorName: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          logActivity(
            d.name,
            'Driver status',
            `Status confirmed: ${d.operational_status}`,
            actorName,
            'Driver app'
          );
          return {
            ...d,
            last_confirmed_at: new Date().toISOString(),
            operational_status: d.operational_status === 'Unconfirmed' ? 'Available' : d.operational_status,
            updated_by: actorName,
          };
        }
        return d;
      })
    );
  };

  // Driver Check In (FR-05, FR-08)
  const driverCheckIn = (
    driverId: string,
    location: VehicleLocation,
    actorName: string,
    method: 'Driver app' | 'On behalf' | 'Admin'
  ) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetDriver = drivers.find((d) => d.id === driverId);

    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          logActivity(
            d.name,
            'Driver status',
            `Shift: ${d.shift_status} → On duty (At ${location})`,
            actorName,
            method
          );
          return {
            ...d,
            shift_status: 'On duty',
            operational_status: 'Available',
            current_location: location,
            shift_started_at: nowTime,
            last_confirmed_at: new Date().toISOString(),
            updated_by: actorName,
          };
        }
        return d;
      })
    );

    // Also sync the assigned vehicle so park count and availability update dynamically
    if (targetDriver) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.vehicle_number === targetDriver.vehicle_assigned || v.assigned_driver_id === targetDriver.id) {
            return {
              ...v,
              current_location: location,
              status: 'Available',
              assigned_driver_id: targetDriver.id,
              assigned_driver_name: targetDriver.name,
              last_updated: 'Just now',
              updated_by: actorName,
            };
          }
          return v;
        })
      );
    }
  };

  // Driver End Shift (FR-06)
  const driverEndShift = (
    driverId: string,
    actorName: string,
    method: 'Driver app' | 'On behalf' | 'Admin'
  ) => {
    const targetDriver = drivers.find((d) => d.id === driverId);

    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          logActivity(
            d.name,
            'Driver status',
            `Shift: ${d.shift_status} → Shift ended`,
            actorName,
            method
          );
          return {
            ...d,
            shift_status: 'Shift ended',
            operational_status: 'Unconfirmed',
            last_confirmed_at: new Date().toISOString(),
            updated_by: actorName,
          };
        }
        return d;
      })
    );

    // Also sync the assigned vehicle so it goes offline/unconfirmed
    if (targetDriver) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.vehicle_number === targetDriver.vehicle_assigned || v.assigned_driver_id === targetDriver.id) {
            return {
              ...v,
              status: 'Unconfirmed',
              last_updated: 'Just now',
              updated_by: actorName,
            };
          }
          return v;
        })
      );
    }
  };

  // Update Vehicle Location (FR-15, FR-16, FR-17)
  const updateVehicleLocation = (
    vehicleId: string,
    newLocation: VehicleLocation,
    destination: 'Campus Gate' | 'SUB' | undefined,
    actorName: string,
    method: 'Admin' | 'Driver app' | 'Correction'
  ) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const oldLoc = v.current_location;
          const changeText =
            newLocation === 'En route'
              ? `Location: ${oldLoc} → En route to ${destination || 'Destination'}`
              : method === 'Correction'
              ? `Correction: ${oldLoc} → ${newLocation}`
              : `Location: ${oldLoc} → ${newLocation}`;

          logActivity(
            v.vehicle_number,
            method === 'Correction' ? 'Corrections' : 'Vehicle location',
            changeText,
            actorName,
            method
          );

          return {
            ...v,
            current_location: newLocation,
            en_route_destination: destination,
            last_updated: 'Just now',
            updated_by: actorName,
          };
        }
        return v;
      })
    );

    // If a driver is assigned to this vehicle, sync their location too
    const veh = vehicles.find((v) => v.id === vehicleId);
    if (veh) {
      setDrivers((prev) =>
        prev.map((d) => {
          if ((veh.assigned_driver_id && d.id === veh.assigned_driver_id) || d.vehicle_assigned === veh.vehicle_number) {
            return {
              ...d,
              current_location: newLocation,
              en_route_destination: destination,
              last_confirmed_at: new Date().toISOString(),
            };
          }
          return d;
        })
      );
    }
  };

  // 5. Submit Charter Request (FR-25, FR-26)
  const submitCharterRequest = (data: {
    requesterId: string;
    requesterName: string;
    requesterPhone?: string;
    pickup: string;
    destination: string;
    pickupNote?: string;
    pickupImageUrl?: string;
    whenType: 'Now' | 'In 15 min' | 'Pick time';
    scheduledTime?: string;
    preferredDriverId?: string;
    preferredDriverName?: string;
    passengerCount?: number;
  }): CharterBooking => {
    const bookingNumber = Math.floor(100 + Math.random() * 900);
    const bookingId = `BK-0${bookingNumber}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newBooking: CharterBooking = {
      id: bookingId,
      requester_id: data.requesterId,
      requester_name: data.requesterName,
      requester_phone: data.requesterPhone,
      pickup: data.pickup,
      destination: data.destination,
      pickup_note: data.pickupNote,
      pickup_image_url: data.pickupImageUrl,
      when_type: data.whenType,
      scheduled_time: data.scheduledTime,
      preferred_driver_id: data.preferredDriverId,
      preferred_driver_name: data.preferredDriverName,
      passenger_count: data.passengerCount || 1,
      status: 'Pending',
      created_at: timeStr,
    };

    setBookings((prev) => [newBooking, ...prev]);
    logActivity(
      bookingId,
      'Bookings',
      `Request created: ${data.pickup} → ${data.destination} (${data.passengerCount || 1} passenger${(data.passengerCount || 1) > 1 ? 's' : ''})${data.preferredDriverName ? ` (Preferred: ${data.preferredDriverName})` : ''}`,
      data.requesterName,
      'Student app'
    );

    return newBooking;
  };

  // Accept Charter Request (FR-27, FR-28, FR-30 - Prevent conflicting bookings!)
  const acceptCharterRequest = (
    bookingId: string,
    driverId: string,
    actorName: string,
    actorRole: 'driver' | 'park_admin' | 'central_admin' = 'driver'
  ): { success: boolean; error?: string } => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) {
      return { success: false, error: 'Driver not found.' };
    }

    // FR-30: Check if driver already has an active overlapping booking
    const activeBooking = bookings.find(
      (b) => b.assigned_driver_id === driverId && (b.status === 'Accepted' || b.status === 'In progress')
    );
    if (activeBooking) {
      return {
        success: false,
        error: `Cannot accept: Driver ${driver.name} is already busy with trip ${activeBooking.id} (${activeBooking.pickup} → ${activeBooking.destination}). Complete or cancel it first.`,
      };
    }

    const acceptedByText = actorRole === 'driver'
      ? driver.name
      : `${actorName} (${actorRole === 'park_admin' ? 'Park Admin' : 'Central Admin'} on behalf of ${driver.name})`;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          logActivity(
            bookingId,
            'Bookings',
            actorRole === 'driver'
              ? `Pending → Accepted (Assigned to ${driver.name})`
              : `Pending → Accepted by ${actorName} on behalf of ${driver.name}`,
            actorName,
            actorRole === 'driver' ? 'Driver app' : 'On behalf'
          );
          return {
            ...b,
            status: 'Accepted',
            assigned_driver_id: driver.id,
            assigned_driver_name: driver.name,
            assigned_vehicle: driver.vehicle_assigned,
            driver_phone: driver.phone || '08056789012',
            accepted_by: acceptedByText,
            accepted_by_role: actorRole,
            accepted_on_behalf: actorRole !== 'driver',
            accepted_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return b;
      })
    );

    // Update driver operational status to On trip
    updateDriverOperationalStatus(
      driverId,
      'On trip',
      actorName,
      actorRole === 'driver' ? 'Driver app' : 'On behalf'
    );
    return { success: true };
  };

  // Accept Charter on Behalf of an on-shift driver (Park Admin & Central Admin)
  const acceptCharterOnBehalf = (
    bookingId: string,
    driverId: string,
    adminName: string,
    adminRole: 'park_admin' | 'central_admin'
  ): { success: boolean; driverPhone?: string; driverName?: string; error?: string } => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) {
      return { success: false, error: 'Driver record not found.' };
    }

    if (driver.shift_status !== 'On duty') {
      return {
        success: false,
        error: `Cannot accept on behalf: Driver ${driver.name} is currently "${driver.shift_status}". Drivers must be checked in and "On duty" to be assigned charters.`,
      };
    }

    const activeBooking = bookings.find(
      (b) => b.assigned_driver_id === driverId && (b.status === 'Accepted' || b.status === 'In progress')
    );
    if (activeBooking) {
      return {
        success: false,
        error: `Cannot assign: Driver ${driver.name} is already busy with booking ${activeBooking.id} (${activeBooking.pickup} → ${activeBooking.destination}).`,
      };
    }

    const roleTitle = adminRole === 'park_admin' ? 'Park Admin' : 'Central Admin';
    const acceptedByLabel = `${adminName} (${roleTitle} on behalf of ${driver.name})`;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          logActivity(
            bookingId,
            'Bookings',
            `Accepted by ${adminName} (${roleTitle}) on behalf of ${driver.name} (${driver.vehicle_assigned})`,
            adminName,
            'On behalf'
          );
          return {
            ...b,
            status: 'Accepted',
            assigned_driver_id: driver.id,
            assigned_driver_name: driver.name,
            assigned_vehicle: driver.vehicle_assigned,
            driver_phone: driver.phone || '08056789012',
            accepted_by: acceptedByLabel,
            accepted_by_role: adminRole,
            accepted_on_behalf: true,
            accepted_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return b;
      })
    );

    updateDriverOperationalStatus(driverId, 'On trip', adminName, 'On behalf');

    return {
      success: true,
      driverPhone: driver.phone || '08056789012',
      driverName: driver.name,
    };
  };

  // Reject Charter Request
  const rejectCharterRequest = (bookingId: string, driverId: string, actorName: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          logActivity(
            bookingId,
            'Bookings',
            `Pending → Rejected by ${actorName}`,
            actorName,
            'Driver app'
          );
          return {
            ...b,
            status: 'Rejected',
          };
        }
        return b;
      })
    );
  };

  // Start Trip
  const startCharterTrip = (bookingId: string, actorName: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          logActivity(
            bookingId,
            'Bookings',
            'Accepted → In progress',
            actorName,
            'Driver app'
          );
          return {
            ...b,
            status: 'In progress',
          };
        }
        return b;
      })
    );
  };

  // Complete Trip
  const completeCharterTrip = (bookingId: string, actorName: string) => {
    let assignedDriverId: string | undefined;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          assignedDriverId = b.assigned_driver_id;
          logActivity(
            bookingId,
            'Bookings',
            'In progress → Completed',
            actorName,
            'Driver app'
          );
          return {
            ...b,
            status: 'Completed',
            completed_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return b;
      })
    );

    // Free up driver
    if (assignedDriverId) {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === assignedDriverId) {
            return {
              ...d,
              operational_status: 'Available',
              charters_completed: d.charters_completed + 1,
              trips_today: d.trips_today + 1,
              last_confirmed_at: new Date().toISOString(),
            };
          }
          return d;
        })
      );
    }
  };

  // Cancel Charter Request
  const cancelCharterRequest = (bookingId: string, actorName: string, isStudent = true) => {
    let assignedDriverId: string | undefined;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          assignedDriverId = b.assigned_driver_id;
          logActivity(
            bookingId,
            'Bookings',
            `${b.status} → Cancelled`,
            actorName,
            isStudent ? 'Student app' : 'Admin'
          );
          return {
            ...b,
            status: 'Cancelled',
          };
        }
        return b;
      })
    );

    if (assignedDriverId) {
      updateDriverOperationalStatus(assignedDriverId, 'Available', actorName, 'Admin');
    }
  };

  // Resolve Flagged Booking (FR-12)
  const resolveFlaggedBooking = (
    bookingId: string,
    resolution: 'Completed' | 'Cancelled',
    notes: string,
    actorName: string
  ) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          logActivity(
            bookingId,
            'Corrections',
            `Resolved flagged booking: ${b.status} → ${resolution} (${notes})`,
            actorName,
            'Correction'
          );
          return {
            ...b,
            status: resolution,
            left_open_at_closing: false,
            notes: notes ? `${b.notes || ''} [Resolved by ${actorName}: ${notes}]` : b.notes,
          };
        }
        return b;
      })
    );
  };

  // 6. Shift Closing Workflow (FR-11, FR-12)
  const updateShiftConfig = (updates: Partial<ShiftClosingConfig>) => {
    setShiftConfig((prev) => ({ ...prev, ...updates }));
  };

  const runDailyShiftClosing = (actorName: string) => {
    // 1. End on-duty driver shifts
    let closedShifts = 0;
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.shift_status === 'On duty') {
          closedShifts++;
          return {
            ...d,
            shift_status: 'Shift ended',
            operational_status: 'Available',
          };
        }
        return d;
      })
    );

    // 2. Unresolved trips are NOT marked completed; they are flagged as Needs review (FR-12)
    let flaggedTrips = 0;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.status === 'Accepted' || b.status === 'In progress' || b.status === 'Pending') {
          flaggedTrips++;
          logActivity(
            b.id,
            'Bookings',
            `Left open at closing → Flagged as Needs review`,
            actorName,
            'Automatic'
          );
          return {
            ...b,
            status: 'Needs review',
            left_open_at_closing: true,
            notes: 'Left open at daily closing. Flagged for administrative review (FR-12).',
          };
        }
        return b;
      })
    );

    logActivity(
      'System Closing',
      'Corrections',
      `Shift closing executed: ${closedShifts} shifts ended, ${flaggedTrips} trips flagged for review`,
      actorName,
      'Automatic'
    );

    setShiftConfig((prev) => ({
      ...prev,
      last_closing_run: new Date().toISOString(),
    }));

    return { closedShifts, flaggedTrips };
  };

  // 7. CSV Export Functions
  const exportActivityLogCSV = () => {
    const headers = ['Time', 'Timestamp', 'Entity', 'Category', 'Change', 'Changed By', 'Method'];
    const rows = activityLogs.map((l) => [
      `"${l.time}"`,
      `"${l.timestamp}"`,
      `"${l.entity}"`,
      `"${l.category}"`,
      `"${l.change.replace(/"/g, '""')}"`,
      `"${l.changed_by}"`,
      `"${l.method}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campusgo_activity_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBookingsCSV = () => {
    const headers = ['Booking ID', 'Requester', 'Pickup', 'Destination', 'When', 'Driver', 'Vehicle', 'Status', 'Time'];
    const rows = bookings.map((b) => [
      `"${b.id}"`,
      `"${b.requester_name}"`,
      `"${b.pickup}"`,
      `"${b.destination}"`,
      `"${b.when_type}"`,
      `"${b.assigned_driver_name || 'Not assigned'}"`,
      `"${b.assigned_vehicle || '-'}"`,
      `"${b.status}"`,
      `"${b.created_at}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campusgo_bookings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Vehicle
  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'last_updated'>, actorName: string) => {
    const newVeh: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      last_updated: 'Just now',
    };
    setVehicles((prev) => [...prev, newVeh]);
    logActivity(
      newVeh.vehicle_number,
      'Vehicle location',
      `Vehicle added: ${newVeh.vehicle_number} (${newVeh.vehicle_type}) at ${newVeh.current_location}`,
      actorName,
      'Admin'
    );
  };

  // Add Driver
  const addDriver = (
    driverData: Omit<DriverRecord, 'id' | 'last_confirmed_at' | 'trips_today' | 'charters_completed'>,
    actorName: string
  ) => {
    const newDrv: DriverRecord = {
      ...driverData,
      id: `drv-${Date.now()}`,
      last_confirmed_at: new Date().toISOString(),
      trips_today: 0,
      charters_completed: 0,
    };
    setDrivers((prev) => [...prev, newDrv]);
    logActivity(
      newDrv.name,
      'Driver status',
      `Driver registered: ${newDrv.name} assigned to ${newDrv.vehicle_assigned}`,
      actorName,
      'Admin'
    );
  };

  // Approve & Enroll Driver (from pending application)
  const approveAndEnrollDriver = (
    applicant: UserProfile,
    vehicleAssigned: string,
    vehicleType: VehicleType,
    parkLocation: VehicleLocation,
    actorName: string
  ) => {
    const existingDriver = drivers.find((d) => d.user_id === applicant.id || d.name === applicant.full_name);
    if (existingDriver) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === existingDriver.id
            ? {
                ...d,
                vehicle_assigned: vehicleAssigned,
                vehicle_type: vehicleType,
                current_location: parkLocation,
                phone: applicant.phone || d.phone,
                updated_by: actorName,
                updated_by_role: 'admin',
              }
            : d
        )
      );
    } else {
      const newDriver: DriverRecord = {
        id: `drv-${Date.now()}`,
        user_id: applicant.id,
        name: applicant.full_name,
        phone: applicant.phone,
        vehicle_assigned: vehicleAssigned,
        vehicle_type: vehicleType,
        shift_status: 'Not checked in',
        operational_status: 'Available',
        current_location: parkLocation,
        last_confirmed_at: new Date().toISOString(),
        updated_by: actorName,
        updated_by_role: 'admin',
        avatar_url: applicant.avatar_url,
        trips_today: 0,
        charters_completed: 0,
      };
      setDrivers((prev) => [...prev, newDriver]);
    }

    // Link vehicle if exists
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.vehicle_number === vehicleAssigned) {
          return {
            ...v,
            assigned_driver_name: applicant.full_name,
            current_location: parkLocation,
            last_updated: 'Just now',
            updated_by: actorName,
          };
        }
        return v;
      })
    );

    logActivity(
      applicant.full_name,
      'Driver status',
      `Driver account approved & enrolled: assigned to ${vehicleAssigned} (${vehicleType}) at ${parkLocation}`,
      actorName,
      'Admin'
    );
  };

  return (
    <AppContext.Provider
      value={{
        parks,
        drivers,
        vehicles,
        bookings,
        activityLogs,
        shiftConfig,
        activeDriversCount,
        availableBusesCount,
        activeChartersCount,
        needsReviewCount,
        updateDriverOperationalStatus,
        confirmDriverStatus,
        driverCheckIn,
        driverEndShift,
        updateVehicleLocation,
        submitCharterRequest,
        acceptCharterRequest,
        acceptCharterOnBehalf,
        rejectCharterRequest,
        startCharterTrip,
        completeCharterTrip,
        cancelCharterRequest,
        resolveFlaggedBooking,
        updateShiftConfig,
        runDailyShiftClosing,
        exportActivityLogCSV,
        exportBookingsCSV,
        addVehicle,
        addDriver,
        approveAndEnrollDriver,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
