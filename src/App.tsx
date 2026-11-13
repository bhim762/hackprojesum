import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { CollegeExplorer } from './components/CollegeExplorer';
import { CampusLife } from './components/CampusLife';
import { FacultyDirectory } from './components/FacultyDirectory';
import { Academics } from './components/Academics';
import { FeesAndScholarships } from './components/FeesAndScholarships';
import { Administration } from './components/Administration';
import { ProblemSolver } from './components/ProblemSolver';
import { CollegeCompare } from './components/CollegeCompare';
import { CommunityReviews } from './components/CommunityReviews';
import { NotificationDrawer } from './components/NotificationDrawer';
import { WandAIModal } from './components/WandAIModal';
import { ProfileModal } from './components/ProfileModal';
import { InstallAppModal } from './components/InstallAppModal';
import { AdminPanel } from './components/AdminPanel';
import { OnboardingScreen } from './components/OnboardingScreen';
import { SeniorsAlumniHub } from './components/SeniorsAlumniHub';
import { InternshipsTrainingHub } from './components/InternshipsTrainingHub';
import { SafeCampusHub } from './components/SafeCampusHub';
import { StudentLogin } from './components/StudentLogin';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  MOCK_COLLEGES,
  MOCK_FACULTY,
  MOCK_TIMETABLE,
  MOCK_ATTENDANCE,
  MOCK_ASSIGNMENTS,
  MOCK_STUDY_MATERIALS,
  MOCK_EXAMS,
  MOCK_NOTICES,
  MOCK_EVENTS,
  MOCK_REVIEWS,
  DEFAULT_STUDENT_PROFILE,
} from './data/mockData';
import {
  UserRole,
  StudentProfile,
  College,
  NoticeItem,
  EventItem,
  CollegeReview,
  OnboardingData,
  SupportedLanguage,
} from './types';

function sanitizeStudentProfile(raw: any): StudentProfile {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_STUDENT_PROFILE };
  }

  const demoNames = ['aryan sharma', 'rahul sharma', 'ananya verma', 'pooja iyer'];
  const rawName = typeof raw.name === 'string' ? raw.name.trim() : '';
  const isLegacyDemo =
    raw.id === 'std-2024-001' ||
    raw.email === 'aryan.sharma@apex.edu.in' ||
    (rawName && demoNames.includes(rawName.toLowerCase()));

  if (isLegacyDemo) {
    return { ...DEFAULT_STUDENT_PROFILE };
  }

  return {
    ...DEFAULT_STUDENT_PROFILE,
    id: typeof raw.id === 'string' ? raw.id : '',
    name: rawName,
    email: typeof raw.email === 'string' ? raw.email.trim() : '',
    mobileNumber: typeof raw.mobileNumber === 'string' ? raw.mobileNumber.trim() : '',
    role:
      raw.role === 'prospective_student' || raw.role === 'college_admin'
        ? raw.role
        : 'current_student',
    avatarUrl: typeof raw.avatarUrl === 'string' ? raw.avatarUrl : '',
    age: typeof raw.age === 'number' ? raw.age : 0,
    city: typeof raw.city === 'string' ? raw.city : '',
    state: typeof raw.state === 'string' ? raw.state : '',
    country: typeof raw.country === 'string' ? raw.country : 'India',
    collegeId: typeof raw.collegeId === 'string' && raw.collegeId ? raw.collegeId : 'clg-apex-01',
    collegeName: typeof raw.collegeName === 'string' ? raw.collegeName : '',
    course: typeof raw.course === 'string' ? raw.course : '',
    department: typeof raw.department === 'string' ? raw.department : '',
    branch: typeof raw.branch === 'string' ? raw.branch : '',
    semester: typeof raw.semester === 'number' && raw.semester > 0 ? raw.semester : 1,
    year: typeof raw.year === 'number' && raw.year > 0 ? raw.year : 1,
    rollNumber: typeof raw.rollNumber === 'string' ? raw.rollNumber : '',
    language: (typeof raw.language === 'string' ? raw.language : 'en') as SupportedLanguage,
    onboardingCompleted: Boolean(raw.onboardingCompleted),
    interests: Array.isArray(raw.interests) ? raw.interests : [],
    careerGoals: Array.isArray(raw.careerGoals) ? raw.careerGoals : [],
    targetBudget: typeof raw.targetBudget === 'number' ? raw.targetBudget : 0,
    preferredCity: typeof raw.preferredCity === 'string' ? raw.preferredCity : '',
  };
}

