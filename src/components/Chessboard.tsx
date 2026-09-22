import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PieceType,
  PlayerColor,
  SanitizedGameState,
  LegalTarget,
} from '../types.js';
import { ChessPieceSvg } from './ChessPieceSvg.js';
import { FILES, RANKS, coordToFileRank, fileRankToCoord } from '../../server/gameEngine.js';
import {
  playMoveSound,
  playCaptureSound,
  playBounceSound,
  playProbeSound,
} from '../utils/soundEffects.js';

interface BouncingPieceInfo {
  from: string;
  to: string;
  piece: { type: PieceType; color: PlayerColor };
  outcome: 'ally_bounce' | 'pawn_bounce';
}

interface ChessboardProps {
  gameState: SanitizedGameState;
  playerColor: PlayerColor;
  isMyTurn: boolean;
  flipped?: boolean;
  legalTargets: LegalTarget[];
  selectedSquare: string | null;
  onSelectSquare: (coord: string | null) => void;
  onTargetClick: (toCoord: string) => void;
  lastMove: { from: string; to: string; outcome?: string } | null;
  isGameOver: boolean;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  gameState,
  playerColor,
  isMyTurn,
  flipped = false,
  legalTargets,
  selectedSquare,
  onSelectSquare,
  onTargetClick,
  lastMove,
  isGameOver,
}) => {
  const [bouncingPiece, setBouncingPiece] = useState<BouncingPieceInfo | null>(null);

  // Trigger bounce animation whenever lastMove has ally_bounce or pawn_bounce
  useEffect(() => {
    if (lastMove && (lastMove.outcome === 'ally_bounce' || lastMove.outcome === 'pawn_bounce')) {
      const sq = gameState.squares[lastMove.from];
      if (sq && sq.piece) {
        setBouncingPiece({
          from: lastMove.from,
          to: lastMove.to,
          piece: sq.piece,
          outcome: lastMove.outcome as 'ally_bounce' | 'pawn_bounce',
        });
        playBounceSound();

        const timer = setTimeout(() => {
          setBouncingPiece(null);
        }, 850);
        return () => clearTimeout(timer);
      }
    }
  }, [lastMove]);

  // Determine ranks and files display order based on flipped state
  const displayRanks = flipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const displayFiles = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const handleSquareClick = (coord: string) => {
    if (isGameOver) return;

    // Check if clicking a legal target for the currently selected piece
    const target = legalTargets.find((t) => t.coordinate === coord);
    if (target && selectedSquare) {
      if (target.type === 'probe') {
        playProbeSound();
      } else if (target.type === 'capture') {
        playCaptureSound();
      } else {
        playMoveSound();
      }
      onTargetClick(coord);
      return;
    }

    // Otherwise check if clicking an active piece of current turn
    const sq = gameState.squares[coord];
    if (sq?.revealed && sq.piece && sq.piece.type !== 'unknown') {
      if (sq.piece.color === gameState.turn && isMyTurn) {
        if (selectedSquare === coord) {
          onSelectSquare(null);
        } else {
          onSelectSquare(coord);
          playMoveSound();
        }
        return;
      }
    }

    // Clicking elsewhere deselects
    if (selectedSquare) {
      onSelectSquare(null);
    }
  };

  // Helper to calculate pixel delta for bounce animation based on square coordinates
  const calculateBounceDelta = (from: string, to: string) => {
    const fromPos = coordToFileRank(from);
    const toPos = coordToFileRank(to);

    const deltaFile = toPos.file - fromPos.file;
    const deltaRank = toPos.rank - fromPos.rank;

    // In CSS grid:
    // deltaX: positive is right (increasing file if not flipped, decreasing if flipped)
    // deltaY: positive is down (decreasing rank if not flipped, increasing if flipped)
    const factorX = flipped ? -1 : 1;
    const factorY = flipped ? 1 : -1;

    return {
      xPercent: deltaFile * 50 * factorX,
      yPercent: deltaRank * 50 * factorY,
    };
  };

  return (
    <div
      id="chessboard-container"
      className="relative select-none w-full max-w-[580px] aspect-square rounded-2xl shadow-2xl p-2 sm:p-3 bg-stone-900/90 border border-stone-800 backdrop-blur-sm"
    >
      {/* Board Grid */}
      <div
        id="chessboard-grid"
        className="w-full h-full grid grid-cols-8 grid-rows-8 rounded-xl overflow-hidden relative border border-stone-800"
      >
        {displayRanks.map((r) =>
          displayFiles.map((f) => {
            const coord = fileRankToCoord(f, r);
            const sq = gameState.squares[coord];
            const isRevealed = sq?.revealed || isGameOver;
            const piece = isGameOver && gameState.unfoggedPieces?.[coord]
              ? gameState.unfoggedPieces[coord]
              : sq?.piece;

            const isLightSquare = (f + r) % 2 !== 0;
            const isSelected = selectedSquare === coord;
            const targetInfo = legalTargets.find((t) => t.coordinate === coord);
            const isLastMoveFrom = lastMove?.from === coord;
            const isLastMoveTo = lastMove?.to === coord;
            const isBouncingMover = bouncingPiece?.from === coord;

            // Check if this square is the King square in check
            const isKingInCheckSquare =
              Boolean(gameState.inCheck) &&
              piece?.type === 'king' &&
              sq?.revealed &&
              piece.color === gameState.turn;

            return (
              <div
                key={coord}
                id={`square-${coord}`}
                onClick={() => handleSquareClick(coord)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                  isLightSquare ? 'bg-[#e2d6b5]' : 'bg-[#b88b4a]'
                } ${
                  isSelected ? 'ring-4 ring-inset ring-amber-400' : ''
                } ${
                  isLastMoveFrom || isLastMoveTo
                    ? 'after:absolute after:inset-0 after:bg-amber-300/30'
                    : ''
                }`}
              >
                {/* Coordinate labels */}
                {f === (flipped ? 7 : 0) && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] font-bold pointer-events-none ${
                      isLightSquare ? 'text-[#b88b4a]' : 'text-[#e2d6b5]'
                    }`}
                  >
                    {RANKS[r]}
                  </span>
                )}
                {r === (flipped ? 7 : 0) && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] font-bold pointer-events-none ${
                      isLightSquare ? 'text-[#b88b4a]' : 'text-[#e2d6b5]'
                    }`}
                  >
                    {FILES[f]}
                  </span>
                )}

                {/* King in Check Pulsating Alert Aura */}
                {isKingInCheckSquare && (
                  <div
                    id={`check-alert-${coord}`}
                    className="absolute inset-0 z-15 pointer-events-none flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-red-600/35 animate-pulse" />
                    <div className="absolute inset-0 border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                    <span className="absolute -top-1 px-1 py-0.2 bg-red-600 text-[9px] font-black tracking-widest text-white uppercase rounded shadow z-30 animate-bounce">
                      Check!
                    </span>
                  </div>
                )}

                {/* Fog of War Overlay for Unrevealed Tiles */}
                {!isRevealed && (
                  <div
                    id={`fog-${coord}`}
                    className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-none"
                  >
                    {/* Deep cloudy dark backdrop */}
                    <div className="absolute inset-0 bg-slate-950/92" />
                    {/* Shrouded misty pattern */}
                    <div
                      className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(100,116,139,0.8)_0%,rgba(15,23,42,0.95)_75%)]"
                    />
                    {/* Micro fog texture lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 100">
                      <filter id={`cloud-noise-${coord}`}>
                        <feTurbulence
                          type="fractalNoise"
                          baseFrequency="0.04"
                          numOctaves="3"
                          result="noise"
                        />
                        <feColorMatrix
                          type="matrix"
                          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"
                        />
                      </filter>
                      <rect width="100" height="100" filter={`url(#cloud-noise-${coord})`} />
                    </svg>
                    {/* Subtle mystical fog indicator */}
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600/40 blur-[1px]" />
                  </div>
                )}

                {/* Visible Piece (or Revealed Post-Game Piece) */}
                {piece && (!isBouncingMover || !bouncingPiece) && (
                  <motion.div
                    layoutId={isRevealed ? `piece-${piece.type}-${piece.color}-${coord}` : undefined}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    className={`w-[82%] h-[82%] z-20 flex items-center justify-center filter drop-shadow-md ${
                      !isRevealed && isGameOver ? 'opacity-70 saturate-50' : ''
                    } ${
                      piece.color === gameState.turn && isMyTurn && isRevealed
                        ? 'hover:scale-105 transition-transform'
                        : ''
                    }`}
                  >
                    <ChessPieceSvg type={piece.type} color={piece.color} />
                  </motion.div>
                )}

                {/* Mystery Question Mark Square Badge */}
                {isRevealed && piece?.type === 'unknown' && (
                  <div
                    id={`unknown-marker-${coord}`}
                    className="absolute bottom-1 right-1 z-25 flex items-center justify-center pointer-events-none"
                  >
                    <div
                      className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-black tracking-wider shadow-md flex items-center gap-0.5 border ${
                        piece.color === 'white'
                          ? 'bg-stone-100 text-stone-900 border-stone-400 shadow-stone-950/40'
                          : 'bg-stone-900 text-stone-100 border-stone-600 shadow-stone-950/60 ring-1 ring-stone-700'
                      }`}
                      title={`Hidden ${piece.color} piece discovered by a pawn`}
                    >
                      <span className="opacity-80 text-[8px] uppercase tracking-tighter">
                        {piece.color === 'white' ? 'W' : 'B'}
                      </span>
                      <span>?</span>
                    </div>
                  </div>
                )}

                {/* Bouncing Piece Animation */}
                {isBouncingMover && bouncingPiece && (
                  <motion.div
                    className="w-[82%] h-[82%] z-30 flex items-center justify-center filter drop-shadow-xl"
                    initial={{ x: '0%', y: '0%' }}
                    animate={{
                      x: [
                        '0%',
                        `${calculateBounceDelta(bouncingPiece.from, bouncingPiece.to).xPercent}%`,
                        `${calculateBounceDelta(bouncingPiece.from, bouncingPiece.to).xPercent + 8}%`,
                        `${calculateBounceDelta(bouncingPiece.from, bouncingPiece.to).xPercent - 8}%`,
                        `${calculateBounceDelta(bouncingPiece.from, bouncingPiece.to).xPercent}%`,
                        '0%',
                      ],
                      y: [
                        '0%',
                        `${calculateBounceDelta(bouncingPiece.from, bouncingPiece.to).yPercent}%`,
                        `${calculateBounceDelta(bouncingPiece.from, bouncingPiece.to).yPercent - 8}%`,
                        `${calculateBounceDelta(bouncingPiece.from, bouncingPiece.to).yPercent + 8}%`,
                        `${calculateBounceDelta(bouncingPiece.from, bouncingPiece.to).yPercent}%`,
                        '0%',
                      ],
                      rotate: [0, -5, 5, -3, 3, 0],
                      scale: [1, 1.15, 1.1, 1.1, 1, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      times: [0, 0.32, 0.45, 0.55, 0.65, 1],
                      ease: 'easeInOut',
                    }}
                  >
                    <ChessPieceSvg
                      type={bouncingPiece.piece.type}
                      color={bouncingPiece.piece.color}
                    />
                  </motion.div>
                )}

                {/* Legal Move Indicators */}
                {targetInfo && (
                  <div className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
                    {/* 1. Standard legal move to empty revealed tile: Green indicator */}
                    {targetInfo.type === 'move' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/80 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300"
                      />
                    )}

                    {/* 2. Legal capture of revealed enemy: Red indicator */}
                    {targetInfo.type === 'capture' && (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-full h-full border-4 border-rose-500/90 rounded-md bg-rose-500/20"
                      />
                    )}

                    {/* 3. Valid frontier fog probe: Amber pulsing ring */}
                    {targetInfo.type === 'probe' && (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                        className="w-[85%] h-[85%] rounded-full ring-3 ring-amber-400 bg-amber-400/25 shadow-lg shadow-amber-400/30 flex items-center justify-center"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
