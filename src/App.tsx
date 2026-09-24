import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DeckList } from './components/DeckList';
import { CourseSpaceView } from './components/CourseSpaceView';
import { DeckStudyModal } from './components/DeckStudyModal';
import { CreateCourseSpaceModal } from './components/CreateCourseSpaceModal';
import { CreateDeckModal } from './components/CreateDeckModal';
import { CreateStudyCardModal } from './components/CreateStudyCardModal';
import { StudyCardDetailModal } from './components/StudyCardDetailModal';
import { JoinSpaceModal } from './components/JoinSpaceModal';
import { QuizModal } from './components/QuizModal';
import { SummaryModal } from './components/SummaryModal';
import { BroadcastNotificationModal } from './components/BroadcastNotificationModal';
import { Deck, CourseModule, ModuleQuiz, ModuleSummary } from './types';
import { Users, BookOpen, Share2, Sparkles } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { 
    decks, 
    courseSpaces, 
    activeSpace, 
    setActiveSpaceId, 
    toggleCardMastery,
    updateStudyProgress
  } = useApp();

  const [currentTab, setCurrentTab] = useState<'decks' | 'spaces'>('decks');

  // Modal States
  const [studyingDeck, setStudyingDeck] = useState<Deck | null>(null);
  const [spaceCreationDeck, setSpaceCreationDeck] = useState<Deck | null>(null);
  const [selectedCardDetail, setSelectedCardDetail] = useState<Deck | null>(null);
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<ModuleQuiz | null>(null);
  const [activeSummary, setActiveSummary] = useState<ModuleSummary | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Sync selectedCardDetail with updated state in decks
  const activeCardDetail = selectedCardDetail 
    ? decks.find((d) => d.id === selectedCardDetail.id) || selectedCardDetail
    : null;

  const handleStudyModuleCards = (module: CourseModule) => {
    // Create temporary deck wrapper for module cards
    const moduleDeck: Deck = {
      id: `mod-deck-${module.id}`,
      title: module.title,
      description: module.description,
      subject: activeSpace?.subject || 'General',
      color: 'from-teal-500 to-emerald-600',
      cards: module.cards,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStudyingDeck(moduleDeck);
  };

  const handleNavigateToSpace = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    setCurrentTab('spaces');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
        onOpenCreateDeckModal={() => setIsCreateDeckOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'decks' ? (
          <DeckList
            onStudyDeck={(deck) => setStudyingDeck(deck)}
            onOpenCreateSpaceModal={(deck) => setSpaceCreationDeck(deck)}
            onOpenCreateDeckModal={() => setIsCreateDeckOpen(true)}
            onNavigateToSpace={handleNavigateToSpace}
            onOpenCardDetail={(deck) => setSelectedCardDetail(deck)}
          />
        ) : (
          <CourseSpaceView
            onBackToDecks={() => setCurrentTab('decks')}
            onTakeQuiz={(quiz) => setActiveQuiz(quiz)}
            onStudyModuleCards={handleStudyModuleCards}
            onViewSummary={(summary) => setActiveSummary(summary)}
            onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
          />
        )}
      </main>

      {/* Study Deck / Cards Modal */}
      {studyingDeck && (
        <DeckStudyModal
          deck={studyingDeck}
          onClose={() => setStudyingDeck(null)}
          onToggleMastery={(deckId, cardId) => toggleCardMastery(deckId, cardId)}
          onRecordStudy={(xp, cardsMasteredDelta) => {
            if (activeSpace) {
              updateStudyProgress(activeSpace.id, xp, cardsMasteredDelta);
            }
          }}
        />
      )}

      {/* Create CourseSpace from Deck Modal */}
      {spaceCreationDeck && (
        <CreateCourseSpaceModal
          deck={spaceCreationDeck}
          onClose={() => setSpaceCreationDeck(null)}
          onCreated={(spaceId) => {
            setActiveSpaceId(spaceId);
            setCurrentTab('spaces');
          }}
        />
      )}

      {/* Create Study Card Modal (Studey Style: Title, Upload Materials, Generate Subsets) */}
      {isCreateDeckOpen && (
        <CreateStudyCardModal
          onClose={() => setIsCreateDeckOpen(false)}
          onCardCreated={(newCardId, shouldOpenConvertModal) => {
            const foundCard = decks.find((d) => d.id === newCardId);
            if (shouldOpenConvertModal && foundCard) {
              setSpaceCreationDeck(foundCard);
            } else if (foundCard) {
              setSelectedCardDetail(foundCard);
            }
          }}
        />
      )}

      {/* Card Detail & Subsets Modal (Flashcards, Quizzes, Summaries, Uploaded Materials) */}
      {activeCardDetail && (
        <StudyCardDetailModal
          card={activeCardDetail}
          onClose={() => setSelectedCardDetail(null)}
          onStudyFlashcards={(deck) => setStudyingDeck(deck)}
          onTakeQuiz={(quiz) => setActiveQuiz(quiz)}
          onViewSummary={(summary) => setActiveSummary(summary)}
          onOpenConvertModal={(deck) => setSpaceCreationDeck(deck)}
          onNavigateToSpace={handleNavigateToSpace}
        />
      )}

      {/* Join CourseSpace by Code Modal */}
      {isJoinModalOpen && (
        <JoinSpaceModal
          onClose={() => setIsJoinModalOpen(false)}
          onJoined={(spaceId) => {
            setActiveSpaceId(spaceId);
            setCurrentTab('spaces');
          }}
        />
      )}

      {/* Quiz Runner Modal */}
      {activeQuiz && (
        <QuizModal
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {/* Concept Summary Reader Modal */}
      {activeSummary && (
        <SummaryModal
          summary={activeSummary}
          onClose={() => setActiveSummary(null)}
        />
      )}

      {/* Broadcast Notification Modal */}
      {isBroadcastModalOpen && (
        <BroadcastNotificationModal
          onClose={() => setIsBroadcastModalOpen(false)}
        />
      )}
    </div>
  );
};
