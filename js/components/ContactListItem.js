import ChangeTodoStatusMutation from '../mutations/ChangeTodoStatusMutation';
import RemoveTodoMutation from '../mutations/RemoveTodoMutation';
import RenameTodoMutation from '../mutations/RenameTodoMutation';
import TodoTextInput from './TodoTextInput';

import React from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';
import classnames from 'classnames';

class ContactListItem extends React.Component {
  _handleClick = (() => {
    this.props.onSelect(this.props.contact.id);
  });

  render() {
    return (
      <li className={this.props.isSelected ? "active" : null}>
        <button onClick={this._handleClick}>
          <div>{this.props.contact.name}</div>
          <div className="friendCount">{this.props.contact.totalFriends} Friends</div>
        </button>
      </li>
    );
  }
}

export default createFragmentContainer(ContactListItem, {
  contact: graphql`
    fragment ContactListItem_contact on Contact {
      id,
      name,
      totalFriends
    }
  `,
  viewer: graphql`
    fragment ContactListItem_viewer on User {
      id,
      totalCount,
      completedCount,
    }
  `,
});
