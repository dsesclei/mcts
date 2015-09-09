/* @flow */
/* global global */

import clone from 'clone';
import Board from './boards/go';
import Node from './node';

export default class AI {
  bestMove(rootBoard: Board): [number, number] {
    var startTime: number = Date.now();
    var otherPlayer = rootBoard.otherPlayer(rootBoard.playerToMove);
    var rootNode: Node = new Node(clone(rootBoard), [-1, -1], otherPlayer);

    while (Date.now() - startTime < global.settings.thinkingTime) {
      var board: Board = clone(rootBoard);
      var node: Node = rootNode;
      while (node.untriedMoves.length === 0 && node.children.length > 0) {
        node = node.uctSelectChild();
        board.move(node.move);
      }

      if (node.untriedMoves.length > 0) {
        var randomIndex: number = Math.floor(Math.random() * node.untriedMoves.length);
        var move: [number, number] = node.untriedMoves[randomIndex];
        board.move(move);
        node = node.addChild(board, move);
      }

      var randomMove = board.getRandomMove(board.playerToMove);
      while (randomMove.length > 0) {
        board.move(randomMove);
        randomMove = board.getRandomMove(board.playerToMove);
      }

      while (typeof node !== 'undefined') {
        var result: number = board.getResult(node.player);
        node.update(result);
        node = node.parent;
      }
    }

    if (rootNode.children.length === 0) {
      return [-1, -1];
    }

    var bestChild = rootNode.children.sort((a, b) => {
      if (a.visits > b.visits) return -1;
      if (b.visits < a.visits) return 1;
      return 0;
    })[0];

    console.log('Playouts per second:', (rootNode.visits * 1000) / (Date.now() - startTime)); // eslint-disable-line no-console
    return bestChild.move;
  }
}
