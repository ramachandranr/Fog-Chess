import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayerColor } from '../types.js';
import { playVictorySound } from '../utils/soundEffects.js';
import { RotateCcw, Trophy, Eye, Flag, Copy, Check } from 'lucide-react';

interface PostGameModalProps {
  winner: PlayerColor | 'draw' | null;
  winReason?: string;
  myColor: PlayerColor;
  onRematch: () => void;
  onCloseInspect: () => void;
  isInspecting: boolean;
  onReopenModal: () => void;
}

export const PostGameModal: React.FC<PostGameModalProps> = ({
  winner,
  winReason,
  myColor,
  onRematch,
  onCloseInspect,
  isInspecting,
  onReopenModal,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (winner && winner !== 'draw') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      playVictorySound();
    }
  }, [winner]);

  if (isInspecting) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          id="btn-reopen-gameover-modal"
          onClick={onReopenModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900/95 border border-stone-700 text-stone-100 shadow-2xl hover:bg-stone-800 transition-all font-medium text-sm backdrop-blur"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Show Game Over Report</span>
        </button>
      </div>
    );
  }

  const isWinner = winner === myColor;
  const isDraw = winner === 'draw';

  const getTitle = () => {
    if (isDraw) return 'Game Drawn';
    if (isWinner) return 'Victory!';
    return `${winner ? winner.charAt(0).toUpperCase() + winner.slice(1) : ''} Won`;
  };

  const getSubtitle = () => {
    if (winReason) return winReason;
    if (isDraw) return 'Neither player could claim the enemy King.';
    return `The ${winner} player captured the opponent King!`;
  };

  const handleCopySummary = () => {
    const text = `Fog of War Chess Match Outcome: ${getTitle()} (${getSubtitle()})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="post-game-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="post-game-modal"
        className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isWinner
              ? 'bg-amber-400'
              : isDraw
              ? 'bg-blue-400'
              : 'bg-rose-500'
          }`}
        />

        {/* Icon Header */}
        <div className="flex justify-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border ${
              isWinner
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : isDraw
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
            }`}
          >
            {isDraw ? (
              <Flag className="w-8 h-8" />
            ) : (
              <Trophy className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Title and Reason */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-100">
            {getTitle()}
          </h2>
          <p className="text-sm text-stone-400 font-medium">
            {getSubtitle()}
          </p>
        </div>

        {/* Fog Lifted Notice */}
        <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4 text-xs text-stone-300 space-y-1 text-left">
          <div className="flex items-center gap-2 font-semibold text-amber-400">
            <Eye className="w-4 h-4" />
            <span>Fog of War Lifted</span>
          </div>
          <p className="text-stone-400 leading-relaxed">
            The board is now completely un-fogged. All remaining hidden power pieces and pawns are revealed in their final positions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            id="btn-play-rematch"
            onClick={onRematch}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Rematch</span>
          </button>

          <button
            id="btn-inspect-board"
            onClick={onCloseInspect}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700/80 text-stone-200 font-medium text-sm border border-stone-700/60 transition-all"
          >
            <Eye className="w-4 h-4 text-stone-400" />
            <span>Inspect Un-fogged Board</span>
          </button>

          <button
            id="btn-copy-summary"
            onClick={handleCopySummary}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-stone-400 hover:text-stone-200 text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Summary Copied!' : 'Copy Result'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