export default function App() {
  // Navigation & Role States — Always start on 'home' so Homepage loads immediately
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [userRole, setUserRole] = useState<UserRole>('current_student');
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    try {
      const authSession = localStorage.getItem('studentwand_auth_session');
      const saved = localStorage.getItem('studentwand_profile');
      if (saved && authSession) {
        const parsed = JSON.parse(saved);
        const sanitized = sanitizeStudentProfile(parsed);
        if (!sanitized.name) {
          localStorage.removeItem('studentwand_profile');
        }
        return sanitized;
      }
      localStorage.removeItem('studentwand_profile');
    } catch (e) {
      console.error('Failed to read profile from storage:', e);
    }
    return { ...DEFAULT_STUDENT_PROFILE };
  });

  // Start with onboarding closed so the Home page always loads directly
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Dynamic Data States
  const [colleges] = useState<College[]>(MOCK_COLLEGES);
  const [notices, setNotices] = useState<NoticeItem[]>(MOCK_NOTICES);
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);
  const [reviews, setReviews] = useState<CollegeReview[]>(MOCK_REVIEWS);

  // Modals & Drawers
  const [isWandAIOpen, setIsWandAIOpen] = useState(false);
  const [wandAIPrompt, setWandAIPrompt] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  // Active college reference with safe fallback
  const activeCollege =
    colleges.find((c) => c.id === studentProfile?.collegeId) || colleges[0];

  // Save profile changes to local storage
  const handleSaveProfile = (updated: StudentProfile) => {
    const cleanProfile = sanitizeStudentProfile(updated);
    setStudentProfile(cleanProfile);
    try {
      localStorage.setItem('studentwand_profile', JSON.stringify(cleanProfile));
      if (cleanProfile.name) {
        localStorage.setItem(
          'studentwand_auth_session',
          JSON.stringify({
            name: cleanProfile.name,
            email: cleanProfile.email || '',
            mobile: cleanProfile.mobileNumber || '',
            verifiedAt: new Date().toISOString(),
          })
        );
      }
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  };

  // Clear stored user data on logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('studentwand_profile');
      localStorage.removeItem('studentwand_auth_session');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    setStudentProfile({ ...DEFAULT_STUDENT_PROFILE });
    setCurrentTab('login');
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    const updated: StudentProfile = {
      ...studentProfile,
      language: lang,
    };
    handleSaveProfile(updated);
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    const mappedRole: UserRole =
      data.studentStatus === 'prospective_student' ? 'prospective_student' : 'current_student';

    const updatedProfile = sanitizeStudentProfile({
      ...studentProfile,
      collegeId: data.collegeId || studentProfile.collegeId || 'clg-apex-01',
      collegeName: data.collegeName || studentProfile.collegeName || '',
      department: data.branch || studentProfile.department || '',
      branch: data.branch || studentProfile.branch || '',
      course: data.course || studentProfile.course || '',
      year: data.year ? parseInt(data.year, 10) || studentProfile.year : studentProfile.year,
      semester:
        typeof data.semester === 'number'
          ? data.semester
          : data.semester
          ? parseInt(data.semester, 10) || studentProfile.semester
          : studentProfile.semester,
      state: data.state || studentProfile.state || '',
      country: data.country || 'India',
      city: data.city || studentProfile.city || '',
      language: data.language || studentProfile.language || 'en',
      role: mappedRole,
      onboardingCompleted: true,
      interestedColleges: data.interestedColleges,
      isCustomCollege: data.isCustomCollege,
      customCollegeUniversity: data.customCollegeUniversity,
      customCollegeWebsite: data.customCollegeWebsite,
      verificationStatus: data.verificationStatus,
    });

    setStudentProfile(updatedProfile);
    setUserRole(mappedRole);
    try {
      localStorage.setItem('studentwand_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('studentwand_onboarding_completed', 'true');
    } catch (e) {
      console.error('Failed to save onboarding:', e);
    }
    setShowOnboarding(false);

    if (data.studentStatus === 'prospective_student') {
      setCurrentTab('explorer');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleOpenWandAIWithPrompt = (prompt: string) => {
    setWandAIPrompt(prompt);
    setIsWandAIOpen(true);
  };

  const handleAddNotice = (newNotice: NoticeItem) => {
    setNotices([newNotice, ...notices]);
  };

  const handleAddEvent = (newEvent: EventItem) => {
    setEvents([newEvent, ...events]);
  };

  const handleAddReview = (newReview: CollegeReview) => {
    setReviews([newReview, ...reviews]);
  };

  const handleLoginSuccess = (profileData: Partial<StudentProfile>) => {
    const updatedProfile = sanitizeStudentProfile({
      ...studentProfile,
      ...profileData,
      role: 'current_student',
      onboardingCompleted: true,
    });
    handleSaveProfile(updatedProfile);
    setUserRole('current_student');
    setCurrentTab('dashboard');
  };

  // Render active tab with guaranteed fallback to LandingPage (Home)
  const renderActiveView = () => {
    switch (currentTab) {
      case 'login':
        return (
          <StudentLogin
            onLoginSuccess={handleLoginSuccess}
            currentProfile={studentProfile}
            initialLanguage={studentProfile?.language || 'en'}
            onChangeLanguage={handleLanguageChange}
            onCancel={() => setCurrentTab('home')}
            onLogout={handleLogout}
          />
        );
      case 'dashboard':
        return (
          <StudentDashboard
            studentProfile={studentProfile}
            activeCollege={activeCollege}
            timetable={MOCK_TIMETABLE}
            attendance={MOCK_ATTENDANCE}
            assignments={MOCK_ASSIGNMENTS}
            exams={MOCK_EXAMS}
            notices={notices}
            events={events}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onLogout={handleLogout}
          />
        );
      case 'explorer':
        return (
          <CollegeExplorer
            colleges={colleges}
            onCompareCollege={() => setCurrentTab('compare')}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
          />
        );
      case 'campus':
        return (
          <CampusLife
            college={activeCollege}
            events={events}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
          />
        );
      case 'faculty':
        return (
          <FacultyDirectory
            facultyList={MOCK_FACULTY}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
            currentStudent={studentProfile}
          />
        );
      case 'academics':
        return (
          <Academics
            timetable={MOCK_TIMETABLE}
            attendance={MOCK_ATTENDANCE}
            assignments={MOCK_ASSIGNMENTS}
            materials={MOCK_STUDY_MATERIALS}
            exams={MOCK_EXAMS}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
          />
        );
      case 'fees':
        return (
          <FeesAndScholarships
            college={activeCollege}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
          />
        );
      case 'admin':
        return (
          <Administration
            college={activeCollege}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
          />
        );
      case 'problems':
        return (
          <ProblemSolver
            college={activeCollege}
            studentProfile={studentProfile}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
          />
        );
      case 'compare':
        return (
          <CollegeCompare
            colleges={colleges}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
          />
        );
      case 'alumni':
        return (
          <SeniorsAlumniHub
            studentProfile={studentProfile}
            activeCollege={activeCollege}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
          />
        );
      case 'internships':
        return (
          <InternshipsTrainingHub
            studentProfile={studentProfile}
            activeCollege={activeCollege}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
          />
        );
      case 'safe-campus':
        return (
          <SafeCampusHub
            studentProfile={studentProfile}
            activeCollege={activeCollege}
            onOpenWandAIWithPrompt={handleOpenWandAIWithPrompt}
          />
        );
      case 'community':
        return (
          <CommunityReviews
            reviews={reviews}
            studentProfile={studentProfile}
            onAddReview={handleAddReview}
          />
        );
      case 'admin-portal':
        return (
          <AdminPanel
            college={activeCollege}
            notices={notices}
            faculty={MOCK_FACULTY}
            events={events}
            onAddNotice={handleAddNotice}
            onAddEvent={handleAddEvent}
          />
        );
      case 'home':
      default:
        return (
          <LandingPage
            onExploreColleges={() => setCurrentTab('explorer')}
            onGetStarted={() => {
              if (userRole === 'prospective_student') {
                setCurrentTab('explorer');
              } else {
                setCurrentTab('dashboard');
              }
            }}
            onAskWandAI={() => {
              setWandAIPrompt('');
              setIsWandAIOpen(true);
            }}
            onOpenLogin={() => setCurrentTab('login')}
            onSelectFeatureTab={(tab) => setCurrentTab(tab)}
            userRole={userRole}
            setUserRole={setUserRole}
          />
        );
    }
  };

  if (showOnboarding) {
    return (
      <ErrorBoundary onReset={() => setShowOnboarding(false)}>
        <OnboardingScreen
          initialProfile={studentProfile}
          onComplete={handleOnboardingComplete}
          onSkip={() => {
            localStorage.setItem('studentwand_onboarding_completed', 'true');
            setShowOnboarding(false);
          }}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        studentProfile={studentProfile}
        unreadNoticesCount={notices.length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenWandAI={() => {
          setWandAIPrompt('');
          setIsWandAIOpen(true);
        }}
        onOpenAuth={() => setIsProfileOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onChangeLanguage={handleLanguageChange}
        onOpenInstall={() => setIsInstallOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Router with ErrorBoundary & Fallback */}
      <main id="main-content-area" className="flex-1 w-full pb-20 xl:pb-10">
        <ErrorBoundary
          key={currentTab}
          onReset={() => {
            setCurrentTab('home');
          }}
        >
          {renderActiveView()}
        </ErrorBoundary>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        onOpenWandAI={() => {
          setWandAIPrompt('');
          setIsWandAIOpen(true);
        }}
        onOpenMore={() => setIsProfileOpen(true)}
      />

      {/* Modals wrapped in ErrorBoundary so they can never crash the page */}
      <ErrorBoundary>
        <WandAIModal
          isOpen={isWandAIOpen}
          onClose={() => setIsWandAIOpen(false)}
          college={activeCollege}
          studentProfile={studentProfile}
          initialPrompt={wandAIPrompt}
        />

        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notices={notices}
          onMarkAllRead={() => {
            setNotices([]);
            setIsNotificationsOpen(false);
          }}
        />

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          studentProfile={studentProfile}
          onSaveProfile={handleSaveProfile}
          userRole={userRole}
          setUserRole={setUserRole}
          colleges={colleges}
          onReRunOnboarding={() => setShowOnboarding(true)}
          onOpenInstall={() => setIsInstallOpen(true)}
          onNavigateToLogin={() => setCurrentTab('login')}
          onLogout={handleLogout}
        />

        <InstallAppModal
          isOpen={isInstallOpen}
          onClose={() => setIsInstallOpen(false)}
        />

        <OfflineIndicator />
      </ErrorBoundary>
    </div>
  );
}
