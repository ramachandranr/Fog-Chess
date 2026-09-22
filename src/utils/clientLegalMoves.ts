import {
  PieceType,
  PlayerColor,
  SanitizedGameState,
  LegalTarget,
} from '../types.js';
import {
  FILES,
  RANKS,
  coordToFileRank,
  fileRankToCoord,
  isWithinBoard,
  getChebyshevDistance,
} from '../../server/gameEngine.js';

export interface ClientSimulationOverrides {
  fromCoord?: string;
  toCoord?: string;
  capturedCoord?: string;
}

export function isSquareAttackedByVisibleEnemyClient(
  state: SanitizedGameState,
  targetCoord: string,
  byColor: PlayerColor,
  overrides?: ClientSimulationOverrides,
  excludeKing: boolean = false,
): boolean {
  const { file: targetF, rank: targetR } = coordToFileRank(targetCoord);

  for (const [coord, sq] of Object.entries(state.squares)) {
    if (overrides?.capturedCoord && coord === overrides.capturedCoord) {
      continue;
    }

    let piecePos = coord;
    let piece = sq.piece;

    if (overrides?.fromCoord && coord === overrides.fromCoord) {
      if (overrides.toCoord) {
        piecePos = overrides.toCoord;
      } else {
        continue;
      }
    }

    if (!piece) continue;
    if (piece.color !== byColor) continue;

    // Must be on a revealed square
    const currentSquare = state.squares[piecePos];
    if (!currentSquare || !currentSquare.revealed) continue;

    // Kings can never deliver check to an opponent king
    if (piece.type === 'king' && excludeKing) continue;

    // Unknown pieces cannot deliver attacks/checks
    if (piece.type === 'unknown') continue;

    const { file: pF, rank: pR } = coordToFileRank(piecePos);
    const pieceType = piece.type;

    if (pieceType === 'king') {
      const dF = Math.abs(pF - targetF);
      const dR = Math.abs(pR - targetR);
      if (dF <= 1 && dR <= 1 && (dF > 0 || dR > 0)) {
        return true;
      }
    } else if (pieceType === 'knight') {
      const dF = Math.abs(pF - targetF);
      const dR = Math.abs(pR - targetR);
      if ((dF === 1 && dR === 2) || (dF === 2 && dR === 1)) {
        return true;
      }
    } else if (pieceType === 'pawn') {
      const dir = piece.color === 'white' ? 1 : -1;
      if (targetR === pR + dir && Math.abs(targetF - pF) === 1) {
        return true;
      }
    } else if (
      pieceType === 'rook' ||
      pieceType === 'bishop' ||
      pieceType === 'queen'
    ) {
      const directions: Array<[number, number]> = [];
      if (pieceType === 'rook' || pieceType === 'queen') {
        directions.push([1, 0], [-1, 0], [0, 1], [0, -1]);
      }
      if (pieceType === 'bishop' || pieceType === 'queen') {
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
          const nextSq = state.squares[nextCoord];
          if (!nextSq || !nextSq.revealed) {
            break;
          }

          let occupied = nextSq.piece !== null;
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

export function isKingInCheckClient(
  state: SanitizedGameState,
  color: PlayerColor,
  overrides?: ClientSimulationOverrides,
): boolean {
  let kingPos = color === 'white' ? state.whiteKingPos : state.blackKingPos;
  if (!kingPos) {
    for (const [coord, sq] of Object.entries(state.squares)) {
      if (sq.revealed && sq.piece && sq.piece.type === 'king' && sq.piece.color === color) {
        kingPos = coord;
        break;
      }
    }
  }
  if (!kingPos) return false;

  if (overrides?.fromCoord && overrides.fromCoord === kingPos) {
    if (overrides.toCoord) {
      kingPos = overrides.toCoord;
    }
  }

  const kingSq = state.squares[kingPos];
  if (!kingSq || !kingSq.revealed) {
    return false;
  }

  const enemyColor: PlayerColor = color === 'white' ? 'black' : 'white';
  return isSquareAttackedByVisibleEnemyClient(state, kingPos, enemyColor, overrides);
}

export function wouldMoveLeaveKingInCheckClient(
  state: SanitizedGameState,
  fromCoord: string,
  toCoord: string,
): boolean {
  const sq = state.squares[fromCoord];
  if (!sq || !sq.piece) return true;
  const piece = sq.piece;

  const targetSq = state.squares[toCoord];
  if (!targetSq) return true;

  const isKing = piece.type === 'king';

  // 1. King stepping into unrevealed fog
  if (isKing && !targetSq.revealed) {
    return false;
  }

  // 2. King moving to a revealed square
  if (isKing) {
    const isEnemyCaptured = targetSq.piece !== null && targetSq.piece.color !== piece.color;
    return isSquareAttackedByVisibleEnemyClient(
      state,
      toCoord,
      piece.color === 'white' ? 'black' : 'white',
      {
        fromCoord,
        toCoord,
        capturedCoord: isEnemyCaptured ? toCoord : undefined,
      },
    );
  }

  // 3. Non-King piece moving
  const currentlyInCheck = isKingInCheckClient(state, piece.color);

  // Moving into fog:
  if (!targetSq.revealed) {
    if (currentlyInCheck) {
      return true;
    }
    return isKingInCheckClient(state, piece.color, {
      fromCoord,
    });
  }

  // Moving to revealed square:
  const isAllyMysteryProbe =
    targetSq.piece !== null &&
    targetSq.piece.color === piece.color &&
    targetSq.piece.type === 'unknown';
  if (isAllyMysteryProbe) {
    if (currentlyInCheck) {
      return true;
    }
    return isKingInCheckClient(state, piece.color, {
      fromCoord,
    });
  }

  const isEnemyCaptured = targetSq.piece !== null && targetSq.piece.color !== piece.color;
  return isKingInCheckClient(state, piece.color, {
    fromCoord,
    toCoord,
    capturedCoord: isEnemyCaptured ? toCoord : undefined,
  });
}

export function getClientLegalMoves(
  state: SanitizedGameState,
  fromCoord: string,
): LegalTarget[] {
  const sq = state.squares[fromCoord];
  if (!sq || !sq.revealed || !sq.piece) return [];
  if (sq.piece.color !== state.turn) return [];
  if (sq.piece.type === 'unknown') return [];

  const piece = sq.piece;
  const { file: f, rank: r } = coordToFileRank(fromCoord);
  const targets: LegalTarget[] = [];
  const enemyColor: PlayerColor = piece.color === 'white' ? 'black' : 'white';

  if (piece.type === 'king') {
    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (df === 0 && dr === 0) continue;
        const nF = f + df;
        const nR = r + dr;
        if (!isWithinBoard(nF, nR)) continue;
        const targetCoord = fileRankToCoord(nF, nR);
        const targetSq = state.squares[targetCoord];
        if (!targetSq) continue;

        if (!targetSq.revealed) {
          // Free step into fog
          targets.push({ coordinate: targetCoord, type: 'probe' });
        } else {
          if (targetSq.piece === null) {
            targets.push({ coordinate: targetCoord, type: 'move' });
          } else if (targetSq.piece.color === enemyColor) {
            targets.push({ coordinate: targetCoord, type: 'capture' });
          } else if (targetSq.piece.color === piece.color && targetSq.piece.type === 'unknown') {
            targets.push({ coordinate: targetCoord, type: 'probe' });
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
      if (!targetSq) continue;

      if (!targetSq.revealed) {
        targets.push({ coordinate: targetCoord, type: 'probe' });
      } else if (targetSq.piece === null) {
        targets.push({ coordinate: targetCoord, type: 'move' });
      } else if (targetSq.piece.color === enemyColor) {
        targets.push({ coordinate: targetCoord, type: 'capture' });
      } else if (targetSq.piece.color === piece.color && targetSq.piece.type === 'unknown') {
        targets.push({ coordinate: targetCoord, type: 'probe' });
      }
    }
  } else if (piece.type === 'pawn') {
    const dir = piece.color === 'white' ? 1 : -1;
    // Straight movement
    const forwardR = r + dir;
    if (isWithinBoard(f, forwardR)) {
      const forwardCoord = fileRankToCoord(f, forwardR);
      const forwardSq = state.squares[forwardCoord];
      if (forwardSq) {
        if (!forwardSq.revealed) {
          targets.push({ coordinate: forwardCoord, type: 'probe' });
        } else if (forwardSq.piece === null) {
          targets.push({ coordinate: forwardCoord, type: 'move' });
        } else if (forwardSq.piece.color === piece.color && forwardSq.piece.type === 'unknown') {
          targets.push({ coordinate: forwardCoord, type: 'probe' });
        }
      }
    }

    // Diagonal captures (only if revealed enemy)
    for (const df of [-1, 1]) {
      const diagF = f + df;
      const diagR = r + dir;
      if (!isWithinBoard(diagF, diagR)) continue;
      const diagCoord = fileRankToCoord(diagF, diagR);
      const diagSq = state.squares[diagCoord];
      if (diagSq?.revealed && diagSq.piece && diagSq.piece.color === enemyColor) {
        targets.push({ coordinate: diagCoord, type: 'capture' });
      }
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
        if (!targetSq) break;

        if (!targetSq.revealed) {
          // Frontier probe!
          targets.push({ coordinate: targetCoord, type: 'probe', frontierProbe: true });
          break;
        } else if (targetSq.piece === null) {
          targets.push({ coordinate: targetCoord, type: 'move' });
          step++;
        } else {
          if (targetSq.piece.color === enemyColor) {
            targets.push({ coordinate: targetCoord, type: 'capture' });
          } else if (targetSq.piece.color === piece.color && targetSq.piece.type === 'unknown') {
            targets.push({ coordinate: targetCoord, type: 'probe' });
          }
          break;
        }
      }
    }
  }

  // Strictly filter out any moves that leave the King in check against visible enemies
  return targets.filter(
    (target) => !wouldMoveLeaveKingInCheckClient(state, fromCoord, target.coordinate),
  );
}
