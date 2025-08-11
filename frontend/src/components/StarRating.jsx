import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ value = 0, onChange, disabled = false }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(null)}
          className="focus:outline-none"
          disabled={disabled}
        >
          <FaStar
            className={`text-3xl transition-colors ${
              (hover || value) >= star ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;

