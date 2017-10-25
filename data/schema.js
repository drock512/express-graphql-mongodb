/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  cursorForObjectInConnection,
  offsetToCursor,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
  toGlobalId,
} from 'graphql-relay';

import {
  Todo,
  User,
  addTodo,
  changeTodoStatus,
  getTodo,
  getTodos,
  getUser,
  getViewer,
  markAllTodos,
  removeCompletedTodos,
  removeTodo,
  renameTodo,

  addContact,
  getContact,
  getContacts,
  changeContact,
  removeContact,
} from './database';

import Contact from './models/contact';

const {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    const {type, id} = fromGlobalId(globalId);
    if (type === 'Todo') {
      return getTodo(id);
    } else if (type === 'User') {
      return getUser(id);
    } else if (type === 'Contact') {
      return getContact(id);
    }
    return null;
  },
  (obj) => {
    if (obj instanceof Todo) {
      return GraphQLTodo;
    } else if (obj instanceof User) {
      return GraphQLUser;
    } else if (obj instanceof Contact) {
      return GraphQLContact;
    }
    return null;
  }
);

const GraphQLContact = new GraphQLObjectType({
  name: 'Contact',
  fields: () => ({
    id: globalIdField('Contact'),
    name: {
      type: GraphQLString,
      resolve: (obj) => obj.name,
    },
    email: {
      type: GraphQLString,
      resolve: (obj) => obj.email,
    },
    friends: {
      type: new GraphQLList(GraphQLContact),
      resolve: (obj) => Promise.all(obj.friends.map(f => getContact(f))),
    },
    totalFriends: {
      type: GraphQLInt,
      resolve: (obj) => obj.friends.length,
    },
  }),
  interfaces: [nodeInterface],
});

const {
  connectionType: ContactConnection,
  edgeType: GraphQLContactEdge,
} = connectionDefinitions({
  name: 'Contact',
  nodeType: GraphQLContact,
});

const GraphQLTodo = new GraphQLObjectType({
  name: 'Todo',
  fields: {
    id: globalIdField('Todo'),
    text: {
      type: GraphQLString,
      resolve: (obj) => obj.text,
    },
    complete: {
      type: GraphQLBoolean,
      resolve: (obj) => obj.complete,
    },
  },
  interfaces: [nodeInterface],
});

const {
  connectionType: TodosConnection,
  edgeType: GraphQLTodoEdge,
} = connectionDefinitions({
  name: 'Todo',
  nodeType: GraphQLTodo,
});

const GraphQLUser = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: globalIdField('User'),
    todos: {
      type: TodosConnection,
      args: {
        status: {
          type: GraphQLString,
          defaultValue: 'any',
        },
        ...connectionArgs,
      },
      resolve: (obj, {status, ...args}) =>
        connectionFromArray(getTodos(status), args),
    },
    totalCount: {
      type: GraphQLInt,
      resolve: () => getTodos().length,
    },
    completedCount: {
      type: GraphQLInt,
      resolve: () => getTodos('completed').length,
    },
  },
  interfaces: [nodeInterface],
});

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer(),
    },
    contacts: {
      type: ContactConnection,
      args: {
        search: {
          type: GraphQLString,
          defaultValue: '',
        },
        ...connectionArgs,
      },
      resolve: (obj, {search, ...args}) =>
        getContacts(search).then(arr => connectionFromArray(arr, args)),
    },
    node: nodeField,
  },
});

const GraphQLAddContactMutation = mutationWithClientMutationId({
  name: 'AddContact',
  inputFields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    friends: { type: new GraphQLList(GraphQLString) },
  },
  outputFields: {
    contactEdge: {
      type: GraphQLContactEdge,
      resolve: ({localContactId}) => {
        return getContact(localContactId).then((contact) => {
          return getContacts().then((arr) => {
            // since arr and contact are separate, need to find index manually
            let index;
            arr.forEach((c, i) => {
              if (c._id === contact._id) {
                index = i;
              }
            });
            return {
              cursor: offsetToCursor(index),
              node: contact,
            }
          });
        });
      },
    },
  },
  mutateAndGetPayload: (obj) => {
    if (obj.friends && obj.friends.length) {
      obj.friends = obj.friends.map((id) => fromGlobalId(id).id);
    }
    return addContact(obj).then((id) => ({ localContactId: id }));
  },
});

