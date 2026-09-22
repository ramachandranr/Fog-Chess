import React from 'react';
import { X, ShieldAlert, Sparkles, Move, Compass, Target } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div
      id="rules-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="rules-modal"
        className="w-full max-w-xl max-h-[85vh] bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col text-stone-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-stone-100">Fog of War Chess Rules</h2>
          </div>
          <button
            id="btn-close-rules"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-sm text-stone-300 leading-relaxed scrollbar-thin scrollbar-thumb-stone-700">
          <div className="space-y-1.5 bg-stone-950/50 p-3.5 rounded-2xl border border-stone-800/80">
            <div className="flex items-center gap-2 font-semibold text-amber-300 text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Symmetric Fog of War
            </div>
            <p className="text-xs text-stone-400">
              Only the two Kings start visible. All other 30 pieces are randomly scattered beneath a shared fog. Whenever any square is revealed by either player, it stays permanently visible to both players.
            </p>
          </div>

          <div className="space-y-1.5 bg-stone-950/50 p-3.5 rounded-2xl border border-stone-800/80">
            <div className="flex items-center gap-2 font-semibold text-emerald-400 text-sm">
              <Target className="w-4 h-4" />
              Single-Square Reveal & Frontier Probing
            </div>
            <ul className="text-xs text-stone-400 space-y-1 list-disc list-inside">
              <li>A move can uncover at most <strong>one</strong> new tile per turn.</li>
              <li><strong>Sliding Pieces (Q, R, B):</strong> Can slide across clear revealed squares, and probe the single adjacent unrevealed square at the edge of the path.</li>
              <li><strong>Knights:</strong> Leap over intermediate tiles without uncovering them; only the landing square is revealed.</li>
              <li><strong>Pawns:</strong> Move 1 square forward straight into fog to probe. Can capture diagonally <em>only</em> if the target tile already contains a revealed enemy.</li>
            </ul>
          </div>

          <div className="space-y-1.5 bg-stone-950/50 p-3.5 rounded-2xl border border-stone-800/80">
            <div className="flex items-center gap-2 font-semibold text-sky-400 text-sm">
              <Move className="w-4 h-4" />
              Discovery & Bounce Mechanics
            </div>
            <div className="text-xs text-stone-400 space-y-1.5">
              <p>When probing an unrevealed square:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Empty:</strong> Moving piece moves onto the tile.</li>
                <li><strong>Ally Found:</strong> Ally wakes up and becomes active. Moving piece <em>bounces back</em> to its starting tile! Notation: <code className="text-amber-300 font-mono">Ke2(=e3)</code>.</li>
                <li><strong>Enemy Found (by non-pawn):</strong> Enemy is captured and removed!</li>
                <li><strong>Enemy Found (by straight pawn):</strong> Pawn discovers an opponent piece and <em>bounces back</em> without capturing. The piece is <strong>not revealed</strong>; instead, the square is marked with a <strong>?</strong> in that opponent's color. Neither player knows which piece is hiding there until an ally makes a valid move to that square to reveal & activate it (ally bounce), or an enemy captures it! Notation: <code className="text-amber-300 font-mono">d4(!d5)</code>.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-1.5 bg-stone-950/50 p-3.5 rounded-2xl border border-stone-800/80">
            <div className="flex items-center gap-2 font-semibold text-rose-400 text-sm">
              <ShieldAlert className="w-4 h-4" />
              Victory & Modified Check
            </div>
            <ul className="text-xs text-stone-400 space-y-1 list-disc list-inside">
              <li><strong>Win Condition:</strong> Direct capture of the enemy King (<code className="text-emerald-300 font-mono">Kxe8#</code>). No checkmate detection required!</li>
              <li><strong>Check:</strong> You cannot step your King into attack from a <em>visible</em> enemy piece. However, Kings may step freely into fog (even if an enemy happens to lurk there).</li>
              <li><strong>Castling & En Passant:</strong> Both are completely disabled.</li>
              <li><strong>Promotion:</strong> Pawns reaching the opponent's back rank promote to Queen, Rook, Bishop, or Knight.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-800 flex justify-end">
          <button
            id="btn-understand-rules"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors"
          >
            Got It, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
