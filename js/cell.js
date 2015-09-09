/* @flow */

import React from 'react';
import classNames from 'classnames';

export default class Cell extends React.Component {
  constructor(props: any): void {
    super(props);
  }

  render(): any {
    var renderedValue;
    if (this.props.game === 'go') {
      renderedValue = ['', '●', '○'][this.props.value];
    } else {
      renderedValue = ['', 'X', 'O'][this.props.value];
    }
    var classes = classNames({
      'board-cell': true,
      'clickable': renderedValue === ''
    });
    return (
      <div className={classes} onClick={this.props.onClick}>{renderedValue}</div>
    );
  }
}

Cell.propTypes = {
  game: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func.isRequired,
  value: React.PropTypes.number.isRequired
};
