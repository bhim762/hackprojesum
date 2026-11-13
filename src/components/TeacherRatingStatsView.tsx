import React from 'react';
import { Star, Award, CheckCircle2, TrendingUp, BookOpen, Clock, Smile, Scale, FileText } from 'lucide-react';
import { TeacherRatingStats } from '../types';
import { StarRatingInput } from './StarRatingInput';

interface TeacherRatingStatsViewProps {
  stats: TeacherRatingStats;
  onFilterByStar?: (star: number | null) => void;
  selectedStarFilter?: number | null;
}

export const TeacherRatingStatsView: React.FC<TeacherRatingStatsViewProps> = ({
  stats,
  onFilterByStar,
  selectedStarFilter,
}) => {
  const total = stats.totalRatingsCount || 0;

  const distribution = [
    { stars: 5, count: stats.distribution[5] || 0 },
    { stars: 4, count: stats.distribution[4] || 0 },
    { stars: 3, count: stats.distribution[3] || 0 },
    { stars: 2, count: stats.distribution[2] || 0 },
    { stars: 1, count: stats.distribution[1] || 0 },
  ];

  const criteriaList = [
    {
      label: 'Clarity of Explanation',
      val: stats.criteriaAverages?.clarity || 5.0,
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Approachability & Mentorship',
      val: stats.criteriaAverages?.approachability || 5.0,
      icon: Smile,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Grading & Marking Fairness',
      val: stats.criteriaAverages?.gradingFairness || 5.0,
      icon: Scale,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Course Notes & Study Material',
      val: stats.criteriaAverages?.materialQuality || 5.0,
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Punctuality & Discipline',
      val: stats.criteriaAverages?.punctuality || 5.0,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Average Score */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 bg-gradient-to-b from-amber-50/70 to-amber-50/20 rounded-xl border border-amber-100 text-center">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
            <span>{stats.averageRating.toFixed(1)}</span>
            <span className="text-xl sm:text-2xl font-bold text-amber-500">/ 5.0</span>
          </div>

          <div className="my-2.5">
            <StarRatingInput
              rating={stats.averageRating}
              readOnly
              size="lg"
              idPrefix="stats-big"
            />
          </div>

          <p className="text-xs font-semibold text-slate-600 mb-2">
            Based on <span className="font-bold text-slate-900">{total} verified</span> student rating{total === 1 ? '' : 's'}
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/70 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats.recommendationPercentage}% Recommend</span>
          </div>
        </div>

        {/* Middle Column: Star Distribution Bars (Clickable filter) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
            <span>Rating Distribution</span>
            {selectedStarFilter !== null && onFilterByStar && (
              <button
                type="button"
                onClick={() => onFilterByStar(null)}
                className="text-indigo-600 hover:text-indigo-800 underline text-[11px]"
              >
                Clear Filter
              </button>
            )}
          </div>

          {distribution.map(({ stars, count }) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            const isSelected = selectedStarFilter === stars;

            return (
              <button
                key={stars}
                type="button"
                onClick={() => onFilterByStar && onFilterByStar(isSelected ? null : stars)}
                className={`w-full flex items-center gap-2.5 text-xs group p-1 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-amber-50 ring-1 ring-amber-300'
                    : 'hover:bg-slate-50'
                }`}
                title={`Filter by ${stars} stars (${count} reviews)`}
              >
                <div className="flex items-center gap-1 w-10 shrink-0 font-medium text-slate-700 group-hover:text-amber-600">
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stars >= 4
                        ? 'bg-amber-400'
                        : stars === 3
                        ? 'bg-amber-300'
                        : 'bg-amber-200'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="w-12 text-right text-slate-500 font-medium shrink-0">
                  {count} <span className="text-[10px] text-slate-400">({percentage}%)</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Key Teaching Quality Criteria Averages */}
        <div className="lg:col-span-4 space-y-2.5 border-t lg:border-t-0 lg:border-l lg:border-slate-100 lg:pl-6 pt-4 lg:pt-0">
          <span className="text-xs font-bold text-slate-700 block mb-1">
            Teaching Quality Breakdown
          </span>

          {criteriaList.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="truncate max-w-[140px] sm:max-w-[180px]">{item.label}</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <span>{item.val.toFixed(1)}</span>
                <span className="text-[10px] text-slate-400 font-normal">/ 5</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consensus Tags Pill Row */}
      {stats.topTags && stats.topTags.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600 shrink-0 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            Top Student Tags:
          </span>
          {stats.topTags.map((tagObj, idx) => (
            <span
              key={idx}
              className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60"
            >
              {tagObj.tag}
              <span className="ml-1 text-[10px] font-bold text-slate-500">
                ×{tagObj.count}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
