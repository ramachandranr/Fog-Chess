import {
  PieceType,
  PlayerColor,
  Piece,
  BoardSquare,
  GameState,
  SanitizedGameState,
  SanitizedSquare,
  LegalTarget,
  MoveRecord,
  MoveOutcome,
} from '../src/types.js';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export function coordToFileRank(coord: string): { file: number; rank: number } {
  const file = coord.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(coord[1], 10) - 1;
  return { file, rank };
}

export function fileRankToCoord(file: number, rank: number): string {
  return `${FILES[file]}${RANKS[rank]}`;
}

export function isWithinBoard(file: number, rank: number): boolean {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8;
}

export function getChebyshevDistance(c1: string, c2: string): number {
  const p1 = coordToFileRank(c1);
  const p2 = coordToFileRank(c2);
  return Math.max(Math.abs(p1.file - p2.file), Math.abs(p1.rank - p2.rank));
}

function getPieceLetter(type: PieceType): string {
  switch (type) {
    case 'king':
      return 'K';
    case 'queen':
      return 'Q';
    case 'rook':
      return 'R';
    case 'bishop':
      return 'B';
    case 'knight':
      return 'N';
    case 'pawn':
      return '';
  }
}

/**
 * Initializes a new Fog of War Chess game state:
 * 1. Kings Placement:
 *    - White King starts anywhere in bottom 2 rows (ranks 1 and 2)
 *    - Black King starts anywhere in top 2 rows (ranks 7 and 8)
 * 2. Pawns Placement:
 *    - 8 White Pawns randomly across ranks 2, 3, 4
 *    - 8 Black Pawns randomly across ranks 5, 6, 7
 * 3. Power Pieces Placement:
 *    - 1 Queen, 2 Rooks, 2 Bishops, 2 Knights per player across unoccupied squares on their respective side
 * 4. Initial Fog Matrix:
 *    - 2 King squares revealed: true, all other 62 revealed: false
 */
