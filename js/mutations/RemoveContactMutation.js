import {
  commitMutation,
  graphql,
} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';

const mutation = graphql`
  mutation RemoveContactMutation($input: RemoveContactInput!) {
    removeContact(input: $input) {
      deletedContactId,
      changedContacts {
        id,
        totalFriends
      }
    }
  }
`;

function sharedUpdater(store, user, deletedID) {
  const userProxy = store.get(user.id);

  let conn = ConnectionHandler.getConnection(
    userProxy,
    'ContactList_contacts',
  );
  ConnectionHandler.deleteNode(
    conn,
    deletedID,
  );

  conn = ConnectionHandler.getConnection(
    userProxy,
    'ContactForm_contacts',
  );
  ConnectionHandler.deleteNode(
    conn,
    deletedID,
  );
}

function commit(
  environment,
  contact,
  user,
) {
  return commitMutation(
    environment,
    {
      mutation,
      variables: {
        input: {id: contact.id},
      },
      updater: (store) => {
        const payload = store.getRootField('removeContact');
        sharedUpdater(store, user, payload.getValue('deletedContactId'));
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, user, contact.id);
      },
    }
  );
}

export default {commit};
