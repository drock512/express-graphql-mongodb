import {
  commitMutation,
  graphql,
} from 'react-relay';

const mutation = graphql`
  mutation EditContactMutation($input: EditContactInput!) {
    editContact(input:$input) {
      contact {
        id
        name
        email
        friends {
          id
          name
        }
        totalFriends
      }
    }
  }
`;

function getOptimisticResponse(obj, contact) {
  return {
    editContact: {
      contact: {
        id: contact.id,
        name: obj.name,
        email: obj.email,
        totalFriends: obj.friends.length
      },
    },
  };
}

function commit(
  environment,
  obj,
  contact
) {
  return commitMutation(
    environment,
    {
      mutation,
      variables: {
        input: {
          id: contact.id,
          name: obj.name,
          email: obj.email,
          friends: obj.friends
        },
      },
      optimisticResponse: getOptimisticResponse(obj, contact),
    }
  );
}

export default {commit};