export function createInitialGameState(roomId: string): GameState {
  const squares: Record<string, BoardSquare> = {};
  const pieces: Record<string, Piece> = {};

  // Create 64 board squares
  for (let f = 0; f < 8; f++) {
    for (let r = 0; r < 8; r++) {
      const coord = fileRankToCoord(f, r);
      squares[coord] = {
        coordinate: coord,
        revealed: false,
        pieceId: null,
      };
    }
  }

  // 1. Kings Placement
  // White King starts anywhere in the bottom 2 rows of the board (ranks 1 and 2: rank indices 0 and 1)
  const whiteKingCandidateCoords: string[] = [];
  for (let f = 0; f < 8; f++) {
    for (let r = 0; r <= 1; r++) {
      whiteKingCandidateCoords.push(fileRankToCoord(f, r));
    }
  }
  const whiteKingPos =
    whiteKingCandidateCoords[Math.floor(Math.random() * whiteKingCandidateCoords.length)];

  // Black King starts anywhere in the top 2 rows of the board (ranks 7 and 8: rank indices 6 and 7)
  const blackKingCandidateCoords: string[] = [];
  for (let f = 0; f < 8; f++) {
    for (let r = 6; r <= 7; r++) {
      blackKingCandidateCoords.push(fileRankToCoord(f, r));
    }
  }
  const blackKingPos =
    blackKingCandidateCoords[Math.floor(Math.random() * blackKingCandidateCoords.length)];

  const wKingPiece: Piece = {
    id: 'w-king',
    type: 'king',
    color: 'white',
    active: true,
    position: whiteKingPos,
  };
  pieces[wKingPiece.id] = wKingPiece;
  squares[whiteKingPos].pieceId = wKingPiece.id;
  squares[whiteKingPos].revealed = true;

  const bKingPiece: Piece = {
    id: 'b-king',
    type: 'king',
    color: 'black',
    active: true,
    position: blackKingPos,
  };
  pieces[bKingPiece.id] = bKingPiece;
  squares[blackKingPos].pieceId = bKingPiece.id;
  squares[blackKingPos].revealed = true;

  // 2. Pawns Placement
  // White pawns in ranks 2, 3, 4 (rank indices 1, 2, 3)
  const whitePawnAvailableCoords: string[] = [];
  for (let f = 0; f < 8; f++) {
    for (let r = 1; r <= 3; r++) {
      const coord = fileRankToCoord(f, r);
      if (!squares[coord].pieceId) {
        whitePawnAvailableCoords.push(coord);
      }
    }
  }
  // Shuffle and pick 8
  whitePawnAvailableCoords.sort(() => Math.random() - 0.5);
  for (let i = 0; i < 8; i++) {
    const pos = whitePawnAvailableCoords[i];
    const pawnPiece: Piece = {
      id: `w-pawn-${i + 1}`,
      type: 'pawn',
      color: 'white',
      active: false,
      position: pos,
    };
    pieces[pawnPiece.id] = pawnPiece;
    squares[pos].pieceId = pawnPiece.id;
  }

  // Black pawns in ranks 5, 6, 7 (rank indices 4, 5, 6)
  const blackPawnAvailableCoords: string[] = [];
  for (let f = 0; f < 8; f++) {
    for (let r = 4; r <= 6; r++) {
      const coord = fileRankToCoord(f, r);
      if (!squares[coord].pieceId) {
        blackPawnAvailableCoords.push(coord);
      }
    }
  }
  blackPawnAvailableCoords.sort(() => Math.random() - 0.5);
  for (let i = 0; i < 8; i++) {
    const pos = blackPawnAvailableCoords[i];
    const pawnPiece: Piece = {
      id: `b-pawn-${i + 1}`,
      type: 'pawn',
      color: 'black',
      active: false,
      position: pos,
    };
    pieces[pawnPiece.id] = pawnPiece;
    squares[pos].pieceId = pawnPiece.id;
  }

  // 3. Power Pieces Placement on respective sides of the board
  const powerPieceTypes: PieceType[] = [
    'queen',
    'rook',
    'rook',
    'bishop',
    'bishop',
    'knight',
    'knight',
  ];

  // White power pieces in White's half (ranks 1 to 4: rank indices 0 to 3)
  const whitePowerPieceAvailableCoords: string[] = [];
  for (let f = 0; f < 8; f++) {
    for (let r = 0; r <= 3; r++) {
      const coord = fileRankToCoord(f, r);
      if (!squares[coord].pieceId) {
        whitePowerPieceAvailableCoords.push(coord);
      }
    }
  }
  whitePowerPieceAvailableCoords.sort(() => Math.random() - 0.5);

  powerPieceTypes.forEach((type, idx) => {
    const pos = whitePowerPieceAvailableCoords[idx];
    const piece: Piece = {
      id: `w-${type}-${idx + 1}`,
      type,
      color: 'white',
      active: false,
      position: pos,
    };
    pieces[piece.id] = piece;
    squares[pos].pieceId = piece.id;
  });

  // Black power pieces in Black's half (ranks 5 to 8: rank indices 4 to 7)
  const blackPowerPieceAvailableCoords: string[] = [];
  for (let f = 0; f < 8; f++) {
    for (let r = 4; r <= 7; r++) {
      const coord = fileRankToCoord(f, r);
      if (!squares[coord].pieceId) {
        blackPowerPieceAvailableCoords.push(coord);
      }
    }
  }
  blackPowerPieceAvailableCoords.sort(() => Math.random() - 0.5);

  powerPieceTypes.forEach((type, idx) => {
    const pos = blackPowerPieceAvailableCoords[idx];
    const piece: Piece = {
      id: `b-${type}-${idx + 1}`,
      type,
      color: 'black',
      active: false,
      position: pos,
    };
    pieces[piece.id] = piece;
    squares[pos].pieceId = piece.id;
  });

  return {
    roomId,
    turn: 'white',
    squares,
    pieces,
    captured: [],
    moveHistory: [],
    status: 'in_progress',
    winner: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    positionHistory: [],
  };
}

export interface SimulationOverrides {
  fromCoord?: string;
  toCoord?: string;
  capturedCoord?: string;
}

/**
 * Checks if a square is attacked by any VISIBLE (revealed and active) enemy piece.
 * Note: modified check rule strictly evaluates against known visible threats.
 * Supports optional simulation overrides for move validation.
 */
