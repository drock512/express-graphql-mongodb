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

export class Todo {}
export class User {}

// Import mongoose models
import Contact from './models/contact';

// Mock authenticated ID
const VIEWER_ID = 'me';

// Mock user data
const viewer = new User();
viewer.id = VIEWER_ID;
const usersById = {
  [VIEWER_ID]: viewer,
};

// Mock todo data
const todosById = {};
const todoIdsByUser = {
  [VIEWER_ID]: [],
};
let nextTodoId = 0;
addTodo('Taste JavaScript', true);
addTodo('Buy a unicorn', false);

const delayMs = 500;
const delay = val => new Promise((resolve) => {
  setTimeout(() => {
    resolve(val);
  }, delayMs);
});

export function addContact(obj) {
  const contact = new Contact(obj);
  return contact.save().then(doc => doc._id).then(delay);
}

export function getContact(id) {
  return Contact.findById(id).then(delay);
}

export function getContacts(search) {
  return Contact.find().exec().then(delay);
}

export function changeContact(id, obj) {
  return Contact.findByIdAndUpdate(id, obj, { new: true }).then(delay);
}

export function removeContact(id) {
  return Contact.findByIdAndRemove(id).then((doc) => {
    // remove references to removed contact
    return Contact.find({ friends: doc._id }).then((docs) => {
      return Promise.all(docs.map(d => {
        d.friends = d.friends.filter(f => String(f) !== String(doc._id));
        return d.save();
      }));
    })
    .then((results) => {
      return {
        deletedContact: doc,
        changedContacts: results
      };
    });
  }).then(delay);
}

//----------------------------------
export function addTodo(text, complete) {
  const todo = new Todo();
  todo.complete = !!complete;
  todo.id = `${nextTodoId++}`;
  todo.text = text;
  todosById[todo.id] = todo;
  todoIdsByUser[VIEWER_ID].push(todo.id);
  return todo.id;
}

export function changeTodoStatus(id, complete) {
  const todo = getTodo(id);
  todo.complete = complete;
}

export function getTodo(id) {
  return todosById[id];
}

export function getTodos(status = 'any') {
  const todos = todoIdsByUser[VIEWER_ID].map(id => todosById[id]);
  if (status === 'any') {
    return todos;
  }
  return todos.filter(todo => todo.complete === (status === 'completed'));
}

export function getUser(id) {
  return usersById[id];
}

export function getViewer() {
  return getUser(VIEWER_ID);
}

export function markAllTodos(complete) {
  const changedTodos = [];
  getTodos().forEach(todo => {
    if (todo.complete !== complete) {
      todo.complete = complete;
      changedTodos.push(todo);
    }
  });
  return changedTodos.map(todo => todo.id);
}

export function removeTodo(id) {
  const todoIndex = todoIdsByUser[VIEWER_ID].indexOf(id);
  if (todoIndex !== -1) {
    todoIdsByUser[VIEWER_ID].splice(todoIndex, 1);
  }
  delete todosById[id];
}

export function removeCompletedTodos() {
  const todosToRemove = getTodos().filter(todo => todo.complete);
  todosToRemove.forEach(todo => removeTodo(todo.id));
  return todosToRemove.map(todo => todo.id);
}

export function renameTodo(id, text) {
  const todo = getTodo(id);
  todo.text = text;
}
