import ChangeTodoStatusMutation from '../mutations/ChangeTodoStatusMutation';
import RemoveTodoMutation from '../mutations/RemoveTodoMutation';
import RenameTodoMutation from '../mutations/RenameTodoMutation';
import TodoTextInput from './TodoTextInput';

import React from 'react';
import {
  QueryRenderer,
  graphql,
} from 'react-relay';

import classnames from 'classnames';

export default class ContactDetails extends React.Component {
  _handleRemove = (contact) => {
    this.props.onRemoveContact(contact);
  };

  renderFriends = (friends) => {
    return (
      <div>
        <div className="smaller">Friends with:</div>
        <ul>
          {friends.map((f) => (
            <li key={f.id}>{f.name}</li>
          ))}
        </ul>
      </div>
    );
  };

  render() {
    return (
      <QueryRenderer
        environment={this.props.relay.environment}
        query={graphql`
          query ContactDetailsQuery($contactID: ID!) {
            node(id: $contactID) {
              id,
              ... on Contact {
                name,
                email,
                totalFriends,
                friends {
                  id,
                  name
                }
              }
            }
          }
        `}
        variables={{
          contactID: this.props.selectedContact,
        }}
        render={({error, props}) => {
          if (error) {
            return <div>{error.message}</div>;
          } else if (props) {
            return (
              <div className="detailsContainer">
                <div className="buttonBar">
                  <button onClick={this._handleRemove.bind(null, props.node)}>Remove Contact</button>
                </div>
                <div>{props.node.name}</div>
                <div className="smaller">{props.node.email}</div>
                {props.node.totalFriends ? this.renderFriends(props.node.friends) : <div className="smaller">Has No Friends</div>}
              </div>
            );
          }
          return <div>Loading</div>;
        }}
      />
    );
  }
}
