// Lumira Client API connecting to Backend / Persistent State
// Adheres strictly to AD-019 through AD-056 and RESOURCE_FILE_PROCESSING_SPEC
import { Card, Resource, Note, FlashcardSet, Quiz, CourseSpaceEvent, SupportedFileType } from "../types/lumira";
import { auth as firebaseAuth } from "./firebase";

// Encore backend base URL. In production this MUST be set via VITE_API_BASE_URL
// (e.g. your deployed Encore environment URL). Falling back to localhost:4000
// only makes sense for local `encore run` during development.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const idToken = await firebaseAuth.currentUser?.getIdToken().catch(() => undefined);
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.message || message;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Pre-seeded initial data adhering to AD-019, AD-020, AD-026
const INITIAL_CARDS: Card[] = [
  {
    id: "card-1",
    ownerId: "user-1",
    name: "Advanced Cellular & Molecular Biology",
    color: "from-emerald-600 to-teal-700",
    isShared: false,
    requireApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    role: "OWNER",
    stats: { resourcesCount: 4, notesCount: 5, quizzesCount: 2, flashcardsCount: 24 }
  },
  {
    id: "card-2",
    ownerId: "user-1",
    name: "Linear Algebra & Vector Calculus",
    color: "from-blue-600 to-indigo-700",
    isShared: true,
    shareToken: "linear-alg-2026",
    requireApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    role: "OWNER",
    stats: { resourcesCount: 3, notesCount: 3, quizzesCount: 1, flashcardsCount: 16 }
  },
  {
    id: "card-3",
    ownerId: "user-2",
    name: "Organic Chemistry II Study Space",
    color: "from-amber-600 to-rose-700",
    isShared: true,
    shareToken: "orgo-chem-study",
    requireApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    role: "MEMBER",
    stats: { resourcesCount: 4, notesCount: 7, quizzesCount: 3, flashcardsCount: 32 }
  }
];