export function isSquareAttackedByVisibleEnemy(
  state: GameState,
  targetCoord: string,
  byColor: PlayerColor,
  overrides?: SimulationOverrides,
  excludeKing: boolean = false,
): boolean {
  const { file: targetF, rank: targetR } = coordToFileRank(targetCoord);

  for (const piece of Object.values(state.pieces)) {
    // If piece was captured, it cannot attack
    if (piece.position === 'captured' || state.captured.some((c) => c.id === piece.id)) {
      continue;
    }
    if (overrides?.capturedCoord && piece.position === overrides.capturedCoord) {
      continue;
    }

    let piecePos = piece.position;
    // If piece moved in simulation
    if (overrides?.fromCoord && piecePos === overrides.fromCoord) {
      if (overrides.toCoord) {
        piecePos = overrides.toCoord;
      } else {
        continue;
      }
    }

    if (piece.color !== byColor) continue;
    const currentSquare = state.squares[piecePos];
    // Must be revealed on board
    if (!currentSquare || !currentSquare.revealed) continue;

    // Piece must be on the board square (guards against stale captured piece entries)
    if (!overrides?.fromCoord || piece.position !== overrides.fromCoord) {
      if (currentSquare.pieceId !== piece.id) continue;
    }

    // Kings can never deliver check to an opponent king
    if (piece.type === 'king' && excludeKing) continue;

    const { file: pF, rank: pR } = coordToFileRank(piecePos);

    if (piece.type === 'king') {
      const dF = Math.abs(pF - targetF);
      const dR = Math.abs(pR - targetR);
      if (dF <= 1 && dR <= 1 && (dF > 0 || dR > 0)) {
        return true;
      }
    } else if (piece.type === 'knight') {
      const dF = Math.abs(pF - targetF);
      const dR = Math.abs(pR - targetR);
      if ((dF === 1 && dR === 2) || (dF === 2 && dR === 1)) {
        return true;
      }
    } else if (piece.type === 'pawn') {
      const dir = piece.color === 'white' ? 1 : -1;
      if (targetR === pR + dir && Math.abs(targetF - pF) === 1) {
        return true;
      }
    } else if (
      piece.type === 'rook' ||
      piece.type === 'bishop' ||
      piece.type === 'queen'
    ) {
      const directions: Array<[number, number]> = [];
      if (piece.type === 'rook' || piece.type === 'queen') {
        directions.push([1, 0], [-1, 0], [0, 1], [0, -1]);
      }
      if (piece.type === 'bishop' || piece.type === 'queen') {
        directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
      }

      for (const [df, dr] of directions) {
        let step = 1;
        while (true) {
          const nextF = pF + df * step;
          const nextR = pR + dr * step;
          if (!isWithinBoard(nextF, nextR)) break;
          const nextCoord = fileRankToCoord(nextF, nextR);
          if (nextCoord === targetCoord) {
            return true;
          }
          const sq = state.squares[nextCoord];
          // Sliding vision blocked by fog
          if (!sq || !sq.revealed) {
            break;
          }

          // Check occupancy with simulation overrides
          let occupied = sq.pieceId !== null;
          if (overrides) {
            if (overrides.fromCoord && nextCoord === overrides.fromCoord) {
              occupied = false;
            }
            if (overrides.toCoord && nextCoord === overrides.toCoord) {
              occupied = true;
            }
            if (overrides.capturedCoord && nextCoord === overrides.capturedCoord) {
              if (overrides.toCoord !== nextCoord) {
                occupied = false;
              }
            }
          }

          if (occupied) {
            break;
          }
          step++;
        }
      }
    }
  }

  return false;
}

/**
 * Checks if a player's King is in check from any visible enemy piece.
 */
export function isKingInCheck(
  state: GameState,
  color: PlayerColor,
  overrides?: SimulationOverrides,
): boolean {
  const king = Object.values(state.pieces).find(
    (p) => p.color === color && p.type === 'king',
  );
  if (!king) return false;

  let kingPos = king.position;
  if (overrides?.fromCoord && overrides.fromCoord === king.position) {
    if (overrides.toCoord) {
      kingPos = overrides.toCoord;
    }
  }

  const kingSq = state.squares[kingPos];
  if (!kingSq || !kingSq.revealed) {
    // Stepping into or residing in unrevealed fog is not under visible check
    return false;
  }

  const enemyColor: PlayerColor = color === 'white' ? 'black' : 'white';
  // Opponent king can NEVER deliver check to another king
  return isSquareAttackedByVisibleEnemy(state, kingPos, enemyColor, overrides, true);
}

