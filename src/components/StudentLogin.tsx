import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Phone,
  User,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Languages,
  Lock,
  Smartphone,
  RotateCw,
  Send,
  MessageSquare,
  Copy,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react';
import { StudentProfile, SupportedLanguage, RegisteredStudentUser } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/i18n';

interface StudentLoginProps {
  onLoginSuccess: (profile: Partial<StudentProfile>) => void;
  currentProfile?: StudentProfile;
  initialLanguage?: SupportedLanguage;
  onChangeLanguage?: (lang: SupportedLanguage) => void;
  onCancel?: () => void;
  onLogout?: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  onLoginSuccess,
  currentProfile,
  initialLanguage = 'en',
  onChangeLanguage,
  onLogout,
}) => {
  // Navigation & Authentication Steps
  const [step, setStep] = useState<'details' | 'otp_verify'>('details');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Always start with empty input fields so no previous or demo user's data is pre-filled
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Optional Academic Details (for Registration)
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [semester, setSemester] = useState<number>(1);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);

  // OTP Verification States
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [smsNotification, setSmsNotification] = useState<{
    show: boolean;
    otp: string;
    mobile: string;
  } | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Validation & Feedback States
  const [errorName, setErrorName] = useState<string | null>(null);
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorMobile, setErrorMobile] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorOtp, setErrorOtp] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // OTP input references for auto-focus
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Registered students registry in localStorage (starts empty, no demo users)
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudentUser[]>(() => {
    try {
      const saved = localStorage.getItem('studentwand_registered_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any legacy demo IDs if previously stored
          return parsed.filter(
            (u: RegisteredStudentUser) =>
              !['std-demo-01', 'std-demo-02', 'std-demo-03'].includes(u.id)
          );
        }
      }
    } catch (e) {
      console.error('Failed to load registered students', e);
    }
    return [];
  });

  // Countdown timer for OTP Resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'otp_verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Sync language changes
  const handleLangChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    if (onChangeLanguage) {
      onChangeLanguage(lang);
    }
  };

  // Mobile number input sanitization (10 digits max)
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digitsOnly);
    if (errorMobile) setErrorMobile(null);
    if (generalError) setGeneralError(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    if (errorName) setErrorName(null);
    if (generalError) setGeneralError(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorEmail) setErrorEmail(null);
    if (generalError) setGeneralError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorPassword) setErrorPassword(null);
    if (generalError) setGeneralError(null);
  };

  // Validate fields before sending OTP
  const validateDetails = (): boolean => {
    let isValid = true;
    setErrorName(null);
    setErrorEmail(null);
    setErrorMobile(null);
    setErrorPassword(null);
    setGeneralError(null);

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorName(
        language === 'hi'
          ? 'कृपया अपना पूरा नाम दर्ज करें।'
          : 'Full Name is required and cannot be empty.'
      );
      isValid = false;
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      setErrorEmail(
        language === 'hi'
          ? 'कृपया अपना ईमेल पता दर्ज करें।'
          : 'Email Address is required.'
      );
      isValid = false;
    } else if (!emailRegex.test(trimmedEmail)) {
      setErrorEmail(
        language === 'hi'
          ? 'कृपया एक वैध ईमेल पता दर्ज करें।'
          : 'Please enter a valid email address.'
      );
      isValid = false;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length === 0) {
      setErrorMobile(
        language === 'hi'
          ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।'
          : 'Mobile number is required.'
      );
      isValid = false;
    } else if (cleanMobile.length !== 10) {
      setErrorMobile(
        language === 'hi'
          ? `मोबाइल नंबर ठीक 10 अंकों का होना चाहिए (वर्तमान: ${cleanMobile.length} अंक)`
          : `Mobile number must be exactly 10 digits (currently ${cleanMobile.length} digits).`
      );
      isValid = false;
    }

    if (!password.trim() || password.trim().length < 4) {
      setErrorPassword(
        language === 'hi'
          ? 'कृपया कम से कम 4 अक्षरों का पासवर्ड दर्ज करें।'
          : 'Please enter a password (minimum 4 characters).'
      );
      isValid = false;
    }

    return isValid;
  };

  // Trigger Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDetails()) {
      return;
    }

    setIsSubmitting(true);

    // Generate random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp_verify');
      setResendTimer(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setErrorOtp(null);

      // Show simulated SMS delivery notification banner
      setSmsNotification({
        show: true,
        otp: newOtp,
        mobile: mobileNumber,
      });

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }, 500);
  };

  // Handle OTP individual digit change
  const handleOtpDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    if (errorOtp) setErrorOtp(null);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP Backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP Paste
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedData[i] || '';
      }
      setOtpDigits(newDigits);
      if (pastedData.length === 6) {
        otpInputRefs.current[5]?.focus();
      } else {
        otpInputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  // Auto-fill OTP from SMS banner
  const handleAutoFillOtp = () => {
    const digits = generatedOtp.split('');
    setOtpDigits(digits);
    setErrorOtp(null);
  };

  // Handle Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return;

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setResendTimer(30);
    setCanResend(false);
    setOtpDigits(['', '', '', '', '', '']);
    setErrorOtp(null);

    setSmsNotification({
      show: true,
      otp: newOtp,
      mobile: mobileNumber,
    });

    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  };

  // Verify OTP and Complete Login
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    const fullEnteredOtp = otpDigits.join('');

    if (fullEnteredOtp.length !== 6) {
      setErrorOtp(
        language === 'hi'
          ? 'कृपया पूरा 6 अंकों का OTP दर्ज करें।'
          : 'Please enter all 6 digits of the OTP code.'
      );
      return;
    }

    if (fullEnteredOtp !== generatedOtp) {
      setErrorOtp(
        language === 'hi'
          ? 'अमान्य OTP (Invalid OTP)! कृपया सही कोड दर्ज करें या Resend OTP दबाएं।'
          : 'Invalid OTP! Please check the code and try again.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorOtp(null);

    const cleanMobile = mobileNumber.trim();
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanCollege = selectedCollege.trim();
    const cleanCourse = selectedCourse.trim();

    setTimeout(() => {
      let matchedStudent = registeredStudents.find((s) => s.mobileNumber === cleanMobile);
      const updatedRegistry = [...registeredStudents];

      if (matchedStudent) {
        matchedStudent.fullName = cleanName;
        if (cleanCollege) matchedStudent.collegeName = cleanCollege;
        if (cleanCourse) matchedStudent.course = cleanCourse;
        if (semester) matchedStudent.semester = semester;
        matchedStudent.lastLoginAt = new Date().toISOString();
      } else {
        const newStudent: RegisteredStudentUser = {
          id: `std-${Date.now()}`,
          fullName: cleanName,
          mobileNumber: cleanMobile,
          collegeName: cleanCollege,
          course: cleanCourse,
          semester: semester,
          year: Math.ceil(semester / 2),
          registeredAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        updatedRegistry.push(newStudent);
        matchedStudent = newStudent;
      }

      try {
        localStorage.setItem(
          'studentwand_registered_students',
          JSON.stringify(updatedRegistry)
        );
        setRegisteredStudents(updatedRegistry);
      } catch (err) {
        console.error('Failed to save registry to localStorage', err);
      }

      setIsSuccess(true);
      setIsSubmitting(false);

      // Load ONLY the logged-in user's own profile information
      setTimeout(() => {
        const studentPayload: Partial<StudentProfile> = {
          id: matchedStudent?.id || `std-${Date.now()}`,
          name: cleanName,
          email: cleanEmail,
          mobileNumber: cleanMobile,
          collegeName: cleanCollege || matchedStudent?.collegeName || '',
          course: cleanCourse || matchedStudent?.course || '',
          semester: semester || matchedStudent?.semester || 1,
          year: Math.ceil((semester || 1) / 2),
          role: 'current_student',
          language: language,
          onboardingCompleted: true,
        };

        if (rememberMe) {
          localStorage.setItem(
            'studentwand_auth_session',
            JSON.stringify({
              mobile: cleanMobile,
              name: cleanName,
              email: cleanEmail,
              verifiedAt: new Date().toISOString(),
            })
          );
        }

        onLoginSuccess(studentPayload);
      }, 600);
    }, 400);
  };

  const isHindi = language === 'hi';
  const hasLoggedInUser = Boolean(currentProfile?.name && currentProfile.name.trim());

  return (
    <div className="min-h-[90vh] w-full max-w-full overflow-x-hidden flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-br from-slate-950 via-[#1E3A8A] to-[#0F172A]">
      {/* Decorative ambient background lights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Simulated Live SMS Notification Toast */}
      {smsNotification && smsNotification.show && (
        <div className="fixed top-20 z-50 max-w-md w-[92%] bg-slate-900/95 backdrop-blur-md text-white border border-blue-400/50 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-md shadow-blue-500/30">
                <MessageSquare className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-300 uppercase tracking-wider text-[10px]">
                    SMS Notification • +91 {smsNotification.mobile}
                  </span>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <p className="text-slate-200 leading-snug">
                  Your Student Wand verification OTP code is:{' '}
                  <strong className="text-amber-400 font-mono text-base tracking-widest font-extrabold">
                    {smsNotification.otp}
                  </strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setSmsNotification(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Valid for 10 minutes</span>
            <button
              type="button"
              onClick={handleAutoFillOtp}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Auto-Fill OTP</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header inside Auth View */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold tracking-tight text-xl font-['Outfit']">
            Student Wand
          </span>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs text-white">
          <Languages className="w-3.5 h-3.5 text-blue-300" />
          <select
            value={language}
            onChange={(e) => handleLangChange(e.target.value as SupportedLanguage)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
            aria-label="Select Language"
          >
            {SUPPORTED_LANGUAGES.slice(0, 4).map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Session Notice if user is already logged in */}
      {hasLoggedInUser && (
        <div className="w-full max-w-md mb-4 p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-100 flex items-center justify-between gap-3 z-10">
          <div className="text-xs">
            <p className="font-bold text-white">
              Logged in as: {currentProfile?.name}
            </p>
            <p className="text-[11px] text-emerald-300">
              {currentProfile?.email || 'No Email'} • {currentProfile?.mobileNumber ? `+91 ${currentProfile.mobileNumber}` : 'No Mobile'}
            </p>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                setFullName('');
                setEmail('');
                setMobileNumber('');
                setPassword('');
                onLogout();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      )}

      {/* Main Centered Login & Identity Verification Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-100/90 overflow-hidden z-10 transition-all">
        {/* Card Header with Blue & White Theme */}
        <div className="p-6 sm:p-7 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white relative">
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-white/20 text-[11px] font-semibold text-blue-100 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>
                  {step === 'details'
                    ? isHindi
                      ? 'सुरक्षित छात्र प्रमाणीकरण'
                      : 'Secure Student Authentication'
                    : isHindi
                    ? 'मोबाइल OTP सत्यापन'
                    : 'Mobile OTP Verification'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] tracking-tight">
                {step === 'details'
                  ? authMode === 'login'
                    ? isHindi
                      ? 'Student Wand लॉगिन'
                      : 'Student Wand Login'
                    : isHindi
                    ? 'नया छात्र पंजीकरण'
                    : 'Student Registration'
                  : isHindi
                  ? 'OTP सत्यापित करें'
                  : 'Verify Mobile OTP'}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 leading-relaxed">
                {step === 'details'
                  ? isHindi
                    ? 'अपनी जानकारी दर्ज करें। कोई भी पूर्व-भरा (pre-filled) डेटा प्रदर्शित नहीं किया जाता है।'
                    : 'Enter your details below to log in and verify your identity.'
                  : isHindi
                  ? `हमने +91 ${mobileNumber} पर 6 अंकों का OTP भेजा है।`
                  : `Enter the 6-digit OTP code sent to +91 ${mobileNumber}`}
              </p>
            </div>
          </div>

          {/* Login / Register Mode Switcher */}
          {step === 'details' && (
            <div className="mt-4 grid grid-cols-2 gap-1.5 bg-blue-900/40 p-1 rounded-xl border border-white/15">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                {isHindi ? 'लॉगिन (Login)' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                {isHindi ? 'पंजीकरण (Register)' : 'Register New User'}
              </button>
            </div>
          )}
        </div>

        {/* STEP 1: Blank Details Form (Full Name, Email, Mobile Number, Password) */}
        {step === 'details' && (
          <form onSubmit={handleSendOtp} className="p-6 sm:p-7 space-y-4" autoComplete="off">
            {generalError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Field 1: Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-full-name"
                className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>{isHindi ? 'पूरा नाम (Full Name)' : 'Full Name'}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="login-full-name"
                name="student_full_name"
                type="text"
                value={fullName}
                onChange={handleNameChange}
                placeholder="Enter Full Name"
                className={`w-full px-4 py-3 rounded-2xl bg-slate-50 border text-slate-900 text-sm font-medium transition-all focus:outline-none focus:bg-white ${
                  errorName
                    ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-200 hover:border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errorName && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errorName}
                </p>
              )}
            </div>

            {/* Field 2: Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>{isHindi ? 'ईमेल (Email Address)' : 'Email Address'}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="login-email"
                name="student_email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter Email"
                className={`w-full px-4 py-3 rounded-2xl bg-slate-50 border text-slate-900 text-sm font-medium transition-all focus:outline-none focus:bg-white ${
                  errorEmail
                    ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-200 hover:border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errorEmail && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errorEmail}
                </p>
              )}
            </div>

            {/* Field 3: Mobile Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-mobile"
                  className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isHindi ? 'मोबाइल नंबर (Mobile Number)' : 'Mobile Number'}</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                    mobileNumber.length === 10
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {mobileNumber.length} / 10 {isHindi ? 'अंक' : 'digits'}
                </span>
              </div>

              <div className="relative flex rounded-2xl shadow-xs">
                <div className="flex items-center gap-1 px-3.5 bg-blue-50 border border-r-0 border-slate-200 rounded-l-2xl text-blue-900 font-bold text-xs shrink-0 select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  id="login-mobile"
                  name="student_mobile"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  placeholder="Enter Mobile Number"
                  className={`w-full px-4 py-3 rounded-r-2xl bg-slate-50 border text-slate-900 text-sm font-semibold tracking-wide font-mono transition-all focus:outline-none focus:bg-white ${
                    errorMobile
                      ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 hover:border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {mobileNumber.length === 10 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              {errorMobile && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errorMobile}
                </p>
              )}
            </div>

            {/* Field 4: Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>{isHindi ? 'पासवर्ड (Password)' : 'Password'}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="student_password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter Password"
                  className={`w-full px-4 py-3 pr-10 rounded-2xl bg-slate-50 border text-slate-900 text-sm font-medium transition-all focus:outline-none focus:bg-white ${
                    errorPassword
                      ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 hover:border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorPassword && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errorPassword}
                </p>
              )}
            </div>

            {/* Optional College & Course fields when in Register mode */}
            {authMode === 'register' && (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isHindi ? 'कॉलेज का नाम (वैकल्पिक)' : 'College Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    placeholder="Enter College Name"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isHindi ? 'कोर्स (Course)' : 'Course'}
                    </label>
                    <input
                      type="text"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      placeholder="Enter Course (e.g. B.Tech)"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isHindi ? 'सेमेस्टर (Semester)' : 'Semester'}
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:border-blue-600"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>{isHindi ? 'मुझे याद रखें' : 'Keep me logged in'}</span>
              </label>

              <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHindi ? 'OTP सुरक्षा' : 'OTP Protected'}</span>
              </span>
            </div>

            {/* Submit / Send OTP Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="send-otp-btn"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isHindi ? 'OTP भेजा जा रहा है...' : 'Sending OTP...'}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {authMode === 'login'
                        ? isHindi
                          ? 'लॉगिन के लिए OTP भेजें'
                          : 'Login & Send OTP'
                        : isHindi
                        ? 'पंजीकरण के लिए OTP भेजें'
                        : 'Register & Send OTP'}
                    </span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Verification Box */}
        {step === 'otp_verify' && (
          <form onSubmit={handleVerifyOtp} className="p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-950">
                <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">+91 {mobileNumber}</span>
                  <span className="block text-[11px] text-blue-700 truncate max-w-[180px]">
                    {email}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>{isHindi ? 'बदलें' : 'Edit'}</span>
              </button>
            </div>

            {/* 6-Digit OTP Boxes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block text-center">
                {isHindi ? '6 अंकों का सत्यापन कोड दर्ज करें (Enter OTP):' : 'Enter 6-Digit OTP Code:'}
              </label>

              <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-2xl border transition-all focus:outline-none ${
                      errorOtp
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-200'
                        : digit
                        ? 'border-blue-600 bg-blue-50/30 text-blue-950 shadow-xs'
                        : 'border-slate-300 bg-slate-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                ))}
              </div>

              {errorOtp && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorOtp}</span>
                </div>
              )}
            </div>

            {/* Resend OTP & Countdown Timer */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-500">
                {isHindi ? 'कोड नहीं मिला?' : "Didn't receive code?"}
              </span>

              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'Resend OTP (पुनः भेजें)' : 'Resend OTP'}</span>
                </button>
              ) : (
                <span className="text-slate-400 font-mono font-medium">
                  Resend in <strong className="text-blue-600">{resendTimer}s</strong>
                </span>
              )}
            </div>

            {/* Verify OTP Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="verify-otp-btn"
                disabled={isSubmitting || isSuccess}
                className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                  isSuccess
                    ? 'bg-emerald-600 shadow-emerald-500/30'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-600/30 hover:shadow-blue-600/40'
                }`}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 animate-bounce" />
                    <span>
                      {isHindi ? 'सत्यापन सफल! डैशबोर्ड खुल रहा है...' : 'Verified! Opening Dashboard...'}
                    </span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isHindi ? 'सत्यापित हो रहा है...' : 'Verifying OTP...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isHindi ? 'OTP सत्यापित करें और लॉगिन करें' : 'Verify OTP & Login'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Privacy & Blank Default Guarantee Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            {hasLoggedInUser
              ? `Signed in as ${currentProfile?.name}. Each user sees only their own verified profile.`
              : 'No information available until you log in. Please complete your profile to continue.'}
          </p>
        </div>
      </div>
    </div>
  );
};
