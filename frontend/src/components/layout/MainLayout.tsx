import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DemoTourModal, DEMO_STEPS } from '../demo/DemoTourModal';
import { useNavigate } from 'react-router-dom';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStepIdx, setDemoStepIdx] = useState(0);

  const handleStartDemo = () => {
    setDemoStepIdx(0);
    setDemoOpen(true);
    // Move to step 1 route
    navigate('/viewer3d?demoStep=1');
  };

  const handleNextStep = () => {
    if (demoStepIdx < DEMO_STEPS.length - 1) {
      const nextIdx = demoStepIdx + 1;
      setDemoStepIdx(nextIdx);
      const nextStep = DEMO_STEPS[nextIdx];
      if (nextStep.targetView === 'passport') {
        navigate('/passport/IN-TN-CHN-P0428-B01-F07-U02');
      } else if (nextStep.targetView === 'validation') {
        navigate('/validation');
      } else if (nextStep.targetView === 'assistant') {
        navigate('/assistant');
      } else {
        navigate(`/viewer3d?demoStep=${nextStep.number}`);
      }
    }
  };

  const handlePrevStep = () => {
    if (demoStepIdx > 0) {
      const prevIdx = demoStepIdx - 1;
      setDemoStepIdx(prevIdx);
      const prevStep = DEMO_STEPS[prevIdx];
      navigate(`/viewer3d?demoStep=${prevStep.number}`);
    }
  };

  const handleJumpToStep = (idx: number) => {
    setDemoStepIdx(idx);
    const step = DEMO_STEPS[idx];
    if (step.targetView === 'passport') {
      navigate('/passport/IN-TN-CHN-P0428-B01-F07-U02');
    } else if (step.targetView === 'validation') {
      navigate('/validation');
    } else if (step.targetView === 'assistant') {
      navigate('/assistant');
    } else {
      navigate(`/viewer3d?demoStep=${step.number}`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header onStartDemo={handleStartDemo} />

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto relative bg-[#020617]">
          <Outlet />
        </main>

        {/* Mandatory Legal & Prototype Disclaimer Banner (Section 39) */}
        <footer className="h-6 bg-slate-950 border-t border-slate-800/80 px-4 flex items-center justify-between text-[11px] text-slate-500 shrink-0 select-none">
          <div className="truncate">
            <span className="font-semibold text-slate-400">DEMO / SYNTHETIC DATA:</span> This prototype uses synthetic demonstration data. Generated 3D ULPINs and property records are demonstrative spatial identifiers and do not constitute legal land title or official Government of India land records.
          </div>
          <div className="shrink-0 hidden md:flex items-center gap-2 pl-2">
            <span>DoLR • MoRD</span>
            <span>|</span>
            <span>PS26011 Prototype</span>
          </div>
        </footer>
      </div>

      {/* Guided Hackathon Demo Tour Runner Modal */}
      <DemoTourModal
        isOpen={demoOpen}
        currentStepIndex={demoStepIdx}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        onClose={() => setDemoOpen(false)}
        onJumpToStep={handleJumpToStep}
      />
    </div>
  );
};
