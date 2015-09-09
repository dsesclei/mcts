/* @flow */
/* global require */

import React from 'react';
import Board from './board';

// Split up the require so that Flow doesn't throw an error
var Worker = require('worker!' + './ai/worker');

var game = 'go';

function handleHumanMove(row: number, col: number): void {
  if (!ready) return;
  worker.postMessage({ type: 'move', row, col });
  ready = false;
}

function renderGame(board: Array<Array<number>>, playerToMove: number, isGameOver: boolean): void {
  var isThinking = (playerToMove === computerPlayer);
  var gameBoard = (
    <Board
      board={board}
      game={game}
      isGameOver={isGameOver}
      isThinking={isThinking}
      onMove={handleHumanMove} />
  );
  React.render(gameBoard, document.getElementById('content'));
}

var worker = new Worker();
worker.onmessage = function(event) {
  var data = event.data;
  switch (data.type) {
  case 'invalidMove':
    alert('Invalid move!');
    break;
  case 'gameData':
    if (!data.isGameOver && data.playerToMove === humanPlayer) {
      ready = true;
    }
    renderGame(data.board, data.playerToMove, data.type === 'gameOver');
    break;
  }
};

var humanPlayer;
var computerPlayer;
if (Math.random() < 0.5) {
  humanPlayer = 1;
  computerPlayer = 2;
} else {
  humanPlayer = 2;
  computerPlayer = 1;
}

var ready = (humanPlayer === 1);

worker.postMessage({ type: 'startGame', game, humanPlayer });
