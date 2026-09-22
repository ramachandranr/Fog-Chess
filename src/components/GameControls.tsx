import React, { useState } from 'react';
import {
  PlayerColor,
  SanitizedGameState,
} from '../types.js';
import {
  Users,
  Copy,
  Check,
  RotateCw,
  Volume2,
  VolumeX,
  HelpCircle,
  Flag,
  Share2,
  Play,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../utils/soundEffects.js';

interface GameControlsProps {
  gameState: SanitizedGameState | null;
  playerColor: PlayerColor;
  mode: 'local' | 'online';
  roomId: string | null;
  isHost: boolean;
  opponentConnected: boolean;
  flipped: boolean;
  onToggleFlip: () => void;
  onResign: () => void;
  onOpenRules: () => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: (roomId: string) => void;
  onStartLocalGame: () => void;
  isLoading: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  playerColor,
  mode,
  roomId,
  isHost,
  opponentConnected,
  flipped,
  onToggleFlip,
  onResign,
  onOpenRules,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onStartLocalGame,
  isLoading,
}) => {
  const [joinInput, setJoinInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleCopyLink = () => {
    if (!roomId) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
  };

  const currentTurn = gameState?.turn || 'white';
  const isMyTurn = mode === 'local' || currentTurn === playerColor;

  return (
    <div
      id="game-controls-panel"
      className="bg-stone-900/80 rounded-2xl border border-stone-800 p-4 shadow-lg text-stone-200 flex flex-col gap-3"
    >
      {/* Top Bar with Mode, Turn, and Utility Buttons */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-stone-800">
        <div className="flex items-center gap-2">
          {/* Active Turn Badge */}
          {gameState && (
            <div
              id="turn-indicator"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                currentTurn === 'white'
                  ? 'bg-stone-100 text-stone-900 border-stone-300'
                  : 'bg-stone-950 text-stone-100 border-stone-700'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  currentTurn === 'white' ? 'bg-amber-500' : 'bg-amber-400'
                } animate-pulse`}
              />
              <span>
                {mode === 'local'
                  ? `${currentTurn === 'white' ? 'White' : 'Black'}'s Turn`
                  : isMyTurn
                  ? 'Your Turn'
                  : "Opponent's Turn"}
              </span>
              {gameState.inCheck && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  Check!
                </span>
              )}
            </div>
          )}

          {/* Mode Pill */}
          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800/80 text-stone-400 border border-stone-700/60 font-medium">
            {mode === 'local' ? 'Pass & Play' : 'Online Match'}
          </span>
        </div>

        {/* Action icons: Flip, Sound, Rules, Resign */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-flip-board"
            onClick={onToggleFlip}
            title={flipped ? 'Flip Board (Black perspective)' : 'Flip Board (White perspective)'}
            className="p-2 rounded-xl bg-stone-800/70 hover:bg-stone-700/80 text-stone-300 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            id="btn-toggle-sound"
            onClick={handleToggleSound}
            title={soundOn ? 'Mute Sound' : 'Enable Sound'}
            className="p-2 rounded-xl bg-stone-800/70 hover:bg-stone-700/80 text-stone-300 transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>

          <button
            id="btn-show-rules"
            onClick={onOpenRules}
            title="Game Rules & Probing Mechanics"
            className="p-2 rounded-xl bg-stone-800/70 hover:bg-stone-700/80 text-stone-300 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {gameState && gameState.status === 'in_progress' && mode === 'online' && (
            <button
              id="btn-resign-match"
              onClick={onResign}
              title="Resign Match"
              className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Fog Stat Progress Bar */}
      {gameState && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1 font-medium">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Fog Unveiled
            </span>
            <span className="font-mono text-stone-300 font-semibold">
              {gameState.revealedCount} / 64 squares ({Math.round((gameState.revealedCount / 64) * 100)}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${(gameState.revealedCount / 64) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Online Room Share & Invite Card */}
      {mode === 'online' && roomId && (
        <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Room Code:</span>
              <span className="font-mono font-bold text-amber-300 tracking-wider">
                {roomId}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  opponentConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="text-stone-300 text-[11px]">
                {opponentConnected ? 'Opponent Connected' : 'Waiting for Player 2...'}
              </span>
            </div>
          </div>

          <button
            id="btn-copy-room-link"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700/80 text-stone-200 text-xs font-semibold border border-stone-700 transition-all active:scale-[0.99]"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Share Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-stone-400" />
                <span>Copy Shareable Match Link</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Mode Switcher / Matchmaker Tabs */}
      <div className="flex items-center gap-2 pt-1">
        <button
          id="btn-switch-pass-play"
          onClick={onStartLocalGame}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'local'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Pass & Play</span>
        </button>

        <button
          id="btn-create-online-room"
          onClick={onCreateOnlineRoom}
          disabled={isLoading}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'online' && isHost
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Create Online Room</span>
        </button>
      </div>

      {/* Join Room Form */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id="input-room-code"
          type="text"
          placeholder="Enter 6-char Room Code..."
          value={joinInput}
          onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
          maxLength={6}
          className="flex-1 px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono tracking-wider text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
        />
        <button
          id="btn-join-room-submit"
          onClick={() => {
            if (joinInput.trim()) {
              onJoinOnlineRoom(joinInput.trim());
            }
          }}
          disabled={joinInput.trim().length === 0 || isLoading}
          className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 text-xs font-semibold flex items-center gap-1 transition-colors border border-stone-700"
        >
          <span>Join</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
