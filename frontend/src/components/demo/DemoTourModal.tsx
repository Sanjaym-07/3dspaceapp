import React from 'react';
import {
  Play,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  HelpCircle,
  Building2,
  Layers,
  ArrowUpDown,
  Search,
  ShieldCheck,
  AlertTriangle,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface DemoStep {
  number: number;
  title: string;
  storyHeading: string;
  description: string;
  targetView: 'dashboard' | 'viewer3d' | 'map' | 'validation' | 'passport' | 'assistant';
  actionLabel?: string;
  stateUpdates?: Record<string, any>;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    number: 1,
    title: "2D Surface Parcel Demarcation",
    storyHeading: "What happens when a 2D parcel becomes a vertical city?",
    description: "Start at surface parcel P0428 (Chennai, Anna Salai). Land records currently map only this flat 2D footprint, ignoring everything above and below.",
    targetView: 'map',
    actionLabel: "Select Parcel P0428",
    stateUpdates: { parcelId: "TN-CHN-P0428", view: "map" }
  },
  {
    number: 2,
    title: "Building Footprint Extrusion",
    storyHeading: "Superstructure Detection",
    description: "The cadastral engine extracts Meridian Heights (B01) situated on parcel P0428, establishing the vertical property container.",
    targetView: 'viewer3d',
    actionLabel: "Enter 3D Cadastral View",
    stateUpdates: { buildingId: "B01", view: "viewer3d", explodeFactor: 0, isUndergroundMode: false }
  },
  {
    number: 3,
    title: "12 Floors + 2 Basements Identified",
    storyHeading: "Multi-Storey Vertical Stratum",
    description: "Meridian Heights is partitioned into 12 residential floor slabs plus 2 subterranean parking levels, each defined by exact elevation bounds.",
    targetView: 'viewer3d',
    actionLabel: "Inspect Floor Stratification",
    stateUpdates: { isolatedFloorCode: null, explodeFactor: 0 }
  },
  {
    number: 4,
    title: "Explode Building Animation",
    storyHeading: "Vertical Cadastral Separation",
    description: "Activating Explode Mode physically elevates individual floor volumes with animation, visualizing independent 3D property planes.",
    targetView: 'viewer3d',
    actionLabel: "Separate Floors Vertically",
    stateUpdates: { explodeFactor: 0.85, isUndergroundMode: false }
  },
  {
    number: 5,
    title: "Floor 7 Selected (+21.0m to +24.2m)",
    storyHeading: "Floor Slab Isolation",
    description: "Isolating Floor 7 exposes its 4 demarcated volumetric property units resting at elevation datum +21.0m to +24.2m.",
    targetView: 'viewer3d',
    actionLabel: "Isolate Floor 7",
    stateUpdates: { isolatedFloorCode: "F07", floorId: "B01-F07" }
  },
  {
    number: 6,
    title: "Unit 02 Selected",
    storyHeading: "Volumetric Property Demarcation",
    description: "Apartment 702 (Unit 02) is selected. It possesses 1280 sq.ft carpet area, registered to synthetic title owner Karthik R.",
    targetView: 'viewer3d',
    actionLabel: "Select Unit 02",
    stateUpdates: { propertyId: "B01-F07-U02" }
  },
  {
    number: 7,
    title: "Prototype 3D ULPIN Issued",
    storyHeading: "Structured Spatial Identity",
    description: "The system stamps a unique Prototype 3D ULPIN: IN-TN-CHN-P0428-B01-F07-U02 encoding Country, State, City, Parcel, Building, Floor, and Unit.",
    targetView: 'viewer3d',
    actionLabel: "Review ULPIN Breakdown",
    stateUpdates: { propertyId: "B01-F07-U02" }
  },
  {
    number: 8,
    title: "Digital Property Passport",
    storyHeading: "Vertical Title & QR Verification",
    description: "Open the digital Property Passport featuring KaTeX vertical bounds, undivided rights, restrictions, and instant QR verification link.",
    targetView: 'passport',
    actionLabel: "Open Property Passport",
    stateUpdates: { ulpin: "IN-TN-CHN-P0428-B01-F07-U02" }
  },
  {
    number: 9,
    title: "Activate Underground Infrastructure",
    storyHeading: "Sub-Surface Transparency",
    description: "Switch to Underground Mode: terrain and buildings become translucent to reveal subterranean parking and municipal utilities.",
    targetView: 'viewer3d',
    actionLabel: "Enable Underground Mode",
    stateUpdates: { isUndergroundMode: true, explodeFactor: 0, isolatedFloorCode: null }
  },
  {
    number: 10,
    title: "Underground Pipeline Inspection",
    storyHeading: "Subterranean Corridor Verification",
    description: "Municipal Water Main UG-UTIL-0042 is located at depth -4.8m with verified 2.4m clearance from building foundations.",
    targetView: 'viewer3d',
    actionLabel: "Inspect Pipeline UG-UTIL-0042",
    stateUpdates: { isUndergroundMode: true, assetId: "UG-UTIL-0042" }
  },
  {
    number: 11,
    title: "Topology Engine Execution",
    storyHeading: "Deterministic 3D Integrity Rules",
    description: "Execute the 9 deterministic topological validation rules (elevation ordering, containment, overlap, footprint, and metadata).",
    targetView: 'validation',
    actionLabel: "Execute Validation Engine",
    stateUpdates: { view: "validation" }
  },
  {
    number: 12,
    title: "Intentional Warning Detected",
    storyHeading: "Boundary Conflict Flagged",
    description: "Topology rule RULE_3 flags that Floor 7 Unit U03 overlaps neighbor U04 by 2.3% along eastern partition. Recommended: boundary review.",
    targetView: 'validation',
    actionLabel: "Review Overlap Details",
    stateUpdates: { view: "validation" }
  },
  {
    number: 13,
    title: "AI Spatial Assistant (VERA)",
    storyHeading: "Spatial Reasoning & Explanation",
    description: "VERA queries local cadastral volumes to explain why F07-U03 was flagged and summarizes building metrics. One unified 3D spatial identity!",
    targetView: 'assistant',
    actionLabel: "Ask VERA Assistant",
    stateUpdates: { view: "assistant", initialPrompt: "Why was B01-F07-U03 flagged?" }
  }
];