const GraphQLEditContactMutation = mutationWithClientMutationId({
  name: 'EditContact',
  inputFields: {
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    friends: { type: new GraphQLList(GraphQLString) },
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    contact: {
      type: GraphQLContact,
      resolve: ({localContactId}) => getContact(localContactId),
    },
  },
  mutateAndGetPayload: ({id, ...obj}) => {
    const localContactId = fromGlobalId(id).id;
    if (obj.friends && obj.friends.length) {
      obj.friends = obj.friends.map((f) => fromGlobalId(id).id);
    }
    return changeContact(localContactId, obj).then((doc) => ({ localContactId: doc._id }));
  },
});

const GraphQLRemoveContactMutation = mutationWithClientMutationId({
  name: 'RemoveContact',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    deletedContactId: {
      type: GraphQLID,
      resolve: ({id}) => id,
    },
  },
  mutateAndGetPayload: ({id}) => {
    const localContactId = fromGlobalId(id).id;
    return removeContact(localContactId).then((doc) => ({ id }));
  },
});

const GraphQLAddTodoMutation = mutationWithClientMutationId({
  name: 'AddTodo',
  inputFields: {
    text: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    todoEdge: {
      type: GraphQLTodoEdge,
      resolve: ({localTodoId}) => {
        const todo = getTodo(localTodoId);
        return {
          cursor: cursorForObjectInConnection(getTodos(), todo),
          node: todo,
        };
      },
    },
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer(),
    },
  },
  mutateAndGetPayload: ({text}) => {
    const localTodoId = addTodo(text);
    return {localTodoId};
  },
});

const GraphQLChangeTodoStatusMutation = mutationWithClientMutationId({
  name: 'ChangeTodoStatus',
  inputFields: {
    complete: { type: new GraphQLNonNull(GraphQLBoolean) },
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    todo: {
      type: GraphQLTodo,
      resolve: ({localTodoId}) => getTodo(localTodoId),
    },
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer(),
    },
  },
  mutateAndGetPayload: ({id, complete}) => {
    const localTodoId = fromGlobalId(id).id;
    changeTodoStatus(localTodoId, complete);
    return {localTodoId};
  },
});

const GraphQLMarkAllTodosMutation = mutationWithClientMutationId({
  name: 'MarkAllTodos',
  inputFields: {
    complete: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
  outputFields: {
    changedTodos: {
      type: new GraphQLList(GraphQLTodo),
      resolve: ({changedTodoLocalIds}) => changedTodoLocalIds.map(getTodo),
    },
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer(),
    },
  },
  mutateAndGetPayload: ({complete}) => {
    const changedTodoLocalIds = markAllTodos(complete);
    return {changedTodoLocalIds};
  },
});

// TODO: Support plural deletes
const GraphQLRemoveCompletedTodosMutation = mutationWithClientMutationId({
  name: 'RemoveCompletedTodos',
  outputFields: {
    deletedTodoIds: {
      type: new GraphQLList(GraphQLString),
      resolve: ({deletedTodoIds}) => deletedTodoIds,
    },
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer(),
    },
  },
  mutateAndGetPayload: () => {
    const deletedTodoLocalIds = removeCompletedTodos();
    const deletedTodoIds = deletedTodoLocalIds.map(toGlobalId.bind(null, 'Todo'));
    return {deletedTodoIds};
  },
});

const GraphQLRemoveTodoMutation = mutationWithClientMutationId({
  name: 'RemoveTodo',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    deletedTodoId: {
      type: GraphQLID,
      resolve: ({id}) => id,
    },
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer(),
    },
  },
  mutateAndGetPayload: ({id}) => {
    const localTodoId = fromGlobalId(id).id;
    removeTodo(localTodoId);
    return {id};
  },
});

const GraphQLRenameTodoMutation = mutationWithClientMutationId({
  name: 'RenameTodo',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    text: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    todo: {
      type: GraphQLTodo,
      resolve: ({localTodoId}) => getTodo(localTodoId),
    },
  },
  mutateAndGetPayload: ({id, text}) => {
    const localTodoId = fromGlobalId(id).id;
    renameTodo(localTodoId, text);
    return {localTodoId};
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addContact: GraphQLAddContactMutation,
    editContact: GraphQLEditContactMutation,
    removeContact: GraphQLRemoveContactMutation,
    addTodo: GraphQLAddTodoMutation,
    changeTodoStatus: GraphQLChangeTodoStatusMutation,
    markAllTodos: GraphQLMarkAllTodosMutation,
    removeCompletedTodos: GraphQLRemoveCompletedTodosMutation,
    removeTodo: GraphQLRemoveTodoMutation,
    renameTodo: GraphQLRenameTodoMutation,
  },
});

export const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});
