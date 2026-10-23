import { showGlobalToast } from '../context/ToastContext';

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