/**
 * Validates whether a candidate move leaves or puts the player's King in check
 * from any visible enemy piece.
 */
export function wouldMoveLeaveKingInCheck(
  state: GameState,
  fromCoord: string,
  toCoord: string,
): boolean {
  const sq = state.squares[fromCoord];
  if (!sq || !sq.pieceId) return true;
  const piece = state.pieces[sq.pieceId];
  if (!piece) return true;

  const targetSq = state.squares[toCoord];
  if (!targetSq) return true;

  const isKing = piece.type === 'king';

  // 1. King stepping into unrevealed fog:
  // "Kings may freely step into fog (even if a hidden piece happens to be there)."
  if (isKing && !targetSq.revealed) {
    return false;
  }

  // 2. King moving to a revealed square:
  if (isKing) {
    const isEnemyCaptured = targetSq.pieceId !== null && state.pieces[targetSq.pieceId]?.color !== piece.color;
    const inPieceAttack = isSquareAttackedByVisibleEnemy(
      state,
      toCoord,
      piece.color === 'white' ? 'black' : 'white',
      {
        fromCoord,
        toCoord,
        capturedCoord: isEnemyCaptured ? toCoord : undefined,
      },
      true, // Exclude enemy king from piece attack check
    );
    if (inPieceAttack) return true;

    // King-vs-King opposition rule: two kings cannot touch (distance <= 1)
    // Distance 2 or more is completely legal!
    const enemyKing = Object.values(state.pieces).find(
      (p) => p.color !== piece.color && p.type === 'king',
    );
    if (enemyKing) {
      const enemyKingSq = state.squares[enemyKing.position];
      if (enemyKingSq && enemyKingSq.revealed) {
        if (getChebyshevDistance(toCoord, enemyKing.position) <= 1) {
          return true;
        }
      }
    }

    return false;
  }

  // 3. Non-King piece moving
  const currentlyInCheck = isKingInCheck(state, piece.color);

  // If moving into fog (unrevealed square):
  if (!targetSq.revealed) {
    // Probing fog cannot resolve an existing check on the King
    if (currentlyInCheck) {
      return true;
    }
    // If not in check, verify that leaving fromCoord does not expose King (absolute pin)
    return isKingInCheck(state, piece.color, {
      fromCoord,
    });
  }

  // Moving to a revealed square (either empty or capturing enemy)
  const isEnemyCaptured = targetSq.pieceId !== null && state.pieces[targetSq.pieceId]?.color !== piece.color;
  return isKingInCheck(state, piece.color, {
    fromCoord,
    toCoord,
    capturedCoord: isEnemyCaptured ? toCoord : undefined,
  });
}

/**
 * Calculates all legal targets for a given piece according to Section 3,
 * strictly filtering out any moves that leave the King in check from visible enemies.
 */
