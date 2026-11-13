import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Sparkles,
  Lock,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { FacultyMember, TeacherReview, StudentProfile, TeacherCriteriaRatings } from '../types';
import { StarRatingInput } from './StarRatingInput';

interface TeacherRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: FacultyMember;
  currentStudent: StudentProfile;
  existingReview?: TeacherReview | null;
  onSubmitReview: (reviewData: Partial<TeacherReview>) => Promise<void> | void;
}

const COMMON_TAGS = [
  'Super Clear Explanations',
  'Fair Grader',
  'Industry Relevant',
  'Hands-on Labs',
  'Very Approachable',
  'Detailed Notes',
  'Challenging Quizzes',
  'Strict on Attendance',
  'Engaging Lectures',
  'Friendly Mentor',
  'Great Exam Notes',
  'High Startup Connections',
  'Project Based',
  'Inspiring Teacher',
];

export const TeacherRatingModal: React.FC<TeacherRatingModalProps> = ({
  isOpen,
  onClose,
  faculty,
  currentStudent,
  existingReview,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5.0);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [courseTaken, setCourseTaken] = useState<string>('');
  const [semesterTaken, setSemesterTaken] = useState<string>('Semester 5');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState<string>('');
  const [newCon, setNewCon] = useState<string>('');
  const [showAdvancedCriteria, setShowAdvancedCriteria] = useState<boolean>(true);
  const [criteria, setCriteria] = useState<TeacherCriteriaRatings>({
    clarity: 5.0,
    approachability: 5.0,
    gradingFairness: 4.5,
    materialQuality: 5.0,
    punctuality: 5.0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5.0);
      setIsAnonymous(Boolean(existingReview.isAnonymous));
      setCourseTaken(existingReview.courseTaken || '');
      setSemesterTaken(existingReview.semesterTaken || 'Semester 5');
      setTitle(existingReview.title || '');
      setContent(existingReview.content || '');
      setSelectedTags(existingReview.tags || []);
      setPros(existingReview.pros || []);
      setCons(existingReview.cons || []);
      if (existingReview.criteriaRatings) {
        setCriteria(existingReview.criteriaRatings);
      }
    } else {
      // Default to first subject taught by faculty
      const defaultSubject = faculty.subjectsTaught?.[0] || '';
      setCourseTaken(defaultSubject);
      setRating(5.0);
      setIsAnonymous(false);
      setTitle('');
      setContent('');
      setSelectedTags([]);
      setPros([]);
      setCons([]);
      setCriteria({
        clarity: 5.0,
        approachability: 5.0,
        gradingFairness: 4.5,
        materialQuality: 5.0,
        punctuality: 5.0,
      });
    }
    setErrorMsg(null);
  }, [existingReview, faculty, isOpen]);

  if (!isOpen) return null;

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= 6) return;
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddPro = () => {
    if (newPro.trim() && !pros.includes(newPro.trim())) {
      setPros([...pros, newPro.trim()]);
      setNewPro('');
    }
  };

  const handleAddCon = () => {
    if (newCon.trim() && !cons.includes(newCon.trim())) {
      setCons([...cons, newCon.trim()]);
      setNewCon('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }

    if (!content.trim() || content.trim().length < 10) {
      setErrorMsg('Please write a constructive review comment (at least 10 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmitReview({
        teacherId: faculty.id,
        studentId: currentStudent.id,
        studentName: currentStudent.name || 'Verified Student',
        studentDepartment: currentStudent.department || 'Computer Science',
        studentYear: currentStudent.year || 3,
        isAnonymous,
        courseTaken: courseTaken.trim() || faculty.subjectsTaught?.[0] || 'General Elective',
        semesterTaken,
        rating,
        criteriaRatings: criteria,
        title: title.trim() || undefined,
        content: content.trim(),
        pros: pros.length > 0 ? pros : undefined,
        cons: cons.length > 0 ? cons : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Failed to submit review. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        id="teacher-rating-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border-2 border-indigo-400 shrink-0">
              <img
                src={
                  faculty.avatarUrl ||
                  faculty.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={faculty.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white leading-tight">
                  {existingReview ? 'Update Your Rating & Review' : 'Rate & Review Teacher'}
                </h3>
              </div>
              <p className="text-xs text-indigo-200 truncate max-w-xs sm:max-w-md">
                {faculty.name} • {faculty.department}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* 1. Overall Star Rating Box */}
          <div className="p-4 bg-gradient-to-r from-amber-50/60 to-orange-50/40 rounded-xl border border-amber-200/80 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
              Overall Teaching Rating (1 - 5 Stars, Half-Stars Supported)
            </span>
            <div className="my-1">
              <StarRatingInput
                rating={rating}
                onChange={(val) => setRating(val)}
                size="xl"
                showValue
                idPrefix="modal-rate"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Hover over left/right side of stars to choose half-star values (e.g. 4.5)
            </p>
          </div>

          {/* 2. Advanced Criteria Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Detailed Quality Metrics (Optional)
              </span>
              <button
                type="button"
                onClick={() => setShowAdvancedCriteria(!showAdvancedCriteria)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {showAdvancedCriteria ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {showAdvancedCriteria && (
              <div className="space-y-3 pt-1">
                {[
                  {
                    key: 'clarity' as keyof TeacherCriteriaRatings,
                    label: 'Explanation Clarity & Problem Solving',
                  },
                  {
                    key: 'approachability' as keyof TeacherCriteriaRatings,
                    label: 'Approachability & Doubt Support',
                  },
                  {
                    key: 'gradingFairness' as keyof TeacherCriteriaRatings,
                    label: 'Fairness in Grading & Marks',
                  },
                  {
                    key: 'materialQuality' as keyof TeacherCriteriaRatings,
                    label: 'Class Notes & Study Material',
                  },
                  {
                    key: 'punctuality' as keyof TeacherCriteriaRatings,
                    label: 'Punctuality & Class Discipline',
                  },
                ].map((crit) => (
                  <div
                    key={crit.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                  >
                    <span className="text-slate-700 font-medium">{crit.label}</span>
                    <div className="flex items-center gap-2">
                      <StarRatingInput
                        rating={criteria[crit.key]}
                        onChange={(newVal) =>
                          setCriteria({ ...criteria, [crit.key]: newVal })
                        }
                        size="sm"
                        idPrefix={`crit-${crit.key}`}
                      />
                      <span className="w-8 text-right font-bold text-slate-800">
                        {criteria[crit.key].toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Course Context & Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course / Subject Taken
              </label>
              <input
                type="text"
                value={courseTaken}
                onChange={(e) => setCourseTaken(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                list="subjects-list"
              />
              <datalist id="subjects-list">
                {faculty.subjectsTaught?.map((subj, idx) => (
                  <option key={idx} value={subj} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Semester Taken
              </label>
              <select
                value={semesterTaken}
                onChange={(e) => setSemesterTaken(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={`Semester ${sem}`}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Post Anonymously
                </span>
                <span className="text-[11px] text-slate-500">
                  Hide your name from the public review card while retaining verified status.
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>

          {/* 4. Review Title & Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Review Headline (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best instructor for competitive coding and algorithms!"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              maxLength={100}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Your Review & Advice for Future Students <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {content.length} / 1000 chars
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your genuine experience regarding lecture clarity, assignment load, lab mentorship, exam preparation tips, and overall teaching style..."
              rows={4}
              maxLength={1000}
              className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
              required
            />
          </div>

          {/* 5. Feedback Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Feedback Tags (Max 6)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Pros and Areas of Improvement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Pros */}
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                Highlights / Pros (Optional)
              </label>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  value={newPro}
                  onChange={(e) => setNewPro(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPro())}
                  placeholder="e.g. Always clears doubts"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddPro}
                  className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-1">
                {pros.map((p, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-900 px-2 py-1 rounded border border-emerald-200"
                  >
                    <span>+ {p}</span>
                    <button
                      type="button"
                      onClick={() => setPros(pros.filter((_, i) => i !== idx))}
                      className="text-emerald-700 hover:text-emerald-900 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div>
              <label className="block text-xs font-bold text-amber-800 mb-1">
                Areas for Improvement (Optional)
              </label>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  value={newCon}
                  onChange={(e) => setNewCon(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCon())}
                  placeholder="e.g. Strict deadlines"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCon}
                  className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-1">
                {cons.map((c, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between text-xs bg-amber-50 text-amber-900 px-2 py-1 rounded border border-amber-200"
                  >
                    <span>- {c}</span>
                    <button
                      type="button"
                      onClick={() => setCons(cons.filter((_, i) => i !== idx))}
                      className="text-amber-700 hover:text-amber-900 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Only 1 active review per student per teacher.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
