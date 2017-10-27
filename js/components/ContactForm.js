import React from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';
import ReactDOM from 'react-dom';

const PropTypes = require('prop-types');

const ENTER_KEY_CODE = 13;
const ESC_KEY_CODE = 27;

class ContactForm extends React.Component {
  static defaultProps = {
    commitOnBlur: false,
  };
  static propTypes = {
    className: PropTypes.string,
    commitOnBlur: PropTypes.bool.isRequired,
    initialValue: PropTypes.string,
    onCancel: PropTypes.func,
    onDelete: PropTypes.func,
    onSave: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
  };
  state = {
    isEditing: false,
    name: '',
    email: '',
    friends: [],
  };
  componentDidMount() {
    ReactDOM.findDOMNode(this).focus();
  }
  _commitChanges = () => {
    const newName = this.state.name.trim();
    const newEmail = this.state.email.trim();
    if (newName !== '' && newEmail !== '') {
      this.props.onSave({
        name: newName,
        email: newEmail,
      });
      this.setState({name: '', email: ''});
    }
  };

  _handleNameChange = (e) => {
    this.setState({name: e.target.value});
  };
  _handleEmailChange = (e) => {
    this.setState({email: e.target.value});
  };
  _handleFriendsChange = (e) => {
  };

  renderFriends = () => {
    console.log('DCM viewer', this.props.viewer)
    if (!this.props.viewer.contacts.edges.length) return null;

    return (
      <div>
        <div className="smaller">Friends with:</div>
        {this.props.viewer.contacts.edges.map(edge => (
          <div key={edge.node.id} className="smaller">
            <input
              type="checkbox"
              name={edge.node.id}
              checked={this.state.friends.indexOf(edge.node.id) !== -1}
              onChange={this._handleFriendsChange}
            />
            {' '}
            {edge.node.name}
          </div>
        ))}
      </div>
    );
  };

  render() {
    return (
      <div className="contactFormContainer">
        <h3>Create New Contact</h3>
        <div>
          <input
            className={"new-todo"}
            onChange={this._handleNameChange}
            placeholder={"Name"}
            value={this.state.name}
          />
        </div>
        <div>
          <input
            className={"new-todo"}
            onChange={this._handleEmailChange}
            placeholder={"Email"}
            value={this.state.email}
          />
        </div>
        {this.renderFriends()}
        <div>
          <button onClick={this._commitChanges}>Save</button>
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(ContactForm, {
  viewer: graphql`
    fragment ContactForm_viewer on User {
      contacts(
        first: 2147483647  # max GraphQLInt
      ) @connection(key: "ContactForm_contacts") {
        edges {
          node {
            id,
            name
          },
        },
      },
      id,
    }
  `,
});
