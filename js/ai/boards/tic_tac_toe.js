/* @flow */
/* global global */

type Values = Array<Array<number>>;
type Point = [number, number];
type PointArray = Array<Point>;

export default class TicTacToeBoard {
  values: Values;
  playerToMove: number;

  constructor() {
    this.clear();
  }

  clear() {
    this.values = this.generateValues();
    this.playerToMove = 1;
  }

  generateValues(): Values {
    return [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
  }

  getValue(point: Point): number {
    return this.values[point[0]][point[1]];
  }

  setValue(point: Point, value: number) {
    this.values[point[0]][point[1]] = value;
  }

  otherPlayer(player: number): number {
    return (player === 1) ? 2 : 1;
  }

  isWinForPlayer(player: number): boolean {
    var groupsOfThree = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [6, 4, 2]];
    return groupsOfThree.some(group => {
      return group.every(pos => {
        var row = Math.floor(pos / 3);
        var col = pos % 3;
        return this.getValue([row, col]) === player;
      });
    });
  }

  isGameOver(): boolean {
    if (this.isWinForPlayer(1) || this.isWinForPlayer(2)) {
      return true;
    }
    // Check for tie
    return this.values.every(rowArray => {
      return rowArray.every(value => {
        return value !== 0;
      });
    });
  }

  move(point: Point) {
    if (this.isLegalMove(point, this.playerToMove)) {
      this.setValue(point, this.playerToMove);
      this.playerToMove = this.otherPlayer(this.playerToMove);
    } else {
      throw `Illegal move: ${point[0]}, ${point[1]}`;
    }
  }

  isValidPoint(point: Point): boolean {
    var row: number = point[0];
    var col: number = point[1];
    return !isNaN(row) && !isNaN(col) && row >= 0 && row < global.settings.size && col >= 0 && col < global.settings.size;
  }

  isLegalMove(point: Point, _player: number): boolean {
    if (!this.isValidPoint(point)) {
      debugger;
      throw 'Invalid point';
    }

    if (this.getValue(point) !== 0) {
      return false;
    }

    return true;
  }

  // Returns a list of all possible moves that a player can make
  getMoves(player: number): PointArray {
    if (this.isGameOver()) return [];
    var moves = [];
    for (var row: number = 0; row < global.settings.size; row++) {
      for (var col: number = 0; col < global.settings.size; col++) {
        if (this.isLegalMove([row, col], player)) {
          moves.push([row, col]);
        }
      }
    }
    return moves;
  }

  getRandomMove(player: number): Point {
    var moves: PointArray = this.getMoves(player);
    if (moves.length > 0) {
      var randomIndex: number = Math.floor(Math.random() * moves.length);
      return moves[randomIndex];
    } else {
      return [];
    }
  }

  getResult(player: number): number {
    if (this.isWinForPlayer(1)) {
      if (player === 1) return 1;
      return 0;
    }
    if (this.isWinForPlayer(2)) {
      if (player === 2) return 1;
      return 0;
    }
    return 0.5;
  }
}