export function getLegalMovesForPiece(
  state: GameState,
  fromCoord: string,
): LegalTarget[] {
  const square = state.squares[fromCoord];
  if (!square || !square.pieceId) return [];

  const piece = state.pieces[square.pieceId];
  if (!piece || piece.color !== state.turn) return [];

  // Piece must be on a revealed square to be moved
  if (!square.revealed) return [];

  const { file: f, rank: r } = coordToFileRank(fromCoord);
  const targets: LegalTarget[] = [];
  const enemyColor: PlayerColor = piece.color === 'white' ? 'black' : 'white';

  if (piece.type === 'king') {
    // Moves 1 square in any direction into visible or fogged tiles
    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (df === 0 && dr === 0) continue;
        const nF = f + df;
        const nR = r + dr;
        if (!isWithinBoard(nF, nR)) continue;
        const targetCoord = fileRankToCoord(nF, nR);
        const targetSq = state.squares[targetCoord];

        if (!targetSq.revealed) {
          // "Kings may freely step into fog (even if a hidden piece happens to be there)."
          targets.push({ coordinate: targetCoord, type: 'probe' });
        } else {
          if (targetSq.pieceId === null) {
            targets.push({ coordinate: targetCoord, type: 'move' });
          } else {
            const occupant = state.pieces[targetSq.pieceId];
            if (occupant && occupant.color === enemyColor) {
              targets.push({ coordinate: targetCoord, type: 'capture' });
            }
          }
        }
      }
    }
  } else if (piece.type === 'knight') {
    const jumps: Array<[number, number]> = [
      [1, 2],
      [2, 1],
      [-1, 2],
      [-2, 1],
      [1, -2],
      [2, -1],
      [-1, -2],
      [-2, -1],
    ];

    for (const [df, dr] of jumps) {
      const nF = f + df;
      const nR = r + dr;
      if (!isWithinBoard(nF, nR)) continue;
      const targetCoord = fileRankToCoord(nF, nR);
      const targetSq = state.squares[targetCoord];

      if (!targetSq.revealed) {
        targets.push({ coordinate: targetCoord, type: 'probe' });
      } else if (targetSq.pieceId === null) {
        targets.push({ coordinate: targetCoord, type: 'move' });
      } else {
        const occupant = state.pieces[targetSq.pieceId];
        if (occupant && occupant.color === enemyColor) {
          targets.push({ coordinate: targetCoord, type: 'capture' });
        }
      }
    }
  } else if (piece.type === 'pawn') {
    const dir = piece.color === 'white' ? 1 : -1;
    // Straight movement: strictly 1 square forward
    const forwardR = r + dir;
    if (isWithinBoard(f, forwardR)) {
      const forwardCoord = fileRankToCoord(f, forwardR);
      const forwardSq = state.squares[forwardCoord];

      if (!forwardSq.revealed) {
        // Can probe 1 square forward straight into fog
        targets.push({ coordinate: forwardCoord, type: 'probe' });
      } else if (forwardSq.pieceId === null) {
        // Moves forward to empty revealed tile
        targets.push({ coordinate: forwardCoord, type: 'move' });
      }
      // Straight into revealed piece (ally or enemy) is blocked for pawns!
    }

    // Diagonal movement: permitted ONLY to capture an already-revealed enemy piece
    for (const df of [-1, 1]) {
      const diagF = f + df;
      const diagR = r + dir;
      if (!isWithinBoard(diagF, diagR)) continue;
      const diagCoord = fileRankToCoord(diagF, diagR);
      const diagSq = state.squares[diagCoord];

      if (diagSq.revealed && diagSq.pieceId !== null) {
        const occupant = state.pieces[diagSq.pieceId];
        if (occupant && occupant.color === enemyColor) {
          targets.push({ coordinate: diagCoord, type: 'capture' });
        }
      }
      // Cannot move diagonally into fog
    }
  } else if (
    piece.type === 'rook' ||
    piece.type === 'bishop' ||
    piece.type === 'queen'
  ) {
    const directions: Array<[number, number]> = [];
    if (piece.type === 'rook' || piece.type === 'queen') {
      directions.push([1, 0], [-1, 0], [0, 1], [0, -1]);
    }
    if (piece.type === 'bishop' || piece.type === 'queen') {
      directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
    }

    for (const [df, dr] of directions) {
      let step = 1;
      while (true) {
        const nF = f + df * step;
        const nR = r + dr * step;
        if (!isWithinBoard(nF, nR)) break;

        const targetCoord = fileRankToCoord(nF, nR);
        const targetSq = state.squares[targetCoord];

        if (!targetSq.revealed) {
          // Immediately adjacent square at edge of clear path (frontier probing)
          targets.push({ coordinate: targetCoord, type: 'probe', frontierProbe: true });
          // Stop sliding: cannot probe beyond the first unrevealed square
          break;
        } else if (targetSq.pieceId === null) {
          // Clear, revealed square
          targets.push({ coordinate: targetCoord, type: 'move' });
          step++;
        } else {
          // Revealed square with piece
          const occupant = state.pieces[targetSq.pieceId];
          if (occupant && occupant.color === enemyColor) {
            targets.push({ coordinate: targetCoord, type: 'capture' });
          }
          // Blocked by ally or enemy piece
          break;
        }
      }
    }
  }

  // Filter out any moves that would leave or put the King in check against visible enemies
  return targets.filter(
    (target) => !wouldMoveLeaveKingInCheck(state, fromCoord, target.coordinate),
  );
}

/**
 * Checks if the active player has ANY legal moves.
 */
export function hasAnyLegalMoves(state: GameState, color: PlayerColor): boolean {
  for (const piece of Object.values(state.pieces)) {
    if (piece.color !== color) continue;
    const sq = state.squares[piece.position];
    if (!sq || !sq.revealed) continue;

    const moves = getLegalMovesForPiece(state, piece.position);
    if (moves.length > 0) return true;
  }
  return false;
}

