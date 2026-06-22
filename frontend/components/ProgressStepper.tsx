import React from 'react';

interface ProgressStepperProps {
  steps: string[];
  currentStep: number;
  maxReachableStep?: number;
  onStepClick?: (step: number) => void;
  companyName?: string;
}

export default function ProgressStepper({
  steps,
  currentStep,
  maxReachableStep,
  onStepClick,
  companyName = 'CV. Rajawali Bina Maju',
}: ProgressStepperProps) {
  const maxStep = maxReachableStep ?? steps.length;
  return (
    <div className="relative bg-navy-800 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(226,35,26,0.14), transparent 60%)',
        }}
      />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-8 pt-8">
        <p className="text-gold-500 text-xs font-medium uppercase tracking-[1.5px]">
          {companyName}
        </p>
        <h1 className="text-white text-2xl mt-1.5">Form Jobs Application</h1>
        <p className="text-white/55 text-sm mt-1.5 pb-6">
          Langkah {currentStep} dari {steps.length} — {steps[currentStep - 1]}
        </p>

        <div className="flex items-center pb-6 pt-1 pl-1 overflow-x-auto">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const done = stepNum < currentStep;
            const active = stepNum === currentStep;
            const reachable = stepNum <= maxStep;
            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <div
                    className="h-[1.5px] flex-1 min-w-[16px]"
                    style={{
                      background: stepNum <= currentStep ? '#C9A84C' : 'rgba(255,255,255,0.15)',
                    }}
                  />
                )}
                <div
                  onClick={() => reachable && onStepClick?.(stepNum)}
                  className={`flex flex-col items-center flex-shrink-0 px-1 ${
                    reachable ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 transition-colors duration-150 ${
                      done
                        ? 'bg-gold-500 text-navy-800'
                        : active
                        ? 'bg-white text-navy-800 ring-[3px] ring-gold-500'
                        : 'bg-white/[0.08] text-white/35 border border-white/[0.18]'
                    }`}
                  >
                    {done ? <i className="ti ti-check" /> : stepNum}
                  </div>
                  <span
                    className={`mt-2 text-[11px] text-center max-w-[72px] hidden sm:block ${
                      done
                        ? 'text-gold-500'
                        : active
                        ? 'text-white font-medium'
                        : 'text-white/45'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