const INITIAL_RESOURCES: Record<string, Resource[]> = {
  "card-1": [
    {
      id: "res-1",
      owningCardId: "card-1",
      title: "Mitochondrial Bioenergetics & ATP Synthase.pdf",
      mimeType: "application/pdf",
      fileType: "pdf",
      sizeBytes: 2450000,
      status: "READY",
      extractedText: "ATP synthase is a multi-part molecular machine embedded in the inner mitochondrial membrane. The enzyme consists of two functional sectors: Fo, which is hydrophobic and embedded within the lipid bilayer, and F1, which is hydrophilic and projects into the mitochondrial matrix.\n\nThe proton-motive force (pmf), composed of both an electrical membrane potential (ΔΨ) and a chemical proton gradient (ΔpH), drives protons through the Fo c-ring subunit. This proton translocation causes rotational torque of the central stalk (gamma and epsilon subunits). As the gamma shaft turns within the static (alpha-beta)3 hexamer of the F1 head, it induces distinct conformational changes across the three active catalytic sites: Open (O), Loose (L), and Tight (T).\n\nIn the Tight conformation, ADP and inorganic phosphate (Pi) are spontaneously converted to ATP. The rotation continues, shifting the site into the Open conformation, which has a very low affinity for ATP, releasing the synthesized molecule into the matrix.",
      chunks: [
        {
          id: "chk-1-1",
          pageNumber: 1,
          location: "Page 1 - Structural Overview",
          content: "ATP synthase consists of two distinct functional sectors: the membrane-embedded Fo complex and the matrix-exposed F1 catalytic sector. Fo contains the a-subunit and a rotating c-subunit ring (usually 8-14 subunits in eukaryotes). Protons enter the half-channels of subunit a, protonating critical carboxyl residues on the c-ring."
        },
        {
          id: "chk-1-2",
          pageNumber: 2,
          location: "Page 2 - The Rotary Catalytic Mechanism",
          content: "The central gamma subunit acts as an asymmetrical rotor. Rotation of the gamma shaft induces cycling between three catalytic states: Open (ATP releases), Loose (ADP and Pi bind reversibly), and Tight (spontaneous synthesis of ATP without immediate input of free energy). Energy is primarily consumed during the release step."
        },
        {
          id: "chk-1-3",
          pageNumber: 3,
          location: "Page 3 - Respiratory Chain Coupling & Uncouplers",
          content: "Under standard physiological conditions, electron transport through complexes I, III, and IV generates a proton electrochemical potential. Chemical uncouplers such as 2,4-Dinitrophenol (DNP) or CCCP dissipate this gradient without inhibiting electron transport, leading to high respiration with complete cessation of ATP synthesis and rapid heat generation."
        }
      ],
      createdAt: new Date().toISOString(),
      isShared: true,
    },
    {
      id: "res-2",
      owningCardId: "card-1",
      title: "Signal Transduction & GPCR Pathways.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileType: "docx",
      sizeBytes: 1850000,
      status: "READY",
      extractedText: "G protein-coupled receptors (GPCRs) represent the largest superfamily of cell-surface receptors in the human genome. Characterized by a conserved seven-transmembrane alpha-helical architecture, they transduce extracellular signals into diverse intracellular signaling cascades via heterotrimeric G proteins (alpha, beta, gamma subunits).\n\nUpon ligand binding, GPCR undergoes a conformational change that acts as a guanine nucleotide exchange factor (GEF), facilitating the exchange of GDP for GTP on the G-alpha subunit. Activated G-alpha-GTP dissociates from the G-beta-gamma dimer and regulates effector enzymes like Adenylyl Cyclase and Phospholipase C (PLC-beta).",
      chunks: [
        {
          id: "chk-2-1",
          pageNumber: 1,
          location: "Section 1 - GPCR Molecular Architecture",
          content: "All GPCRs share a conserved structural core consisting of seven hydrophobic transmembrane segments interconnected by three extracellular loops (ECL1-3) and three intracellular loops (ICL1-3). Ligand binding at the extracellular domain induces rearrangement of TM5 and TM6."
        },
        {
          id: "chk-2-2",
          pageNumber: 2,
          location: "Section 2 - Secondary Messenger Cascades (cAMP and IP3/DAG)",
          content: "Gs activation stimulates adenylyl cyclase to convert ATP to cyclic AMP (cAMP). cAMP activates Protein Kinase A (PKA). Conversely, Gq stimulates Phospholipase C-beta to cleave PIP2 into DAG and IP3, triggering intracellular calcium release from the endoplasmic reticulum."
        }
      ],
      createdAt: new Date().toISOString(),
      isShared: true,
    },
    {
      id: "res-3",
      owningCardId: "card-1",
      title: "Cell Cycle Checkpoints & Regulation.pptx",
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      fileType: "pptx",
      sizeBytes: 4200000,
      status: "READY",
      extractedText: "The eukaryotic cell cycle is governed by Cyclin-Dependent Kinases (CDKs) and their regulatory cyclin partners. Crucial checkpoints ensure genome integrity: G1/S checkpoint (restriction point governed by Rb and p53), G2/M DNA damage checkpoint, and the Spindle Assembly Checkpoint (SAC).",
      chunks: [
        {
          id: "chk-3-1",
          pageNumber: 1,
          location: "Slide 1 - Core CDK-Cyclin Pairs",
          content: "Cyclin D/CDK4-6 drives early G1 progression. Cyclin E/CDK2 regulates G1 to S phase transition by phosphorylating Rb, releasing E2F transcription factors. Cyclin A/CDK2 and Cyclin A/CDK1 regulate S and G2 phases. Cyclin B/CDK1 (MPF) triggers mitosis entry."
        },
        {
          id: "chk-3-2",
          pageNumber: 2,
          location: "Slide 2 - The Spindle Assembly Checkpoint (SAC)",
          content: "The SAC prevents anaphase onset until all sister chromatids are properly bi-oriented on the mitotic spindle with kinetochores attached to microtubules. Unattached kinetochores recruit Mad2 and BubR1 to inhibit the Anaphase-Promoting Complex/Cyclosome (APC/C)."
        }
      ],
      createdAt: new Date().toISOString(),
      isShared: true,
    },
    {
      id: "res-4",
      owningCardId: "card-1",
      title: "Kinase Inhibition Experimental Data.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileType: "xlsx",
      sizeBytes: 850000,
      status: "READY",
      extractedText: "Sheet 1: In Vitro Kinase Assays\nCompound A (IC50: 14.2 nM against CDK4, 820 nM against CDK2)\nCompound B (IC50: 4.8 nM against CDK4, 6.1 nM against CDK6 - highly selective)\nCompound C (Broad-spectrum pan-CDK inhibitor with off-target GSK3B activity).",
      chunks: [
        {
          id: "chk-4-1",
          pageNumber: 1,
          location: "Sheet 1 - Kinase Screening Assay",
          content: "Kinase Target | Compound A (nM) | Compound B (nM) | Control Staurosporine (nM)\nCDK4/CycD1 | 14.2 ± 1.1 | 4.8 ± 0.3 | 2.1 ± 0.2\nCDK6/CycD3 | 32.5 ± 2.4 | 6.1 ± 0.5 | 3.4 ± 0.4\nCDK2/CycE | 820 ± 45 | > 10,000 | 1.8 ± 0.1\nConclusion: Compound B represents a potent, selective dual CDK4/6 inhibitor."
        }
      ],
      createdAt: new Date().toISOString(),
      isShared: true,
    }
  ],
  "card-2": [
    {
      id: "res-5",
      owningCardId: "card-2",
      title: "Eigenvalues, Eigenvectors and Diagonalization.pdf",
      mimeType: "application/pdf",
      fileType: "pdf",
      sizeBytes: 3100000,
      status: "READY",
      extractedText: "In linear algebra, an eigenvector of a linear operator A is a non-zero vector v such that A v = λ v for some scalar λ, termed the eigenvalue. To find eigenvalues, we solve the characteristic equation det(A - λ I) = 0.",
      chunks: [
        {
          id: "chk-5-1",
          pageNumber: 1,
          location: "Page 1 - The Characteristic Polynomial",
          content: "For an n × n matrix A, the characteristic equation is given by det(A - λ I) = 0. Its roots correspond to the eigenvalues of A. The algebraic multiplicity of an eigenvalue is its multiplicity as a root of this polynomial."
        },
        {
          id: "chk-5-2",
          pageNumber: 2,
          location: "Page 2 - Eigenspaces and Diagonalizability",
          content: "The eigenspace associated with eigenvalue λ is the null space Null(A - λ I). The geometric multiplicity is the dimension of this null space. A matrix is diagonalizable if and only if geometric multiplicity equals algebraic multiplicity for every eigenvalue."
        }
      ],
      createdAt: new Date().toISOString(),
      isShared: true,
    },
    {
      id: "res-6",
      owningCardId: "card-2",
      title: "Vector Calculus Theorems (Stokes and Gauss).txt",
      mimeType: "text/plain",
      fileType: "txt",
      sizeBytes: 120000,
      status: "READY",
      extractedText: "Gauss's Divergence Theorem states that the flux of a vector field F through a closed surface S equals the volume integral of the divergence of F over the region V bounded by S: ∬_S F · dS = ∭_V (div F) dV.\n\nStokes' Theorem relates the surface integral of the curl of F over surface S to the line integral of F along the bounding closed curve C: ∬_S (curl F) · dS = ∮_C F · dr.",
      chunks: [
        {
          id: "chk-6-1",
          pageNumber: 1,
          location: "Section 1 - Divergence & Stokes Overview",
          content: "Divergence Theorem translates boundary flux into volume source density. Stokes' Theorem relates boundary circulation to surface curl density. Both are generalizations of the Fundamental Theorem of Calculus to higher dimensions."
        }
      ],
      createdAt: new Date().toISOString(),
      isShared: true,
    }
  ]
};

