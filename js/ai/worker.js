/* This file isn't checked by Flow because it throws an error for `postMessage` */
/* global global onmessage: true */

import AI from './ai';
import GoBoard from './boards/go';
import TicTacToeBoard from './boards/tic_tac_toe';

global.settings = {
  thinkingTime: 120000,
  size: null
};

var computer;
var board;

function makeMove(point) {
  board.move(point);
  postMessage({ type: 'gameData', board: board.values, playerToMove: board.playerToMove, isGameOver: board.isGameOver() });
}

onmessage = (event) => {
  if (event.data.type === 'startGame') {
    computer = new AI();
    switch (event.data.game) {
    case 'go':
      global.settings.size = 9;
      board = new GoBoard();
      break;
    case 'tic-tac-toe':
      global.settings.size = 3;
      board = new TicTacToeBoard();
      break;
    }
    postMessage({ type: 'gameData', board: board.values, playerToMove: board.playerToMove, isGameOver: false });
    if (event.data.humanPlayer === 2) {
      var startingMove = computer.bestMove(board);
      makeMove(startingMove);
    }
    return;
  }

  var {row, col} = event.data;
  if (!board.isLegalMove([row, col], board.playerToMove)) {
    postMessage({ type: 'invalidMove' });
    return;
  }

  makeMove([row, col]);

  while (true) {
  var move = computer.bestMove(board);
  if (move[0] !== -1 && move[1] !== -1) {
    makeMove(move);
  }
  }
};


