import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, StudyMaterial, ModuleQuiz, ModuleSummary } from '../types';
import { 
  Plus, 
  Trash2, 
  X, 
  BookOpen, 
  Sparkles, 
  Upload, 
  FileText, 
  Check, 
  ArrowRight, 
  Layers, 
  HelpCircle, 
  FileUp, 
  FileCheck2,
  Atom,
  Clock,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateStudyCardModalProps {
  onClose: () => void;
  onCardCreated: (newCardId: string, shouldOpenConvertModal?: boolean) => void;
}

export const CreateStudyCardModal: React.FC<CreateStudyCardModalProps> = ({
  onClose,
  onCardCreated,
}) => {
  const { addNewCardWithMaterials } = useApp();

  // Step state: 1: Info & Materials, 2: Generating (AI Simulation), 3: Success preview
  const [step, setStep] = useState<'form' | 'generating' | 'success'>('form');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('Analyzing materials...');

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('from-blue-600 to-cyan-500');

  // Materials
  const [activeMaterialTab, setActiveMaterialTab] = useState<'upload' | 'paste'>('upload');
  const [pastedNotes, setPastedNotes] = useState('');
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);

  // Generation options
  const [generateFlashcards, setGenerateFlashcards] = useState(true);
  const [generateQuiz, setGenerateQuiz] = useState(true);
  const [generateSummary, setGenerateSummary] = useState(true);

  // Result of creation
  const [createdCardId, setCreatedCardId] = useState<string | null>(null);

  const subjectPresets = [
    { label: 'Physics', color: 'from-blue-600 to-cyan-500' },
    { label: 'Cell Biology', color: 'from-teal-500 to-emerald-600' },
    { label: 'Organic Chemistry', color: 'from-emerald-600 to-lime-500' },
    { label: 'Calculus II', color: 'from-violet-600 to-purple-500' },
    { label: 'Neuroscience', color: 'from-indigo-600 to-blue-500' },
    { label: 'Computer Science', color: 'from-amber-500 to-orange-600' },
  ];

  // Quick helper to load sample physics materials
  const handleLoadSamplePhysics = () => {
    setTitle('Physics');
    setSubject('Physics');
    setDescription('Classical mechanics, Newton’s laws of motion, work-energy theorem, momentum conservation, and thermodynamics.');
    setColor('from-blue-600 to-cyan-500');

    const samplePdf: StudyMaterial = {
      id: `mat-${Date.now()}-1`,
      name: 'Physics_Mechanics_Lecture_Ch1-4.pdf',
      size: '2.4 MB',
      type: 'pdf',
      uploadedAt: new Date().toISOString(),
      contentPreview: 'Chapters 1-4: Kinematics, Newton’s 1st, 2nd & 3rd Laws, Friction, Circular Motion, Work-Energy Theorem, and Conservation of Momentum.',
    };

    const sampleDoc: StudyMaterial = {
      id: `mat-${Date.now()}-2`,
      name: 'Thermodynamics_Formula_Sheet.docx',
      size: '1.1 MB',
      type: 'doc',
      uploadedAt: new Date().toISOString(),
      contentPreview: 'First and Second Laws of Thermodynamics, Carnot Engine efficiency equations, and entropy definitions for isolated systems.',
    };

    setMaterials([samplePdf, sampleDoc]);
    setPastedNotes(
      "Newton's 2nd Law: F_net = m*a = dp/dt.\nWork-Energy Theorem: Net work W_net = ΔKE = 1/2 m*v_f^2 - 1/2 m*v_i^2.\nMomentum: p = m*v, conserved when ΣF_ext = 0.\nCarnot Efficiency: η = 1 - (T_cold / T_hot) in Kelvin."
    );
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUploaded: StudyMaterial[] = Array.from(files).map((file, i) => ({
      id: `mat-${Date.now()}-${i}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` || '1.2 MB',
      type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'doc' : 'text',
      uploadedAt: new Date().toISOString(),
      contentPreview: `Extracted content from ${file.name}: Key subject concepts, definitions, and equations ready for AI card synthesis.`,
    }));

    setMaterials((prev) => [...prev, ...newUploaded]);
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleStartGeneration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Transition to generation animation
    setStep('generating');
    setGenerationProgress(15);
    setGenerationStatus(`Analyzing ${materials.length > 0 ? materials.length + ' uploaded materials' : 'lecture notes'} for ${title}...`);

    setTimeout(() => {
      setGenerationProgress(40);
      setGenerationStatus('Extracting core definitions, formulas & key principles...');
    }, 600);

    setTimeout(() => {
      setGenerationProgress(70);
      setGenerationStatus('Synthesizing active recall flashcards & practice quiz questions...');
    }, 1200);

    setTimeout(() => {
      setGenerationProgress(90);
      setGenerationStatus('Structuring chapter summary & formula guide subsets...');
    }, 1800);

    setTimeout(() => {
      setGenerationProgress(100);
      setGenerationStatus('Finalizing study card subsets!');

      // Synthesize generated materials based on title & subject
      const cardTitle = title.trim();
      const cardSub = subject.trim() || 'General';

      // 1. Flashcards subset
      const generatedCards: Card[] = [
        {
          id: `c-gen-${Date.now()}-1`,
          front: `State the fundamental governing principle of ${cardTitle} mechanics.`,
          back: `Net external force directly dictates momentum change over time: F = dp/dt. Under constant inertial mass, F = m·a.`,
          hint: 'Primary equation relating force and acceleration.',
          difficulty: 'easy',
          tags: [cardSub, 'Foundations'],
          mastered: false,
        },
        {
          id: `c-gen-${Date.now()}-2`,
          front: `What is the Work-Energy Theorem in ${cardTitle}?`,
          back: `The net work done on an object by all conservative and non-conservative forces equals the change in kinetic energy: W_net = ΔKE.`,
          hint: 'Relates total work performed to kinetic energy change.',
          difficulty: 'medium',
          tags: [cardSub, 'Energy'],
          mastered: false,
        },
        {
          id: `c-gen-${Date.now()}-3`,
          front: `Under what conditions is linear momentum conserved in ${cardTitle}?`,
          back: `In any isolated system where the net external force is zero (ΣF_ext = 0). Internal reaction pairs cancel identically by Newton's Third Law.`,
          hint: 'Condition of an isolated physical system.',
          difficulty: 'easy',
          tags: [cardSub, 'Momentum'],
          mastered: false,
        },
        {
          id: `c-gen-${Date.now()}-4`,
          front: `What limits the theoretical efficiency of thermal processes in ${cardTitle}?`,
          back: `The Carnot efficiency limit: η = 1 - (T_cold / T_hot), where operating temperatures are evaluated on the absolute Kelvin scale.`,
          hint: 'Second Law of Thermodynamics bound.',
          difficulty: 'hard',
          tags: [cardSub, 'Thermodynamics'],
          mastered: false,
        },
        {
          id: `c-gen-${Date.now()}-5`,
          front: `Distinguish between elastic and inelastic interactions in ${cardTitle}.`,
          back: `Both conserve total linear momentum. Elastic collisions preserve total mechanical kinetic energy, whereas inelastic collisions dissipate kinetic energy into heat or deformation.`,
          hint: 'Kinetic energy conservation check.',
          difficulty: 'medium',
          tags: [cardSub, 'Collisions'],
          mastered: false,
        },
      ];

      // 2. Quiz subset
      const generatedQuizzes: ModuleQuiz[] = generateQuiz
        ? [
            {
              id: `quiz-gen-${Date.now()}`,
              moduleId: `mod-${Date.now()}`,
              title: `${cardTitle} Core Knowledge Check`,
              description: `Diagnostic multiple-choice assessment generated from uploaded ${cardTitle} materials.`,
              isReleased: false,
              questions: [
                {
                  id: `qg-1`,
                  question: `In ${cardTitle}, what happens to linear momentum when net external force is zero?`,
                  options: [
                    { id: 'opt-1', text: 'It remains strictly constant (conserved).' },
                    { id: 'opt-2', text: 'It decreases exponentially over time.' },
                    { id: 'opt-3', text: 'It transforms completely into potential energy.' },
                    { id: 'opt-4', text: 'It fluctuates with frequency.' },
                  ],
                  correctOptionId: 'opt-1',
                  explanation: `When ΣF_ext = 0, dp/dt = 0, meaning linear momentum p is constant.`,
                },
                {
                  id: `qg-2`,
                  question: `According to the Work-Energy Theorem, net work is equal to:`,
                  options: [
                    { id: 'opt-1', text: 'The change in kinetic energy (ΔKE)' },
                    { id: 'opt-2', text: 'The change in momentum (Δp)' },
                    { id: 'opt-3', text: 'The total gravitational potential' },
                    { id: 'opt-4', text: 'Total heat dissipated' },
                  ],
                  correctOptionId: 'opt-1',
                  explanation: `W_net = ΔKE = 1/2 m*v_f² - 1/2 m*v_i².`,
                },
              ],
            },
          ]
        : [];

      // 3. Summary subset
      const generatedSummaries: ModuleSummary[] = generateSummary
        ? [
            {
              id: `sum-gen-${Date.now()}`,
              moduleId: `mod-${Date.now()}`,
              title: `${cardTitle} Executive Study Guide & Formulas`,
              isReleased: false,
              keyTakeaways: [
                `Foundational relations established in ${cardTitle}.`,
                'Conservation laws provide invariant constraints across all physical scenarios.',
                'Work and kinetic energy transformation principles.',
                'Thermodynamic and statistical boundaries.',
              ],
              fullMarkdown: `# ${cardTitle} Study Guide\n\n## Overview\nGenerated summary synthesized from uploaded materials for ${cardTitle}.\n\n### Core Equations\n- **Force:** $F = m a$\n- **Kinetic Energy:** $KE = \\frac{1}{2}mv^2$\n- **Momentum:** $p = mv$\n- **Work:** $W = \\int F \\cdot dr = \\Delta KE$\n\n### Spaced Repetition Advice\nReview the flashcards subset 3 times this week and complete the practice quiz before converting to a CourseSpace with your study cohort.`,
            },
          ]
        : [];

      // Save to App state
      const finalCard = addNewCardWithMaterials(
        cardTitle,
        description.trim() || `AI-synthesized ${cardTitle} study set covering core principles, flashcards, practice quiz, and summary.`,
        cardSub,
        color,
        materials,
        generatedCards,
        generatedQuizzes,
        generatedSummaries
      );

      setCreatedCardId(finalCard.id);
      setStep('success');
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }, 2300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                Studey Card Creator
              </span>
              <h3 className="text-base font-bold text-white">Create Card & Generate Subsets</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Form & Materials */}
        {step === 'form' && (
          <form onSubmit={handleStartGeneration} className="p-6 space-y-6 overflow-y-auto flex-1">
            
            {/* Quick Physics Preset Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                  <Atom className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Try Sample Physics Card</h4>
                  <p className="text-[11px] text-slate-300">Auto-fill with Physics lecture notes, equations & files.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLoadSamplePhysics}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-all shadow-sm"
              >
                Use Physics Sample
              </button>
            </div>

            {/* Card Name & Subject */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">
                    Card Name <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">e.g. Physics, Organic Chemistry</span>
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Physics"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              {/* Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 mr-1">Suggestions:</span>
                {subjectPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTitle(preset.label);
                      setSubject(preset.label);
                      setColor(preset.color);
                    }}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                      title === preset.label
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Materials Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FileUp className="w-3.5 h-3.5 text-teal-400" />
                    <span>Upload Materials for this Card</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Upload PDFs, lecture slides, notes, or paste syllabus to generate card subsets.
                  </p>
                </div>

                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveMaterialTab('upload')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      activeMaterialTab === 'upload'
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Files
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMaterialTab('paste')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      activeMaterialTab === 'paste'
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              {activeMaterialTab === 'upload' ? (
                <div className="space-y-3">
                  {/* Drop zone */}
                  <label className="border-2 border-dashed border-slate-800 hover:border-teal-500/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition-all text-center group">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-white">
                      Drop physics/course documents here, or <span className="text-teal-400 underline">browse files</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Supports PDF, DOCX, TXT, Slides (up to 25MB)</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleSimulatedFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Uploaded files list */}
                  {materials.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        Attached Documents ({materials.length}):
                      </span>
                      <div className="space-y-1.5">
                        {materials.map((mat) => (
                          <div
                            key={mat.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                              <span className="font-semibold text-white truncate">{mat.name}</span>
                              <span className="text-slate-500 text-[10px]">({mat.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(mat.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <textarea
                    rows={4}
                    value={pastedNotes}
                    onChange={(e) => setPastedNotes(e.target.value)}
                    placeholder="Paste lecture notes, study outlines, formulas, or syllabus text here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors resize-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    AI will analyze this text to generate flashcards, practice quiz questions, and a study guide.
                  </p>
                </div>
              )}
            </div>

            {/* Subsets to Generate */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Generate Card Subsets (Studey AI)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                  generateFlashcards ? 'bg-teal-950/20 border-teal-500/40 text-teal-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={generateFlashcards}
                    onChange={(e) => setGenerateFlashcards(e.target.checked)}
                    className="rounded border-slate-700 text-teal-500 focus:ring-0"
                  />
                  <div>
                    <p className="text-xs font-bold">⚡ Flashcards</p>
                    <p className="text-[10px] text-slate-400">Active recall cards</p>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                  generateQuiz ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={generateQuiz}
                    onChange={(e) => setGenerateQuiz(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-500 focus:ring-0"
                  />
                  <div>
                    <p className="text-xs font-bold">📝 Practice Quiz</p>
                    <p className="text-[10px] text-slate-400">Multiple choice tests</p>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                  generateSummary ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={generateSummary}
                    onChange={(e) => setGenerateSummary(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <div>
                    <p className="text-xs font-bold">📖 Summary Guide</p>
                    <p className="text-[10px] text-slate-400">Executive cheat sheet</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Study Card & Subsets</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Generating Animation */}
        {step === 'generating' && (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 animate-pulse">
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-3xl blur-xl opacity-30 animate-spin" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-bold text-white">Synthesizing "{title}" Card</h3>
              <p className="text-xs text-teal-300 font-medium">{generationStatus}</p>
            </div>

            <div className="w-full max-w-sm space-y-1.5">
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Extracting concepts</span>
                <span>{generationProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === 'success' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-white">
                "{title}" Card Created!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                All study subsets have been generated. You can study solo or convert this card into a collaborative CourseSpace with friends!
              </p>
            </div>

            {/* Generated Subsets Summary */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div>
                <p className="text-lg font-extrabold text-teal-400">5</p>
                <p className="text-[11px] font-semibold text-slate-300">Flashcards</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-indigo-400">1</p>
                <p className="text-[11px] font-semibold text-slate-300">Practice Quiz</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-cyan-400">1</p>
                <p className="text-[11px] font-semibold text-slate-300">Summary Guide</p>
              </div>
            </div>

            {/* Convert to CourseSpace Highlight Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <Share2 className="w-4 h-4 text-indigo-400" />
                <span>Share with Friends as a CourseSpace</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Invite friends to study this "{title}" card together with synchronized live rooms, gated quiz milestones, and competitive leaderboards.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (createdCardId) {
                    onCardCreated(createdCardId, false);
                  }
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                View Card Subsets
              </button>

              <button
                type="button"
                onClick={() => {
                  if (createdCardId) {
                    onCardCreated(createdCardId, true);
                  }
                  onClose();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Convert to CourseSpace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
