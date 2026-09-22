import React from 'react';
import { PieceType, PlayerColor } from '../types.js';
import { ChessPieceSvg } from './ChessPieceSvg.js';

interface PromotionModalProps {
  color: PlayerColor;
  onSelectPiece: (pieceType: PieceType) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  color,
  onSelectPiece,
}) => {
  const options: Array<{ type: PieceType; name: string }> = [
    { type: 'queen', name: 'Queen' },
    { type: 'rook', name: 'Rook' },
    { type: 'bishop', name: 'Bishop' },
    { type: 'knight', name: 'Knight' },
  ];

  return (
    <div
      id="promotion-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="promotion-modal"
        className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl"
      >
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-stone-100">Pawn Promotion</h3>
          <p className="text-xs text-stone-400">
            Your pawn reached the enemy back rank. Select a piece:
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 pt-2">
          {options.map((opt) => (
            <button
              key={opt.type}
              id={`promo-${opt.type}`}
              onClick={() => onSelectPiece(opt.type)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/60 hover:border-amber-500/80 transition-all hover:scale-105 group"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-1">
                <ChessPieceSvg type={opt.type} color={color} />
              </div>
              <span className="text-xs font-semibold text-stone-300 group-hover:text-amber-400">
                {opt.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
