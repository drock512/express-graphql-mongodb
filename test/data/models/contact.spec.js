import { expect } from "chai";
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';
import ContactModel from "../../../data/models/contact";

const mockgoose = new Mockgoose(mongoose);
//mockgoose.helper.setDbVersion('3.2.1');

describe("Models:Contact", function() {
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

  it("should create new contact", function(done) {
    const contact = new ContactModel({
      name: 'Test User',
      email: 'testuser@home.com',
      friends: []
    });

    contact.save()
      .then((doc) => {
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
