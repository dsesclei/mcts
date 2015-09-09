/* @flow */

import React from 'react';
import classNames from 'classnames';
import Cell from './cell';

export default class Board extends React.Component {
  constructor(props: any) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.renderCell = this.renderCell.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  handleClick(row: number, col: number) {
    if (this.props.board[row][col] !== 0) return;
    this.props.onMove(row, col);
  }

  // Arguments need to be in this order for map and bind to work correctly
  renderCell(rowNum: number, value: number, cellNum: number): any {
    return (
      <Cell
        game={this.props.game}
        key={cellNum}
        onClick={this.handleClick.bind(null, rowNum, cellNum)}
        value={value} />
    );
  }

  renderRow(row: Array<number>, rowNum: number): any {
    return (
      <div className="board-row" key={rowNum}>
        {row.map(this.renderCell.bind(null, rowNum))}
      </div>
    );
  }

  render(): any {
    var classes = classNames({
      'board-container': true,
      'go': this.props.game === 'go',
      'tic-tac-toe': this.props.game === 'tic-tac-toe',
      'thinking': this.props.isThinking,
      'game-over': this.props.isGameOver
    });

    return (
      <div className={classes}>
        {this.props.board.map(this.renderRow)}
      </div>
    );
  }
}

Board.propTypes = {
  board: React.PropTypes.array.isRequired,
  game: React.PropTypes.string.isRequired,
  isGameOver: React.PropTypes.bool.isRequired,
  isThinking: React.PropTypes.bool.isRequired,
  onMove: React.PropTypes.func.isRequired
};