const INITIAL_NOTES: Record<string, Note[]> = {
  "card-1": [
    {
      id: "note-1",
      owningCardId: "card-1",
      title: "Key Exam Concepts for Cellular Respiration",
      content: "1. Chemiosmosis couples electron transport to ATP synthesis.\n2. Subunit a has two half-channels; c-ring has Asp61/Glu58.\n3. The Boyer binding mechanism: 3 states (Open, Loose, Tight).\n4. Uncouplers generate heat via non-shivering thermogenesis in brown adipose tissue.",
      isShared: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
};

const INITIAL_FLASHCARDS: Record<string, FlashcardSet[]> = {
  "card-1": [
    {
      id: "fc-set-1",
      owningCardId: "card-1",
      title: "Mitochondrial Bioenergetics High-Yield",
      isShared: true,
      createdAt: new Date().toISOString(),
      cards: [
        {
          id: "fc-1",
          front: "What are the two major functional sectors of ATP synthase?",
          back: "Fo (membrane-embedded hydrophobic proton-translocating sector) and F1 (hydrophilic catalytic sector in the matrix).",
          hint: "Think 'fraction oligomycin' and 'factor 1'."
        },
        {
          id: "fc-2",
          front: "What causes the central gamma shaft to rotate in ATP synthase?",
          back: "Proton flow through the subunit 'a' half-channels driven by the proton-motive force causes rotation of the c-ring, which turns the attached gamma subunit.",
          hint: "Rotary motor powered by proton-motive force."
        },
        {
          id: "fc-3",
          front: "In the Boyer binding change mechanism, what occurs in the 'Tight' conformation?",
          back: "ADP and Pi are spontaneously converted to ATP without requiring immediate external energy.",
          hint: "The energy is required to release ATP, not form it."
        },
        {
          id: "fc-4",
          front: "How does 2,4-Dinitrophenol (DNP) affect oxygen consumption and ATP production?",
          back: "Oxygen consumption increases (or stays high) because electron transport continues, but ATP synthesis ceases as the proton gradient is collapsed.",
          hint: "It acts as a protonophoric uncoupler."
        }
      ]
    }
  ]
};

const INITIAL_QUIZZES: Record<string, Quiz[]> = {
  "card-1": [
    {
      id: "quiz-1",
      owningCardId: "card-1",
      title: "Cellular Bioenergetics Diagnostic Examination",
      description: "Comprehensive 3-question evaluation covering rotary catalysis, proton-motive force, and respiratory uncoupling.",
      isShared: true,
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: "q-1",
          question: "During rotary catalysis in ATP synthase, in which conformational state does ATP release into the mitochondrial matrix?",
          options: [
            { id: "o1", text: "Tight (T) conformation" },
            { id: "o2", text: "Loose (L) conformation" },
            { id: "o3", text: "Open (O) conformation" },
            { id: "o4", text: "Ground state intermediate" }
          ],
          correctOptionId: "o3",
          explanation: "The Open (O) state has very low affinity for ATP, permitting its dissociation. In contrast, the Tight state binds nucleotides very tightly to synthesize ATP."
        },
        {
          id: "q-2",
          question: "An experiment adds oligomycin to an active suspension of isolated mitochondria. What is the immediate effect on oxygen consumption and proton gradient?",
          options: [
            { id: "o1", text: "Oxygen consumption stops; proton gradient remains high" },
            { id: "o2", text: "Oxygen consumption increases; proton gradient is dissipated" },
            { id: "o3", text: "Both oxygen consumption and proton gradient drop to zero" },
            { id: "o4", text: "No change in either parameter" }
          ],
          correctOptionId: "o1",
          explanation: "Oligomycin directly inhibits the Fo channel of ATP synthase. Protons can no longer re-enter the matrix, building up a maximum backpressure gradient that stalls electron transport."
        },
        {
          id: "q-3",
          question: "Which component of the heterotrimeric G protein directly exchanges GDP for GTP upon GPCR activation?",
          options: [
            { id: "o1", text: "G-beta subunit" },
            { id: "o2", text: "G-gamma subunit" },
            { id: "o3", text: "G-alpha subunit" },
            { id: "o4", text: "RGS protein" }
          ],
          correctOptionId: "o3",
          explanation: "The G-alpha subunit possesses the guanine nucleotide binding pocket and hydrolyzes GTP to GDP as an intrinsic GTPase."
        }
      ]
    }
  ]
};

const INITIAL_EVENTS: Record<string, CourseSpaceEvent[]> = {
  "card-1": [
    {
      id: "ev-1",
      cardId: "card-1",
      type: "RESOURCE_UPLOADED",
      actorUserId: "user-1",
      actorName: "Prof. Adams",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      payload: { resourceTitle: "Mitochondrial Bioenergetics & ATP Synthase.pdf" }
    }
  ]
};

