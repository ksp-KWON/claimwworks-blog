'use client';

import ExpertMedicalForm from './ExpertMedicalForm';

export default function MedicalCalculatorContainer() {
  return (
    <div className="w-full">
      <div className="relative animate-in slide-in-from-bottom-8 fade-in duration-500">
        <ExpertMedicalForm />
      </div>
    </div>
  );
}
