import React, { useState } from 'react';
import {
  ThumbsUp,
  Flag,
  Edit2,
  Trash2,
  CheckCircle,
  User,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { TeacherReview, StudentProfile } from '../types';
import { StarRatingInput } from './StarRatingInput';

interface TeacherReviewCardProps {
  review: TeacherReview;
  currentStudent?: StudentProfile;
  onHelpfulToggle: (reviewId: string) => void;
  onEditReview?: (review: TeacherReview) => void;
  onDeleteReview?: (reviewId: string) => void;
  onReportReview?: (reviewId: string, reason: string) => void;
}

export const TeacherReviewCard: React.FC<TeacherReviewCardProps> = ({
  review,
  currentStudent,
  onHelpfulToggle,
  onEditReview,
  onDeleteReview,
  onReportReview,
}) => {
  const [showCriteria, setShowCriteria] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate language');
  const [hasReported, setHasReported] = useState(review.isReported || false);

  const isOwner = currentStudent && review.studentId === currentStudent.id;
  const isVotedHelpful =
    currentStudent && review.helpfulVoterIds?.includes(currentStudent.id);

  const handleReportSubmit = () => {
    if (onReportReview) {
      onReportReview(review.id, reportReason);
      setHasReported(true);
      setShowReportDialog(false);
    }
  };

  return (
    <div
      id={`review-card-${review.id}`}
      className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-200"
    >
      {/* Header with Student Info and Actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 shrink-0">
            {review.isAnonymous ? (
              <User className="w-5 h-5 text-slate-400" />
            ) : (
              review.studentName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900">
                {review.isAnonymous ? 'Anonymous Student' : review.studentName}
              </h4>
              {!review.isAnonymous && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <CheckCircle className="w-3 h-3" />
                  Verified Student
                </span>
              )}
              {isOwner && (
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Your Review
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
              {review.courseTaken && (
                <span className="font-medium text-slate-700">
                  {review.courseTaken}
                </span>
              )}
              {review.semesterTaken && (
                <>
                  <span>•</span>
                  <span>{review.semesterTaken}</span>
                </>
              )}
              <span>•</span>
              <span>{review.date}</span>
              {review.lastEditedDate && (
                <span className="italic text-slate-400">
                  (Edited {review.lastEditedDate})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rating and Owner Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70">
            <StarRatingInput
              rating={review.rating}
              readOnly
              size="sm"
              idPrefix={`card-${review.id}`}
            />
            <span className="text-sm font-bold text-amber-900 ml-1">
              {review.rating.toFixed(1)}
            </span>
          </div>

          {isOwner && (
            <div className="flex items-center gap-1 ml-1">
              {onEditReview && (
                <button
                  id={`edit-review-btn-${review.id}`}
                  onClick={() => onEditReview(review)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit your review"
                  aria-label="Edit review"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDeleteReview && (
                <button
                  id={`delete-review-btn-${review.id}`}
                  onClick={() => onDeleteReview(review.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete your review"
                  aria-label="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Title */}
      {review.title && (
        <h5 className="text-base font-semibold text-slate-900 mb-1.5 leading-snug">
          {review.title}
        </h5>
      )}

      {/* Review Content */}
      <p className="text-sm text-slate-700 leading-relaxed mb-3 whitespace-pre-line">
        {review.content}
      </p>

      {/* Detailed Criteria Ratings Dropdown */}
      {review.criteriaRatings && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowCriteria(!showCriteria)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            {showCriteria ? (
              <>
                <span>Hide Detailed Criteria</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>View Detailed Criteria Breakdown</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {showCriteria && (
            <div className="mt-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs animate-in fade-in duration-200">
              <div className="flex flex-col">
                <span className="text-slate-500">Clarity</span>
                <span className="font-semibold text-slate-800">
                  {review.criteriaRatings.clarity?.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500">Approachability</span>
                <span className="font-semibold text-slate-800">
                  {review.criteriaRatings.approachability?.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500">Grading Fairness</span>
                <span className="font-semibold text-slate-800">
                  {review.criteriaRatings.gradingFairness?.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500">Materials Quality</span>
                <span className="font-semibold text-slate-800">
                  {review.criteriaRatings.materialQuality?.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500">Punctuality</span>
                <span className="font-semibold text-slate-800">
                  {review.criteriaRatings.punctuality?.toFixed(1)} / 5.0
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pros and Cons */}
      {((review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0)) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {review.pros && review.pros.length > 0 && (
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-lg">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block mb-1">
                Pros
              </span>
              <ul className="text-xs text-emerald-900 space-y-1">
                {review.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.cons && review.cons.length > 0 && (
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-lg">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block mb-1">
                Areas for Improvement
              </span>
              <ul className="text-xs text-amber-900 space-y-1">
                {review.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">-</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Feedback Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {review.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 rounded-md transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Official Faculty Reply */}
      {review.officialReplies && review.officialReplies.length > 0 && (
        <div className="mt-3 p-3.5 bg-indigo-50/70 border-l-3 border-indigo-500 rounded-r-lg space-y-2">
          {review.officialReplies.map((reply) => (
            <div key={reply.id}>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-950 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>{reply.authorName}</span>
                <span className="text-[10px] bg-indigo-200/80 text-indigo-800 px-1.5 py-0.5 rounded">
                  {reply.authorRole}
                </span>
                <span className="text-[11px] font-normal text-slate-500 ml-auto">
                  {reply.date}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic pl-5">
                "{reply.content}"
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer: Helpful Button & Report Button */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
        <button
          id={`helpful-btn-${review.id}`}
          onClick={() => onHelpfulToggle(review.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            isVotedHelpful
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title="Mark this review as helpful"
        >
          <ThumbsUp
            className={`w-3.5 h-3.5 ${
              isVotedHelpful ? 'fill-indigo-600 text-indigo-600' : ''
            }`}
          />
          <span>Helpful</span>
          <span className="font-semibold">({review.helpfulCount || 0})</span>
        </button>

        <div className="relative">
          {hasReported ? (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-slate-400" />
              Report Submitted
            </span>
          ) : (
            <button
              id={`report-review-btn-${review.id}`}
              onClick={() => setShowReportDialog(!showReportDialog)}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors inline-flex items-center gap-1"
              title="Report inappropriate review"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="text-[11px]">Report</span>
            </button>
          )}

          {/* Report Popover Dialog */}
          {showReportDialog && (
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-white rounded-xl shadow-xl border border-slate-200 z-20 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Review</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                Help keep the community accurate and respectful. Select a reason:
              </p>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full text-xs p-1.5 mb-3 border border-slate-200 rounded-md focus:ring-1 focus:ring-rose-500 bg-white"
              >
                <option value="Inappropriate Language">Inappropriate Language</option>
                <option value="False Information">False Information</option>
                <option value="Spam or Promotion">Spam or Promotion</option>
                <option value="Harassment or Abuse">Harassment or Personal Attack</option>
                <option value="Not a genuine student">Not a genuine student</option>
              </select>
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowReportDialog(false)}
                  className="px-2 py-1 text-slate-500 hover:bg-slate-100 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReportSubmit}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
