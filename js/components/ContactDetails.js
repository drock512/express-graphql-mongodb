import ContactFormContainer from './ContactFormContainer';
import ContactView from './ContactView';
import Loading from './Loading';

import React from 'react';
import {
  QueryRenderer,
  graphql,
} from 'react-relay';

export default class ContactDetails extends React.Component {
  state = {
    isEditing: false,
  };

  _toggleEdit = () => {
    this.setState({
      isEditing: !this.state.isEditing,
    });
  };

  _handleRemove = (contact) => {
    this.props.onRemoveContact(contact);
  };

  _handleSave = (contact, obj) => {
    this._toggleEdit();
    this.props.onSaveContact(contact, obj);
  };

  _getRelay = () => this.props.relay;

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
            return this.state.isEditing ? (
              <ContactFormContainer
                relay={this._getRelay()}
                initialValue={{
                  id: props.node.id,
                  name: props.node.name,
                  email: props.node.email,
                  friends: props.node.friends.map(f => f.id),
                }}
                onSave={this._handleSave.bind(null, props.node)}
                onCancel={this._toggleEdit}
              />
            ) : (
              <ContactView
                contact={props.node}
                onRemove={this._handleRemove.bind(null, props.node)}
                onEdit={this._toggleEdit}
              />
            );
          }
          return <Loading />;
        }}
      />
    );
  }
}
