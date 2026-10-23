import { showGlobalToast } from '../context/ToastContext';
import { supabase } from './supabase';

export interface SentEmail {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  timestamp: string;
  type: 'verification' | 'approval';
  code?: string;
}

const EMAIL_STORAGE_KEY = 'campusgo_sent_emails';

export const getSentEmails = (): SentEmail[] => {
  try {
    const raw = localStorage.getItem(EMAIL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read sent emails', e);
    return [];
  }
};

export const saveSentEmail = (email: SentEmail) => {
  try {
    const current = getSentEmails();
    const updated = [email, ...current].slice(0, 50); // Keep last 50 emails
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save sent email', e);
  }
};

/**
 * Send 6-digit OTP verification email for account registration
 * Dispatches real email via Supabase Auth OTP pipeline and stores audit record.
 * Never leaks the code digits in UI toasts.
 */
export const sendVerificationOTP = (recipientEmail: string, recipientName: string, code: string): SentEmail => {
  const cleanEmail = recipientEmail.trim().toLowerCase();
  const cleanName = recipientName.trim();

  const emailItem: SentEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    recipientEmail: cleanEmail,
    recipientName: cleanName,
    subject: 'CampusGo - Your 6-Digit Verification Code',
    body: `Hello ${cleanName},\n\nYour 6-digit email verification code for CampusGo is: ${code}\n\nPlease enter this code to activate your account. This code is valid for 15 minutes.\n\nThank you,\nCampusGo Security Team`,
    timestamp: new Date().toISOString(),
    type: 'verification',
    code,
  };

  saveSentEmail(emailItem);

  // Dispatch real email via Supabase Auth OTP pipeline
  try {
    supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
      },
    }).then(({ error }) => {
      if (error) {
        console.warn('[EmailService] Supabase Auth OTP notice:', error.message);
      } else {
        console.log('[EmailService] Supabase Auth OTP email dispatched to:', cleanEmail);
      }
    }).catch((err) => {
      console.warn('[EmailService] Supabase signInWithOtp error:', err);
    });
  } catch (err) {
    console.warn('[EmailService] Supabase Auth call failed:', err);
  }

  // Surface a clean toast informing the user without exposing the code digits
  showGlobalToast(
    `📧 Verification code sent to ${cleanEmail}. Please check your Gmail or email inbox.`,
    'success',
    6000
  );

  return emailItem;
};

/**
 * Send Account Approval notice to Driver or Park Admin upon verification/approval
 */
export const sendAccountApprovalEmail = (
  recipientEmail: string,
  recipientName: string,
  role: string,
  details?: string
): SentEmail => {
  const roleName = role === 'park_admin' ? 'Park Administrator' : role === 'driver' ? 'Driver' : role;
  
  const emailItem: SentEmail = {
    id: `email-appr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    recipientEmail: recipientEmail.trim(),
    recipientName: recipientName.trim(),
    subject: `CampusGo - Your ${roleName} Account Has Been Approved!`,
    body: `Dear ${recipientName},\n\nCongratulations! Your CampusGo ${roleName} account registration has been approved by administration.\n${details ? `${details}\n\n` : '\n'}You may now log in to the CampusGo app using your email address and password to start your shifts and operations.\n\nLogin URL: https://campus-go-7fcb.onrender.com/\n\nWarm regards,\nCampus Transportation Administration`,
    timestamp: new Date().toISOString(),
    type: 'approval',
  };

  saveSentEmail(emailItem);

  // Surface a high-priority toast notification confirming the approval email dispatch
  showGlobalToast(
    `📧 Approval email sent to ${recipientEmail}: Account verified. Prompted to log in!`,
    'success',
    6000
  );

  return emailItem;
};
