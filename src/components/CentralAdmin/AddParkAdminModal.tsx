import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

interface AddParkAdminModalProps {
  onClose: () => void;
}

export const AddParkAdminModal: React.FC<AddParkAdminModalProps> = ({ onClose }) => {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [parkScope, setParkScope] = useState<'Campus Gate' | 'SUB'>('Campus Gate');
  const [password, setPassword] = useState('Admin@2026');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    await signup({
      fullName: fullName.trim(),
      email: email.trim(),
      role: 'park_admin',
      parkScope,
      password,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#151821] rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-[#252B3A] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Add Park Admin
            </h3>
            <p className="text-xs text-gray-400">
              Create an authorized administrator account (FR-02)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Adeola Balogun"
              required
              className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-sm font-medium rounded-2xl px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="adeola@university.edu"
              required
              className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-sm font-medium rounded-2xl px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              Assigned Park Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Campus Gate', 'SUB'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setParkScope(p)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    parkScope === p
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-gray-100 dark:bg-[#1E2330] text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              Temporary Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#F3F4F6] dark:bg-[#1E2330] text-gray-900 dark:text-white text-sm font-medium rounded-2xl px-4 py-3 outline-none font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-sm text-xs sm:text-sm transition-all cursor-pointer"
            >
              {isSubmitting ? 'Creating account...' : 'Create Admin Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
