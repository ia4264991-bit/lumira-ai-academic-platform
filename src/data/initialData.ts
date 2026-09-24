import { CourseSpace, Deck, CurrentUser } from '../types';

export const INITIAL_USER: CurrentUser = {
  id: 'user-sarah',
  name: 'Sarah Chen',
  email: 'sarah.chen@uni.edu',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  xp: 1420,
  streakDays: 7,
};

export const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-physics-1',
    title: 'Physics',
    description: 'Classical mechanics, Newton’s laws of motion, work-energy theorem, momentum conservation, and thermodynamics.',
    subject: 'Physics',
    color: 'from-blue-600 to-cyan-500',
    createdAt: '2026-09-18T08:30:00Z',
    updatedAt: '2026-09-20T11:00:00Z',
    materials: [
      {
        id: 'mat-phys-1',
        name: 'Physics_Mechanics_Lectures_Ch1-4.pdf',
        size: '2.4 MB',
        type: 'pdf',
        uploadedAt: '2026-09-18T08:31:00Z',
        contentPreview: 'Chapters 1-4 covering Kinematics in 1D and 2D, Newton’s Laws, Free Body Diagrams, Friction coefficients, and Uniform Circular Motion.'
      },
      {
        id: 'mat-phys-2',
        name: 'Work_Energy_Thermodynamics_Summary.docx',
        size: '1.2 MB',
        type: 'doc',
        uploadedAt: '2026-09-18T08:32:00Z',
        contentPreview: 'Summary of Conservative Forces, Potential Energy functions, Impulse-Momentum Theorem, and First & Second Laws of Thermodynamics.'
      }
    ],
    cards: [
      {
        id: 'cp-1',
        front: 'State Newton’s Second Law of Motion in terms of momentum.',
        back: 'Net external force equals the time rate of change of linear momentum: F_net = dp/dt. When mass is constant, F_net = m·a.',
        hint: 'Relates force to the derivative of momentum.',
        difficulty: 'easy',
        tags: ['Mechanics', 'Newton'],
        mastered: true,
      },
      {
        id: 'cp-2',
        front: 'What is the Work-Energy Theorem, and under what conditions does it apply?',
        back: 'The net work done by all forces on a particle equals the change in its kinetic energy: W_net = ΔKE = 1/2 m·v_f² - 1/2 m·v_i². Applies to all forces (both conservative and non-conservative).',
        hint: 'Relates total work done to kinetic energy change.',
        difficulty: 'medium',
        tags: ['Energy', 'Work'],
        mastered: true,
      },
      {
        id: 'cp-3',
        front: 'Under what condition is total linear momentum conserved in a physical system?',
        back: 'When the net external force acting on the system is zero (ΣF_ext = 0). Internal forces cancel out by Newton’s Third Law.',
        hint: 'Isolated system condition.',
        difficulty: 'easy',
        tags: ['Momentum'],
        mastered: false,
      },
      {
        id: 'cp-4',
        front: 'What is the maximum theoretical efficiency of a heat engine operating between temperatures T_H and T_C?',
        back: 'Carnot Efficiency: η_max = 1 - (T_C / T_H), where temperatures must be measured in Kelvin (absolute scale).',
        hint: 'Carnot cycle efficiency.',
        difficulty: 'hard',
        tags: ['Thermodynamics'],
        mastered: true,
      },
      {
        id: 'cp-5',
        front: 'Explain the difference between elastic and inelastic collisions.',
        back: 'Both conserve linear momentum. Elastic collisions also conserve total mechanical kinetic energy; inelastic collisions lose kinetic energy to heat, deformation, or sound.',
        hint: 'Kinetic energy conservation distinction.',
        difficulty: 'medium',
        tags: ['Collisions', 'Mechanics'],
        mastered: false,
      },
      {
        id: 'cp-6',
        front: 'What is the expression for centripetal acceleration in uniform circular motion of radius r at speed v?',
        back: 'a_c = v² / r directed radially inward toward the center of curvature; or a_c = ω²·r in terms of angular velocity.',
        hint: 'Speed squared over radius.',
        difficulty: 'easy',
        tags: ['Kinematics'],
        mastered: true,
      },
      {
        id: 'cp-7',
        front: 'State the Second Law of Thermodynamics in terms of entropy.',
        back: 'The total entropy of an isolated system can never decrease over time; it can remain constant in ideal reversible processes, and strictly increases in all spontaneous irreversible processes (ΔS_total ≥ 0).',
        hint: 'Entropy direction of the universe.',
        difficulty: 'hard',
        tags: ['Thermodynamics', 'Entropy'],
        mastered: false,
      }
    ],
    quizzes: [
      {
        id: 'quiz-phys-1',
        moduleId: 'mod-physics-1',
        title: 'Physics Mechanics & Newton’s Laws Diagnostic',
        description: 'Comprehensive test on force analysis, momentum conservation, and energy transformations.',
        isReleased: false,
        questions: [
          {
            id: 'qp-1',
            question: 'A 5 kg mass accelerates uniformly from rest to 10 m/s in 2 seconds. What is the net force acting on it?',
            options: [
              { id: 'opt-1', text: '25 N (since a = 5 m/s² and F = ma = 5 × 5 = 25 N)' },
              { id: 'opt-2', text: '50 N' },
              { id: 'opt-3', text: '10 N' },
              { id: 'opt-4', text: '100 N' }
            ],
            correctOptionId: 'opt-1',
            explanation: 'Acceleration a = (10 - 0) / 2 = 5 m/s². From F = m·a, F = 5 kg × 5 m/s² = 25 N.'
          },
          {
            id: 'qp-2',
            question: 'If no net external force acts on an object, which of the following MUST be constant?',
            options: [
              { id: 'opt-1', text: 'Linear momentum' },
              { id: 'opt-2', text: 'Potential energy' },
              { id: 'opt-3', text: 'Acceleration' },
              { id: 'opt-4', text: 'Angular position' }
            ],
            correctOptionId: 'opt-1',
            explanation: 'By Newton’s First and Second Laws (dp/dt = F_net = 0), momentum remains constant if no net external force acts.'
          },
          {
            id: 'qp-3',
            question: 'A heat engine absorbs 1000 J of heat from a reservoir at 600 K and exhausts heat to a reservoir at 300 K. What is its maximum possible efficiency?',
            options: [
              { id: 'opt-1', text: '50%' },
              { id: 'opt-2', text: '33.3%' },
              { id: 'opt-3', text: '66.7%' },
              { id: 'opt-4', text: '100%' }
            ],
            correctOptionId: 'opt-1',
            explanation: 'Carnot efficiency η = 1 - (T_C / T_H) = 1 - (300 / 600) = 0.50 or 50%.'
          }
        ]
      }
    ],
    summaries: [
      {
        id: 'sum-phys-1',
        moduleId: 'mod-physics-1',
        title: 'Physics Mechanics & Thermodynamics Core Cheat Sheet',
        isReleased: false,
        keyTakeaways: [
          'Newton’s 2nd Law (F = dp/dt = ma) governs translational dynamics when mass is invariant.',
          'Work-Energy Theorem: Net work done on a system is identically equal to change in kinetic energy.',
          'Linear momentum is universally conserved whenever external net forces sum to zero.',
          'Carnot cycle defines the thermodynamic upper bound of efficiency: η = 1 - T_cold / T_hot.'
        ],
        fullMarkdown: `# Physics: Core Mechanics & Thermodynamic Principles

## 1. Newtonian Dynamics
- **First Law (Inertia):** A body maintains constant velocity unless compelled by external forces.
- **Second Law:** $\\vec{F}_{net} = \\frac{d\\vec{p}}{dt} = m\\vec{a}$
- **Third Law:** Action-reaction pairs act on different bodies with equal magnitude and opposite direction.

## 2. Work, Kinetic Energy & Potential
- **Work:** $W = \\int \\vec{F} \\cdot d\\vec{r} = F d \\cos(\\theta)$
- **Work-Energy Theorem:** $W_{net} = \\Delta KE = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2$
- **Conservation of Mechanical Energy:** When only conservative forces do work, $E = KE + PE = \\text{constant}$.

## 3. Momentum & Collisions
- **Linear Momentum:** $\\vec{p} = m\\vec{v}$
- **Impulse:** $\\vec{J} = \\int \\vec{F}\\,dt = \\Delta\\vec{p}$
- **Elastic Collision:** Conserves both $\\vec{p}$ and $KE$.
- **Inelastic Collision:** Conserves $\\vec{p}$ only; maximum kinetic loss occurs in perfectly inelastic collisions (bodies stick together).

## 4. Thermodynamics Fundamentals
- **First Law:** $\\Delta U = Q - W$ (Change in internal energy equals heat added minus work done by system).
- **Entropy & Second Law:** $\\Delta S_{isolated} \\ge 0$.
- **Carnot Limit:** $\\eta_{Carnot} = 1 - \\frac{T_C}{T_H}$ (Temperatures in Kelvin).`
      }
    ]
  },
  {
    id: 'deck-bio-1',
    title: 'Cellular Biology & Genetics',
    description: 'Core concepts of organelle function, membrane transport, ATP synthesis, and DNA replication mechanics.',
    subject: 'Biology',
    color: 'from-teal-500 to-emerald-600',
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-18T14:30:00Z',
    linkedSpaceId: 'space-bio-cell',
    cards: [
      {
        id: 'c-1',
        front: 'What is the primary thermodynamic driving force behind passive membrane transport?',
        back: 'The electrochemical concentration gradient across the phospholipid bilayer, moving solutes from high to low chemical potential.',
        hint: 'Think entropy and concentration differences.',
        difficulty: 'medium',
        tags: ['Membrane', 'Biophysics'],
        mastered: true,
      },
      {
        id: 'c-2',
        front: 'Which enzyme synthesizes ATP in mitochondria, and what provides its rotational energy?',
        back: 'ATP Synthase (Complex V); driven by the proton-motive force (H+ gradient) returning through the F0 rotor subunit.',
        hint: 'Chemiosmosis across inner mitochondrial membrane.',
        difficulty: 'hard',
        tags: ['Metabolism', 'ATP'],
        mastered: true,
      },
      {
        id: 'c-3',
        front: 'What role do Okazaki fragments play during eukaryotic DNA replication?',
        back: 'They allow discontinuous synthesis of the lagging strand in the 5\' to 3\' direction, later joined by DNA ligase.',
        hint: 'Synthesized away from the replication fork.',
        difficulty: 'medium',
        tags: ['Genetics', 'DNA'],
        mastered: false,
      },
      {
        id: 'c-4',
        front: 'What is the function of the rough endoplasmic reticulum vs. smooth endoplasmic reticulum?',
        back: 'Rough ER has ribosomes for synthesizing transmembrane and secretory proteins; Smooth ER synthesizes lipids, phospholipids, and detoxifies chemicals.',
        hint: 'One has ribosomes on its cytosolic surface.',
        difficulty: 'easy',
        tags: ['Organelles'],
        mastered: true,
      },
      {
        id: 'c-5',
        front: 'Define apoptosis and explain the role of Cytochrome c in the intrinsic pathway.',
        back: 'Programmed cell death; Cytochrome c leaks from the mitochondrial intermembrane space into the cytosol to activate the apoptosome and Caspase-9 cascade.',
        hint: 'Mitochondrial outer membrane permeabilization.',
        difficulty: 'hard',
        tags: ['Signaling', 'Apoptosis'],
        mastered: false,
      },
      {
        id: 'c-6',
        front: 'What is the function of telomerase in cellular senescence?',
        back: 'It adds repetitive ribonucleotide sequences (TTAGGG) to the ends of chromosomes, countering the end-replication problem in germ and stem cells.',
        hint: 'Reverse transcriptase ribonucleoprotein.',
        difficulty: 'medium',
        tags: ['Genetics'],
        mastered: true,
      }
    ],
  },
  {
    id: 'deck-neuro-1',
    title: 'Neuroscience & Synaptic Transmission',
    description: 'Action potential kinetics, neurotransmitter synthesis, ionotropic vs metabotropic receptors, and long-term potentiation.',
    subject: 'Neuroscience',
    color: 'from-blue-600 to-indigo-700',
    createdAt: '2026-09-14T09:00:00Z',
    updatedAt: '2026-09-19T11:00:00Z',
    cards: [
      {
        id: 'cn-1',
        front: 'What ion is primarily responsible for the rapid depolarization phase of an axonal action potential?',
        back: 'Inrush of Na+ (sodium) through voltage-gated sodium channels opening upon threshold voltage (~-55mV).',
        hint: 'Inward current.',
        difficulty: 'easy',
        tags: ['Electrophysiology'],
        mastered: true,
      },
      {
        id: 'cn-2',
        front: 'What molecular mechanism underlies Long-Term Potentiation (LTP) at glutamatergic synapses?',
        back: 'Depolarization expels the Mg2+ plug from NMDA receptors, allowing Ca2+ influx which phosphorylates and inserts more AMPA receptors into the postsynaptic density.',
        hint: 'Magnesium block removal and calcium influx.',
        difficulty: 'hard',
        tags: ['Plasticity', 'Memory'],
        mastered: false,
      },
      {
        id: 'cn-3',
        front: 'Which glial cells myelinate axons in the Central Nervous System vs Peripheral Nervous System?',
        back: 'Oligodendrocytes myelinate the CNS (can wrap multiple axons); Schwann cells myelinate the PNS (one cell per axonal segment).',
        hint: 'CNS vs PNS myelination specialists.',
        difficulty: 'medium',
        tags: ['Glia', 'Anatomy'],
        mastered: true,
      }
    ],
  },
  {
    id: 'deck-cs-algos',
    title: 'Data Structures & Algorithms Mastery',
    description: 'Graph traversal, dynamic programming paradigms, balanced binary trees, and amortized complexity bounds.',
    subject: 'Computer Science',
    color: 'from-amber-500 to-orange-600',
    createdAt: '2026-09-15T15:20:00Z',
    updatedAt: '2026-09-18T16:45:00Z',
    cards: [
      {
        id: 'cs-1',
        front: 'What is the time complexity of Dijkstra’s Algorithm using a Min-Heap (Priority Queue)?',
        back: 'O((V + E) log V), where V is the number of vertices and E is the number of edges.',
        hint: 'Each extract-min takes log V, edge relaxations decrease-key log V.',
        difficulty: 'medium',
        tags: ['Graphs', 'Algorithms'],
        mastered: true,
      },
      {
        id: 'cs-2',
        front: 'Explain the difference between Dynamic Programming with Memoization vs Tabulation.',
        back: 'Memoization is top-down using recursion and caching results; Tabulation is bottom-up solving base subproblems first iteratively in an array/table.',
        hint: 'Top-down recursion vs bottom-up iteration.',
        difficulty: 'medium',
        tags: ['Dynamic Programming'],
        mastered: true,
      }
    ]
  }
];

