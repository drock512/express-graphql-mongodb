import {
  commitMutation,
  graphql,
} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';

const mutation = graphql`
  mutation AddContactMutation($input: AddContactInput!) {
    addContact(input:$input) {
      contactEdge {
        __typename
        cursor
        node {
          id
          name
          email
          totalFriends
        }
      }
    }
  }
`;

function sharedUpdater(store, user, newEdge) {
  const userProxy = store.get(user.id);
  const conn = ConnectionHandler.getConnection(
    userProxy,
    'ContactList_contacts',
  );
  ConnectionHandler.insertEdgeAfter(conn, newEdge);
}

let tempID = 0;

function commit(
  environment,
  obj,
  user
) {
  return commitMutation(
    environment,
    {
      mutation,
      variables: {
        input: Object.assign({}, obj, { clientMutationId: tempID++ })
      },
      updater: (store) => {
        const payload = store.getRootField('addContact');
        const newEdge = payload.getLinkedRecord('contactEdge');
        sharedUpdater(store, user, newEdge);
      },
      optimisticUpdater: (store) => {
        const id = 'client:newContact:' + tempID++;
        const node = store.create(id, 'Contact');
        node.setValue(obj.name, 'name');
        node.setValue(obj.email, 'email');
        node.setValue(id, 'id');
        const newEdge = store.create(
          'client:newEdge:' + tempID++,
          'ContactEdge',
        );
        newEdge.setLinkedRecord(node, 'node');
        sharedUpdater(store, user, newEdge);
      },
    }
  );
}

export default {commit};
