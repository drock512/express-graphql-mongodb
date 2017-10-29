import MarkAllTodosMutation from '../mutations/MarkAllTodosMutation';
import ContactListItem from './ContactListItem';

import React from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';

const PropTypes = require('prop-types');

class ContactList extends React.Component {
  _handleSelection = (id) => {
    this.props.onSelect(id);
  }

  renderContacts() {
    return this.props.viewer.contacts.edges.map((edge) => {
      if (edge && edge.node) {
        return (
          <ContactListItem
            key={edge.node.id}
            contact={edge.node}
            isSelected={this.props.selectedContact === edge.node.id}
            onSelect={this._handleSelection}
            viewer={this.props.viewer}
          />
        );
      }

      return null;
    });
  }
  render() {
    const numTodos = this.props.viewer.totalCount;
    const numCompletedTodos = this.props.viewer.completedCount;
    return (
      <div className="contactList">
        <ul className="contact-list">
          <li className={this.props.selectedContact === null ? "active" : null}>
            <button className="add" onClick={this._handleSelection.bind(null, null)}>Add Contact</button>
          </li>
          {this.renderContacts()}
        </ul>
      </div>
    );
  }
}

export default createFragmentContainer(ContactList, {
  viewer: graphql`
    fragment ContactList_viewer on User {
      contacts(
        first: 2147483647  # max GraphQLInt
      ) @connection(key: "ContactList_contacts") {
        edges {
          node {
            id,
            ...ContactListItem_contact,
          },
        },
      },
      id,
      ...ContactListItem_viewer,
    }
  `,
});