interface DemoTourModalProps {
  currentStepIndex: number;
  isOpen: boolean;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onJumpToStep: (index: number) => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  currentStepIndex,
  isOpen,
  onNext,
  onPrev,
  onClose,
  onJumpToStep
}) => {
  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === DEMO_STEPS.length - 1;

  const handleNextWithConfetti = () => {
    if (isLast) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onClose();
    } else {
      onNext();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] glass-panel rounded-2xl border-2 border-blue-500/80 shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-6 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Hackathon Demo Tour • Step {currentStep.number} of {DEMO_STEPS.length}
            </span>
            <h4 className="font-semibold text-slate-100 text-sm">
              {currentStep.title}
            </h4>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1 my-3 overflow-x-auto py-1">
        {DEMO_STEPS.map((s, idx) => (
          <button
            key={s.number}
            onClick={() => onJumpToStep(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentStepIndex
                ? 'w-6 bg-blue-500'
                : idx < currentStepIndex
                ? 'w-2 bg-blue-400/50'
                : 'w-2 bg-slate-700'
            }`}
            title={`Step ${s.number}: ${s.title}`}
          />
        ))}
      </div>

      {/* Story Context & Description */}
      <div className="space-y-2 mb-4">
        <div className="text-xs font-semibold text-blue-300">
          "{currentStep.storyHeading}"
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {currentStep.description}
        </p>
      </div>

      {/* Controls Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
            isFirst
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNextWithConfetti}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/40 transition"
        >
          <span>{isLast ? "Complete Demo 🎉" : (currentStep.actionLabel || "Next Step")}</span>
          {!isLast && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
