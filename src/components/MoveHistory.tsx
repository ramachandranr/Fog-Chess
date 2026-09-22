import React, { useEffect, useRef } from 'react';
import { MoveRecord, PieceType, PlayerColor } from '../types.js';
import { ChessPieceSvg } from './ChessPieceSvg.js';

interface MoveHistoryProps {
  moveHistory: MoveRecord[];
  captured: Array<{ type: PieceType; color: PlayerColor }>;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moveHistory,
  captured,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory]);

  // Group moves into pairs (White & Black)
  const pairedMoves: Array<{
    turnNumber: number;
    white?: MoveRecord;
    black?: MoveRecord;
  }> = [];

  for (let i = 0; i < moveHistory.length; i += 2) {
    pairedMoves.push({
      turnNumber: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1],
    });
  }

  // Count captured pieces
  const whiteCaptured = captured.filter((p) => p.color === 'white');
  const blackCaptured = captured.filter((p) => p.color === 'black');

  const renderOutcomeBadge = (outcome: MoveRecord['outcome']) => {
    switch (outcome) {
      case 'ally_bounce':
        return (
          <span
            className="text-[10px] uppercase font-semibold px-1 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50"
            title="Ally discovered - piece bounced back"
          >
            Ally
          </span>
        );
      case 'pawn_bounce':
        return (
          <span
            className="text-[10px] uppercase font-semibold px-1 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50"
            title="Enemy discovered straight ahead - pawn bounced back"
          >
            Pawn Bounce
          </span>
        );
      case 'capture':
        return (
          <span
            className="text-[10px] uppercase font-semibold px-1 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700/50"
            title="Piece captured"
          >
            Capture
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id="move-history-panel"
      className="flex flex-col h-full bg-stone-900/80 rounded-2xl border border-stone-800 p-4 text-stone-200 overflow-hidden shadow-lg"
    >
      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-stone-300">
          Match Transcript
        </h3>
        <span className="text-xs text-stone-500 font-mono">
          {moveHistory.length} ply
        </span>
      </div>

      {/* Captured / Lost Pieces Section with High-Contrast Background */}
      <div
        id="captured-pieces-panel"
        className="my-2.5 p-3 rounded-xl bg-[#e6ddc8] border border-[#cfc4ab] text-stone-900 shadow-inner flex flex-col gap-2.5"
      >
        {/* White Lost Pieces */}
        <div className="flex flex-col gap-1 pb-2 border-b border-[#d8cca5]/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-800 font-semibold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-stone-400 inline-block shadow-xs" />
              White Lost ({whiteCaptured.length}):
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-1.5 min-h-[32px]">
            {whiteCaptured.length === 0 ? (
              <span className="text-stone-500 italic text-[11px] py-0.5">None</span>
            ) : (
              whiteCaptured.map((p, idx) => (
                <div
                  key={idx}
                  className="w-[30px] h-[30px] p-0.5 rounded-md bg-white/85 border border-stone-300/80 shadow-xs flex items-center justify-center hover:scale-110 transition-transform"
                  title={`White ${p.type}`}
                >
                  <ChessPieceSvg type={p.type} color="white" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Black Lost Pieces */}
        <div className="flex flex-col gap-1 pt-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-800 font-semibold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-700 inline-block shadow-xs" />
              Black Lost ({blackCaptured.length}):
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-1.5 min-h-[32px]">
            {blackCaptured.length === 0 ? (
              <span className="text-stone-500 italic text-[11px] py-0.5">None</span>
            ) : (
              blackCaptured.map((p, idx) => (
                <div
                  key={idx}
                  className="w-[30px] h-[30px] p-0.5 rounded-md bg-white/85 border border-stone-300/80 shadow-xs flex items-center justify-center hover:scale-110 transition-transform"
                  title={`Black ${p.type}`}
                >
                  <ChessPieceSvg type={p.type} color="black" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Move log list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 my-2 pr-1 font-mono text-xs scrollbar-thin scrollbar-thumb-stone-700"
      >
        {pairedMoves.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-stone-500 italic text-center">
            Awaiting first probe...<br />White moves first.
          </div>
        ) : (
          pairedMoves.map((turn) => (
            <div
              key={turn.turnNumber}
              className="grid grid-cols-[2rem_1fr_1fr] items-center py-1 px-1.5 rounded hover:bg-stone-800/50 transition-colors"
            >
              <span className="text-stone-500 font-sans">{turn.turnNumber}.</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-100">
                  {turn.white?.notation}
                </span>
                {turn.white && renderOutcomeBadge(turn.white.outcome)}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-100">
                  {turn.black?.notation}
                </span>
                {turn.black && renderOutcomeBadge(turn.black.outcome)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fog Notation Legend */}
      <div className="pt-2.5 mt-auto border-t border-stone-800 text-[11px] text-stone-400 space-y-1 font-sans">
        <div className="text-stone-500 uppercase text-[10px] font-bold tracking-wider mb-1">
          Notation Guide
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <div><code className="text-amber-400">(=sq)</code> Ally Bounce</div>
          <div><code className="text-amber-400">(!sq)</code> Pawn Bounce</div>
          <div><code className="text-rose-400">x</code> Capture</div>
          <div><code className="text-emerald-400">#</code> King Captured</div>
        </div>
      </div>
    </div>
  );
};
