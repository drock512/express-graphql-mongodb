import TodoList from './TodoList';
import TodoListFooter from './TodoListFooter';
import AddContactMutation from '../mutations/AddContactMutation';
import ContactForm from './ContactForm';
import ContactList from './ContactList';
import ContactDetails from './ContactDetails';

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

  render() {
    const hasTodos = this.props.viewer.totalCount > 0;
    return (
      <div className="contactapp">
        <div className="appHeader">
          <h1>Contacts</h1>
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
            {this.state.selectedContact ? (
              <ContactDetails
                relay={this.props.relay}
                selectedContact={this.state.selectedContact}
              />
            ) : (
              <ContactForm
                viewer={this.props.viewer}
                onSave={this._handleContactSave}
              />
            )}
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
      totalCount,
      ...ContactForm_viewer,
      ...ContactList_viewer,
    }
  `,
});
