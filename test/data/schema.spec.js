import { graphql } from 'graphql';
import { expect } from "chai";
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';
import { schema } from '../../data/schema';
import ContactModel from "../../data/models/contact";
import * as db from "../../data/database";

const mockgoose = new Mockgoose(mongoose);

describe("Schema", function() {
  before(function(done) {
    mockgoose.prepareStorage().then(function() {
      mongoose.Promise = global.Promise;
      mongoose.connect('mongodb://localhost/contacts', { useMongoClient: true })
        .then(() => done())
        .catch((err) => done(err))
    })
    .catch((err) => done(err));
  });

  after(function(done) {
    mongoose.disconnect();
    const childProcess = mockgoose.mongodHelper.mongoBin.childProcess;
    childProcess.kill();
    done();
  });

  describe("todo", function() {
    it("should return the viewer", function(done) {
      const query = `
        query Q {
          viewer {
            id,
            totalCount
          }
        }
      `;

      //const rootValue = {};
      //const context = getContext();

      graphql(schema, query)
        .then((result) => {
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe("contact", function() {
    it("should return all contacts", function(done) {
      const query = `
        query Q {
          contacts(first: 2) {
            edges {
              cursor,
              node {
                id,
                name,
                email
              },
            },
          },
        }
      `;

      // Preload mock DB
      const contact1 = new ContactModel({
        name: 'Bruce Banner',
        email: 'bruce@home.com',
        friends: []
      });
      const contact2 = new ContactModel({
        name: 'Steve Rogers',
        email: 'steve@home.com',
        friends: []
      });

      let bruceBanner;
      let steveRogers;

      contact1.save()
        .then((doc) => {
          bruceBanner = Object.assign({}, doc);
          return contact2.save();
        })
        .then((doc) => {
          steveRogers = Object.assign({}, doc);
          return Promise.resolve();
        })
        .then(() => graphql(schema, query))
        .then((result) => {
          expect(result.data.contacts.edges).to.be.an('array');
          expect(result.data.contacts.edges[0].node.name).to.equal(contact1.name);
          expect(result.data.contacts.edges[0].node.email).to.equal(contact1.email);
          expect(result.data.contacts.edges[1].node.name).to.equal(contact2.name);
          expect(result.data.contacts.edges[1].node.email).to.equal(contact2.email);
          done();
        })
        .catch((err) => done(err));
    });

    it("should create new contact", function(done) {
      const query = `
        mutation createContact {
          addContact(input: {
            name: "Peter Parker",
            email: "peter@home.com"
          }) {
            contactEdge {
              cursor,
              node {
                id,
                name,
                email
              }
            }
          },
        }
      `;

      graphql(schema, query)
        .then((result) => {
          expect(result.data.addContact.contactEdge).to.be.a('object');
          expect(result.data.addContact.contactEdge.node.name).to.equal('Peter Parker');
          expect(result.data.addContact.contactEdge.node.email).to.equal('peter@home.com');
          done();
        })
        .catch((err) => done(err));
    });

    it("should edit and return changed contact", function(done) {
      let query;
      const fetchQuery = `
        query Q {
          contacts(first: 2000) {
            edges {
              cursor,
              node {
                id,
                name,
                email
              },
            },
          },
        }
      `;

      // Preload mock DB
      const contact1 = new ContactModel({
        name: 'Batman',
        email: 'thebat@home.com',
        friends: []
      });

      let bruceWayne;

      contact1.save()
        .then(() => graphql(schema, fetchQuery))
        .then((result) => {
          bruceWayne = result.data.contacts.edges.find(c => c.node.name === contact1.name);
          query = `
            mutation changeContact {
              editContact(input: {
                id: "${bruceWayne.node.id}"
                name: "Bruce Wayne"
              }) {
                contact {
                  id,
                  name,
                  email
                }
              },
            }
          `;
          return Promise.resolve();
        })
        .then(() => graphql(schema, query))
        .then((result) => {
          expect(result.data.editContact.contact).to.be.a('object');
          expect(result.data.editContact.contact.name).to.equal('Bruce Wayne');
          expect(result.data.editContact.contact.email).to.equal(contact1.email);
          done();
        })
        .catch((err) => done(err));
    });

    it("should remove and return removed contact id", function(done) {
      let query;
      const fetchQuery = `
        query Q {
          contacts(first: 2000) {
            edges {
              cursor,
              node {
                id,
                name,
                email
              },
            },
          },
        }
      `;

      // Preload mock DB
      const contact1 = new ContactModel({
        name: 'Beetle',
        email: 'beetle@home.com',
        friends: []
      });

      let beetle;

      contact1.save()
        .then(() => graphql(schema, fetchQuery))
        .then((result) => {
          beetle = result.data.contacts.edges.find(c => c.node.name === contact1.name);
          query = `
            mutation deleteContact {
              removeContact(input: {
                id: "${beetle.node.id}"
              }) {
                deletedContactId
              },
            }
          `;
          return Promise.resolve();
        })
        .then(() => graphql(schema, query))
        .then((result) => {
          expect(result.data.removeContact.deletedContactId).to.equal(beetle.node.id);
          done();
        })
        .catch((err) => done(err));
    });

    it("should create contact with friend and return contact with friend", function(done) {
      let query;
      const fetchQuery = `
        query Q {
          contacts(first: 2000) {
            edges {
              cursor,
              node {
                id,
                name,
                email
              },
            },
          },
        }
      `;

      // Preload mock DB
      const contact1 = new ContactModel({
        name: 'Mario',
        email: 'mario@home.com',
        friends: []
      });

      let mario;
      let luigi;

      contact1.save()
        .then(() => graphql(schema, fetchQuery))
        .then((result) => {
          mario = result.data.contacts.edges.find(c => c.node.name === contact1.name);
          query = `
            mutation createContact {
              addContact(input: {
                name: "Luigi",
                email: "luigi@home.com",
                friends: ["${mario.node.id}"]
              }) {
                contactEdge {
                  cursor,
                  node {
                    id,
                    name,
                    email,
                    friends {
                      name
                    }
                  }
                }
              },
            }
          `;
          return Promise.resolve();
        })
        .then(() => graphql(schema, query))
        .then((result) => {
          expect(result.data.addContact.contactEdge).to.be.a('object');
          expect(result.data.addContact.contactEdge.node.name).to.equal('Luigi');
          expect(result.data.addContact.contactEdge.node.email).to.equal('luigi@home.com');
          expect(result.data.addContact.contactEdge.node.friends).to.deep.equal([{
            name: 'Mario'
          }]);
          done();
        })
        .catch((err) => done(err));
    });
  });
});
