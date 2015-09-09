/* @flow */
/* global global */

type Values = Array<Array<number>>;
type Point = [number, number];
type PointArray = Array<Point>;

export default class GoBoard {
  values: Values;
  playerToMove: number;
  koPoint: ?Point;
  blackPassed: boolean;
  whitePassed: boolean;

  constructor() {
    this.clear();
  }

  clear() {
    this.values = this.generateValues();
    this.playerToMove = 1;
    this.koPoint = undefined;
    this.blackPassed = false;
    this.whitePassed = false;
  }

  generateValues(): Values {
    var values = new Array(global.settings.size);
    for (var row = 0; row < global.settings.size; row++) {
      values[row] = new Array(global.settings.size);
      for (var col = 0; col < global.settings.size; col++) {
        values[row][col] = 0;
      }
    }
    return values;
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

  pass() {
    if (this.playerToMove === 1) {
      this.blackPassed = true;
    } else {
      this.whitePassed = true;
    }

    this.playerToMove = this.otherPlayer(this.playerToMove);
  }

  isGameOver(): boolean {
    return this.blackPassed && this.whitePassed;
  }

  move(point: Point) {
    if (this.isLegalMove(point, this.playerToMove)) {
      var neighbors: PointArray = this.getOrthogonalNeighbors(point);
      var stonesRemoved: number = 0;
      var potentialKoPoint: ?Point;

      this.setValue(point, this.playerToMove);

      neighbors.forEach(neighbor => {
        var value: number = this.getValue(neighbor);
        if (value === 0 || value === this.playerToMove) {
          return;
        }
        if (!this.hasAtLeastOneLiberty(neighbor)) {
          stonesRemoved = this.removeGroup(neighbor);
          potentialKoPoint = neighbor;
        }
      });

      if (stonesRemoved === 1) {
        this.koPoint = potentialKoPoint;
      } else {
        this.koPoint = undefined;
      }
      this.playerToMove = this.otherPlayer(this.playerToMove);
    } else {
      throw 'Illegal move';
    }
  }

  isValidPoint(point: Point): boolean {
    var row: number = point[0];
    var col: number = point[1];
    return !isNaN(row) && !isNaN(col) && row >= 0 && row < global.settings.size && col >= 0 && col < global.settings.size;
  }

  getOrthogonalNeighbors(point: Point): PointArray {
    var row: number = point[0];
    var col: number = point[1];
    var neighbors = [[row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1]];
    return neighbors.filter(this.isValidPoint);
  }

  getDiagonalNeighbors(point: Point): PointArray {
    var row: number = point[0];
    var col: number = point[1];
    var neighbors = [[row + 1, col + 1], [row + 1, col - 1], [row - 1, col + 1], [row - 1, col - 1]];
    return neighbors.filter(this.isValidPoint);
  }

  isLegalMove(point: Point, player: number): boolean {
    if (!this.isValidPoint(point)) {
      throw 'Invalid point';
    }

    if (this.getValue(point) !== 0) {
      return false;
    }

    // Check for ko
    if (this.koPoint != null && this.koPoint[0] === point[0] && this.koPoint[1] === point[1]) {
      return false;
    }

    // Are there enough liberties?
    this.setValue(point, player);
    var hasLiberty = this.hasAtLeastOneLiberty(point);
    this.setValue(point, 0);
    if (hasLiberty) {
      return true;
    }

    // Is it capturing anything?
    if (this.isCapturingMove(point, player)) {
      return true;
    }

    // Must be suicide
    return false;
  }

  // Checks if a play at point by player would capture any stones
  isCapturingMove(point: Point, player: number): boolean {
    var neighbors: PointArray = this.getOrthogonalNeighbors(point);
    this.setValue(point, player);
    var result: boolean = neighbors.some(neighbor => {
      // Only check the points which have the other player's stones on them
      if (this.getValue(neighbor) === this.getValue(point)) {
        return false;
      }
      return !this.hasAtLeastOneLiberty(neighbor);
    });
    this.setValue(point, 0);
    return result;
  }

  isValidMove(point: Point, player: number): boolean {
    if (this.isLegalMove(point, player)) {
      // Check to be sure that we're not filling an eye
      // https://groups.google.com/d/msg/computer-go-archive/hutmQemXFI8/dVso6A38j7kJ

      // Are the orthogonal neighbors of this point all the same color?
      var orthogonalNeighbors = this.getOrthogonalNeighbors(point);
      var sameColorNeighbors = orthogonalNeighbors.every(neighbor => {
        return this.getValue(neighbor) === player;
      });

      if (sameColorNeighbors) {
        var diagonalNeighbors = this.getDiagonalNeighbors(point);
        var enemyDiagonalNeighbors = 0;
        diagonalNeighbors.forEach(neighbor => {
          if (this.getValue(neighbor) === this.otherPlayer(player)) {
            enemyDiagonalNeighbors++;
          }
        });

        // Are we on a border?
        if (point[0] === 0 || point[0] === global.settings.size - 1 || point[1] === 0 || point[1] === global.settings.size - 1) {
          // If there are any diagonal neighbors, it's probably not an eye
          // (This is not always true, however: https://i.imgur.com/3JgYSEZ.png)
          if (enemyDiagonalNeighbors === 0) {
            return false;
          }
        } else {
          // If we're not on a border, we can allow one enemy stone in a diagonal position
          if (enemyDiagonalNeighbors <= 1) {
            return false;
          }
        }
      }

      return true;
    }

    return false;
  }

  // Returns a list of all possible moves that a player can make
  getMoves(player: number): PointArray {
    var moves: PointArray = [];
    for (var row: number = 0; row < global.settings.size; row++) {
      for (var col: number = 0; col < global.settings.size; col++) {
        if (this.isValidMove([row, col], player)) {
          moves.push([row, col]);
        }
      }
    }

    return moves;
  }

  getRandomMove(playerToMove: number): Point {
    // refactor this method
    var numPositions = Math.pow(global.settings.size, 2);
    var positions: Array<boolean> = new Array(numPositions);
    var checked: number = 0;
    while (checked < numPositions) {
      var row = Math.floor(Math.random() * global.settings.size);
      var col = Math.floor(Math.random() * global.settings.size);
      if (positions[row * global.settings.size + col] !== true) {
        positions[row * global.settings.size + col] = true;
        checked++;
        if (this.isValidMove([row, col], playerToMove)) {
          return [row, col];
        }
      }
    }
    return [];
  }

  removeGroup(point: Point): number {
    if (this.getValue(point) === 0) {
      throw 'Removing an empty group!';
    }
    var player: number = this.getValue(point);
    var stonesRemoved: number = 1;
    this.setValue(point, 0);
    var neighbors: PointArray = this.getOrthogonalNeighbors(point);
    neighbors.forEach(neighbor => {
      if (this.getValue(neighbor) === player) {
        stonesRemoved += this.removeGroup(neighbor);
      }
    });
    return stonesRemoved;
  }

  countLiberties(point: Point, player: ?number, checkedValues: ?Values): number {
    if (!this.isValidPoint(point)) throw "TODO DELETE";
    player = player != null ? player : this.getValue(point);
    checkedValues = checkedValues != null ? checkedValues : this.generateValues();
    if (checkedValues[point[0]][point[1]] === 1) return 0;
    checkedValues[point[0]][point[1]] = 1;
    if (this.getValue(point) === 0) return 1;
    if (this.values[point[0]][point[1]] !== player) return 0;

    var neighbors: PointArray = this.getOrthogonalNeighbors(point);
    return neighbors.reduce((sum, neighbor) => {
      return this.countLiberties(neighbor, player, checkedValues);
    }, 0);
  }

  // Although countLiberties() could be used to implement this method, the performance gains are worth the code duplication
  hasAtLeastOneLiberty(point: Point, player: ?number, checkedValues: ?Values): boolean {
    if (!this.isValidPoint(point)) throw "TODO DELETE";
    player = player != null ? player : this.getValue(point);
    checkedValues = checkedValues != null ? checkedValues : this.generateValues();
    if (checkedValues[point[0]][point[1]] === 1) return false;
    checkedValues[point[0]][point[1]] = 1;
    if (this.getValue(point) === 0) return true;
    if (this.values[point[0]][point[1]] !== player) return false;

    var neighbors: PointArray = this.getOrthogonalNeighbors(point);
    return neighbors.some(neighbor => {
      return this.hasAtLeastOneLiberty(neighbor, player, checkedValues);
    });
  }

  getResult(player: number): number {
    var p1Score = 0;
    var p2Score = 0;
    for (var row = 0; row < global.settings.size; row++) {
      for (var col = 0; col < global.settings.size; col++) {
        if (this.getValue([row, col]) === 1) p1Score++;
        if (this.getValue([row, col]) === 2) p2Score++;
      }
    }

    if (p1Score > p2Score) {
      if (player === 1) return 1;
      return 0;
    } else if (p1Score < p2Score) {
      if (player === 2) return 1;
      return 0;
    } else {
      return 0.5;
    }
  }
}