/**
 * Evaluates whether 100% of squares are revealed and material is insufficient.
 */
export function isInsufficientMaterial(state: GameState): boolean {
  const allSquaresRevealed = Object.values(state.squares).every((s) => s.revealed);
  if (!allSquaresRevealed) return false;

  const activePieces = Object.values(state.pieces).filter(
    (p) => state.squares[p.position]?.pieceId === p.id,
  );

  // K vs K
  if (activePieces.length === 2) return true;

  // K+B vs K or K+N vs K
  if (activePieces.length === 3) {
    const nonKings = activePieces.filter((p) => p.type !== 'king');
    if (nonKings.length === 1 && (nonKings[0].type === 'bishop' || nonKings[0].type === 'knight')) {
      return true;
    }
  }

  return false;
}

/**
 * Generates position string representation for threefold repetition (considering visible board state).
 */
export function getVisiblePositionHash(state: GameState): string {
  const pieces = Object.values(state.pieces)
    .filter((p) => state.squares[p.position]?.revealed)
    .map((p) => `${p.color[0]}${p.type[0]}:${p.position}`)
    .sort()
    .join(',');
  return `${state.turn}|${pieces}`;
}

export interface ResolveMoveResult {
  state: GameState;
  record: MoveRecord;
  valid: boolean;
  error?: string;
}

/**
 * Executes a move on the authoritative GameState according to Section 4.
 */
