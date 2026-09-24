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

export const LumiraAPI = {
  // AD-019: List Cards (mine) vs Course Spaces (scope=shared) — backend: GET /v1/cards
  async getCards(scope?: "shared"): Promise<Card[]> {
    const data = await apiFetch<{ cards: Card[] }>(`/v1/cards${scope ? `?scope=${scope}` : ""}`);
    return data.cards;
  },

  async getCard(cardId: string): Promise<Card> {
    return apiFetch<Card>(`/v1/cards/${cardId}`);
  },

  // backend: POST /v1/cards
  async createCard(name: string, color: string = "indigo"): Promise<Card> {
    return apiFetch<Card>(`/v1/cards`, {
      method: "POST",
      body: JSON.stringify({ name, color }),
    });
  },

  // backend: POST /v1/cards/:cardId/share — enables Course Space sharing on an existing Card
  async convertToCourseSpace(cardId: string): Promise<Card> {
    return apiFetch<Card>(`/v1/cards/${cardId}/share`, { method: "POST" });
  },

  // backend: POST /v1/cards/:cardId/share-link — generate or rotate the invite link
  async resetShareLink(cardId: string): Promise<{ shareToken: string; url: string; requireApproval: boolean }> {
    return apiFetch(`/v1/cards/${cardId}/share-link`, { method: "POST" });
  },

  // backend: POST /v1/join/:shareToken
  async joinCourseSpace(shareToken: string): Promise<{ card: Card; role: string; joinedAt: string }> {
    return apiFetch(`/v1/join/${shareToken}`, { method: "POST" });
  },

  // backend: GET /v1/cards/:cardId/members
  async getMembers(cardId: string): Promise<Array<{ userId: string; cardId: string; status: string; role: string; joinedAt: string }>> {
    const data = await apiFetch<{ members: any[] }>(`/v1/cards/${cardId}/members`);
    return data.members;
  },

  // backend: POST /v1/cards/:cardId/members/:userId/promote
  async promoteMember(cardId: string, userId: string): Promise<{ success: boolean }> {
    return apiFetch(`/v1/cards/${cardId}/members/${userId}/promote`, { method: "POST" });
  },

  // backend: POST /v1/cards/:cardId/leave
  async leaveCourseSpace(cardId: string): Promise<{ success: boolean }> {
    return apiFetch(`/v1/cards/${cardId}/leave`, { method: "POST" });
  },

  // backend: GET/POST /v1/cards/:cardId/chat
  async getChatMessages(cardId: string) {
    const data = await apiFetch<{ messages: any[] }>(`/v1/cards/${cardId}/chat`);
    return data.messages;
  },
  async sendChatMessage(cardId: string, senderName: string, text: string, senderRole?: "Owner" | "Admin" | "Member") {
    return apiFetch(`/v1/cards/${cardId}/chat`, {
      method: "POST",
      body: JSON.stringify({ cardId, senderName, senderRole, text }),
    });
  },

  // backend: GET /v1/me
  async getMe() {
    return apiFetch<{ userId: string; email: string; name: string; avatarUrl?: string; authProvider: string }>(`/v1/me`);
  },

  // backend: GET /v1/sarah/usage/me
  async getSarahUsage() {
    return apiFetch<{ used: number; quota: number }>(`/v1/sarah/usage/me`);
  },

  // backend: POST /v1/artifacts/:artifactType/:artifactId/share (and DELETE to unshare)
  async shareArtifact(artifactType: "resource" | "note" | "quiz" | "flashcardset" | "summary", artifactId: string, cardId: string) {
    return apiFetch(`/v1/artifacts/${artifactType}/${artifactId}/share`, {
      method: "POST",
      body: JSON.stringify({ artifactType, artifactId, cardId }),
    });
  },
  async unshareArtifact(artifactType: string, artifactId: string, cardId: string) {
    return apiFetch(`/v1/artifacts/${artifactType}/${artifactId}/share/${cardId}`, { method: "DELETE" });
  },

  // backend: GET/POST /v1/cards/:cardId/resources (resource/resource.ts) — real, persisted
  async getResources(cardId: string): Promise<Resource[]> {
    const data = await apiFetch<{ resources: any[] }>(`/v1/cards/${cardId}/resources`);
    return data.resources.map(r => ({ ...r, chunks: [] }));
  },

  async addResource(
    cardId: string,
    title: string,
    extractedText: string,
    fileType: SupportedFileType = "pdf"
  ): Promise<Resource> {
    const res = await apiFetch<any>(`/v1/cards/${cardId}/resources`, {
      method: "POST",
      body: JSON.stringify({ cardId, title, extractedText, fileType }),
    });
    return { ...res, chunks: [] };
  },

  // backend: POST /v1/cards/:cardId/resources/upload (resource/resource.ts) — real file bytes,
  // stored in the `resource-files` Object Storage bucket. 25MB MVP limit; see docs.
  async uploadResourceFile(cardId: string, title: string, fileType: SupportedFileType, file: File): Promise<Resource> {
    const base64Content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const res = await apiFetch<any>(`/v1/cards/${cardId}/resources/upload`, {
      method: "POST",
      body: JSON.stringify({ cardId, title, fileType, base64Content }),
    });
    return { ...res, chunks: [] };
  },

  // backend: GET/POST /v1/cards/:cardId/notes and PATCH /v1/notes/:noteId (note/note.ts) — real, persisted
  async getNotes(cardId: string): Promise<Note[]> {
    const data = await apiFetch<{ notes: Note[] }>(`/v1/cards/${cardId}/notes`);
    return data.notes;
  },

  async addNote(cardId: string, title: string, content: string): Promise<Note> {
    return apiFetch<Note>(`/v1/cards/${cardId}/notes`, {
      method: "POST",
      body: JSON.stringify({ cardId, title, content }),
    });
  },

  async updateNote(noteId: string, patch: { title?: string; content?: string; isShared?: boolean }): Promise<Note> {
    return apiFetch<Note>(`/v1/notes/${noteId}`, { method: "PATCH", body: JSON.stringify({ noteId, ...patch }) });
  },

  // backend: POST /v1/cards/:cardId/sarah/generate + GET /v1/cards/:cardId/study-artifacts
  // (sarah/sarah.ts) — Gemini-generated, persisted to study_artifact so they survive a refresh.
  async getFlashcardSets(cardId: string): Promise<FlashcardSet[]> {
    const data = await apiFetch<{ artifacts: any[] }>(`/v1/cards/${cardId}/study-artifacts?type=flashcardset`);
    return data.artifacts.map(a => ({ id: a.id, owningCardId: cardId, title: a.title, isShared: true, cards: a.cards || [], createdAt: a.createdAt }));
  },

  async generateFlashcards(cardId: string, topic?: string): Promise<FlashcardSet> {
    const res = await apiFetch<any>(`/v1/cards/${cardId}/sarah/generate`, {
      method: "POST",
      body: JSON.stringify({ cardId, type: "flashcards", topic }),
    });
    return { id: `fresh-${Date.now()}`, owningCardId: cardId, title: res.title, isShared: true, cards: res.cards, createdAt: new Date().toISOString() };
  },

  async getQuizzes(cardId: string): Promise<Quiz[]> {
    const data = await apiFetch<{ artifacts: any[] }>(`/v1/cards/${cardId}/study-artifacts?type=quiz`);
    return data.artifacts.map(a => ({ id: a.id, owningCardId: cardId, title: a.title, description: "", isShared: true, questions: a.questions || [], createdAt: a.createdAt }));
  },

  async generateQuiz(cardId: string, topic?: string): Promise<Quiz> {
    const res = await apiFetch<any>(`/v1/cards/${cardId}/sarah/generate`, {
      method: "POST",
      body: JSON.stringify({ cardId, type: "quiz", topic }),
    });
    return { id: `fresh-${Date.now()}`, owningCardId: cardId, title: res.title, description: "", isShared: true, questions: res.questions, createdAt: new Date().toISOString() };
  },

  // backend: GET /v1/cards/:cardId/events (AD-026 activity feed) — real endpoint, wired for real
  async getEvents(cardId: string): Promise<CourseSpaceEvent[]> {
    try {
      const data = await apiFetch<{ events: CourseSpaceEvent[] }>(`/v1/cards/${cardId}/events`);
      return data.events;
    } catch {
      // Fall back to local seed only if the backend is genuinely unreachable in dev.
      return INITIAL_EVENTS[cardId] || [];
    }
  },

  // AD-027: Workspace Sarah — backend: POST /v1/cards/:cardId/sarah/ask
  async askSarah(params: {
    cardId: string;
    question: string;
    resourceTitle?: string;
    selectedText?: string;
  }): Promise<string> {
    const data = await apiFetch<{ answer: string }>(`/v1/cards/${params.cardId}/sarah/ask`, {
      method: "POST",
      body: JSON.stringify(params),
    });
    return data.answer;
  }
};
