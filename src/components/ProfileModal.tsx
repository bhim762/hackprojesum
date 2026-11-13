import React, { useState, useEffect } from 'react';
import {
  User,
  X,
  Save,
  CheckCircle2,
  Languages,
  MapPin,
  Sparkles,
  Smartphone,
  Download,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { StudentProfile, UserRole, College, SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/i18n';
import { INDIAN_STATES_AND_UTS } from '../data/indianStatesAndColleges';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  colleges: College[];
  onReRunOnboarding?: () => void;
  onOpenInstall?: () => void;
  onNavigateToLogin?: () => void;
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  studentProfile,
  onSaveProfile,
  userRole,
  setUserRole,
  onReRunOnboarding,
  onOpenInstall,
  onNavigateToLogin,
  onLogout,
}) => {
  const [formData, setFormData] = useState<StudentProfile>({ ...studentProfile });
  const [isSaved, setIsSaved] = useState(false);

  // Sync formData whenever studentProfile changes or modal opens
  useEffect(() => {
    setFormData({ ...studentProfile });
  }, [studentProfile, isOpen]);

  if (!isOpen) return null;

  const hasUserData = Boolean(studentProfile.name && studentProfile.name.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#2D2A4A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#2D2A4A] flex items-center justify-center font-extrabold text-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-['Outfit']">
                Student Profile & Settings
              </h3>
              <p className="text-xs text-indigo-200">
                {hasUserData
                  ? `Signed in as ${studentProfile.name}`
                  : 'No information available — Please complete your profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-indigo-200 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Status Banner: If no user data entered, show "No Information Available" */}
          {!hasUserData ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-extrabold">No Information Available</p>
                  <p className="text-[11px] text-amber-800">
                    Please complete your profile below or log in to view your personal information.
                  </p>
                </div>
              </div>
              {onNavigateToLogin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToLogin();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  Login
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="text-emerald-950">
                <p className="text-xs font-bold">{studentProfile.name}</p>
                <p className="text-[11px] text-emerald-700">
                  {studentProfile.email || 'No Information Available'} •{' '}
                  {studentProfile.mobileNumber
                    ? `+91 ${studentProfile.mobileNumber}`
                    : 'No Information Available'}
                </p>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}

          {/* Re-run Onboarding & Install App Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {onReRunOnboarding && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReRunOnboarding();
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Personalize College Setup</span>
              </button>
            )}
            {onOpenInstall && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstall();
                }}
                className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Install App / APK</span>
              </button>
            )}
          </div>

          {/* User Persona Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Your Active Role</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'current_student', label: 'Current Student' },
                { role: 'prospective_student', label: 'Prospective' },
                { role: 'college_admin', label: 'Administrator' },
              ].map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => {
                    setUserRole(r.role as UserRole);
                    setFormData({ ...formData, role: r.role as UserRole });
                  }}
                  className={`p-2 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                    userRole === r.role
                      ? 'bg-[#2D2A4A] text-white border-[#2D2A4A] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-amber-500" />
              <span>App Language / भाषा</span>
            </label>
            <select
              value={formData.language || 'en'}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value as SupportedLanguage })
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name}) — {l.region}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter Full Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Mobile Number (10 digits)
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="Enter Mobile Number"
                value={formData.mobileNumber || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter Email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          {/* State Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>State / UT in India</span>
            </label>
            <select
              value={formData.state || ''}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-xs text-slate-800"
            >
              <option value="">Select State / UT</option>
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st.code} value={st.name}>
                  {st.name} ({st.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Primary College</label>
            <input
              type="text"
              placeholder="Enter College Name"
              value={formData.collegeName || ''}
              onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Course / Degree</label>
              <input
                type="text"
                placeholder="Enter Course"
                value={formData.course || ''}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Branch / Dept</label>
              <input
                type="text"
                placeholder="Enter Branch"
                value={formData.branch || formData.department || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    branch: e.target.value,
                    department: e.target.value,
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="10"
                placeholder="Enter Semester"
                value={formData.semester || ''}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Roll Number</label>
              <input
                type="text"
                placeholder="Enter Roll Number"
                value={formData.rollNumber || ''}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {isSaved ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </span>
            ) : (
              <span className="text-slate-400">
                {hasUserData ? 'Showing your personal profile' : 'Please complete your profile'}
              </span>
            )}
            <div className="flex items-center gap-2">
              {hasUserData && onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Clear / Logout</span>
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2D2A4A] hover:bg-[#201e38] text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
