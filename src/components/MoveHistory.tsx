import React, { useState, useEffect, useRef } from 'react';
import { MoveRecord, PieceType, PlayerColor } from '../types.js';
import { ChessPieceSvg } from './ChessPieceSvg.js';
import { ListOrdered, ShieldAlert, Layers } from 'lucide-react';

interface MoveHistoryProps {
  moveHistory: MoveRecord[];
  captured: Array<{ type: PieceType; color: PlayerColor }>;
}

type TabType = 'moves' | 'lost' | 'both';

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moveHistory,
  captured,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('moves');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory, activeTab]);

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
            className="text-[9px] uppercase font-bold tracking-tight px-1 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800"
            title="Ally discovered - piece bounced back"
          >
            Ally
          </span>
        );
      case 'pawn_bounce':
        return (
          <span
            className="text-[9px] uppercase font-bold tracking-tight px-1 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800"
            title="Opponent piece discovered ahead - marked with ? and pawn bounced back"
          >
            Bounce ?
          </span>
        );
      case 'capture':
        return (
          <span
            className="text-[9px] uppercase font-bold tracking-tight px-1 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800"
            title="Piece captured"
          >
            Capture
          </span>
        );
      default:
        return null;
    }
  };

  const renderCapturedSection = (compact: boolean = false) => (
    <div
      id="captured-pieces-panel"
      className={`rounded-xl bg-[#e6ddc8] border border-[#cfc4ab] text-stone-900 shadow-inner flex flex-col ${
        compact ? 'p-2.5 gap-2 my-2' : 'p-3.5 gap-3.5 my-2 flex-1 overflow-y-auto'
      }`}
    >
      {/* White Lost Pieces */}
      <div className="flex flex-col gap-1.5 pb-2 border-b border-[#d8cca5]">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-white border border-stone-400 inline-block shadow-xs" />
            <span>White Lost Pieces</span>
          </span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/90 text-stone-700 text-[11px] font-mono border border-stone-300">
            {whiteCaptured.length}
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-2 min-h-[38px]">
          {whiteCaptured.length === 0 ? (
            <span className="text-stone-500 italic text-xs py-1">No white pieces captured</span>
          ) : (
            whiteCaptured.map((p, idx) => (
              <div
                key={idx}
                className="w-[36px] h-[36px] p-1 rounded-lg bg-white/90 border border-stone-300 shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
                title={`White ${p.type}`}
              >
                <div className="w-[28px] h-[28px]">
                  <ChessPieceSvg type={p.type} color="white" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Black Lost Pieces */}
      <div className="flex flex-col gap-1.5 pt-0.5">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-stone-900 border border-stone-700 inline-block shadow-xs" />
            <span>Black Lost Pieces</span>
          </span>
          <span className="px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-100 text-[11px] font-mono border border-stone-900">
            {blackCaptured.length}
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-2 min-h-[38px]">
          {blackCaptured.length === 0 ? (
            <span className="text-stone-500 italic text-xs py-1">No black pieces captured</span>
          ) : (
            blackCaptured.map((p, idx) => (
              <div
                key={idx}
                className="w-[36px] h-[36px] p-1 rounded-lg bg-white/90 border border-stone-300 shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
                title={`Black ${p.type}`}
              >
                <div className="w-[28px] h-[28px]">
                  <ChessPieceSvg type={p.type} color="black" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderMovesTable = () => (
    <div className="flex flex-col flex-1 min-h-[180px] overflow-hidden my-2">
      {/* Table Column Headers */}
      <div className="grid grid-cols-[2.5rem_1fr_1fr] items-center py-1.5 px-2 bg-stone-950/60 rounded-t-lg border-b border-stone-800 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
        <span>#</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-white inline-block border border-stone-400" />
          White
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-stone-900 inline-block border border-stone-600" />
          Black
        </span>
      </div>

      {/* Move log list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 p-1 bg-stone-950/30 rounded-b-lg font-mono text-xs border border-t-0 border-stone-800/60 scrollbar-thin scrollbar-thumb-stone-700 max-h-[300px]"
      >
        {pairedMoves.length === 0 ? (
          <div className="h-28 flex flex-col items-center justify-center text-stone-500 italic text-center px-4">
            <span>No moves made yet.</span>
            <span className="text-[11px] text-stone-600 mt-1">Waiting for White's opening move...</span>
          </div>
        ) : (
          pairedMoves.map((turn, index) => {
            const isLatest = index === pairedMoves.length - 1;
            return (
              <div
                key={turn.turnNumber}
                className={`grid grid-cols-[2.5rem_1fr_1fr] items-center py-1.5 px-2 rounded-md transition-colors ${
                  isLatest
                    ? 'bg-stone-800/80 border border-stone-700/60'
                    : 'hover:bg-stone-800/40 border border-transparent'
                }`}
              >
                <span className="text-stone-400 font-sans font-medium text-[11px]">
                  {turn.turnNumber}.
                </span>
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="font-bold text-stone-100 font-mono text-[13px]">
                    {turn.white?.notation || '—'}
                  </span>
                  {turn.white && renderOutcomeBadge(turn.white.outcome)}
                </div>
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="font-bold text-stone-100 font-mono text-[13px]">
                    {turn.black?.notation || '—'}
                  </span>
                  {turn.black && renderOutcomeBadge(turn.black.outcome)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div
      id="move-history-panel"
      className="flex flex-col h-full bg-stone-900/90 rounded-2xl border border-stone-800 p-4 text-stone-200 overflow-hidden shadow-lg"
    >
      {/* Header with Title and Mode Switcher */}
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-800">
        <div>
          <h3 className="font-semibold text-sm tracking-wide uppercase text-stone-200">
            Match Transcript
          </h3>
          <span className="text-[11px] text-stone-400 font-mono">
            {moveHistory.length} ply recorded
          </span>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-stone-950 border border-stone-800 text-xs">
          <button
            id="tab-moves-list"
            onClick={() => setActiveTab('moves')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
              activeTab === 'moves'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ListOrdered className="w-3 h-3" />
            <span>Moves ({moveHistory.length})</span>
          </button>

          <button
            id="tab-lost-pieces"
            onClick={() => setActiveTab('lost')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
              activeTab === 'lost'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Lost ({captured.length})</span>
          </button>

          <button
            id="tab-both-views"
            onClick={() => setActiveTab('both')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
              activeTab === 'both'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Show both moves and lost pieces"
          >
            <Layers className="w-3 h-3" />
            <span>All</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'moves' && (
        <>
          {renderMovesTable()}
        </>
      )}

      {activeTab === 'lost' && (
        <>
          {renderCapturedSection(false)}
        </>
      )}

      {activeTab === 'both' && (
        <div className="flex flex-col flex-1 overflow-y-auto">
          {renderCapturedSection(true)}
          {renderMovesTable()}
        </div>
      )}

      {/* Fog Notation Legend */}
      <div className="pt-2 mt-auto border-t border-stone-800 text-[11px] text-stone-400 space-y-1 font-sans">
        <div className="flex items-center justify-between">
          <span className="text-stone-500 uppercase text-[10px] font-bold tracking-wider">
            Notation Guide
          </span>
          <span className="text-stone-500 text-[10px]">
            {activeTab === 'moves' ? 'Click "Lost" for captured pieces' : 'Click "Moves" for full list'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <div><code className="text-amber-400 font-mono">(=sq)</code> Ally Bounce</div>
          <div><code className="text-amber-400 font-mono">(!sq)</code> Pawn Bounce</div>
          <div><code className="text-rose-400 font-mono">x</code> Capture</div>
          <div><code className="text-emerald-400 font-mono">#</code> King Captured</div>
        </div>
      </div>
    </div>
  );
};
