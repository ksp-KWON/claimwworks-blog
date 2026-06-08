'use client';

import ExpertModeForm from './ExpertModeForm';

export default function AutoCalculatorContainer() {
  return (
    <div className="w-full">
      <div className="relative animate-in slide-in-from-bottom-8 fade-in duration-500">
        <ExpertModeForm />
      </div>
    </div>
  );
}
