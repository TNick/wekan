/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { expect } from 'meteor/practicalmeteor:chai';
import { stub } from 'sinon';
import { faker } from 'meteor/practicalmeteor:faker';
import { wipeDatabase } from '/imports/checks/helpers';
import StubCollections from 'meteor/hwillson:stub-collections';
import { Session } from 'meteor/session';
import { Users } from '/imports/api/models/users';
import { Boards } from '/imports/api/models/boards';


// prevents annoying error message that there's no path for /
FlowRouter.wait();

// const userFields = [
//   'createdAt',
//   'createdThroughApi',
//   'emails',
//   'heartbeat',
//   'isAdmin',
//   'loginDisabled',
//   'profile',
//   'services',
//   'username',
// ];

describe('Users', () => {
  beforeEach(function (done) {
    wipeDatabase(done);
    stub(TAPi18n, '__').callsFake((arg) => arg);
  });

  afterEach(function () {
    TAPi18n.__.restore();
  });

  describe('initial state', () => {
    it('has no users to begin with', () => {
      expect(Users.find().count()).to.equal(0);
    });
    it('is a common meteor collection', () => {
      expect(Users).to.have.property('find');
      expect(Users).to.have.property('findOne');
      expect(Users).to.have.property('insert');
      expect(Users).to.have.property('update');
      expect(Users).to.have.property('upsert');
      expect(Users).to.have.property('remove');
      expect(Users).to.have.property('allow');
      expect(Users).to.have.property('deny');
    });
  });

  it('provides defaults to fields', () => {
    if (Meteor.isServer) {
      const userId = Users.insert({});
      expect(userId).to.be.a.string;

      const user = Users.findOne(userId);
      expect(user).to.have.property('createdAt').and.to.be.a.date;
      expect(user).to.have.property('profile').and.to.be.a.object;
      expect(user).to.have.property('_id').to.be.a.string;
    }
  });

  it('prevents updates to fields not in schema', () => {
    if (Meteor.isServer) {
      const userId = Users.insert({username: faker.internet.userName()});
      expect(() => { Users.update(userId, {nonExistingField: 'XY'}); }).to.throw(Error, /your modifier is now empty/);
    }
  });

  it('prevents non-strings for username', () => {
    if (Meteor.isServer) {
      const username = faker.internet.userName();
      const userId = Users.insert({username});
      expect(userId).to.be.a.string;
      const user = Users.findOne(userId);
      expect(user.username).to.be.equal(username);
      Users.update(user._id, {$set: {'profile.initials': 'XY'}});
    }
  });

  it('accepts known fields', () => {
    if (Meteor.isServer) {
      const userId = Users.insert({
        username: faker.internet.userName(),
        emails: [{address: faker.internet.email(), verified: false}],
        createdAt: new Date(),
        profile: {
          avatarUrl: faker.internet.imageUrl,
          boardView: 'board-view-lists',
          emailBuffer: faker.lorem.paragraphs().split('\n'),
          fullname: `${faker.name.firstName()} ${faker.name.lastName()}`,
          hiddenSystemMessages: true,
          icode: faker.internet.userName(),
          initials: 'XY',
          invitedBoards: [faker.internet.userName()],
          language: 'en',
          notifications: faker.lorem.sentences().split('\n'),
          showCardsCountAt: 10,
          starredBoards: [faker.internet.userName()],
          tags: faker.lorem.words(8),
        },
        services: {},
        heartbeat: new Date(),
        isAdmin: false,
        createdThroughApi: true,
        loginDisabled: true,
      });
      expect(userId).to.be.a.string;
    }
  });

  describe('helpers', () => {
    let user = null;
    beforeEach(function (done) {
      //StubCollections.add(Users, Boards);
      //StubCollections.stub();
      user = Users.findOne(Users.insert({
        username: 'xyz',
      }));
    });
    afterEach(function () {
      //StubCollections.restore();
    });

    if (Meteor.isClient) {
      it('returns false if there is no current board', () => {
        Session.set('currentBoard', undefined);
        expect(user.isBoardMember()).to.be.undefined;
        Session.set('currentBoard', null);
        expect(user.isBoardMember()).to.be.undefined;
        Session.set('currentBoard', 'non-existing');
        expect(user.isBoardMember()).to.be.undefined;
      });

      it('returns false if board exists but is not member, not admin', () => {
        const boardId = Boards.insert({});
        Session.set('currentBoard', boardId);
        expect(user.isBoardMember()).to.be.undefined;
        Boards.update(boardId, {$set: {members: [
          {userId: '123', isAdmin: false, isActive: false, isCommentOnly: false},
          {userId: '123', isAdmin: false, isActive: false, isCommentOnly: false},
        ]}});
        expect(user.isBoardMember()).to.be.undefined;
        Boards.remove({});
      });

      it('returns true if the user is admin', () => {
        Users.update(user._id, {$set: {isAdmin: true}});
        const boardId = Boards.insert({});
        Session.set('currentBoard', boardId);
        expect(user.isBoardMember()).to.be.true;
        Boards.update(boardId, {$set: {members: [
          {userId: '123', isAdmin: false, isActive: false, isCommentOnly: false},
          {userId: '123', isAdmin: false, isActive: false, isCommentOnly: false},
        ]}});
        expect(user.isBoardMember()).to.be.true;
        Boards.remove({});
        Users.update(user._id, {$set: {isAdmin: false}});
      });

      it('returns true if the user is member', () => {
        Users.update(user._id, {$set: {isAdmin: true}});
        const boardId = Boards.insert({});
        Session.set('currentBoard', boardId);
        expect(user.isBoardMember()).to.be.true;
        Boards.update(boardId, {$set: {members: [
          {userId: '123', isAdmin: false, isActive: false, isCommentOnly: false},
          {userId: '123', isAdmin: false, isActive: false, isCommentOnly: false},
        ]}});
        expect(user.isBoardMember()).to.be.true;
        Boards.remove({});
        Users.update(user._id, {$set: {isAdmin: false}});
      });

    }


  });

  // describe('helpers', () => {
  //
  //   beforeEach(function (done) {

  //     user = Users.findOne(Users.insert({
  //       username: faker.internet.userName(),
  //     }));
  //   });

  //   afterEach(function () {
  //     // StubCollections.restore();
  //   });


  //   describe('in client', () => {
  //     // describe('is Board Member', () => {
  //     it('returns null if there is no current board', () => {
  //       if (Meteor.isClient) {
  //       //expect(user.isBoardMember()).to.be.false;
  //       }
  //     });
  //     //});

  //     // isBoardMember() {
  //     //   const board = Boards.findOne(Session.get('currentBoard'));
  //     //   return board && board.hasMember(this._id);
  //     // },
  //   });


  // });

});
