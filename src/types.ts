export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PlayerColor = 'white' | 'black';

export interface Piece {
  id: string;
  type: PieceType;
  color: PlayerColor;
  active: boolean;
  position: string; // e.g. "e4"
}

export interface BoardSquare {
  coordinate: string; // "a1" - "h8"
  revealed: boolean;
  pieceId: string | null;
}

export type MoveOutcome = 'move' | 'capture' | 'ally_bounce' | 'pawn_bounce';

export interface MoveRecord {
  notation: string;
  from: string;
  to: string;
  player: PlayerColor;
  outcome: MoveOutcome;
  capturedPiece?: {
    type: PieceType;
    color: PlayerColor;
  };
  revealedPiece?: {
    type: PieceType;
    color: PlayerColor;
  };
  timestamp?: number;
}

export interface GameState {
  roomId: string;
  turn: PlayerColor;
  squares: Record<string, BoardSquare>;
  pieces: Record<string, Piece>;
  captured: Piece[];
  moveHistory: MoveRecord[];
  status: 'waiting' | 'in_progress' | 'completed';
  winner: PlayerColor | 'draw' | null;
  winReason?: string;
  halfmoveClock: number; // for 50-move rule
  fullmoveNumber: number;
  positionHistory: string[]; // for threefold repetition
}

export interface SanitizedSquare {
  coordinate: string;
  revealed: boolean;
  piece: {
    id?: string;
    type: PieceType;
    color: PlayerColor;
  } | null;
}

export interface SanitizedGameState {
  roomId: string;
  turn: PlayerColor;
  squares: Record<string, SanitizedSquare>;
  captured: Array<{ type: PieceType; color: PlayerColor }>;
  moveHistory: MoveRecord[];
  status: 'waiting' | 'in_progress' | 'completed';
  winner: PlayerColor | 'draw' | null;
  winReason?: string;
  revealedCount: number;
  whiteKingPos?: string;
  blackKingPos?: string;
  inCheck?: boolean;
  // Included ONLY when status === 'completed'
  unfoggedPieces?: Record<string, { type: PieceType; color: PlayerColor; active: boolean }>;
}

export interface LegalTarget {
  coordinate: string;
  type: 'move' | 'capture' | 'probe';
  frontierProbe?: boolean;
}

export type ClientMessage =
  | { type: 'create_room'; playerName?: string; mode?: 'online' | 'local' }
  | { type: 'join_room'; roomId: string; playerName?: string }
  | { type: 'make_move'; roomId: string; from: string; to: string; promotion?: PieceType }
  | { type: 'request_rematch'; roomId: string }
  | { type: 'resign'; roomId: string };

export type ServerMessage =
  | { type: 'room_created'; roomId: string; color: PlayerColor }
  | { type: 'game_start'; roomId: string; color: PlayerColor; state: SanitizedGameState }
  | { type: 'move_resolved'; state: SanitizedGameState; lastMove: MoveRecord }
  | { type: 'game_over'; winner: PlayerColor | 'draw' | null; reason: string; state: SanitizedGameState }
  | { type: 'rematch_started'; state: SanitizedGameState }
  | { type: 'error'; message: string }
  | { type: 'player_status'; whiteConnected: boolean; blackConnected: boolean };
