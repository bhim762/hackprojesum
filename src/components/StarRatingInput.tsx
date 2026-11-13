import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  rating: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  allowHalf?: boolean;
  showValue?: boolean;
  idPrefix?: string;
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  rating,
  onChange,
  readOnly = false,
  size = 'md',
  allowHalf = true,
  showValue = false,
  idPrefix = 'star',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-2xl font-black',
  };

  const getRatingLabel = (val: number) => {
    if (val >= 4.8) return 'Outstanding';
    if (val >= 4.3) return 'Excellent';
    if (val >= 3.8) return 'Very Good';
    if (val >= 3.3) return 'Good';
    if (val >= 2.5) return 'Average';
    if (val >= 1.5) return 'Below Average';
    return 'Poor';
  };

  const handleStarMouseMove = (starIndex: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !onChange) return;
    if (!allowHalf) {
      setHoverRating(starIndex);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const isLeftHalf = event.clientX - rect.left < rect.width / 2;
    setHoverRating(isLeftHalf ? starIndex - 0.5 : starIndex);
  };

  const handleStarClick = (starIndex: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !onChange) return;
    if (!allowHalf) {
      onChange(starIndex);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const isLeftHalf = event.clientX - rect.left < rect.width / 2;
    const finalVal = isLeftHalf ? starIndex - 0.5 : starIndex;
    onChange(finalVal);
  };

  return (
    <div className="inline-flex items-center gap-2 select-none" id={`${idPrefix}-container`}>
      <div
        className="inline-flex items-center gap-0.5"
        onMouseLeave={() => !readOnly && setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = activeRating >= starIndex;
          const isHalf = activeRating >= starIndex - 0.5 && activeRating < starIndex;

          return (
            <div
              key={starIndex}
              id={`${idPrefix}-star-${starIndex}`}
              className={`relative ${
                !readOnly ? 'cursor-pointer transition-transform hover:scale-110' : ''
              }`}
              onMouseMove={(e) => handleStarMouseMove(starIndex, e)}
              onClick={(e) => handleStarClick(starIndex, e)}
              role={readOnly ? 'presentation' : 'button'}
              tabIndex={readOnly ? -1 : 0}
              aria-label={`${starIndex} Star`}
            >
              {/* Background empty star */}
              <Star
                className={`${sizeClasses[size]} text-slate-200 fill-slate-100 transition-colors`}
              />

              {/* Full or half overlay */}
              {(isFull || isHalf) && (
                <div
                  className="absolute inset-0 overflow-hidden text-amber-400"
                  style={{ width: isFull ? '100%' : '50%' }}
                >
                  <Star
                    className={`${sizeClasses[size]} text-amber-400 fill-amber-400 drop-shadow-xs`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showValue && (
        <div className="flex items-center gap-1.5">
          <span className={`${textSizes[size]} text-slate-800`}>
            {activeRating.toFixed(1)}
          </span>
          {!readOnly && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {getRatingLabel(activeRating)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
