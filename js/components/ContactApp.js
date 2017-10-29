import AddContactMutation from '../mutations/AddContactMutation';
import ContactFormContainer from './ContactFormContainer';
import ContactList from './ContactList';
import ContactDetails from './ContactDetails';
import Welcome from './Welcome';
import RemoveContactMutation from '../mutations/RemoveContactMutation';
import EditContactMutation from '../mutations/EditContactMutation';

import React from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';

class ContactApp extends React.Component {
  state = {
    selectedContact: null,
  };

  _handleSelection = (id) => {
    this.setState({selectedContact: id});
  };

  _handleContactSave = (obj) => {
    AddContactMutation.commit(
      this.props.relay.environment,
      obj,
      this.props.viewer,
    );
  };

  _handleEditContact = (contact, obj) => {
    EditContactMutation.commit(
      this.props.relay.environment,
      obj,
      contact
    );
  }

  _handleRemoveContact = (contact) => {
    this.setState({ selectedContact: null });
    RemoveContactMutation.commit(
      this.props.relay.environment,
      contact,
      this.props.viewer
    );
  }

  renderMainWindow = () => {
    switch (this.state.selectedContact) {
      case 'add':
        return (
          <ContactFormContainer
            relay={this.props.relay}
            onSave={this._handleContactSave}
          />
        );

      case null:
        return <Welcome />;

      default:
        return (
          <ContactDetails
            relay={this.props.relay}
            selectedContact={this.state.selectedContact}
            onRemoveContact={this._handleRemoveContact}
            onSaveContact={this._handleEditContact}
          />
        );
    }
  }

  render() {
    return (
      <div className="contactapp">
        <div className="appHeader">
          <h1>GraphQL-Relay Contacts App</h1>
        </div>
        <div className="appBody">
          <div className="leftNav">
            <ContactList
              viewer={this.props.viewer}
              onSelect={this._handleSelection}
              selectedContact={this.state.selectedContact}
            />
          </div>
          <div className="mainWindow">
            {this.renderMainWindow()}
          </div>
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(ContactApp, {
  viewer: graphql`
    fragment ContactApp_viewer on User {
      id,
      ...ContactList_viewer,
    }
  `,
});
