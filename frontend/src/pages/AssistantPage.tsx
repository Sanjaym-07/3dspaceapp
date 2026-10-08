import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Box,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  suggestedActions?: Array<{ label: string; action: string }>;
  entities?: Array<{ type: string; id: string; ulpin?: string; name?: string; status?: string }>;
}

export const AssistantPage: React.FC = () => {
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello, I am VERA (Vertical & Spatial Reasoning Assistant). I can analyze 3D cadastral volumes, inspect sub-surface utility easements, verify elevation bounds, and explain topology validation warnings across the platform.",
      suggestedActions: [
        { label: "Which floors have validation issues?", action: "QUERY:Which floors have validation issues?" },
        { label: "Show me all underground assets", action: "QUERY:Show me all underground assets" },
        { label: "Why was B01-F07-U03 flagged?", action: "QUERY:Why was B01-F07-U03 flagged?" },
        { label: "How many residential units are in Meridian Heights?", action: "QUERY:How many residential units are in Meridian Heights?" }
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineState, setPipelineState] = useState<any>(null);

  useEffect(() => {
    api.getAssistantPipeline().then(setPipelineState).catch(() => {});
  }, []);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    const userMsg: Message = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await api.queryAssistant(q);
      const assistantMsg: Message = {
        sender: 'assistant',
        text: res.answer,
        suggestedActions: res.suggested_actions,
        entities: res.relevant_entities
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (res.pipeline_state) setPipelineState(res.pipeline_state);
    } catch {
      // Offline fallback
      let fallbackAnswer = "I evaluated local cadastral volumes. 87 units are indexed across 3 parcels. Floor 7 in Meridian Heights has a 2.3% partition overlap alert.";
      if (q.toLowerCase().includes("issue") || q.toLowerCase().includes("flag")) {
        fallbackAnswer = "Found 1 validation alert: RULE_3 flagged on PROPERTY 'B01-F07-U03': U03 overlaps with U04 on floor B01-F07 by 2.3%. Recommended: Review boundary partition wall between U03 and U04.";
      } else if (q.toLowerCase().includes("underground")) {
        fallbackAnswer = "There are 5 registered sub-surface assets in the corridor: Municipal Water Main (depth -4.8m), 33kV Power Cable (-3.2m), Storm Sewer Main (-6.5m), Metro Rail Tunnel (-14.0m), and Fiber Optic Conduit (-2.1m).";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: fallbackAnswer,
          suggestedActions: [
            { label: "Inspect in 3D Viewer", action: "NAVIGATE_VIEWER" }
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.startsWith('QUERY:')) {
      handleSend(action.replace('QUERY:', ''));
    } else if (action === 'NAVIGATE_VALIDATION' || action === 'RUN_VALIDATION') {
      navigate('/validation');
    } else if (action === 'TOGGLE_UNDERGROUND') {
      navigate('/viewer3d?demoStep=9');
    } else if (action === 'NAVIGATE_VIEWER' || action === 'HIGHLIGHT_ISSUES') {
      navigate('/viewer3d?demoStep=5');
    } else if (action.startsWith('OPEN_PASSPORT:')) {
      const ulpin = action.replace('OPEN_PASSPORT:', '');
      navigate(`/passport/${encodeURIComponent(ulpin)}`);
    } else {
      navigate('/viewer3d');
    }
  };

  const pipelineStages = pipelineState?.stages || [
    { id: 1, name: "LiDAR / BIM Ingestion", status: "COMPLETED", detail: "Point cloud and IFC architectural structural models parsed" },
    { id: 2, name: "Building Extraction", status: "COMPLETED", detail: "3 building massing envelopes detected" },
    { id: 3, name: "Floor Segmentation", status: "COMPLETED", detail: "25+ horizontal floor slabs identified" },
    { id: 4, name: "Vertical Parcel Delineation", status: "COMPLETED", detail: "87 property volumes demarcated" },
    { id: 5, name: "Topology Validation", status: "WARNING", detail: "9 rules executed (1 boundary overlap warning)" },
    { id: 6, name: "3D ULPIN Generation", status: "COMPLETED", detail: "87 Prototype 3D ULPINs generated" }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              VERA — Vertical & Spatial Reasoning Assistant
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Domain-specific spatial intelligence engine querying 3D cadastre volumes, topology rules, and subterranean assets.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chat Console */}
        <div className="lg:col-span-7 glass-panel rounded-2xl border border-slate-800 h-[560px] flex flex-col overflow-hidden">
          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => {
              const isAssistant = m.sender === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} space-y-1.5`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    {isAssistant ? (
                      <>
                        <Bot className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-semibold text-purple-300">VERA AI</span>
                      </>
                    ) : (
                      <span className="font-semibold text-slate-300">Cadastral Surveyor</span>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-line shadow ${
                      isAssistant
                        ? 'bg-slate-900 border border-slate-800 text-slate-200'
                        : 'bg-blue-600 text-white font-medium'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Action Suggestion Pills */}
                  {isAssistant && m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestedActions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act.action)}
                          className="px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 text-purple-300 hover:text-white border border-slate-700 text-[11px] font-medium transition flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-purple-400 p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>VERA is analyzing spatial volumes...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask VERA (e.g. 'Why was B01-F07-U03 flagged?')..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Spatial AI Pipeline Stepper (Section 21) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-slate-100 text-sm">
                  Autonomous Spatial AI Pipeline
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                AI / ML Prototype
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Demonstrates end-to-end automated segmentation from unstructured architectural point clouds to topologically validated 3D ULPIN registry entries.
            </p>

            {/* Stepper Pipeline */}
            <div className="space-y-2.5">
              {pipelineStages.map((st: any) => {
                const isWarning = st.status === 'WARNING';
                return (
                  <div
                    key={st.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3 text-xs"
                  >
                    <div className="mt-0.5 shrink-0">
                      {isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">
                          {st.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            isWarning
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {st.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {st.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-[11px] text-slate-500 italic">
              AI-assisted building extraction and floor segmentation prototype.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