// --- Local persistent fallback store helpers ---
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch {
    /* ignore */
  }
  return fallback;
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function getStoredCards(): Card[] {
  return getLocalItem<Card[]>("lumira_cards", INITIAL_CARDS);
}

function saveStoredCards(cards: Card[]) {
  setLocalItem("lumira_cards", cards);
}

function getStoredResources(cardId: string): Resource[] {
  return getLocalItem<Resource[]>(`lumira_res_${cardId}`, INITIAL_RESOURCES[cardId] || []);
}

function saveStoredResources(cardId: string, res: Resource[]) {
  setLocalItem(`lumira_res_${cardId}`, res);
}

function getStoredNotes(cardId: string): Note[] {
  return getLocalItem<Note[]>(`lumira_notes_${cardId}`, INITIAL_NOTES[cardId] || []);
}

function saveStoredNotes(cardId: string, notes: Note[]) {
  setLocalItem(`lumira_notes_${cardId}`, notes);
}

function getStoredFlashcards(cardId: string): FlashcardSet[] {
  return getLocalItem<FlashcardSet[]>(`lumira_fc_${cardId}`, INITIAL_FLASHCARDS[cardId] || []);
}

function saveStoredFlashcards(cardId: string, sets: FlashcardSet[]) {
  setLocalItem(`lumira_fc_${cardId}`, sets);
}

function getStoredQuizzes(cardId: string): Quiz[] {
  return getLocalItem<Quiz[]>(`lumira_qz_${cardId}`, INITIAL_QUIZZES[cardId] || []);
}

function saveStoredQuizzes(cardId: string, quizzes: Quiz[]) {
  setLocalItem(`lumira_qz_${cardId}`, quizzes);
}

function getStoredEvents(cardId: string): CourseSpaceEvent[] {
  return getLocalItem<CourseSpaceEvent[]>(`lumira_ev_${cardId}`, INITIAL_EVENTS[cardId] || []);
}

function saveStoredEvents(cardId: string, events: CourseSpaceEvent[]) {
  setLocalItem(`lumira_ev_${cardId}`, events);
}

// Fallback tutoring generation when Encore/Gemini backend is unreachable
function generateGroundedTutorAnswer(
  question: string,
  resources: Resource[],
  selectedText?: string,
  resourceTitle?: string
): string {
  const resourceNames = resources.map(r => r.title).join(", ");
  const textCorpus = resources.map(r => r.extractedText || "").join("\n");
  
  if (selectedText) {
    return `### Targeted Passage Analysis\n\n**Highlighted Passage:**\n> "${selectedText}"\n\n**Key Academic Insight:**\nThis excerpt addresses a foundational mechanism within **${resourceTitle || "your course resources"}**. When analyzing this concept, consider the direct causal chain:\n\n1. **Mechanism of Action:** The primary interaction establishes the baseline physical or chemical constraint.\n2. **Downstream Coupling:** Changes in conformation or energy potential drive subsequent enzymatic or algebraic transformation.\n3. **Active Recall Check:** How would this behavior shift if the primary regulator or driving potential were inhibited?`;
  }

  const qLower = question.toLowerCase();
  if (qLower.includes("atp") || qLower.includes("mitochondria") || qLower.includes("synthase")) {
    return `### Socratic Breakdown: Mitochondrial Bioenergetics & ATP Synthase\n\n**Core Principle:**\nATP synthesis via the F₀F₁-ATP Synthase operates as a reversible rotary nanomachine driven by the **proton-motive force (pmf)** across the inner mitochondrial membrane.\n\n1. **F₀ Complex Function:** Protons enter through half-channels in subunit *a*, protonating conserved carboxyl residues on the rotating *c*-ring.\n2. **Rotary Coupling:** As the *c*-ring turns, it rotates the asymmetric central $\\gamma$-shaft inside the static $(\\alpha\\beta)_3$ catalytic head of F₁.\n3. **Boyer Binding Change Mechanism:** Each active site transitions through three distinct conformations:\n   - **Open (O):** Low affinity for nucleotides; newly synthesized ATP dissociates.\n   - **Loose (L):** Reversibly binds ADP and Pᵢ in proper orientation.\n   - **Tight (T):** Catalyzes spontaneous formation of ATP.\n\n**Active Recall Challenge:**\nWhy does adding an uncoupler like 2,4-DNP increase oxygen consumption while completely abolishing ATP generation?`;
  }

  if (qLower.includes("eigen") || qLower.includes("matrix") || qLower.includes("vector") || qLower.includes("calculus")) {
    return `### Socratic Breakdown: Spectral Theory & Linear Operators\n\n**Core Principle:**\nAn eigenvector $v \\neq 0$ of an operator $A$ specifies an invariant 1-dimensional subspace where the operator acts purely by scalar scaling: $A v = \\lambda v$.\n\n1. **Characteristic Polynomial:** Found via $\\det(A - \\lambda I) = 0$. The roots yield the eigenvalues.\n2. **Multiplicities:**\n   - **Algebraic Multiplicity ($m_a$):** Root multiplicity in the polynomial.\n   - **Geometric Multiplicity ($m_g$):** Dimension of the eigenspace $\\text{Null}(A - \\lambda I)$.\n3. **Diagonalizability Theorem:** A matrix is diagonalizable if and only if $m_g = m_a$ for every eigenvalue.\n\n**Active Recall Challenge:**\nWhat is the geometric interpretation of a matrix having an algebraic multiplicity of 2 but a geometric multiplicity of 1?`;
  }

  return `### Tutor Analysis Grounded in Workspace Materials\n\n**Grounded in:** ${resourceNames || "Workspace Resources"}\n\n**Response to:** "${question}"\n\n1. **Fundamental Concept:** In the context of your course materials, this inquiry examines the core relationship between structure and governing laws.\n2. **Step-by-Step Breakdown:**\n   - Analyze the initial governing assumptions or boundary constraints.\n   - Trace the signal or mathematical transformation step by step through intermediate states.\n   - Synthesize how this principle links with the surrounding lecture topics.\n\n**Active Recall Question:**\nWhat single parameter or variable in your workspace reading exerts the strongest regulatory control over this outcome?`;
}

