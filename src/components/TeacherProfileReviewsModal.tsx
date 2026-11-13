import React, { useState, useMemo } from 'react';
import {
  X,
  Star,
  Sparkles,
  MessageSquare,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  Mail,
  MapPin,
  Clock,
  Award,
  CheckCircle,
  PlusCircle,
  Edit,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { FacultyMember, TeacherReview, TeacherRatingStats, StudentProfile } from '../types';
import { StarRatingInput } from './StarRatingInput';
import { TeacherRatingStatsView } from './TeacherRatingStatsView';
import { TeacherReviewCard } from './TeacherReviewCard';
import { computeTeacherRatingStats } from '../data/mockData';

interface TeacherProfileReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: FacultyMember;
  allReviews: TeacherReview[];
  currentStudent: StudentProfile;
  onOpenRateModal: (faculty: FacultyMember) => void;
  onHelpfulToggle: (reviewId: string) => void;
  onEditReview: (review: TeacherReview) => void;
  onDeleteReview: (reviewId: string) => void;
  onReportReview: (reviewId: string, reason: string) => void;
  onAskWandAI?: (prompt: string) => void;
}

export const TeacherProfileReviewsModal: React.FC<TeacherProfileReviewsModalProps> = ({
  isOpen,
  onClose,
  faculty,
  allReviews,
  currentStudent,
  onOpenRateModal,
  onHelpfulToggle,
  onEditReview,
  onDeleteReview,
  onReportReview,
  onAskWandAI,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'highest' | 'lowest' | 'most_helpful'>('latest');

  // Filter reviews for this teacher
  const teacherReviews = useMemo(() => {
    return allReviews.filter(
      (r) => r.teacherId === faculty.id && r.status === 'published'
    );
  }, [allReviews, faculty.id]);

  // Compute live dynamic stats
  const stats: TeacherRatingStats = useMemo(() => {
    return computeTeacherRatingStats(faculty.id, allReviews);
  }, [faculty.id, allReviews]);

  // Check if current user already submitted a review
  const userReview = useMemo(() => {
    return allReviews.find(
      (r) => r.teacherId === faculty.id && r.studentId === currentStudent.id
    );
  }, [allReviews, faculty.id, currentStudent.id]);

  // Filter & sort reviews for display
  const filteredReviews = useMemo(() => {
    let list = [...teacherReviews];

    if (starFilter !== null) {
      list = list.filter(
        (r) => Math.floor(r.rating) === starFilter || Math.round(r.rating) === starFilter
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.content.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.courseTaken?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === 'most_helpful') {
      list.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    } else {
      // latest
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return list;
  }, [teacherReviews, starFilter, searchQuery, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        id="teacher-profile-reviews-modal"
        className="relative w-full max-w-4xl bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header with Faculty Info & Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pr-8">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-indigo-400 shadow-md shrink-0">
                <img
                  src={
                    faculty.avatarUrl ||
                    faculty.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={faculty.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {faculty.name}
                  </h2>
                  {faculty.isAvailableForMentorship && (
                    <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Open for Mentorship
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                  {faculty.title || faculty.designation} • {faculty.department}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    {faculty.qualification || faculty.qualifications}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    {faculty.experienceYears} Years Experience
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button to Rate */}
            <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id="modal-open-rate-teacher-btn"
                onClick={() => onOpenRateModal(faculty)}
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {userReview ? (
                  <>
                    <Edit className="w-4 h-4" />
                    <span>Update Your Review</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>Rate & Review Teacher</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* Faculty Quick Meta Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Office Cabin</span>
                <span className="font-semibold">{faculty.officeRoom || faculty.cabinRoom || 'Admin Block'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Consultation Hours</span>
                <span className="font-semibold">{faculty.consultationHours || 'Daily 3:00 PM - 5:00 PM'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Mail className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Official Email</span>
                <span className="font-semibold truncate block">{faculty.officialEmail || faculty.email}</span>
              </div>
            </div>
          </div>

          {/* Subjects Taught & Teaching Philosophy */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Subjects & Courses Taught
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(faculty.subjectsTaught || faculty.coursesTaught || []).map((subj, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100"
                  >
                    {subj}
                  </span>
                ))}
              </div>
            </div>

            {(faculty.teachingStyleSummary || faculty.teachingStyle) && (
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Teaching Methodology: </span>
                {faculty.teachingStyleSummary || faculty.teachingStyle}
              </div>
            )}
          </div>

          {/* Teacher Rating Statistics Dashboard */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Student Ratings & Rating Distribution</span>
              </h3>
              <span className="text-xs text-slate-500">
                {stats.totalRatingsCount} Total Reviews
              </span>
            </div>

            <TeacherRatingStatsView
              stats={stats}
              selectedStarFilter={starFilter}
              onFilterByStar={(star) => setStarFilter(star)}
            />
          </div>

          {/* Search, Filter & Reviews List Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Student Reviews ({filteredReviews.length})</span>
                </h3>
                {starFilter !== null && (
                  <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    {starFilter}★ Only
                    <button
                      type="button"
                      onClick={() => setStarFilter(null)}
                      className="hover:text-amber-700 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              {/* Search and Sort Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reviews..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs">
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-slate-700 text-xs focus:outline-none"
                  >
                    <option value="latest">Latest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                    <option value="most_helpful">Most Helpful</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List of Reviews */}
            {filteredReviews.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No reviews found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || starFilter !== null
                    ? 'Try clearing your search or star filters to view all reviews.'
                    : 'Be the first student to rate and review this professor!'}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenRateModal(faculty)}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Write the First Review</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredReviews.map((rev) => (
                  <TeacherReviewCard
                    key={rev.id}
                    review={rev}
                    currentStudent={currentStudent}
                    onHelpfulToggle={onHelpfulToggle}
                    onEditReview={onEditReview}
                    onDeleteReview={onDeleteReview}
                    onReportReview={onReportReview}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Wand AI Insight Action */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          {onAskWandAI && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAskWandAI(
                  `Give me an honest student summary of ${faculty.name} (${faculty.department}) based on ratings and teaching style.`
                );
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Wand AI for Professor Insights</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
