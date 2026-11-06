// LAYER: Frontend Client Component
// Interactive ingredients list allowing home cooks to check off items as they prepare the dish.

'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

export default function IngredientsList({ ingredients = [] }) {
  const [checkedItems, setCheckedItems] = useState({});

  function toggleItem(index) {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  return (
    <ul className="space-y-2.5">
      {ingredients.map((ingredient, idx) => {
        const isChecked = Boolean(checkedItems[idx]);
        return (
          <li
            key={idx}
            onClick={() => toggleItem(idx)}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
              isChecked
                ? 'bg-stone-50 border-stone-200 text-stone-600'
                : 'bg-white border-stone-200 hover:border-orange-200 text-stone-800 shadow-2xs'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                isChecked
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-stone-300 bg-stone-50'
              }`}
            >
              {isChecked && <Check className="w-3.5 h-3.5" />}
            </div>
            <span
              className={`text-sm leading-relaxed ${
                isChecked ? 'line-through text-stone-600' : 'text-stone-800'
              }`}
            >
              {ingredient}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

