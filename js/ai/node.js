/* @flow */

import Board from './boards/go';

export default class Node {
  move: [number, number];
  player: number;
  untriedMoves: Array<Array<number>>;
  children: Array<Node>;
  wins: number;
  visits: number;
  parent: Node;

  constructor(board: Board, move: [number, number], player: number) {
    this.move = move;
    this.player = player;
    this.untriedMoves = board.getMoves(board.playerToMove);
    this.children = [];
    this.wins = 0;
    this.visits = 0;
  }

  addChild(board: Board, move: [number, number]): Node {
    var child: Node = new Node(board, move, board.otherPlayer(this.player));
    child.parent = this;
    this.untriedMoves.splice(this.untriedMoves.indexOf(move), 1);
    this.children.push(child);
    return child;
  }

  uctSelectChild(): Node {
    var bestChild = this.children.sort((a, b) => {
      var aVal = a.wins / a.visits + Math.sqrt(2 * Math.log(this.visits) / a.visits);
      var bVal = b.wins / b.visits + Math.sqrt(2 * Math.log(this.visits) / b.visits);
      if (aVal > bVal) return -1;
      if (aVal < bVal) return 1;
      return 0;
    })[0];

    return bestChild;
  }

  update(result: number): void {
    this.visits++;
    this.wins += result;
  }
}