export function executeMove(
  currentState: GameState,
  from: string,
  to: string,
  promotion?: PieceType,
): ResolveMoveResult {
  if (currentState.status === 'completed') {
    return { state: currentState, record: null as any, valid: false, error: 'Game is already completed' };
  }

  const fromSq = currentState.squares[from];
  if (!fromSq || !fromSq.pieceId) {
    return { state: currentState, record: null as any, valid: false, error: 'No piece at source square' };
  }

  const piece = currentState.pieces[fromSq.pieceId];
  if (!piece || piece.color !== currentState.turn) {
    return { state: currentState, record: null as any, valid: false, error: 'Not your turn or wrong piece' };
  }

  const legalTargets = getLegalMovesForPiece(currentState, from);
  const target = legalTargets.find((t) => t.coordinate === to);
  if (!target) {
    return { state: currentState, record: null as any, valid: false, error: 'Illegal move' };
  }

  // Deep clone state to ensure mutation safety
  const state: GameState = JSON.parse(JSON.stringify(currentState));
  const movingPiece = state.pieces[fromSq.pieceId];
  const targetSq = state.squares[to];

  let outcome: MoveOutcome = 'move';
  let notation = '';
  let capturedPieceInfo: { type: PieceType; color: PlayerColor } | undefined;
  let revealedPieceInfo: { type: PieceType; color: PlayerColor } | undefined;

  const pieceLetter = getPieceLetter(movingPiece.type);

  if (!targetSq.revealed) {
    // Target square is UNREVEALED: reveal it permanently
    targetSq.revealed = true;

    if (targetSq.pieceId === null) {
      // 1. Empty square discovered
      outcome = 'move';
      state.squares[from].pieceId = null;
      state.squares[to].pieceId = movingPiece.id;
      movingPiece.position = to;
      movingPiece.active = true;

      // Check promotion for pawns
      if (movingPiece.type === 'pawn') {
        const { rank } = coordToFileRank(to);
        if ((movingPiece.color === 'white' && rank === 7) || (movingPiece.color === 'black' && rank === 0)) {
          const promoType = promotion || 'queen';
          movingPiece.type = promoType;
          notation = `${to}=${getPieceLetter(promoType)}`;
        } else {
          notation = to;
        }
      } else {
        notation = `${pieceLetter}${to}`;
      }
    } else {
      const discoveredPiece = state.pieces[targetSq.pieceId];
      discoveredPiece.active = true;
      revealedPieceInfo = { type: discoveredPiece.type, color: discoveredPiece.color };

      if (discoveredPiece.color === movingPiece.color) {
        // 2. Ally Piece Discovered: ally becomes active, mover bounces back
        outcome = 'ally_bounce';
        // Piece stays at `from`, ally stays at `to`
        notation = `${pieceLetter}${from}(=${to})`;
      } else {
        // Discovered enemy piece!
        if (movingPiece.type === 'pawn' && target.type === 'probe') {
          // 4. Enemy Piece Discovered (Pawn Moving Straight):
          // Enemy revealed but NOT captured. Pawn bounces back.
          outcome = 'pawn_bounce';
          notation = `${from}(!${to})`;
        } else {
          // 3. Enemy Piece Discovered (Non-Pawn Mover or Pawn Diagonal):
          // Captured and removed! Moving piece occupies square.
          outcome = 'capture';
          capturedPieceInfo = { type: discoveredPiece.type, color: discoveredPiece.color };
          discoveredPiece.position = 'captured';
          state.captured.push(discoveredPiece);

          state.squares[from].pieceId = null;
          state.squares[to].pieceId = movingPiece.id;
          movingPiece.position = to;
          movingPiece.active = true;

          // Check if King was captured -> Instant Win!
          if (discoveredPiece.type === 'king') {
            state.status = 'completed';
            state.winner = movingPiece.color;
            state.winReason = 'King captured';
            notation = `${pieceLetter || from[0]}x${to}#`;
          } else {
            // Check pawn promotion
            if (movingPiece.type === 'pawn') {
              const { rank } = coordToFileRank(to);
              if (
                (movingPiece.color === 'white' && rank === 7) ||
                (movingPiece.color === 'black' && rank === 0)
              ) {
                const promoType = promotion || 'queen';
                movingPiece.type = promoType;
                notation = `${from[0]}x${to}=${getPieceLetter(promoType)}`;
              } else {
                notation = `${from[0]}x${to}`;
              }
            } else {
              notation = `${pieceLetter}x${to}`;
            }
          }
        }
      }
    }
  } else {
    // Target square was ALREADY REVEALED
    if (targetSq.pieceId === null) {
      outcome = 'move';
      state.squares[from].pieceId = null;
      state.squares[to].pieceId = movingPiece.id;
      movingPiece.position = to;
      movingPiece.active = true;

      if (movingPiece.type === 'pawn') {
        const { rank } = coordToFileRank(to);
        if ((movingPiece.color === 'white' && rank === 7) || (movingPiece.color === 'black' && rank === 0)) {
          const promoType = promotion || 'queen';
          movingPiece.type = promoType;
          notation = `${to}=${getPieceLetter(promoType)}`;
        } else {
          notation = to;
        }
      } else {
        notation = `${pieceLetter}${to}`;
      }
    } else {
      // Capture already revealed enemy
      const enemyPiece = state.pieces[targetSq.pieceId];
      outcome = 'capture';
      capturedPieceInfo = { type: enemyPiece.type, color: enemyPiece.color };
      enemyPiece.position = 'captured';
      state.captured.push(enemyPiece);

      state.squares[from].pieceId = null;
      state.squares[to].pieceId = movingPiece.id;
      movingPiece.position = to;
      movingPiece.active = true;

      if (enemyPiece.type === 'king') {
        state.status = 'completed';
        state.winner = movingPiece.color;
        state.winReason = 'King captured';
        notation = `${pieceLetter || from[0]}x${to}#`;
      } else {
        if (movingPiece.type === 'pawn') {
          const { rank } = coordToFileRank(to);
          if (
            (movingPiece.color === 'white' && rank === 7) ||
            (movingPiece.color === 'black' && rank === 0)
          ) {
            const promoType = promotion || 'queen';
            movingPiece.type = promoType;
            notation = `${from[0]}x${to}=${getPieceLetter(promoType)}`;
          } else {
            notation = `${from[0]}x${to}`;
          }
        } else {
          notation = `${pieceLetter}x${to}`;
        }
      }
    }
  }

  const moveRecord: MoveRecord = {
    notation,
    from,
    to,
    player: currentState.turn,
    outcome,
    capturedPiece: capturedPieceInfo,
    revealedPiece: revealedPieceInfo,
    timestamp: Date.now(),
  };

  state.moveHistory.push(moveRecord);

  // Update clocks & turn if game not over
  if (state.status !== 'completed') {
    if (movingPiece.type === 'pawn' || outcome === 'capture') {
      state.halfmoveClock = 0;
    } else {
      state.halfmoveClock += 1;
    }

    if (state.turn === 'black') {
      state.fullmoveNumber += 1;
    }

    const nextTurn: PlayerColor = state.turn === 'white' ? 'black' : 'white';
    state.turn = nextTurn;

    // Evaluate Check, Checkmate, and Stalemate
    const isNextInCheck = isKingInCheck(state, nextTurn);
    const nextHasMoves = hasAnyLegalMoves(state, nextTurn);

    if (isNextInCheck) {
      if (!nextHasMoves) {
        state.status = 'completed';
        state.winner = movingPiece.color;
        state.winReason = 'Checkmate';
        notation += '#';
        moveRecord.notation = notation;
      } else {
        notation += '+';
        moveRecord.notation = notation;
      }
    } else if (!nextHasMoves) {
      state.status = 'completed';
      state.winner = 'draw';
      state.winReason = 'Stalemate (no legal moves)';
    }

    // Check draw conditions:
    // 1. 50-move rule (100 half-moves)
    if (state.status !== 'completed' && state.halfmoveClock >= 100) {
      state.status = 'completed';
      state.winner = 'draw';
      state.winReason = '50-move rule';
    }

    // 2. Threefold repetition
    if (state.status !== 'completed') {
      const posHash = getVisiblePositionHash(state);
      state.positionHistory.push(posHash);
      const count = state.positionHistory.filter((h) => h === posHash).length;
      if (count >= 3) {
        state.status = 'completed';
        state.winner = 'draw';
        state.winReason = 'Threefold repetition';
      }
    }

    // 3. Insufficient material (checked only if 100% squares revealed)
    if (state.status !== 'completed' && isInsufficientMaterial(state)) {
      state.status = 'completed';
      state.winner = 'draw';
      state.winReason = 'Insufficient material';
    }
  }

  // If game is completed, reveal all squares for post-game
  if (state.status === 'completed') {
    for (const sq of Object.values(state.squares)) {
      sq.revealed = true;
    }
  }

  return {
    state,
    record: moveRecord,
    valid: true,
  };
}

