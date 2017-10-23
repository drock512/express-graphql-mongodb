import { expect } from "chai";
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';
import * as db from "../../data/database";

const mockgoose = new Mockgoose(mongoose);
//mockgoose.helper.setDbVersion('3.2.1');

describe("Database", function() {
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

  describe("addContact", function() {
    it("should create new contact and return the doc id", function(done) {
      const contact = {
        name: 'Test User',
        email: 'testuser@home.com',
        friends: []
      };

      db.addContact(contact)
        .then((id) => {
          expect(!!id).to.equal(true);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("getContact", function() {
    it("should get and return the contact", function(done) {
      const contact = {
        name: 'Test User',
        email: 'testuser@home.com',
        friends: []
      };

      db.addContact(contact)
        .then((id) => db.getContact(id))
        .then((doc) => {
          expect(doc).to.be.a('object');
          expect(doc.name).to.equal(contact.name);
          expect(doc.email).to.equal(contact.email);
          expect(doc.friends).to.deep.equal(contact.friends);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("changeContact", function() {
    it("should change and return the contact", function(done) {
      const contact = {
        name: 'Test User',
        email: 'testuser@home.com',
        friends: []
      };

      db.addContact(contact)
        .then((id) => db.changeContact(id, { name: 'New Name' }))
        .then((doc) => {
          expect(doc).to.be.a('object');
          expect(doc.name).to.equal('New Name');
          expect(doc.email).to.equal(contact.email);
          expect(doc.friends).to.deep.equal(contact.friends);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("removeContact", function() {
    it("should remove and return the contact", function(done) {
      const contact = {
        name: 'Test User',
        email: 'testuser@home.com',
        friends: []
      };

      db.addContact(contact)
        .then((id) => db.removeContact(id))
        .then((doc) => {
          expect(doc).to.be.a('object');
          expect(doc.name).to.equal(contact.name);
          expect(doc.email).to.equal(contact.email);
          expect(doc.friends).to.deep.equal(contact.friends);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("should remove all references to contact", function(done) {
      const contactToRemove = {
        name: 'Test User',
        email: 'testuser@home.com',
        friends: []
      };
      let contactToRemoveId = null;
      let contactThatRemainsId = null;

      db.addContact(contactToRemove)
        .then((id) => {
          contactToRemoveId = id;
          return db.addContact({
            name: 'Another User',
            email: 'anotheruser@home.com',
            friends: [id]
          });
        })
        .then((id) => {
          contactThatRemainsId = id;
          return db.removeContact(contactToRemoveId);
        })
        .then((doc) => {
          // removed doc
          expect(doc).to.be.a('object');
          expect(doc.name).to.equal(contactToRemove.name);
          expect(doc.email).to.equal(contactToRemove.email);
          expect(doc.friends).to.deep.equal(contactToRemove.friends);
          return db.getContact(contactThatRemainsId);
        })
        .then((doc) => {
          // check that removed doc reference was deleted from friends
          expect(doc).to.be.a('object');
          expect(doc.name).to.equal('Another User');
          expect(doc.email).to.equal('anotheruser@home.com');
          expect(doc.friends).to.deep.equal([]);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