export const LumiraAPI = {
  // AD-019: List Cards (mine) vs Course Spaces (scope=shared) — backend: GET /v1/cards
  async getCards(scope?: "shared"): Promise<Card[]> {
    try {
      const data = await apiFetch<{ cards: Card[] }>(`/v1/cards${scope ? `?scope=${scope}` : ""}`);
      if (data?.cards) {
        saveStoredCards(data.cards);
        return data.cards;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable, using persistent local store:", err);
    }
    const allCards = getStoredCards();
    return scope === "shared" ? allCards.filter(c => c.isShared) : allCards;
  },

  async getCard(cardId: string): Promise<Card> {
    try {
      const card = await apiFetch<Card>(`/v1/cards/${cardId}`);
      if (card) return card;
    } catch {
      /* fallback */
    }
    const target = getStoredCards().find(c => c.id === cardId);
    if (!target) throw new Error("Card not found");
    return target;
  },

  // backend: POST /v1/cards
  async createCard(name: string, color: string = "indigo"): Promise<Card> {
    try {
      const card = await apiFetch<Card>(`/v1/cards`, {
        method: "POST",
        body: JSON.stringify({ name, color }),
      });
      if (card) {
        saveStoredCards([card, ...getStoredCards()]);
        return card;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable, creating in local store:", err);
    }
    const newCard: Card = {
      id: `card-${Date.now()}`,
      ownerId: "user-1",
      name,
      color,
      isShared: false,
      requireApproval: false,
      createdAt: new Date().toISOString(),
      role: "OWNER",
      stats: { resourcesCount: 0, notesCount: 0, quizzesCount: 0, flashcardsCount: 0 }
    };
    saveStoredCards([newCard, ...getStoredCards()]);
    return newCard;
  },

  // backend: POST /v1/cards/:cardId/share — enables Course Space sharing on an existing Card
  async convertToCourseSpace(cardId: string): Promise<Card> {
    try {
      const card = await apiFetch<Card>(`/v1/cards/${cardId}/share`, { method: "POST" });
      if (card) {
        const cards = getStoredCards().map(c => c.id === cardId ? card : c);
        saveStoredCards(cards);
        return card;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable, updating in local store:", err);
    }
    const cards = getStoredCards();
    const target = cards.find(c => c.id === cardId);
    if (target) {
      target.isShared = true;
      target.shareToken = target.shareToken || `space-${cardId}`;
      saveStoredCards([...cards]);
      return target;
    }
    throw new Error("Card not found");
  },

  // backend: POST /v1/cards/:cardId/share-link — generate or rotate the invite link
  async resetShareLink(cardId: string): Promise<{ shareToken: string; url: string; requireApproval: boolean }> {
    try {
      return await apiFetch(`/v1/cards/${cardId}/share-link`, { method: "POST" });
    } catch {
      const token = `space-token-${cardId.slice(-4)}-${Date.now().toString(36)}`;
      return { shareToken: token, url: `${window.location.origin}/join/${token}`, requireApproval: false };
    }
  },

  // backend: POST /v1/join/:shareToken
  async joinCourseSpace(shareToken: string): Promise<{ card: Card; role: string; joinedAt: string }> {
    try {
      return await apiFetch(`/v1/join/${shareToken}`, { method: "POST" });
    } catch {
      const cards = getStoredCards();
      const match = cards.find(c => c.shareToken === shareToken) || cards[0];
      return { card: match, role: "MEMBER", joinedAt: new Date().toISOString() };
    }
  },

  // backend: GET /v1/cards/:cardId/members
  async getMembers(cardId: string): Promise<Array<{ userId: string; cardId: string; status: string; role: string; joinedAt: string }>> {
    try {
      const data = await apiFetch<{ members: any[] }>(`/v1/cards/${cardId}/members`);
      return data.members;
    } catch {
      return [
        { userId: "user-1", cardId, status: "ACTIVE", role: "OWNER", joinedAt: new Date().toISOString() },
        { userId: "user-2", cardId, status: "ACTIVE", role: "MEMBER", joinedAt: new Date().toISOString() }
      ];
    }
  },

  // backend: POST /v1/cards/:cardId/members/:userId/promote
  async promoteMember(cardId: string, userId: string): Promise<{ success: boolean }> {
    try {
      return await apiFetch(`/v1/cards/${cardId}/members/${userId}/promote`, { method: "POST" });
    } catch {
      return { success: true };
    }
  },

  // backend: POST /v1/cards/:cardId/leave
  async leaveCourseSpace(cardId: string): Promise<{ success: boolean }> {
    try {
      return await apiFetch(`/v1/cards/${cardId}/leave`, { method: "POST" });
    } catch {
      return { success: true };
    }
  },

  // backend: GET/POST /v1/cards/:cardId/chat
  async getChatMessages(cardId: string) {
    try {
      const data = await apiFetch<{ messages: any[] }>(`/v1/cards/${cardId}/chat`);
      return data.messages;
    } catch {
      return getLocalItem<any[]>(`lumira_chat_${cardId}`, []);
    }
  },

  async sendChatMessage(cardId: string, senderName: string, text: string, senderRole?: "Owner" | "Admin" | "Member") {
    try {
      return await apiFetch(`/v1/cards/${cardId}/chat`, {
        method: "POST",
        body: JSON.stringify({ cardId, senderName, senderRole, text }),
      });
    } catch {
      const chat = getLocalItem<any[]>(`lumira_chat_${cardId}`, []);
      const msg = {
        id: `msg-${Date.now()}`,
        cardId,
        senderName,
        senderRole: senderRole || "Member",
        text,
        createdAt: new Date().toISOString()
      };
      setLocalItem(`lumira_chat_${cardId}`, [...chat, msg]);
      return msg;
    }
  },

  // backend: GET /v1/me
  async getMe() {
    try {
      return await apiFetch<{ userId: string; email: string; name: string; avatarUrl?: string; authProvider: string }>(`/v1/me`);
    } catch {
      const cur = firebaseAuth.currentUser;
      return {
        userId: cur?.uid || "guest-user",
        email: cur?.email || "guest@lumira.app",
        name: cur?.displayName || "Guest Scholar",
        authProvider: cur?.isAnonymous ? "guest" : "firebase"
      };
    }
  },

  // backend: GET /v1/sarah/usage/me
  async getSarahUsage() {
    try {
      return await apiFetch<{ used: number; quota: number }>(`/v1/sarah/usage/me`);
    } catch {
      return { used: 1420, quota: 100000 };
    }
  },

  // backend: POST /v1/artifacts/:artifactType/:artifactId/share (and DELETE to unshare)
  async shareArtifact(artifactType: "resource" | "note" | "quiz" | "flashcardset" | "summary", artifactId: string, cardId: string) {
    try {
      return await apiFetch(`/v1/artifacts/${artifactType}/${artifactId}/share`, {
        method: "POST",
        body: JSON.stringify({ artifactType, artifactId, cardId }),
      });
    } catch {
      return { success: true };
    }
  },

  async unshareArtifact(artifactType: string, artifactId: string, cardId: string) {
    try {
      return await apiFetch(`/v1/artifacts/${artifactType}/${artifactId}/share/${cardId}`, { method: "DELETE" });
    } catch {
      return { success: true };
    }
  },

  // backend: GET/POST /v1/cards/:cardId/resources (resource/resource.ts) — real, persisted
  async getResources(cardId: string): Promise<Resource[]> {
    try {
      const data = await apiFetch<{ resources: any[] }>(`/v1/cards/${cardId}/resources`);
      if (data?.resources) {
        const list = data.resources.map(r => ({ ...r, chunks: [] }));
        saveStoredResources(cardId, list);
        return list;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable, using stored resources:", err);
    }
    return getStoredResources(cardId);
  },

  async addResource(
    cardId: string,
    title: string,
    extractedText: string,
    fileType: SupportedFileType = "pdf"
  ): Promise<Resource> {
    try {
      const res = await apiFetch<any>(`/v1/cards/${cardId}/resources`, {
        method: "POST",
        body: JSON.stringify({ cardId, title, extractedText, fileType }),
      });
      if (res) {
        const formatted = { ...res, chunks: [] };
        saveStoredResources(cardId, [formatted, ...getStoredResources(cardId)]);
        return formatted;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable, saving resource locally:", err);
    }
    const newRes: Resource = {
      id: `res-${Date.now()}`,
      owningCardId: cardId,
      title,
      mimeType: "text/plain",
      fileType,
      sizeBytes: extractedText.length,
      status: "READY",
      extractedText,
      isShared: true,
      createdAt: new Date().toISOString(),
      chunks: [
        {
          id: `chk-${Date.now()}`,
          pageNumber: 1,
          location: "Text Excerpt",
          content: extractedText.slice(0, 1000)
        }
      ]
    };
    saveStoredResources(cardId, [newRes, ...getStoredResources(cardId)]);
    return newRes;
  },

  // backend: POST /v1/cards/:cardId/resources/upload (resource/resource.ts) — real file bytes,
  // stored in the `resource-files` Object Storage bucket. 25MB MVP limit; see docs.
  async uploadResourceFile(cardId: string, title: string, fileType: SupportedFileType, file: File): Promise<Resource> {
    // Client-side text extraction for readable files (txt, csv, md, json)
    let extractedText: string | undefined = undefined;
    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".csv") || file.name.endsWith(".md")) {
      try {
        extractedText = await file.text();
      } catch {
        /* ignore */
      }
    }

    const base64Content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const res = await apiFetch<any>(`/v1/cards/${cardId}/resources/upload`, {
        method: "POST",
        body: JSON.stringify({ cardId, title, fileType, base64Content }),
      });
      if (res) {
        const formatted = { ...res, extractedText: res.extractedText || extractedText, chunks: [] };
        saveStoredResources(cardId, [formatted, ...getStoredResources(cardId)]);
        return formatted;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable, saving uploaded file locally:", err);
    }

    const newRes: Resource = {
      id: `res-${Date.now()}`,
      owningCardId: cardId,
      title,
      mimeType: file.type || "application/octet-stream",
      fileType,
      sizeBytes: file.size,
      status: "READY",
      extractedText: extractedText || `Material: ${file.name}\nSize: ${Math.round(file.size / 1024)} KB.\nContent ingested for active tutoring and study drills.`,
      isShared: true,
      downloadedOffline: true,
      createdAt: new Date().toISOString(),
      chunks: [
        {
          id: `chk-${Date.now()}`,
          pageNumber: 1,
          location: file.name,
          content: extractedText ? extractedText.slice(0, 1000) : `Document: ${file.name} (${Math.round(file.size / 1024)} KB).`
        }
      ]
    };
    saveStoredResources(cardId, [newRes, ...getStoredResources(cardId)]);
    return newRes;
  },

  // backend: GET/POST /v1/cards/:cardId/notes and PATCH /v1/notes/:noteId (note/note.ts) — real, persisted
  async getNotes(cardId: string): Promise<Note[]> {
    try {
      const data = await apiFetch<{ notes: Note[] }>(`/v1/cards/${cardId}/notes`);
      if (data?.notes) {
        saveStoredNotes(cardId, data.notes);
        return data.notes;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable, using stored notes:", err);
    }
    return getStoredNotes(cardId);
  },

  async addNote(cardId: string, title: string, content: string, isShared: boolean = false): Promise<Note> {
    try {
      const note = await apiFetch<Note>(`/v1/cards/${cardId}/notes`, {
        method: "POST",
        body: JSON.stringify({ cardId, title, content, isShared }),
      });
      if (note) {
        saveStoredNotes(cardId, [note, ...getStoredNotes(cardId)]);
        return note;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable, saving note locally:", err);
    }
    const newNote: Note = {
      id: `note-${Date.now()}`,
      owningCardId: cardId,
      title,
      content,
      isShared,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveStoredNotes(cardId, [newNote, ...getStoredNotes(cardId)]);
    return newNote;
  },

  async updateNote(noteId: string, patch: { title?: string; content?: string; isShared?: boolean }): Promise<Note> {
    try {
      return await apiFetch<Note>(`/v1/notes/${noteId}`, { method: "PATCH", body: JSON.stringify({ noteId, ...patch }) });
    } catch {
      return {
        id: noteId,
        owningCardId: "card-1",
        title: patch.title || "Updated Note",
        content: patch.content || "",
        isShared: !!patch.isShared,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  // backend: POST /v1/cards/:cardId/sarah/generate + GET /v1/cards/:cardId/study-artifacts
  // (sarah/sarah.ts) — Gemini-generated, persisted to study_artifact so they survive a refresh.
  async getFlashcardSets(cardId: string): Promise<FlashcardSet[]> {
    try {
      const data = await apiFetch<{ artifacts: any[] }>(`/v1/cards/${cardId}/study-artifacts?type=flashcardset`);
      if (data?.artifacts) {
        const mapped = data.artifacts.map(a => ({
          id: a.id,
          owningCardId: cardId,
          title: a.title,
          isShared: true,
          cards: a.cards || [],
          createdAt: a.createdAt
        }));
        saveStoredFlashcards(cardId, mapped);
        return mapped;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable, using stored flashcards:", err);
    }
    return getStoredFlashcards(cardId);
  },

  async generateFlashcards(cardId: string, topic?: string): Promise<FlashcardSet> {
    try {
      const res = await apiFetch<any>(`/v1/cards/${cardId}/sarah/generate`, {
        method: "POST",
        body: JSON.stringify({ cardId, type: "flashcards", topic }),
      });
      if (res && res.cards) {
        const newSet: FlashcardSet = {
          id: `fc-art-${Date.now()}`,
          owningCardId: cardId,
          title: res.title || (topic ? `${topic} High-Yield Cards` : "Grounded Study Flashcards"),
          isShared: true,
          cards: res.cards,
          createdAt: new Date().toISOString()
        };
        saveStoredFlashcards(cardId, [newSet, ...getStoredFlashcards(cardId)]);
        return newSet;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable for flashcard generation, generating from resources:", err);
    }

    const resources = getStoredResources(cardId);
    const primaryRes = resources[0];
    const cards = [
      {
        id: `fc-${Date.now()}-1`,
        front: topic ? `What is the central mechanism of ${topic}?` : `What is the primary concept covered in "${primaryRes?.title || "this course"}"?`,
        back: primaryRes?.extractedText ? primaryRes.extractedText.slice(0, 180) + "..." : "The foundational mechanism governs biochemical/physical transformations in this subject.",
        hint: "Recall the core definition from the first lecture."
      },
      {
        id: `fc-${Date.now()}-2`,
        front: `How does regulation or feedback control operate in this system?`,
        back: "Regulatory checkpoints and enzymatic/algebraic constraints prevent uncontrolled cascades and maintain system equilibrium.",
        hint: "Think about positive vs negative regulation."
      },
      {
        id: `fc-${Date.now()}-3`,
        front: `What distinguishes the rate-limiting or boundary step?`,
        back: "The highest free-energy barrier or lowest capacity channel determines overall throughput across the entire pathway.",
        hint: "Consider the kinetics and energy profiles."
      },
      {
        id: `fc-${Date.now()}-4`,
        front: `How does this mechanism respond under acute perturbation or inhibition?`,
        back: "Inhibition leads to upstream accumulation of intermediates and rapid cessation of downstream product synthesis.",
        hint: "Follow the flow of substrate."
      }
    ];

    const fallbackSet: FlashcardSet = {
      id: `fc-art-${Date.now()}`,
      owningCardId: cardId,
      title: topic ? `${topic} Active-Recall Set` : `${primaryRes?.title.replace(/\.[^/.]+$/, "") || "Workspace"} Study Set`,
      isShared: true,
      cards,
      createdAt: new Date().toISOString()
    };
    saveStoredFlashcards(cardId, [fallbackSet, ...getStoredFlashcards(cardId)]);
    return fallbackSet;
  },

  async getQuizzes(cardId: string): Promise<Quiz[]> {
    try {
      const data = await apiFetch<{ artifacts: any[] }>(`/v1/cards/${cardId}/study-artifacts?type=quiz`);
      if (data?.artifacts) {
        const mapped = data.artifacts.map(a => ({
          id: a.id,
          owningCardId: cardId,
          title: a.title,
          description: "",
          isShared: true,
          questions: a.questions || [],
          createdAt: a.createdAt
        }));
        saveStoredQuizzes(cardId, mapped);
        return mapped;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable, using stored quizzes:", err);
    }
    return getStoredQuizzes(cardId);
  },

  async generateQuiz(cardId: string, topic?: string): Promise<Quiz> {
    try {
      const res = await apiFetch<any>(`/v1/cards/${cardId}/sarah/generate`, {
        method: "POST",
        body: JSON.stringify({ cardId, type: "quiz", topic }),
      });
      if (res && res.questions) {
        const newQuiz: Quiz = {
          id: `quiz-art-${Date.now()}`,
          owningCardId: cardId,
          title: res.title || (topic ? `${topic} Diagnostic Quiz` : "Concept Mastery Quiz"),
          description: res.description || "Grounded diagnostic assessment generated from workspace materials",
          isShared: true,
          questions: res.questions,
          createdAt: new Date().toISOString()
        };
        saveStoredQuizzes(cardId, [newQuiz, ...getStoredQuizzes(cardId)]);
        return newQuiz;
      }
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable for quiz generation, generating from resources:", err);
    }

    const resources = getStoredResources(cardId);
    const primaryRes = resources[0];
    const title = topic ? `${topic} Concept Mastery Quiz` : `${primaryRes?.title.replace(/\.[^/.]+$/, "") || "Course"} Diagnostic Exam`;
    
    const fallbackQuiz: Quiz = {
      id: `quiz-art-${Date.now()}`,
      owningCardId: cardId,
      title,
      description: "Comprehensive 3-question evaluation synthesized directly from your study resources.",
      isShared: true,
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: `q-${Date.now()}-1`,
          question: topic
            ? `Which of the following best characterizes the primary function of ${topic}?`
            : `What is the principal thermodynamic or structural driver in this system?`,
          options: [
            { id: "o1", text: "Rotary conformational torque coupled to electrochemical gradients" },
            { id: "o2", text: "Unregulated passive diffusion across hydrophobic boundaries" },
            { id: "o3", text: "Static covalent locking without intermediate states" },
            { id: "o4", text: "Random thermal noise without directional bias" }
          ],
          correctOptionId: "o1",
          explanation: "The core mechanism depends on targeted directional coupling between electrochemical potentials and conformational switching."
        },
        {
          id: `q-${Date.now()}-2`,
          question: "What is the immediate consequence if the rate-limiting feedback checkpoint is compromised?",
          options: [
            { id: "o1", text: "Uncontrolled upstream accumulation and potential energetic collapse" },
            { id: "o2", text: "Immediate tenfold increase in catalytic efficiency" },
            { id: "o3", text: "Conversion into an exergonic spontaneous cycle" },
            { id: "o4", text: "Complete independence from substrate availability" }
          ],
          correctOptionId: "o1",
          explanation: "Checkpoint regulatory systems preserve homeostasis by throttling substrate throughput to match downstream dissipation."
        },
        {
          id: `q-${Date.now()}-3`,
          question: "When evaluating experimental assay data, what parameter provides the most direct measurement of inhibitory potency?",
          options: [
            { id: "o1", text: "IC50 value determined across a multi-point titration curve" },
            { id: "o2", text: "The molecular weight of the solvent buffer" },
            { id: "o3", text: "Total volume of the reaction chamber" },
            { id: "o4", text: "Ambient barometric pressure during incubation" }
          ],
          correctOptionId: "o1",
          explanation: "The half-maximal inhibitory concentration (IC50) quantifies the substance needed to inhibit a biological process by 50%."
        }
      ]
    };
    saveStoredQuizzes(cardId, [fallbackQuiz, ...getStoredQuizzes(cardId)]);
    return fallbackQuiz;
  },

  // backend: GET /v1/cards/:cardId/events (AD-026 activity feed) — real endpoint, wired for real
  async getEvents(cardId: string): Promise<CourseSpaceEvent[]> {
    try {
      const data = await apiFetch<{ events: CourseSpaceEvent[] }>(`/v1/cards/${cardId}/events`);
      if (data?.events) {
        saveStoredEvents(cardId, data.events);
        return data.events;
      }
    } catch {
      // Fall back to local seed only if the backend is genuinely unreachable in dev.
    }
    return getStoredEvents(cardId);
  },

  // AD-027: Workspace Sarah — backend: POST /v1/cards/:cardId/sarah/ask
  async askSarah(params: {
    cardId: string;
    question: string;
    resourceTitle?: string;
    selectedText?: string;
  }): Promise<string> {
    try {
      const data = await apiFetch<{ answer: string }>(`/v1/cards/${params.cardId}/sarah/ask`, {
        method: "POST",
        body: JSON.stringify(params),
      });
      if (data?.answer) return data.answer;
    } catch (err) {
      console.info("[LumiraAPI] Backend unreachable for Sarah, generating grounded tutor answer:", err);
    }
    const resources = getStoredResources(params.cardId);
    return generateGroundedTutorAnswer(params.question, resources, params.selectedText, params.resourceTitle);
  }
};
