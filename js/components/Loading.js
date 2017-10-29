import React from 'react';

export default class Loading extends React.Component {
  render() {
    return (
      <div className="loading">
        <div><i className="fa fa-spinner fa-pulse" /> Loading...</div>
      </div>
    );
  }
}
