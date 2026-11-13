import React, { useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  Bell,
  Search,
  BookOpen,
  Users,
  CreditCard,
  Building2,
  HelpCircle,
  Scale,
  MessageSquare,
  ShieldCheck,
  Menu,
  X,
  Compass,
  LayoutDashboard,
  Languages,
  SlidersHorizontal,
  Briefcase,
  ShieldAlert,
  Database,
  Download,
  Lock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  CheckCircle,
} from 'lucide-react';
import { UserRole, StudentProfile, SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES, getTranslation } from '../data/i18n';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  studentProfile: StudentProfile;
  unreadNoticesCount: number;
  onOpenNotifications: () => void;
  onOpenWandAI: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenOnboarding?: () => void;
  onChangeLanguage?: (lang: SupportedLanguage) => void;
  onOpenInstall?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  studentProfile,
  unreadNoticesCount,
  onOpenNotifications,
  onOpenWandAI,
  onOpenProfile,
  onOpenOnboarding,
  onChangeLanguage,
  onOpenInstall,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(studentProfile.language || 'en');
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleNavInstall = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    if (onOpenInstall) {
      onOpenInstall();
    }
  };

  const mainNavItems = [
    { id: 'home', label: t.navHome || 'Home', icon: Compass },
    { id: 'login', label: 'Login / Register', icon: Lock },
    { id: 'dashboard', label: t.navDashboard || 'Dashboard', icon: LayoutDashboard, roleRestricted: false },
    { id: 'explorer', label: t.navExplorer || 'Explore Colleges', icon: Search },
    { id: 'alumni', label: t.navAlumni || 'Seniors & Alumni', icon: GraduationCap },
    { id: 'internships', label: t.navInternships || 'Internships', icon: Briefcase },
    { id: 'safe-campus', label: t.navSafeCampus || 'Anti-Harassment & Care', icon: ShieldAlert },
    { id: 'academics', label: t.navAcademics || 'Academics', icon: BookOpen },
    { id: 'faculty', label: t.navFaculty || 'Faculty', icon: Users },
    { id: 'fees', label: t.navFees || 'Fees', icon: CreditCard },
    { id: 'problems', label: t.navProblemSolver || 'Problem Solver', icon: HelpCircle },
    { id: 'compare', label: t.navCompare || 'Compare', icon: Scale },
    { id: 'campus', label: t.navCampus || 'Campus Life', icon: Building2 },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'admin-portal', label: t.navAdmin || 'Admin Panel', icon: ShieldCheck, adminOnly: true },
  ];

  const visibleNavItems = mainNavItems.filter((item) =>
    item.adminOnly ? userRole === 'college_admin' : true
  );

  const scrollMenu = (direction: 'left' | 'right') => {
    if (!navScrollRef.current) return;
    const scrollAmount = 260;
    navScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs"
    >
      {/* Top Fixed Bar: Brand Logo + Utilities */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center shrink-0">
            <button
              id="brand-logo-btn"
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-400 rounded-xl flex items-center justify-center text-[#2D2A4A] font-bold shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#2D2A4A]" />
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[#2D2A4A] font-['Outfit'] whitespace-nowrap">
                Student Wand
              </span>
            </button>
          </div>

          {/* Right Actions & Utilities (Fixed within viewport, no overflow) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Role Switcher Pill */}
            <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs">
              <button
                id="role-switch-current"
                onClick={() => setUserRole('current_student')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  userRole === 'current_student'
                    ? 'bg-white text-[#2D2A4A] font-bold shadow-xs border border-slate-200/70'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Current College Student view"
              >
                Student
              </button>
              <button
                id="role-switch-prospective"
                onClick={() => setUserRole('prospective_student')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  userRole === 'prospective_student'
                    ? 'bg-white text-[#2D2A4A] font-bold shadow-xs border border-slate-200/70'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Prospective Applicant view"
              >
                Prospective
              </button>
              <button
                id="role-switch-admin"
                onClick={() => setUserRole('college_admin')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  userRole === 'college_admin'
                    ? 'bg-white text-[#2D2A4A] font-bold shadow-xs border border-slate-200/70'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="College Administrator view"
              >
                Admin
              </button>
            </div>

            {/* Language Switcher Pill */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs">
              <Languages className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <select
                value={studentProfile.language || 'en'}
                onChange={(e) => onChangeLanguage?.(e.target.value as SupportedLanguage)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs pr-1"
                title="Change language / भाषा बदलें"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Install App Action Trigger */}
            {onOpenInstall && (
              <button
                id="install-app-nav-btn"
                onClick={handleNavInstall}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                  isInstalled
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                    : isInstallable
                    ? 'text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 shadow-xs'
                    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                }`}
                title={isInstalled ? 'App is installed on your device' : 'Install Student Wand (PWA)'}
              >
                {isInstalled ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Download className={`w-3.5 h-3.5 shrink-0 ${isInstallable ? 'text-white' : 'text-indigo-600'}`} />
                )}
                <span className="hidden md:inline">
                  {isInstalled ? 'App Installed' : isInstallable ? 'Install App (1-Tap)' : 'Install App'}
                </span>
              </button>
            )}

            {/* Supabase Connected Database Badge */}
            <div
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 whitespace-nowrap"
              title="Supabase PostgreSQL & REST Connected"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Supabase</span>
            </div>

            {/* Personalize / Onboarding Quick Trigger */}
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-slate-600 hover:text-[#2D2A4A] hover:bg-slate-100 text-xs font-semibold border border-transparent hover:border-slate-200 transition-all cursor-pointer whitespace-nowrap"
                title="Re-open Onboarding & College Personalization"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Personalize</span>
              </button>
            )}

            {/* SOS Anti-Harassment & Mental Health Quick Trigger */}
            <button
              id="sos-safe-nav-trigger"
              onClick={() => setCurrentTab('safe-campus')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'safe-campus'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
              title="24x7 Anti-Harassment Cell & Mental Health Helpline"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" />
              <span className="hidden sm:inline">SOS Care</span>
            </button>

            {/* Wand AI Trigger Button */}
            <button
              id="wand-ai-nav-trigger"
              onClick={onOpenWandAI}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-amber-400 hover:bg-amber-500 text-[#2D2A4A] text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2D2A4A] shrink-0" />
              <span>{t.askWandAI || 'Ask Wand AI'}</span>
            </button>

            {/* Student Login or Logout Quick Action */}
            {studentProfile.name && studentProfile.name.trim() ? (
              onLogout && (
                <button
                  id="student-logout-nav-btn"
                  onClick={onLogout}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer whitespace-nowrap"
                  title="Logout and clear stored profile data"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Logout</span>
                </button>
              )
            ) : (
              <button
                id="student-login-nav-btn"
                onClick={() => setCurrentTab('login')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'login'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80'
                }`}
                title="Open Student Login / Register Page"
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Login</span>
              </button>
            )}

            {/* Notifications Bell */}
            <button
              id="notification-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full text-slate-600 hover:text-[#2D2A4A] hover:bg-slate-100 transition-colors focus:outline-hidden cursor-pointer shrink-0"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNoticesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Profile Avatar / Login */}
            <button
              id="user-profile-nav-btn"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shrink-0"
              title="Student Profile Settings"
            >
              <div className="w-7 h-7 rounded-full bg-[#2D2A4A] text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                {studentProfile.name && studentProfile.name.trim() ? (
                  studentProfile.name.trim().charAt(0).toUpperCase()
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight pr-2">
                <p className="font-bold text-[#2D2A4A] truncate max-w-[110px]">
                  {studentProfile.name && studentProfile.name.trim()
                    ? studentProfile.name
                    : 'Profile'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {studentProfile.name && studentProfile.name.trim()
                    ? studentProfile.mobileNumber
                      ? `+91 ${studentProfile.mobileNumber.slice(0, 5)}...`
                      : 'Logged In'
                    : 'Not Logged In'}
                </p>
              </div>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 shrink-0 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Horizontally Scrollable Feature Navigation Bar (Only this bar scrolls horizontally; main page stays fixed) */}
      <div className="w-full bg-slate-50/90 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center gap-1 py-1.5">
          {/* Desktop Left Scroll Arrow */}
          <button
            type="button"
            onClick={() => scrollMenu('left')}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs shrink-0 cursor-pointer transition-colors"
            aria-label="Scroll features left"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Feature Menu Container */}
          <nav
            ref={navScrollRef}
            aria-label="Feature navigation"
            className="navbar-menu feature-tabs flex-1 items-center gap-1.5 px-1 py-0.5"
          >
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#2D2A4A] text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:text-[#2D2A4A] hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-amber-300' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Scroll Arrow */}
          <button
            type="button"
            onClick={() => scrollMenu('right')}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs shrink-0 cursor-pointer transition-colors"
            aria-label="Scroll features right"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Select Role:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setUserRole('current_student')}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold ${
                  userRole === 'current_student'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setUserRole('prospective_student')}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold ${
                  userRole === 'prospective_student'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Prospective
              </button>
              <button
                onClick={() => setUserRole('college_admin')}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold ${
                  userRole === 'college_admin'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {onOpenInstall && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleNavInstall();
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs border transition-colors ${
                  isInstalled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isInstallable
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                }`}
              >
                {isInstalled ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isInstalled ? 'App Installed on Device' : isInstallable ? 'Install App (1-Tap)' : 'Install Student Wand App'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
