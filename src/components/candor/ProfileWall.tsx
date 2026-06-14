"use client";

import { useState } from "react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { CandorNoticed, PublicRead, ConversationEnergy, QuestionsWorthAsking, SmallJoys, SignatureObjects, CuriosityModule, ShelfModule, SeasonalMood, Gallery } from "./profile-modules";
// We will import more modules here

export type ProfileModuleData = {
  id: string;
  type: string;
  visible: boolean;
  pinned: boolean;
  props: Record<string, unknown>;
};

export function ProfileWall({ initialModules, isOwner }: { initialModules: ProfileModuleData[], isOwner: boolean }) {
  const [modules, setModules] = useState(initialModules);
  const [isEditing, setIsEditing] = useState(false);

  const renderModule = (mod: ProfileModuleData) => {
    switch (mod.type) {
      case "candor-noticed":
        return <CandorNoticed observation={mod.props.observation} />;
      case "public-read":
        return <PublicRead sentence={mod.props.sentence} />;
      case "conversation-energy":
        return <ConversationEnergy chips={mod.props.chips} />;
      case "questions-worth-asking":
        return <QuestionsWorthAsking questions={mod.props.questions} />;
      case "small-joys":
        return <SmallJoys joys={mod.props.joys} />;
      case "signature-objects":
        return <SignatureObjects objects={mod.props.objects} />;
      case "current-curiosity":
        return <CuriosityModule topics={mod.props.topics} />;
      case "shelf":
        return <ShelfModule title={mod.props.title} items={mod.props.items} />;
      case "seasonal-mood":
        return <SeasonalMood season={mod.props.season} mood={mod.props.mood} />;
      case "gallery":
        return <Gallery images={mod.props.images} />;
      default:
        return null;
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        {isOwner && (
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs font-light tracking-wide text-foreground-secondary hover:text-foreground transition-colors px-4 py-1.5 rounded-full border border-border/30 bg-background/20"
            >
              ✨ Edit Layout
            </button>
          </div>
        )}
        <div className="flex flex-col md:block md:columns-2 lg:columns-3 xl:columns-4 gap-6">
          {modules.filter(m => m.visible).map((mod) => (
            <motion.div
              key={mod.id}
              layout
              className="break-inside-avoid relative mb-6 rounded-3xl"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {renderModule(mod)}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-8">
        <p className="text-sm font-light text-foreground/80">Drag to reorder your profile modules</p>
        <button 
          onClick={() => setIsEditing(false)}
          className="text-xs font-medium tracking-wide text-primary-foreground bg-accent hover:bg-accent/90 transition-colors px-5 py-2 rounded-full"
        >
          Done
        </button>
      </div>
      <Reorder.Group 
        axis="y" 
        values={modules} 
        onReorder={setModules} 
        className="flex flex-col gap-6 max-w-xl mx-auto"
      >
        {modules.map((mod) => (
          <Reorder.Item key={mod.id} value={mod} className="relative z-10 cursor-grab active:cursor-grabbing">
            <div className="opacity-80 pointer-events-none transition-transform hover:scale-[1.02]">
               {renderModule(mod)}
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
