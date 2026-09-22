import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PlayerColor,
  SanitizedGameState,
  PieceType,
  ServerMessage,
  ClientMessage,
  MoveRecord,
  LegalTarget,
} from './types.js';
import { Chessboard } from './components/Chessboard.js';
import { MoveHistory } from './components/MoveHistory.js';
import { GameControls } from './components/GameControls.js';
import { PostGameModal } from './components/PostGameModal.js';
import { PromotionModal } from './components/PromotionModal.js';
import { RulesModal } from './components/RulesModal.js';
import { getClientLegalMoves } from './utils/clientLegalMoves.js';
import { coordToFileRank } from '../server/gameEngine.js';
import { playCheckSound, playVictorySound } from './utils/soundEffects.js';
import { Sparkles, Shield, AlertTriangle } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<SanitizedGameState | null>(null);
  const [myColor, setMyColor] = useState<PlayerColor>('white');
  const [mode, setMode] = useState<'local' | 'online'>('local');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(true);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<MoveRecord | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Initialize and connect WebSocket
  useEffect(() => {
    let isDisposed = false;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      if (isDisposed) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isDisposed) {
            ws?.close();
            return;
          }
          console.log('Connected to Fog of War Chess server');
          setIsLoading(false);

          // Check if there is a ?room= query param in URL
          const params = new URLSearchParams(window.location.search);
          const urlRoom = params.get('room');
          if (urlRoom) {
            setMode('online');
            setRoomId(urlRoom.toUpperCase());
            setIsHost(false);
            sendWsMessage({ type: 'join_room', roomId: urlRoom.toUpperCase() });
          } else {
            // Default to initializing Local Pass & Play immediately
            sendWsMessage({ type: 'create_room', mode: 'local' });
          }
        };

        ws.onmessage = (event) => {
          if (isDisposed) return;
          try {
            const msg: ServerMessage = JSON.parse(event.data);
            handleServerMessage(msg);
          } catch (err) {
            console.warn('Failed to parse server message', err);
          }
        };

        ws.onclose = () => {
          if (isDisposed) return;
          console.log('WebSocket connection closed, reconnecting in 2s...');
          reconnectTimeout = setTimeout(connect, 2000);
        };

        ws.onerror = () => {
          if (isDisposed) return;
          console.warn('WebSocket connection attempt encountered an issue, will retry...');
        };
      } catch (err) {
        if (!isDisposed) {
          console.warn('WebSocket init exception, will retry:', err);
          reconnectTimeout = setTimeout(connect, 2000);
        }
      }
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
    };
  }, []);

  const sendWsMessage = (msg: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn('WebSocket not open. ReadyState:', wsRef.current?.readyState);
    }
  };

  const handleServerMessage = (msg: ServerMessage) => {
    switch (msg.type) {
      case 'room_created':
        setRoomId(msg.roomId);
        setMyColor(msg.color);
        setIsHost(true);
        setMode('online');
        setOpponentConnected(false);
        setIsLoading(false);
        break;

      case 'game_start':
        setRoomId(msg.roomId);
        setMyColor(msg.color);
        setGameState(msg.state);
        setIsInspecting(false);
        setSelectedSquare(null);
        setLastMove(null);
        setOpponentConnected(true);
        setIsLoading(false);
        break;

      case 'move_resolved':
        setGameState(msg.state);
        setLastMove(msg.lastMove);
        setSelectedSquare(null);
        if (msg.state.inCheck) {
          playCheckSound();
        }
        break;

      case 'game_over':
        setGameState(msg.state);
        setSelectedSquare(null);
        setIsInspecting(false);
        playVictorySound();
        break;

      case 'rematch_started':
        setGameState(msg.state);
        setLastMove(null);
        setSelectedSquare(null);
        setIsInspecting(false);
        break;

      case 'player_status':
        setOpponentConnected(isHost ? msg.blackConnected : msg.whiteConnected);
        break;

      case 'error':
        setErrorMessage(msg.message);
        setTimeout(() => setErrorMessage(null), 4000);
        setIsLoading(false);
        break;
    }
  };

  // Compute legal targets for the currently selected square
  const legalTargets: LegalTarget[] = useMemo(() => {
    if (!gameState || !selectedSquare) return [];
    return getClientLegalMoves(gameState, selectedSquare);
  }, [gameState, selectedSquare]);

  const handleSelectSquare = (coord: string | null) => {
    setSelectedSquare(coord);
  };

  const handleTargetClick = (toCoord: string) => {
    if (!gameState || !selectedSquare || !roomId) return;

    const fromSq = gameState.squares[selectedSquare];
    if (!fromSq || !fromSq.piece) return;

    // Check if this move requires pawn promotion
    if (fromSq.piece.type === 'pawn') {
      const { rank: toRank } = coordToFileRank(toCoord);
      if (
        (fromSq.piece.color === 'white' && toRank === 7) ||
        (fromSq.piece.color === 'black' && toRank === 0)
      ) {
        setPendingPromotion({ from: selectedSquare, to: toCoord });
        return;
      }
    }

    // Execute standard move
    sendWsMessage({
      type: 'make_move',
      roomId,
      from: selectedSquare,
      to: toCoord,
    });
    setSelectedSquare(null);
  };

  const handleSelectPromotion = (promoType: PieceType) => {
    if (!pendingPromotion || !roomId) return;
    sendWsMessage({
      type: 'make_move',
      roomId,
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: promoType,
    });
    setPendingPromotion(null);
    setSelectedSquare(null);
  };

  const handleStartLocalGame = () => {
    setIsLoading(true);
    setMode('local');
    setMyColor('white');
    sendWsMessage({ type: 'create_room', mode: 'local' });
  };

  const handleCreateOnlineRoom = () => {
    setIsLoading(true);
    setMode('online');
    sendWsMessage({ type: 'create_room', mode: 'online' });
  };

  const handleJoinOnlineRoom = (code: string) => {
    setIsLoading(true);
    setMode('online');
    setIsHost(false);
    sendWsMessage({ type: 'join_room', roomId: code });
  };

  const handleRematch = () => {
    if (!roomId) return;
    sendWsMessage({ type: 'request_rematch', roomId });
  };

  const handleResign = () => {
    if (!roomId) return;
    if (window.confirm('Are you sure you want to resign this match?')) {
      sendWsMessage({ type: 'resign', roomId });
    }
  };

  const currentTurn = gameState?.turn || 'white';
  const isMyTurn = mode === 'local' || currentTurn === myColor;
  const isGameOver = gameState?.status === 'completed';

  return (
    <div
      id="app-root"
      className="min-h-screen bg-[#0c0d10] text-stone-100 flex flex-col items-center justify-between p-3 sm:p-5 selection:bg-amber-500 selection:text-stone-950 font-sans"
    >
      {/* Header */}
      <header
        id="app-header"
        className="w-full max-w-6xl flex items-center justify-between py-2 sm:py-3 px-2 border-b border-stone-800/80 mb-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-stone-950 font-black text-lg">
            ♞
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
              <span>Fog of War Chess</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Symmetric
              </span>
            </h1>
            <p className="text-xs text-stone-400 hidden sm:block">
              Server-authoritative imperfect information chess with frontier probing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-header-rules"
            onClick={() => setRulesOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-800 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Rules</span>
          </button>
        </div>
      </header>

      {/* Error Alert Toast */}
      {errorMessage && (
        <div
          id="error-toast"
          className="fixed top-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/90 border border-rose-800 text-rose-200 text-xs shadow-xl animate-in fade-in"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Game Stage */}
      <main
        id="game-stage"
        className="w-full max-w-6xl flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-5 lg:gap-8 my-auto"
      >
        {/* Left Column: Board */}
        <div className="flex flex-col items-center gap-2 w-full max-w-[580px]">
          {gameState ? (
            <Chessboard
              gameState={gameState}
              playerColor={myColor}
              isMyTurn={isMyTurn}
              flipped={flipped}
              legalTargets={legalTargets}
              selectedSquare={selectedSquare}
              onSelectSquare={handleSelectSquare}
              onTargetClick={handleTargetClick}
              lastMove={lastMove}
              isGameOver={isGameOver}
            />
          ) : (
            <div className="w-full aspect-square rounded-2xl bg-stone-900/50 border border-stone-800 flex items-center justify-center text-stone-500 text-sm">
              Initializing board state...
            </div>
          )}

          {/* Probing instruction helper */}
          <div className="text-[11px] text-stone-400 text-center flex items-center justify-center gap-3 px-2 py-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Move
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-rose-500 bg-rose-500/30 inline-block" /> Capture
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-amber-400/30 inline-block" /> Frontier Probe
            </span>
          </div>
        </div>

        {/* Right Column: Controls & Transcript */}
        <div className="w-full max-w-[420px] flex flex-col gap-4">
          <GameControls
            gameState={gameState}
            playerColor={myColor}
            mode={mode}
            roomId={roomId}
            isHost={isHost}
            opponentConnected={opponentConnected}
            flipped={flipped}
            onToggleFlip={() => setFlipped(!flipped)}
            onResign={handleResign}
            onOpenRules={() => setRulesOpen(true)}
            onCreateOnlineRoom={handleCreateOnlineRoom}
            onJoinOnlineRoom={handleJoinOnlineRoom}
            onStartLocalGame={handleStartLocalGame}
            isLoading={isLoading}
          />

          <div className="h-[280px] sm:h-[320px]">
            <MoveHistory
              moveHistory={gameState?.moveHistory || []}
              captured={gameState?.captured || []}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl py-3 border-t border-stone-900 text-center text-xs text-stone-600 flex items-center justify-between flex-wrap gap-2 px-2 mt-3">
        <span>Fog of War Chess &bull; Shared Visibility &bull; Chebyshev $\ge 5$ King Separation</span>
        <span className="font-mono text-[11px]">Server Authoritative Engine</span>
      </footer>

      {/* Modals */}
      {isGameOver && gameState && (
        <PostGameModal
          winner={gameState.winner}
          winReason={gameState.winReason}
          myColor={myColor}
          onRematch={handleRematch}
          onCloseInspect={() => setIsInspecting(true)}
          isInspecting={isInspecting}
          onReopenModal={() => setIsInspecting(false)}
        />
      )}

      {pendingPromotion && gameState && (
        <PromotionModal
          color={gameState.turn}
          onSelectPiece={handleSelectPromotion}
        />
      )}

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </div>
  );
}
