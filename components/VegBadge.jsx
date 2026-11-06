// LAYER: Frontend Component
// Displays authentic Indian food classification indicator (Veg vs Non-Veg badge).

export default function VegBadge({ veg, showLabel = true, size = 'sm' }) {
  const isVeg = Boolean(veg);

  // Size variations
  const boxSize = size === 'lg' ? 'w-5 h-5 p-0.5' : 'w-4 h-4 p-0.5';
  const dotSize = size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';
  const textSize = size === 'lg' ? 'text-xs font-semibold' : 'text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
        isVeg
          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
          : 'bg-rose-50 border-rose-300 text-rose-800'
      }`}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      {/* Standard Indian Veg / Non-Veg Icon */}
      <span
        className={`inline-flex items-center justify-center border-2 rounded ${boxSize} ${
          isVeg ? 'border-emerald-600' : 'border-rose-600'
        }`}
      >
        <span
          className={`rounded-full ${dotSize} ${
            isVeg ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        />
      </span>

      {showLabel && (
        <span className={textSize}>
          {isVeg ? 'Vegetarian' : 'Non-Veg'}
        </span>
      )}
    </span>
  );
}

