import ContactListItem from './ContactListItem';

import React from 'react';
import {
  createPaginationContainer,
  graphql,
} from 'react-relay';

class ContactList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  _handleSelection = (id) => {
    this.props.onSelect(id);
  }

  _loadMore = () => {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return;
    }

    // workaround for bug
    this.setState({
      loading: true,
    });
    this.props.relay.loadMore(
      3, // Fetch the next 10 feed items
      () => {
        this.setState({
          loading: false,
        });
      },
    );
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
    return (
      <div className="contactList">
        <ul className="contact-list">
          <li className={this.props.selectedContact === 'add' ? 'active' : null}>
            <button className="add" onClick={this._handleSelection.bind(null, 'add')}>Add Contact</button>
          </li>
          {this.renderContacts()}
        </ul>
        <div className="loadMore">
          {this.props.relay.hasMore() ? (
            <button onClick={this._loadMore} disabled={this.state.loading}>
              {this.state.loading ? (
                <span><i className="fa fa-spinner fa-pulse" /> Loading...</span>
              ) : (
                <span>Load More</span>
              )}
            </button>
          ) : (
            <div className="thatAll">Fully Loaded</div>
          )}
        </div>
      </div>
    );
  }
}

/***
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
***/

export default createPaginationContainer(
  ContactList,
  {
    viewer: graphql`
      fragment ContactList_viewer on User {
        contacts(
          first: $count
          after: $cursor
        ) @connection(key: "ContactList_contacts") {
          edges {
            node {
              id
              ...ContactListItem_contact,
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
        id,
        ...ContactListItem_viewer,
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.contacts;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      return {
        count,
        cursor,
      };
    },
    query: graphql`
      query ContactListPaginationQuery(
        $count: Int!
        $cursor: String
      ) {
        viewer {
          # You could reference the fragment defined previously.
          ...ContactList_viewer
        }
      }
    `,
  }
);
