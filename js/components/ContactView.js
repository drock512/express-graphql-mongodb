import React from 'react';
import {
  QueryRenderer,
  graphql,
} from 'react-relay';

import classnames from 'classnames';

export default class ContactView extends React.Component {
  renderFriends = () => {
    if (this.props.contact.totalFriends) {
      return (
        <div className="friendsList">
          <div className="friendsLabel">Friends with:</div>
          <ul>
            {this.props.contact.friends.map((f) => {
              return (f && f.id && f.name) ? (
                <li key={f.id}>{f.name}</li>
              ) : null;
            })}
          </ul>
        </div>
      );
    }

    return (
      <div className="friendsLabel">Has no friends <i className="fa fa-frown-o" /></div>
    );
  };

  render() {
    return (
      <div className="contactView">
        <div className="contactTopContainer">
          <div className="contactInfo">
            <div className="contactName">{this.props.contact.name}</div>
            <div className="contactEmail">{this.props.contact.email}</div>
          </div>
          <div className="contactActions">
            <button onClick={this.props.onEdit}><i className="fa fa-pencil" /> Edit</button>
            <button className="delete" onClick={this.props.onRemove}><i className="fa fa-trash" /> Remove</button>
          </div>
        </div>
        {this.renderFriends()}
      </div>
    );
  }
}
