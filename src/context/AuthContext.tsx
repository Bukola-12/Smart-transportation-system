import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, AdminPermissions, WarningItem } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { supabase, uploadImage } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  users: UserProfile[];
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    fullName: string;
    email: string;
    phone?: string;
    matricNumber?: string;
    role: UserRole;
    parkScope?: 'Campus Gate' | 'SUB';
    preferredVehicleType?: 'bus' | 'tricycle';
    password: string;
    avatarFile?: File;
  }) => Promise<{ 
    success: boolean; 
    pendingApproval?: boolean; 
    role?: UserRole; 
    message?: string;
    error?: string;
  }>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  updateProfileImage: (file: File) => Promise<boolean>;
  updateUserPermissions: (userId: string, updates: Partial<UserProfile>) => void;
  approveDriverAccount: (
    userId: string,
    vehicleAssigned: string,
    parkLocation: 'Campus Gate' | 'SUB',
    approvedBy: string
  ) => void;
  approveParkAdminAccount: (
    userId: string,
    parkScope: 'Campus Gate' | 'SUB',
    permissions: AdminPermissions,
    approvedBy: string
  ) => void;
  rejectAccountRegistration: (userId: string, rejectedBy: string, reason?: string) => void;
  warnUser: (
    userId: string,
    reason: string,
    actorName: string,
    actorRole: 'park_admin' | 'central_admin'
  ) => { success: boolean; error?: string };
  suspendUser: (
    userId: string,
    durationDays: number | null,
    reason: string,
    actorName: string,
    actorRole: 'park_admin' | 'central_admin'
  ) => { success: boolean; error?: string };
  reactivateUser: (userId: string, actorName: string) => { success: boolean; error?: string };
  deactivateUser: (userId: string, actorName: string) => { success: boolean; error?: string };
  deleteUser: (userId: string, actorName: string) => { success: boolean; error?: string };
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('campusgo_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  });

  // Default active user is null for new visitors or users who have logged out.
  // Only restore session if a valid saved user ID exists in localStorage.
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedId = localStorage.getItem('campusgo_active_user_id');
    if (savedId) {
      const found = users.find((u) => u.id === savedId);
      if (found) return found;
    }
    // Return null so new users land directly on the Login / Signup screen
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem('campusgo_users', JSON.stringify(users));
  }, [users]);

  // Check and auto-lift expired suspensions
  useEffect(() => {
    const now = Date.now();
    let hasExpired = false;
    const updated = users.map((u) => {
      if (u.status === 'Suspended' && u.suspended_until && new Date(u.suspended_until).getTime() <= now) {
        hasExpired = true;
        return {
          ...u,
          status: 'Active' as const,
          suspended_until: undefined,
          suspension_reason: undefined,
          suspended_by: undefined,
          suspended_by_role: undefined,
        };
      }
      return u;
    });

    if (hasExpired) {
      setUsers(updated);
      if (user && user.status === 'Suspended' && user.suspended_until && new Date(user.suspended_until).getTime() <= now) {
        const found = updated.find((u) => u.id === user.id);
        if (found) setUser(found);
      }
    }
  }, [users, user]);

  // Sync current user ID
  useEffect(() => {
    if (user) {
      localStorage.setItem('campusgo_active_user_id', user.id);
    } else {
      localStorage.removeItem('campusgo_active_user_id');
    }
  }, [user]);

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    const cleanId = identifier.trim().toLowerCase();

    // Background Supabase Auth if applicable
    if (cleanId.includes('@')) {
      supabase.auth.signInWithPassword({
        email: cleanId,
        password: pass,
      }).catch((e) => {
        console.warn('Supabase auth note:', e);
      });
    }

    // Match in user database (by email or matric number)
    const matched = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.matric_number && u.matric_number.toLowerCase() === cleanId)
    );

    setIsLoading(false);

    if (!matched) {
      return {
        success: false,
        error: 'No account found with this email or matric number. Please check your credentials or create a new account.',
      };
    }

    // Check password if set on user (or default password123)
    const expectedPass = matched.password || 'password123';
    if (pass.trim() && pass.trim() !== expectedPass) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your credentials and try again.',
      };
    }

    // Check if suspension has expired
    if (matched.status === 'Suspended' && matched.suspended_until && new Date(matched.suspended_until).getTime() <= Date.now()) {
      const reactivated: UserProfile = {
        ...matched,
        status: 'Active',
        suspended_until: undefined,
        suspension_reason: undefined,
        suspended_by: undefined,
        suspended_by_role: undefined,
      };
      setUsers((prev) => prev.map((u) => (u.id === matched.id ? reactivated : u)));
      setUser(reactivated);
      localStorage.setItem('campusgo_active_user_id', reactivated.id);
      return { success: true };
    }

    if (matched.status === 'Suspended') {
      const untilStr = matched.suspended_until
        ? ` until ${new Date(matched.suspended_until).toLocaleDateString()} (${new Date(matched.suspended_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
        : ' indefinitely';
      const issuerStr = matched.suspended_by
        ? ` by ${matched.suspended_by}${matched.suspended_by_role === 'park_admin' ? ' (Park Admin)' : ' (Central Admin)'}`
        : '';
      const reasonStr = matched.suspension_reason ? ` Reason: "${matched.suspension_reason}".` : '';
      return {
        success: false,
        error: `This account has been suspended${untilStr}${issuerStr}.${reasonStr} You cannot use core app functionalities until the suspension is resolved.`,
      };
    }

    if (matched.status === 'Deactivated') {
      return {
        success: false,
        error: 'This account has been deactivated by Central Administration. You cannot log in until Central Admin reactivates your account.',
      };
    }

    if (matched.status === 'Pending approval') {
      if (matched.role === 'driver') {
        return {
          success: false,
          error: 'Your driver account registration is pending approval by a Park Admin or Central Admin. You will be able to log in once your credentials and vehicle assignment are verified.',
        };
      }
      if (matched.role === 'park_admin') {
        return {
          success: false,
          error: 'Your Park Admin account registration is pending verification by Central Admin. Central Admin must confirm your administrative credentials before you can log in.',
        };
      }
      return {
        success: false,
        error: 'Your account is pending administrator verification.',
      };
    }

    if (matched.status === 'Rejected') {
      return {
        success: false,
        error: 'This account registration was declined by administration. Please contact campus transport support.',
      };
    }

    // Valid active login
    setUser(matched);
    localStorage.setItem('campusgo_active_user_id', matched.id);
    return { success: true };
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    phone?: string;
    matricNumber?: string;
    role: UserRole;
    parkScope?: 'Campus Gate' | 'SUB';
    preferredVehicleType?: 'bus' | 'tricycle';
    password: string;
    avatarFile?: File;
  }) => {
    setIsLoading(true);

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanMatric = data.matricNumber?.trim().toLowerCase();

    // Check if an account already exists
    const existing = users.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        (cleanMatric && u.matric_number && u.matric_number.toLowerCase() === cleanMatric)
    );

    if (existing) {
      setIsLoading(false);
      return {
        success: false,
        error: 'An account with this email or matric number already exists. Please sign in instead.',
      };
    }

    let avatarUrl: string | undefined = undefined;

    if (data.avatarFile) {
      try {
        avatarUrl = await uploadImage(data.avatarFile, 'avatars');
      } catch (err) {
        console.warn('Image upload error during signup:', err);
      }
    }

    // Background Supabase auth sign-up if applicable
    if (cleanEmail.includes('@')) {
      supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
            phone: data.phone,
          },
        },
      }).catch((e) => {
        console.warn('Supabase sign-up note:', e);
      });
    }

    const isStudent = data.role === 'student';
    const initialStatus = isStudent ? 'Active' : 'Pending approval';

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      password: data.password,
      full_name: data.fullName,
      phone: data.phone,
      matric_number: data.matricNumber,
      role: data.role,
      park_scope: data.parkScope,
      preferred_vehicle_type: data.preferredVehicleType,
      avatar_url: avatarUrl,
      status: initialStatus,
      created_at: new Date().toISOString(),
      permissions:
        data.role === 'park_admin'
          ? {
              update_driver_status: true,
              record_vehicle_location: true,
              accept_charters_on_behalf: true,
              correct_records: true,
              manage_bookings_other_parks: false,
            }
          : undefined,
    };

    setUsers((prev) => [...prev, newUser]);

    // ONLY student accounts are immediately logged in!
    // Drivers & Park Admins must wait for verification/approval
    if (isStudent) {
      setUser(newUser);
      localStorage.setItem('campusgo_active_user_id', newUser.id);
    } else {
      setUser(null);
      localStorage.removeItem('campusgo_active_user_id');
    }

    setIsLoading(false);
    return { 
      success: true, 
      pendingApproval: !isStudent, 
      role: data.role,
      message: isStudent 
        ? 'Student account created successfully.' 
        : data.role === 'driver'
        ? 'Driver account submitted. Pending approval from Park Admin or Central Admin.'
        : 'Park Admin account submitted. Pending verification by Central Admin.'
    };
  };

  const approveDriverAccount = (
    userId: string,
    vehicleAssigned: string,
    parkLocation: 'Campus Gate' | 'SUB',
    approvedBy: string
  ) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            status: 'Active',
            vehicle_assigned: vehicleAssigned,
            park_scope: parkLocation,
            approved_by: approvedBy,
            approved_at: new Date().toISOString(),
          };
        }
        return u;
      })
    );
  };

  const approveParkAdminAccount = (
    userId: string,
    parkScope: 'Campus Gate' | 'SUB',
    permissions: AdminPermissions,
    approvedBy: string
  ) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            status: 'Active',
            park_scope: parkScope,
            permissions,
            approved_by: approvedBy,
            approved_at: new Date().toISOString(),
          };
        }
        return u;
      })
    );
  };

  const rejectAccountRegistration = (userId: string, rejectedBy: string, reason?: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            status: 'Rejected',
            approved_by: rejectedBy,
          };
        }
        return u;
      })
    );
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign-out:', e);
    }
    localStorage.removeItem('campusgo_active_user_id');
    setUser(null);
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setUser(found);
    }
  };

  const updateProfileImage = async (file: File): Promise<boolean> => {
    if (!user) return false;
    try {
      const url = await uploadImage(file, 'avatars');
      const updatedUser = { ...user, avatar_url: url };
      setUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
      return true;
    } catch (err) {
      console.error('Failed to update avatar image:', err);
      return false;
    }
  };

  const updateUserPermissions = (userId: string, updates: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...updates };
          if (user?.id === userId) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const warnUser = (
    userId: string,
    reason: string,
    actorName: string,
    actorRole: 'park_admin' | 'central_admin'
  ): { success: boolean; error?: string } => {
    if (!reason.trim()) {
      return { success: false, error: 'A reason for the warning is required.' };
    }

    const warningItem: WarningItem = {
      id: `warn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: `${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      reason: reason.trim(),
      issued_by: actorName,
      issued_by_role: actorRole,
    };

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated: UserProfile = {
            ...u,
            warnings: [...(u.warnings || []), warningItem],
          };
          if (user?.id === userId) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    return { success: true };
  };

  const suspendUser = (
    userId: string,
    durationDays: number | null,
    reason: string,
    actorName: string,
    actorRole: 'park_admin' | 'central_admin'
  ): { success: boolean; error?: string } => {
    if (!reason.trim()) {
      return { success: false, error: 'A reason for suspension must be specified.' };
    }

    let safeUntil: string | undefined = undefined;

    if (actorRole === 'park_admin') {
      // Park Admin ceiling is STRICTLY 1 month (maximum 30 days)
      const days = durationDays ? Math.min(30, Math.max(1, durationDays)) : 30;
      safeUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    } else {
      // Central Admin has NO CEILING
      if (durationDays && durationDays > 0) {
        safeUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
      } else {
        safeUntil = undefined; // Indefinite suspension
      }
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated: UserProfile = {
            ...u,
            status: 'Suspended',
            suspended_until: safeUntil,
            suspension_reason: reason.trim(),
            suspended_by: actorName,
            suspended_by_role: actorRole,
          };
          if (user?.id === userId) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    return { success: true };
  };

  const reactivateUser = (userId: string, actorName: string): { success: boolean; error?: string } => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated: UserProfile = {
            ...u,
            status: 'Active',
            suspended_until: undefined,
            suspension_reason: undefined,
            suspended_by: undefined,
            suspended_by_role: undefined,
          };
          if (user?.id === userId) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    return { success: true };
  };

  const deactivateUser = (userId: string, actorName: string): { success: boolean; error?: string } => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated: UserProfile = {
            ...u,
            status: 'Deactivated',
            suspended_until: undefined,
            suspension_reason: 'Account deactivated indefinitely by Central Admin.',
            suspended_by: actorName,
            suspended_by_role: 'central_admin',
          };
          if (user?.id === userId) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    return { success: true };
  };

  const deleteUser = (userId: string, actorName: string): { success: boolean; error?: string } => {
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, error: 'User not found.' };
    }
    if (target.role === 'central_admin') {
      return { success: false, error: 'Cannot delete central admin account.' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    if (user?.id === userId) {
      setUser(null);
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        signup,
        logout,
        switchUser,
        updateProfileImage,
        updateUserPermissions,
        approveDriverAccount,
        approveParkAdminAccount,
        rejectAccountRegistration,
        warnUser,
        suspendUser,
        reactivateUser,
        deactivateUser,
        deleteUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
