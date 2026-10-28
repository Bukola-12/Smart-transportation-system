import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { uploadImage } from '../../lib/supabase';
import { compressImage } from '../../lib/imageCompression';
import { 
  CAMPUS_LOCATIONS_CATEGORIZED, 
  POPULAR_DESTINATIONS, 
  POPULAR_PICKUPS 
} from '../../data/campusLocations';
import { 
  ArrowLeft, 
  MapPin, 
  Camera, 
  X, 
  Phone, 
  AlertTriangle, 
  UserCheck, 
  Zap, 
  Clock, 
  Car, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

interface TricycleCharterRequestProps {
  onBack: () => void;
  onRequestSubmitted: (bookingId: string) => void;
  initialDestination?: string;
}

export const TricycleCharterRequest: React.FC<TricycleCharterRequestProps> = ({
  onBack,
  onRequestSubmitted,
  initialDestination,
}) => {
  const { submitCharterRequest, drivers } = useApp();
  const { user } = useAuth();

  const isSuspended = user?.status === 'Suspended';
  const isDeactivated = user?.status === 'Deactivated';
  const hasWarnings = (user?.warnings && user.warnings.length > 0) || false;

  const onDutyDrivers = drivers.filter((d) => d.shift_status === 'On duty');

  const [pickup, setPickup] = useState('SUB Car Park');
  const [customPickup, setCustomPickup] = useState('');
  const [isCustomPickup, setIsCustomPickup] = useState(false);

  const [destination, setDestination] = useState(
    initialDestination || 'Hezekiah Oluwasanmi Library (Main Library)'
  );
  const [customDestination, setCustomDestination] = useState('');
  const [isCustomDestination, setIsCustomDestination] = useState(false);

  React.useEffect(() => {
    if (initialDestination) {
      setIsCustomDestination(false);
      setDestination(initialDestination);
    }
  }, [initialDestination]);

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'recently';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  const [rideTier, setRideTier] = useState<'standard' | 'comfort' | 'preferred'>('standard');
  const [pickupNote, setPickupNote] = useState('');
  const [passengerPhone, setPassengerPhone] = useState(user?.phone || '');
  const [preferredDriverId, setPreferredDriverId] = useState<string>('');
  const [whenType, setWhenType] = useState<'Now' | 'In 15 min' | 'Pick time'>('Now');
  const [customTime, setCustomTime] = useState('');

  // Location Photo Upload & Compression State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [compressionBadge, setCompressionBadge] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handlePickupChange = (value: string) => {
    if (value === '__custom__') {
      setIsCustomPickup(true);
      setPickup('');
    } else {
      setIsCustomPickup(false);
      setPickup(value);
    }
  };

  const handleDestinationChange = (value: string) => {
    if (value === '__custom__') {
      setIsCustomDestination(true);
      setDestination('');
    } else {
      setIsCustomDestination(false);
      setDestination(value);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Image must be under 20MB in size.');
      return;
    }

    setIsCompressingPhoto(true);
    setError(null);

    try {
      // Client-side high-ratio compression (e.g. 5MB -> 110KB)
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.76,
        mimeType: 'image/jpeg',
      });

      setPhotoFile(compressed.file);
      setPhotoPreview(compressed.dataUrl);
      setCompressionBadge(
        `${compressed.formattedOriginalSize} → ${compressed.formattedCompressedSize} (${compressed.savedPercent}% saved)`
      );
    } catch (err) {
      console.warn('Compression error fallback:', err);
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setCompressionBadge(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSuspended || isDeactivated) {
      setError('Your account is currently suspended from requesting charters. Contact campus transport administration.');
      return;
    }

    const finalPickup = isCustomPickup ? customPickup.trim() : pickup.trim();
    const finalDestination = isCustomDestination ? customDestination.trim() : destination.trim();

    if (!finalPickup) {
      setError('Please select or specify your pickup location.');
      return;
    }
    if (!finalDestination) {
      setError('Please select or enter your destination.');
      return;
    }
    if (finalPickup.toLowerCase() === finalDestination.toLowerCase()) {
      setError('Pickup and destination cannot be the same location.');
      return;
    }

    if (!/^0\d{10}$/.test(passengerPhone.trim())) {
      setError('Contact phone number must be exactly 11 numbers and start with 0 (e.g. 08012345678).');
      return;
    }

    let finalImageUrl: string | undefined = undefined;
    if (photoFile) {
      setIsUploadingPhoto(true);
      try {
        finalImageUrl = await uploadImage(photoFile, 'locations');
      } catch (err) {
        console.warn('Image upload error, fallback to preview:', err);
        finalImageUrl = photoPreview || undefined;
      } finally {
        setIsUploadingPhoto(false);
      }
    }

    const chosenDriver = onDutyDrivers.find((d) => d.id === preferredDriverId);

    const booking = submitCharterRequest({
      requesterId: user?.id || 'guest-student',
      requesterName: user?.full_name || 'Student Passenger',
      requesterPhone: passengerPhone.trim() || user?.phone || undefined,
      pickup: finalPickup,
      destination: finalDestination,
      pickupNote: pickupNote.trim() ? pickupNote.trim() : undefined,
      pickupImageUrl: finalImageUrl,
      whenType,
      scheduledTime: whenType === 'Pick time' ? customTime : undefined,
      preferredDriverId: chosenDriver?.id,
      preferredDriverName: chosenDriver?.name,
    });

    onRequestSubmitted(booking.id);
  };

  return (
    <div className="pb-32 pt-3 md:py-8 px-4 sm:px-6 md:px-8 max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 -ml-2 text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white rounded-2xl hover:bg-gray-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Tricycle Charter
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              CampusGo Fast Dispatch • OAU
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#EBF7EE] dark:bg-emerald-950/40 text-[#00A86B] dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold border border-[#D8F3DC] dark:border-emerald-800/60">
          <div className="w-2 h-2 rounded-full bg-[#00C269] animate-pulse" />
          <span>{onDutyDrivers.length} Online</span>
        </div>
      </div>

      {/* Disciplinary Suspension Alert if Suspended */}
      {isSuspended && (
        <div className="mb-6 p-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-3xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-extrabold text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>Account Suspended from Booking Charters</span>
          </div>
          <p className="text-xs sm:text-sm text-red-800 dark:text-red-300 leading-relaxed">
            Your student account has an active disciplinary restriction
            {user?.suspended_until ? (
              <span className="font-bold"> active until {new Date(user.suspended_until).toLocaleDateString()}</span>
            ) : (
              <span className="font-bold"> active indefinitely</span>
            )}
            {user?.suspended_by ? (
              <span> issued by <strong className="font-semibold">{user.suspended_by}{user.suspended_by_role === 'park_admin' ? ' (Park Admin)' : ' (Central Admin)'}</strong></span>
            ) : ''}.
          </p>
          {user?.suspension_reason && (
            <div className="text-xs bg-white dark:bg-[#1A1E29] p-3.5 rounded-2xl border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200 space-y-1">
              <span className="font-bold text-red-700 dark:text-red-400 block text-[11px] uppercase tracking-wider">Official Suspension Reason:</span>
              <p className="font-medium italic">"{user.suspension_reason}"</p>
              <div className="pt-2 text-[11px] text-gray-500 dark:text-gray-400 border-t border-red-100 dark:border-red-900/40 flex items-center justify-between">
                <span>Restrictions: Tricycle bookings blocked</span>
                <span>Appeal: Contact Central Admin</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disciplinary Warning Banner */}
      {!isSuspended && hasWarnings && (
        <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <span className="font-bold">Disciplinary Notice:</span> You have {user?.warnings?.length} official warning(s) on your profile. Please uphold campus ride regulations.
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs rounded-2xl font-medium border border-red-200 dark:border-red-800/60 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ======================================================== */}
        {/* 1. BOLT-STYLE ROUTE SELECTOR CARD                       */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 md:p-6 border border-gray-100 dark:border-[#252B3A] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-colors">
          <div className="flex items-start gap-3.5">
            {/* Visual Route Connector (Green circle to Dark square) */}
            <div className="flex flex-col items-center mt-3.5 flex-shrink-0">
              <div className="w-3.5 h-3.5 rounded-full bg-[#00C269] ring-4 ring-[#00C269]/20" />
              <div className="w-0.5 h-14 bg-gradient-to-b from-[#00C269] to-gray-400 dark:to-gray-600 my-1.5" />
              <div className="w-3 h-3 rounded-sm bg-gray-900 dark:bg-white" />
            </div>

            {/* Inputs Container */}
            <div className="flex-1 space-y-3.5">
              {/* Pickup Input */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Pickup Location
                </label>
                <select
                  value={isCustomPickup ? '__custom__' : pickup}
                  onChange={(e) => handlePickupChange(e.target.value)}
                  className="w-full bg-[#F6F8FA] dark:bg-[#1E2330] border border-transparent focus:border-[#00C269] text-gray-900 dark:text-white rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold outline-none transition-all cursor-pointer"
                >
                  {CAMPUS_LOCATIONS_CATEGORIZED.map((cat) => (
                    <optgroup key={cat.category} label={cat.category}>
                      {cat.locations.map((spot) => (
                        <option key={spot} value={spot}>
                          {spot}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="__custom__">✏️ Enter custom pickup spot...</option>
                </select>

                {isCustomPickup && (
                  <input
                    type="text"
                    value={customPickup}
                    onChange={(e) => setCustomPickup(e.target.value)}
                    placeholder="Specify exact pickup spot (e.g. Behind Spider Hall)"
                    className="w-full mt-2 bg-[#F6F8FA] dark:bg-[#1E2330] border border-gray-200 dark:border-gray-700 focus:border-[#00C269] text-gray-900 dark:text-white rounded-2xl px-4 py-2.5 text-xs font-semibold outline-none"
                  />
                )}
              </div>

              {/* Destination Input */}
              <div className="pt-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Destination
                </label>
                <select
                  value={isCustomDestination ? '__custom__' : destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="w-full bg-[#F6F8FA] dark:bg-[#1E2330] border border-transparent focus:border-[#00C269] text-gray-900 dark:text-white rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold outline-none transition-all cursor-pointer"
                >
                  {CAMPUS_LOCATIONS_CATEGORIZED.map((cat) => (
                    <optgroup key={cat.category} label={cat.category}>
                      {cat.locations.map((spot) => (
                        <option key={spot} value={spot}>
                          {spot}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="__custom__">✏️ Enter custom destination...</option>
                </select>

                {isCustomDestination && (
                  <input
                    type="text"
                    value={customDestination}
                    onChange={(e) => setCustomDestination(e.target.value)}
                    placeholder="Specify destination (e.g. PG Hall Gate, New Market)"
                    className="w-full mt-2 bg-[#F6F8FA] dark:bg-[#1E2330] border border-gray-200 dark:border-gray-700 focus:border-[#00C269] text-gray-900 dark:text-white rounded-2xl px-4 py-2.5 text-xs font-semibold outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Quick Destination Chips (Bolt Shortcut style) */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Popular Campus Spots
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_DESTINATIONS.map((spot) => (
                <button
                  key={spot}
                  type="button"
                  onClick={() => {
                    setIsCustomDestination(false);
                    setDestination(spot);
                  }}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    destination === spot && !isCustomDestination
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                      : 'bg-gray-100 dark:bg-[#1E2330] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2A3142]'
                  }`}
                >
                  {spot.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. BOLT RIDE TIER CARDS (Standard vs Comfort vs Preferred)*/}
        {/* ======================================================== */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider px-1">
            Choose Charter Option
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Tier 1: Campus Standard */}
            <div
              onClick={() => {
                setRideTier('standard');
                setPreferredDriverId('');
              }}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative ${
                rideTier === 'standard'
                  ? 'border-[#00C269] bg-[#EBF7EE]/60 dark:bg-emerald-950/30 shadow-xs'
                  : 'border-transparent bg-white dark:bg-[#151821] hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#00C269]/15 text-[#00C269] flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-[#00C269]" />
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  Fastest
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                Standard Trip
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Standard campus charter ride to your chosen stop or faculty along campus routes.
              </p>
            </div>

            {/* Tier 2: Direct Comfort */}
            <div
              onClick={() => {
                setRideTier('comfort');
                setPreferredDriverId('');
              }}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative ${
                rideTier === 'comfort'
                  ? 'border-[#00C269] bg-[#EBF7EE]/60 dark:bg-emerald-950/30 shadow-xs'
                  : 'border-transparent bg-white dark:bg-[#151821] hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Direct
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                Private Trip
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Exclusive full-tricycle hire with direct door-to-door drop-off and no intermediate stops.
              </p>
            </div>

            {/* Tier 3: Preferred Driver */}
            <div
              onClick={() => setRideTier('preferred')}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative ${
                rideTier === 'preferred'
                  ? 'border-[#00C269] bg-[#EBF7EE]/60 dark:bg-emerald-950/30 shadow-xs'
                  : 'border-transparent bg-white dark:bg-[#151821] hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                  Select
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                Pick Driver
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Choose an on-duty driver directly
              </p>
            </div>
          </div>
        </div>

        {/* Preferred Driver Dropdown (Shown or Highlighted when Pick Driver is active) */}
        {(rideTier === 'preferred' || preferredDriverId) && (
          <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 border border-purple-200 dark:border-purple-800/60 shadow-xs space-y-2">
            <label className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-600" />
              Select Your Preferred On-Duty Driver
            </label>
            <select
              value={preferredDriverId}
              onChange={(e) => setPreferredDriverId(e.target.value)}
              className="w-full bg-[#F6F8FA] dark:bg-[#1E2330] border border-gray-200 dark:border-gray-700 focus:border-purple-500 text-gray-900 dark:text-white rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold outline-none cursor-pointer"
            >
              <option value="">Any Available Driver (Recommended - Fastest Dispatch)</option>
              {onDutyDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.vehicle_assigned} ({d.vehicle_type === 'tricycle' ? 'Tricycle' : 'Bus'}) · At {d.current_location} {d.operational_status === 'Available' ? '· Ready now' : `· (${d.operational_status})`} · Confirmed {formatRelativeTime(d.last_confirmed_at)}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400">
              When selected, your charter request will be specifically directed to this driver's phone & console.
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. PICKUP NOTE & IMAGE COMPRESSION SECTION              */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 md:p-6 border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00C269]" />
              Pickup Landmark Note (Optional)
            </label>
            <input
              type="text"
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
              placeholder="e.g. Standing beside the ATM gallery, wearing yellow hoodie"
              className="w-full bg-[#F6F8FA] dark:bg-[#1E2330] border border-transparent focus:border-[#00C269] text-gray-900 dark:text-white rounded-2xl px-4 py-3 text-xs sm:text-sm outline-none transition-all"
            />
          </div>

          {/* Compressed Photo Upload */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#00C269]" />
                Location Photo
              </label>
              {compressionBadge && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {compressionBadge}
                </span>
              )}
            </div>

            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 h-36 group">
                <img
                  src={photoPreview}
                  alt="Location landmark preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  Optimized for instant driver viewing
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-[#00C269] dark:hover:border-[#00C269] rounded-2xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#1E2330] group-hover:bg-[#EBF7EE] dark:group-hover:bg-emerald-950/40 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-[#00C269] transition-colors">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block group-hover:text-[#00C269] transition-colors">
                    {isCompressingPhoto ? 'Compressing photo...' : 'Take or snap a location photo'}
                  </span>
                  <span className="text-[11px] text-gray-400 block">
                    Auto-compressed to under ~150KB for lightning upload
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  disabled={isCompressingPhoto}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. PASSENGER PHONE & TIME SELECTION                     */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-[#151821] rounded-3xl p-5 md:p-6 border border-gray-100 dark:border-[#252B3A] shadow-xs space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#00C269]" />
              Your Phone Number (For Driver Call) *
            </label>
            <input
              type="tel"
              value={passengerPhone}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
                setPassengerPhone(cleaned);
              }}
              maxLength={11}
              required
              placeholder="e.g. 08012345678"
              className="w-full bg-[#F6F8FA] dark:bg-[#1E2330] border border-transparent focus:border-[#00C269] text-gray-900 dark:text-white rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono font-bold outline-none"
            />
            <span className="text-[11px] text-gray-400 dark:text-gray-500 block">
              Must be exactly 11 numbers and start with 0.
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              Departure Time
            </label>
            <div className="flex items-center gap-2">
              {(['Now', 'In 15 min', 'Pick time'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWhenType(w)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    whenType === w
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-[#F6F8FA] dark:bg-[#1E2330] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#252B3A]'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            {whenType === 'Pick time' && (
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                required
                className="mt-2 bg-[#F6F8FA] dark:bg-[#1E2330] text-gray-900 dark:text-white rounded-2xl px-4 py-2.5 text-xs font-semibold outline-none"
              />
            )}
          </div>
        </div>

        {/* Transparent Fare Reminder (Bolt Payment style) */}
        <div className="bg-[#EBF7EE] dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 rounded-3xl p-4 sm:p-5 border border-[#D8F3DC] dark:border-emerald-800/60 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#00C269] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-[13px] leading-relaxed">
            <strong>Direct Fare Agreement:</strong> No card or in-app charge is deducted. Settle the agreed fare directly with your driver upon arrival.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 5. PRIMARY BOLT ACTION BUTTON                           */}
        {/* ======================================================== */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isUploadingPhoto || isCompressingPhoto || isSuspended || isDeactivated}
            className="w-full bg-[#00C269] hover:bg-[#00AB5D] active:scale-[0.99] text-white font-black py-4 px-6 rounded-2xl text-base shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSuspended ? (
              <span>Account Suspended</span>
            ) : isDeactivated ? (
              <span>Account Deactivated</span>
            ) : isCompressingPhoto ? (
              <span>Compressing photo...</span>
            ) : isUploadingPhoto ? (
              <span>Dispatching charter...</span>
            ) : (
              <>
                <span>Request CampusGo Tricycle</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
