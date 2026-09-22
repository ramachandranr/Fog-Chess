import React from 'react';
import { PieceType, PlayerColor } from '../types.js';

interface ChessPieceSvgProps {
  type: PieceType;
  color: PlayerColor;
  className?: string;
}

export const ChessPieceSvg: React.FC<ChessPieceSvgProps> = ({
  type,
  color,
  className = 'w-full h-full',
}) => {
  const isWhite = color === 'white';
  const whiteFill = '#ffffff';
  const blackFill = '#1c1917';
  const darkStroke = '#0c0a09';
  const lightStroke = '#ffffff';

  if (isWhite) {
    switch (type) {
      case 'king':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-king-white`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Crown cross */}
              <path d="M22.5 11.63V6M20 8h5" stroke={darkStroke} strokeLinejoin="miter" />
              {/* Crown bulb */}
              <path
                d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
                fill={whiteFill}
                stroke={darkStroke}
                strokeLinecap="butt"
                strokeLinejoin="miter"
              />
              {/* Main robe body */}
              <path
                d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"
                fill={whiteFill}
                stroke={darkStroke}
              />
              {/* Base bands */}
              <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
            </g>
          </svg>
        );

      case 'queen':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-queen-white`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* 5 Coronet pearls */}
              <path d="M 9 13 A 2 2 0 1 1 5,13 A 2 2 0 1 1 9 13 z" transform="translate(-1,-1)" fill={whiteFill} />
              <path d="M 9 13 A 2 2 0 1 1 5,13 A 2 2 0 1 1 9 13 z" transform="translate(15.5,-5.5)" fill={whiteFill} />
              <path d="M 9 13 A 2 2 0 1 1 5,13 A 2 2 0 1 1 9 13 z" transform="translate(32,-1)" fill={whiteFill} />
              <path d="M 9 13 A 2 2 0 1 1 5,13 A 2 2 0 1 1 9 13 z" transform="translate(7,-4.5)" fill={whiteFill} />
              <path d="M 9 13 A 2 2 0 1 1 5,13 A 2 2 0 1 1 9 13 z" transform="translate(24,-4.5)" fill={whiteFill} />
              {/* Coronet body */}
              <path
                d="M 9,26 C 17.5,34.5 27.5,34.5 36,26 C 38.5,13.5 31,11 31,11 C 31,11 31,24.5 22.5,20.5 C 14,24.5 14,11 14,11 C 14,11 6.5,13.5 9,26 z"
                fill={whiteFill}
                stroke={darkStroke}
              />
              {/* Skirt base */}
              <path
                d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26"
                fill={whiteFill}
                stroke={darkStroke}
              />
              <path d="M 11.5,30 C 15,29 30,29 33.5,30" />
              <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" />
            </g>
          </svg>
        );

      case 'rook':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-rook-white`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Base */}
              <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" fill={whiteFill} strokeLinecap="butt" />
              <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" fill={whiteFill} strokeLinecap="butt" />
              {/* Tower battlements */}
              <path
                d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"
                fill={whiteFill}
                strokeLinecap="butt"
              />
              <path d="M 34,14 L 31,17 L 14,17 L 11,14" fill={whiteFill} />
              <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" fill={whiteFill} strokeLinecap="butt" strokeLinejoin="miter" />
              <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" fill={whiteFill} />
              <path d="M 11,14 L 34,14" />
            </g>
          </svg>
        );

      case 'bishop':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-bishop-white`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g fill={whiteFill} strokeLinecap="butt">
                <path d="M 9,36 C 12.39,35 14.46,35.5 22.5,35.5 C 30.54,35.5 32.61,35 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.5 30.54,38 22.5,38 C 14.46,38 12.39,37.5 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.06 9,36 9,36 z" />
                <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 22.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
                <path d="M 25 8 A 2.5 2.5 0 1 1 20,8 A 2.5 2.5 0 1 1 25 8 z" />
              </g>
              <path
                d="M 17.5,26 C 15,31 17.5,34 22.5,34 C 27.5,34 30,31 27.5,26 C 27.5,20 27.5,10 22.5,10 C 17.5,10 17.5,20 17.5,26 z"
                fill={whiteFill}
              />
              <path d="M 20,12 L 25,12" />
              <path d="M 22.5,9.5 L 22.5,14.5" />
              <path d="M 17.5,21.5 C 19.5,24 25.5,24 27.5,21.5" />
            </g>
          </svg>
        );

      case 'knight':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-knight-white`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Back and neck */}
              <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill={whiteFill} />
              {/* Head, snout, ears, nostrils */}
              <path
                d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.5,6.5 19,8 C 19.5,8.5 20,8.5 21,8 C 22,7.5 23.5,7 24,7.5 C 24.5,8 24,8.5 24,9 C 24.5,9.5 25.5,9 26,9.5 C 26.5,10 26,10.5 26,11 C 26.5,11.5 27,11.5 27,12 C 27,12.5 26.5,13 26.5,13.5 C 26.5,14 27,14 27,14.5 C 27,15 26.5,15.5 26.5,16 C 26.5,16.5 27,16.5 27,17 C 27,17.5 26.5,18 26.5,18.5"
                fill={whiteFill}
              />
              {/* Nostril dot */}
              <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill={darkStroke} />
              {/* Eye oval */}
              <path
                d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z"
                transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)"
                fill={darkStroke}
              />
            </g>
          </svg>
        );

      case 'pawn':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-pawn-white`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M 22 9 C 19.79 9 18 10.79 18 13 C 18 13.89 18.29 14.71 18.78 15.38 C 16.83 16.5 15.5 18.59 15.5 21 C 15.5 23.03 16.44 24.84 17.91 26.03 C 14.91 27.09 10.5 31.58 10.5 39.5 L 34.5 39.5 C 34.5 31.58 30.09 27.09 27.09 26.03 C 28.56 24.84 29.5 23.03 29.5 21 C 29.5 18.59 28.17 16.5 26.22 15.38 C 26.71 14.71 27 13.89 27 13 C 27 10.79 25.21 9 23 9 C 22.66 9 22.33 9.04 22 9.13 L 22 9 z"
                fill={whiteFill}
              />
            </g>
          </svg>
        );
    }
  } else {
    // Black piece standard Staunton
    switch (type) {
      case 'king':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-king-black`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Crown cross */}
              <path d="M22.5 11.63V6" strokeLinejoin="miter" stroke={darkStroke} />
              <path
                d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
                fill={blackFill}
                stroke={darkStroke}
                strokeLinecap="butt"
                strokeLinejoin="miter"
              />
              <path
                d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"
                fill={blackFill}
                stroke={darkStroke}
              />
              <path d="M20 8h5" strokeLinejoin="miter" stroke={darkStroke} />
              {/* Inner highlight oval on black robe */}
              <path
                d="M32 29.5c0 2.21-4.25 4-9.5 4s-9.5-1.79-9.5-4 4.25-4 9.5-4 9.5 1.79 9.5 4z"
                fill={blackFill}
                stroke={lightStroke}
              />
              {/* White lines on black base */}
              <path
                d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"
                stroke={lightStroke}
              />
            </g>
          </svg>
        );

      case 'queen':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-queen-black`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 9 13 A 2 2 0 1 1 5,13 A 2 2 0 1 1 9 13 z" transform="translate(-1,-1)" fill={blackFill} />
              <path d="M 9 13 A 2 2 0 1 1 5,13 A 2 2 0 1 1 9 13 z" transform="translate(15.5,-5.5)" fill={blackFill} />
              <path d="M 9 13 A 2 2 0 1 1 5,13 A 2 2 0 1 1 9 13 z" transform="translate(32,-1)" fill={blackFill} />
              <path d="M 9 13 A 2 2 0 1 1 5,13 A 2 2 0 1 1 9 13 z" transform="translate(7,-4.5)" fill={blackFill} />
              <path d="M 9 13 A 2 2 0 1 1 5,13 A 2 2 0 1 1 9 13 z" transform="translate(24,-4.5)" fill={blackFill} />
              <path
                d="M 9,26 C 17.5,34.5 27.5,34.5 36,26 C 38.5,13.5 31,11 31,11 C 31,11 31,24.5 22.5,20.5 C 14,24.5 14,11 14,11 C 14,11 6.5,13.5 9,26 z"
                fill={blackFill}
                stroke={darkStroke}
              />
              <path
                d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26"
                fill={blackFill}
                stroke={darkStroke}
              />
              <path d="M 11.5,30 C 15,29 30,29 33.5,30" stroke={lightStroke} />
              <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" stroke={lightStroke} />
            </g>
          </svg>
        );

      case 'rook':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-rook-black`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" fill={blackFill} strokeLinecap="butt" />
              <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" fill={blackFill} strokeLinecap="butt" />
              <path
                d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"
                fill={blackFill}
                strokeLinecap="butt"
              />
              <path d="M 34,14 L 31,17 L 14,17 L 11,14" fill={blackFill} />
              <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" fill={blackFill} strokeLinecap="butt" strokeLinejoin="miter" />
              <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" fill={blackFill} />
              {/* Highlight lines on black rook */}
              <path d="M 12,35.5 L 33,35.5" stroke={lightStroke} />
              <path d="M 13,31.5 L 32,31.5" stroke={lightStroke} />
              <path d="M 14,29.5 L 31,29.5" stroke={lightStroke} />
              <path d="M 14,16.5 L 31,16.5" stroke={lightStroke} />
              <path d="M 11,14 L 34,14" stroke={lightStroke} />
            </g>
          </svg>
        );

      case 'bishop':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-bishop-black`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g fill={blackFill} strokeLinecap="butt">
                <path d="M 9,36 C 12.39,35 14.46,35.5 22.5,35.5 C 30.54,35.5 32.61,35 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.5 30.54,38 22.5,38 C 14.46,38 12.39,37.5 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.06 9,36 9,36 z" />
                <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 22.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
                <path d="M 25 8 A 2.5 2.5 0 1 1 20,8 A 2.5 2.5 0 1 1 25 8 z" />
              </g>
              <path
                d="M 17.5,26 C 15,31 17.5,34 22.5,34 C 27.5,34 30,31 27.5,26 C 27.5,20 27.5,10 22.5,10 C 17.5,10 17.5,20 17.5,26 z"
                fill={blackFill}
              />
              {/* Highlight cross and mitre lines on black bishop */}
              <path d="M 20,12 L 25,12" stroke={lightStroke} />
              <path d="M 22.5,9.5 L 22.5,14.5" stroke={lightStroke} />
              <path d="M 17.5,21.5 C 19.5,24 25.5,24 27.5,21.5" stroke={lightStroke} />
            </g>
          </svg>
        );

      case 'knight':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-knight-black`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill={blackFill} />
              <path
                d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.5,6.5 19,8 C 19.5,8.5 20,8.5 21,8 C 22,7.5 23.5,7 24,7.5 C 24.5,8 24,8.5 24,9 C 24.5,9.5 25.5,9 26,9.5 C 26.5,10 26,10.5 26,11 C 26.5,11.5 27,11.5 27,12 C 27,12.5 26.5,13 26.5,13.5 C 26.5,14 27,14 27,14.5 C 27,15 26.5,15.5 26.5,16 C 26.5,16.5 27,16.5 27,17 C 27,17.5 26.5,18 26.5,18.5"
                fill={blackFill}
              />
              {/* White eye and nostril on black knight */}
              <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill={lightStroke} stroke={lightStroke} />
              <path
                d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z"
                transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)"
                fill={lightStroke}
                stroke={lightStroke}
              />
              <path
                d="M 24.55,10.4 C 24.18,10 23.4,9.7 22.8,10.1 C 21.6,10.7 21.6,12.3 22.6,12.9 C 23.2,13.2 24.2,13 24.5,12.4 C 24.8,11.8 24.9,10.8 24.55,10.4 z"
                fill={lightStroke}
                stroke={lightStroke}
              />
            </g>
          </svg>
        );

      case 'pawn':
        return (
          <svg viewBox="0 0 45 45" className={className} id={`piece-pawn-black`}>
            <g
              fill="none"
              fillRule="evenodd"
              stroke={darkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M 22 9 C 19.79 9 18 10.79 18 13 C 18 13.89 18.29 14.71 18.78 15.38 C 16.83 16.5 15.5 18.59 15.5 21 C 15.5 23.03 16.44 24.84 17.91 26.03 C 14.91 27.09 10.5 31.58 10.5 39.5 L 34.5 39.5 C 34.5 31.58 30.09 27.09 27.09 26.03 C 28.56 24.84 29.5 23.03 29.5 21 C 29.5 18.59 28.17 16.5 26.22 15.38 C 26.71 14.71 27 13.89 27 13 C 27 10.79 25.21 9 23 9 C 22.66 9 22.33 9.04 22 9.13 L 22 9 z"
                fill={blackFill}
              />
            </g>
          </svg>
        );
    }
  }
};
