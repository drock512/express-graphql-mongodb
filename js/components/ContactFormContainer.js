import ContactForm from './ContactForm';
import Loading from './Loading';

import React from 'react';
import {
  QueryRenderer,
  graphql,
} from 'react-relay';

export default class ContactFormContainer extends React.Component {
  _handleCancel = () => {
    this.props.onCancel();
  };

  _handleSave = (obj) => {
    this.props.onSave(obj);
  };

  _getInitialValue = () => {
    return this.props.initialValue;
  };

  render() {
    return (
      <QueryRenderer
        environment={this.props.relay.environment}
        query={graphql`
          query ContactFormContainerQuery {
            viewer {
              ...ContactForm_viewer,
            }
          }
        `}
        variables={{}}
        render={({error, props}) => {
          if (error) {
            return <div>{error.message}</div>;
          } else if (props) {
            return (
              <ContactForm
                viewer={props.viewer}
                initialValue={this._getInitialValue()}
                onSave={this._handleSave}
                onCancel={this._handleCancel}
              />
            );
          }
          return <Loading />;
        }}
      />
    );
  }
}