/**
 * Sanitizes GameState for transmission to clients.
 * CRITICAL RULE: If revealed === false, piece MUST ALWAYS be null in the payload.
 * When game is completed, sends the unfogged pieces for post-game display.
 */
export function sanitizeGameState(state: GameState): SanitizedGameState {
  const sanitizedSquares: Record<string, SanitizedSquare> = {};
  let revealedCount = 0;

  for (const [coord, sq] of Object.entries(state.squares)) {
    if (sq.revealed) {
      revealedCount++;
      const piece = sq.pieceId ? state.pieces[sq.pieceId] : null;
      sanitizedSquares[coord] = {
        coordinate: coord,
        revealed: true,
        piece: piece
          ? {
              id: piece.id,
              type: piece.type,
              color: piece.color,
            }
          : null,
      };
    } else {
      // MUST NEVER reveal piece on unrevealed square to client during game
      sanitizedSquares[coord] = {
        coordinate: coord,
        revealed: false,
        piece: null,
      };
    }
  }

  const whiteKing = Object.values(state.pieces).find(
    (p) => p.color === 'white' && p.type === 'king',
  );
  const blackKing = Object.values(state.pieces).find(
    (p) => p.color === 'black' && p.type === 'king',
  );

  const inCheck = state.status === 'in_progress' ? isKingInCheck(state, state.turn) : false;

  const payload: SanitizedGameState = {
    roomId: state.roomId,
    turn: state.turn,
    squares: sanitizedSquares,
    captured: state.captured.map((p) => ({ type: p.type, color: p.color })),
    moveHistory: state.moveHistory,
    status: state.status,
    winner: state.winner,
    winReason: state.winReason,
    revealedCount,
    whiteKingPos: whiteKing?.position,
    blackKingPos: blackKing?.position,
    inCheck,
  };

  if (state.status === 'completed') {
    // Provide full unfogged pieces for post-game inspection
    const unfogged: Record<string, { type: PieceType; color: PlayerColor; active: boolean }> = {};
    for (const piece of Object.values(state.pieces)) {
      unfogged[piece.position] = {
        type: piece.type,
        color: piece.color,
        active: piece.active,
      };
    }
    payload.unfoggedPieces = unfogged;
  }

  return payload;
}