export const INITIAL_SPACES: CourseSpace[] = [
  {
    id: 'space-bio-cell',
    code: 'CS-CELL101',
    title: 'Bio 101: Cellular Mechanics Space',
    description: 'Official cohort space for Bio 101. Interactive study modules, real-time deck review rooms, and exclusive quiz milestones.',
    subject: 'Cell Biology',
    bannerColor: 'from-teal-600 to-cyan-700',
    creatorId: 'user-sarah',
    creatorName: 'Sarah Chen',
    sourceDeckId: 'deck-bio-1',
    createdAt: '2026-09-15T12:00:00Z',
    isPublic: true,
    members: [
      {
        id: 'user-sarah',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'creator',
        xp: 1420,
        cardsMastered: 5,
        totalCardsStudied: 18,
        quizzesCompleted: 3,
        streakDays: 7,
        status: 'online',
        currentCardIndex: 2,
        joinedAt: '2026-09-15T12:00:00Z',
        lastActive: 'Just now',
      },
      {
        id: 'user-marcus',
        name: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'admin',
        xp: 1180,
        cardsMastered: 4,
        totalCardsStudied: 14,
        quizzesCompleted: 2,
        streakDays: 5,
        status: 'studying',
        currentCardIndex: 1,
        joinedAt: '2026-09-15T13:40:00Z',
        lastActive: '2m ago',
      },
      {
        id: 'user-jordan',
        name: 'Jordan Lee',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        role: 'member',
        xp: 850,
        cardsMastered: 3,
        totalCardsStudied: 10,
        quizzesCompleted: 1,
        streakDays: 3,
        status: 'online',
        currentCardIndex: 0,
        joinedAt: '2026-09-16T09:15:00Z',
        lastActive: '5m ago',
      },
      {
        id: 'user-maya',
        name: 'Maya Patel',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'member',
        xp: 620,
        cardsMastered: 2,
        totalCardsStudied: 8,
        quizzesCompleted: 1,
        streakDays: 2,
        status: 'idle',
        joinedAt: '2026-09-17T14:20:00Z',
        lastActive: '1h ago',
      }
    ],
    messages: [
      {
        id: 'm-1',
        spaceId: 'space-bio-cell',
        senderId: 'user-sarah',
        senderName: 'Sarah Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        senderRole: 'creator',
        text: 'Welcome everyone to our CourseSpace! The initial cards and Module 1 diagnostic quiz are unlocked for everyone.',
        timestamp: '2026-09-16T10:00:00Z',
        isPinned: true,
      },
      {
        id: 'm-2',
        spaceId: 'space-bio-cell',
        senderId: 'user-marcus',
        senderName: 'Marcus Vance',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        senderRole: 'admin',
        text: 'Thanks for making me admin Sarah! I reviewed the cards on Chemiosmosis and they look super clean.',
        timestamp: '2026-09-16T10:05:00Z',
      },
      {
        id: 'm-3',
        spaceId: 'space-bio-cell',
        senderId: 'user-jordan',
        senderName: 'Jordan Lee',
        senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        senderRole: 'member',
        text: 'Hey all! When will the Module 2 mastery quiz and summary be released? Eager to test myself on ATP synthase.',
        timestamp: '2026-09-17T11:20:00Z',
      },
      {
        id: 'm-4',
        spaceId: 'space-bio-cell',
        senderId: 'user-sarah',
        senderName: 'Sarah Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        senderRole: 'creator',
        text: 'Module 2 quiz is currently locked while we refine the question bank. Marcus and I will release it once the cohort hits 80% card reviews!',
        timestamp: '2026-09-17T11:24:00Z',
      }
    ],
    notifications: [
      {
        id: 'notif-1',
        spaceId: 'space-bio-cell',
        title: 'Module 1 Diagnostics Live',
        message: 'Module 1 cards and diagnostic quiz have been published. Complete them to earn 50 XP!',
        senderId: 'user-sarah',
        senderName: 'Sarah Chen',
        senderRole: 'creator',
        createdAt: '2026-09-16T10:00:00Z',
        priority: 'important',
        readBy: ['user-sarah', 'user-marcus', 'user-jordan'],
      },
      {
        id: 'notif-2',
        spaceId: 'space-bio-cell',
        title: 'Live Study Session Today',
        message: 'Join Marcus and Sarah in the real-time card room at 4:00 PM for group flashcard sprints.',
        senderId: 'user-marcus',
        senderName: 'Marcus Vance',
        senderRole: 'admin',
        createdAt: '2026-09-18T08:30:00Z',
        priority: 'normal',
        readBy: ['user-marcus', 'user-sarah'],
      }
    ],
    modules: [
      {
        id: 'mod-1',
        spaceId: 'space-bio-cell',
        title: 'Module 1: Cellular Architecture & Membrane Dynamics',
        description: 'Phospholipid bilayers, active and passive transport, organelle specialization, and protein trafficking.',
        order: 1,
        resources: [
          {
            id: 'res-1',
            moduleId: 'mod-1',
            title: 'Membrane Transport Core Cards',
            type: 'flashcards',
            content: 'Full set of 3 interactive cards covering concentration gradients, channels, and carriers.',
            cardCount: 3,
          },
          {
            id: 'res-2',
            moduleId: 'mod-1',
            title: 'Organelle Quick Reference Cheatsheet',
            type: 'cheatsheet',
            content: 'Ribosomes: translation; Golgi: post-translational glycosylation & sorting; Peroxisomes: beta-oxidation of very long-chain fatty acids.',
          }
        ],
        cards: [
          INITIAL_DECKS[0].cards[0],
          INITIAL_DECKS[0].cards[3],
          INITIAL_DECKS[0].cards[4],
        ],
        quizzes: [
          {
            id: 'quiz-mod-1',
            moduleId: 'mod-1',
            title: 'Module 1 Diagnostic: Membrane Kinetics',
            description: 'Evaluate your understanding of concentration gradients, organelle sorting, and passive transport.',
            isReleased: true, // RELEASED BY CREATOR -> accessible to members!
            releasedBy: 'Sarah Chen (Creator)',
            releasedAt: '2026-09-16T10:00:00Z',
            questions: [
              {
                id: 'q1',
                question: 'Which of the following transport mechanisms requires direct hydrolysis of ATP?',
                options: [
                  { id: 'opt1', text: 'Simple diffusion of O2 and CO2' },
                  { id: 'opt2', text: 'Primary active transport (e.g., Na+/K+ ATPase pump)' },
                  { id: 'opt3', text: 'Facilitated diffusion via GLUT1 glucose transporter' },
                  { id: 'opt4', text: 'Osmotic water flow through aquaporins' }
                ],
                correctOptionId: 'opt2',
                explanation: 'Primary active transport uses direct energy from ATP hydrolysis to move ions against their electrochemical gradient.',
              },
              {
                id: 'q2',
                question: 'Proteins destined for secretion from the cell are translated on which cellular structure?',
                options: [
                  { id: 'opt1', text: 'Free cytosolic ribosomes' },
                  { id: 'opt2', text: 'Ribosomes bound to the rough endoplasmic reticulum' },
                  { id: 'opt3', text: 'Mitochondrial matrix ribosomes' },
                  { id: 'opt4', text: 'Nucleolar transcription complexes' }
                ],
                correctOptionId: 'opt2',
                explanation: 'Secretory proteins contain an N-terminal signal sequence that directs ribosomes to the rough ER membrane via the Signal Recognition Particle (SRP).',
              }
            ]
          }
        ],
        summaries: [
          {
            id: 'sum-mod-1',
            moduleId: 'mod-1',
            title: 'Module 1 AI Executive Synthesis & Concept Map',
            isReleased: true, // RELEASED BY CREATOR -> accessible to members!
            releasedBy: 'Sarah Chen (Creator)',
            releasedAt: '2026-09-16T10:00:00Z',
            keyTakeaways: [
              'Membranes follow the fluid mosaic model with selective permeability determined by lipid composition and embedded transport proteins.',
              'Fick’s law of diffusion dictates passive flux rate based on surface area, partition coefficient, and concentration delta.',
              'Endomembrane system coordinates protein folding, chaperone-assisted quality control, and vesicular transit via COPI, COPII, and clathrin.'
            ],
            fullMarkdown: '### Fluid Mosaic & Transport\nMembranes are dynamic structures where lipids and proteins diffuse laterally. Active transport systems (such as the Na+/K+ pump) consume up to 30% of total cellular ATP to maintain resting electrochemical potentials essential for secondary symport/antiport systems.'
          }
        ]
      },
      {
        id: 'mod-2',
        spaceId: 'space-bio-cell',
        title: 'Module 2: Bioenergetics, ATP Synthase & Mitochondria',
        description: 'The citric acid cycle, electron transport chain complexes I-IV, chemiosmosis, and reactive oxygen species.',
        order: 2,
        resources: [
          {
            id: 'res-3',
            moduleId: 'mod-2',
            title: 'Bioenergetics Base Flashcards',
            type: 'flashcards',
            content: 'Cards on ATP Synthase mechanics and oxidative phosphorylation.',
            cardCount: 3,
          },
          {
            id: 'res-4',
            moduleId: 'mod-2',
            title: 'Electron Transport Chain Pathway Map',
            type: 'notes',
            content: 'Complex I (NADH DH) -> Ubiquinone (Q) -> Complex III -> Cytochrome c -> Complex IV (Cytochrome oxidase) -> O2 (final acceptor).',
          }
        ],
        cards: [
          INITIAL_DECKS[0].cards[1],
          INITIAL_DECKS[0].cards[2],
          INITIAL_DECKS[0].cards[5],
        ],
        quizzes: [
          {
            id: 'quiz-mod-2',
            moduleId: 'mod-2',
            title: 'High-Yield Mastery Challenge: Chemiosmosis & ETC',
            description: 'Intense drill on proton gradients, uncouplers (DNP), and Complex inhibitors (Rotenone, Cyanide).',
            isReleased: false, // 🔒 EXCLUSIVE CONTENT: LOCKED UNTIL CREATOR OR ADMIN RELEASES IT!
            questions: [
              {
                id: 'q2-1',
                question: 'What happens to ATP synthesis and oxygen consumption when the chemical uncoupler DNP (2,4-dinitrophenol) is introduced?',
                options: [
                  { id: 'opt1', text: 'Both ATP synthesis and oxygen consumption completely halt' },
                  { id: 'opt2', text: 'ATP synthesis decreases dramatically while oxygen consumption continues or increases' },
                  { id: 'opt3', text: 'ATP synthesis surges while oxygen consumption drops to zero' },
                  { id: 'opt4', text: 'Electron transport reverses flow back to NADH' }
                ],
                correctOptionId: 'opt2',
                explanation: 'DNP dissipates the proton gradient by shuttling H+ across the inner membrane without passing through ATP synthase. This uncouples respiration from phosphorylation: oxygen consumption accelerates while ATP synthesis drops.',
              },
              {
                id: 'q2-2',
                question: 'Which electron transport complex does NOT pump protons across the inner mitochondrial membrane?',
                options: [
                  { id: 'opt1', text: 'Complex I (NADH-Q oxidoreductase)' },
                  { id: 'opt2', text: 'Complex II (Succinate-Q reductase)' },
                  { id: 'opt3', text: 'Complex III (Q-cytochrome c oxidoreductase)' },
                  { id: 'opt4', text: 'Complex IV (Cytochrome c oxidase)' }
                ],
                correctOptionId: 'opt2',
                explanation: 'Complex II oxidizes succinate to fumarate and transfers electrons to ubiquinone (FAD -> FADH2 -> Q), but does not span the membrane or pump protons.',
              }
            ]
          }
        ],
        summaries: [
          {
            id: 'sum-mod-2',
            moduleId: 'mod-2',
            title: 'AI Synthesis: Mitochondrial Coupling & Thermodynamic Yields',
            isReleased: false, // 🔒 EXCLUSIVE CONTENT: LOCKED UNTIL CREATOR OR ADMIN RELEASES IT!
            keyTakeaways: [
              'Chemiosmotic hypothesis by Peter Mitchell: Proton gradient electrochemical potential powers ATP synthesis.',
              'P/O ratios: approximately 2.5 ATP per NADH, and 1.5 ATP per FADH2 due to Complex II proton bypassing.',
              'Inhibitors vs Uncouplers: Cyanide blocks Complex IV halting all electron flow; uncouplers allow electron flow while generating heat.'
            ],
            fullMarkdown: '### Exclusive Module 2 Mastery Summary\nOxidative phosphorylation accounts for the overwhelming bulk of aerobic ATP yield. The F0 rotor turns at ~100 Hz driven by proton influx, driving conformational changes in the F1 catalytic alpha-beta hexamer (Open -> Loose -> Tight binding mechanisms).'
          }
        ]
      }
    ]
  }
];
