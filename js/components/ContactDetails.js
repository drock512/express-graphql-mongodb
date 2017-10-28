import ChangeTodoStatusMutation from '../mutations/ChangeTodoStatusMutation';
import RemoveTodoMutation from '../mutations/RemoveTodoMutation';
import RenameTodoMutation from '../mutations/RenameTodoMutation';
import TodoTextInput from './TodoTextInput';
import ContactForm from './ContactForm';

import React from 'react';
import {
  QueryRenderer,
  graphql,
} from 'react-relay';

import classnames from 'classnames';

export default class ContactDetails extends React.Component {
  state = {
    isEditing: false
  };

  _toggleEdit = () => {
    this.setState({
      isEditing: !this.state.isEditing
    });
  };

  _handleRemove = (contact) => {
    this.props.onRemoveContact(contact);
  };

  _handleSave = (contact, obj) => {
    this._toggleEdit();
    this.props.onSaveContact(contact, obj);
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
            viewer {
              id,
              ...ContactForm_viewer,
            }
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
            return this.state.isEditing ? (
              <div className="detailsContainer">
                <div className="buttonBar">
                  <button onClick={this._toggleEdit}>Cancel</button>
                </div>
                <ContactForm
                  viewer={props.viewer}
                  initialValue={{
                    name: props.node.name,
                    email: props.node.email,
                    friends: props.node.friends.map(f => f.id)
                  }}
                  onSave={this._handleSave.bind(null, props.node)}
                />
              </div>
            ) : (
              <div className="detailsContainer">
                <div className="buttonBar">
                  <button onClick={this._handleRemove.bind(null, props.node)}>Remove Contact</button>
                  <button onClick={this._toggleEdit}>Edit Contact</button>
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
