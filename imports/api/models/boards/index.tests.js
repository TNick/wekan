/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { assert, expect, should } from 'meteor/practicalmeteor:chai';
import { stub } from 'sinon';
import { faker } from 'meteor/practicalmeteor:faker';
import { printOwnProperties, wipeDatabase } from '/imports/checks/helpers';

import { Boards } from '/imports/api/models/boards';
import { Users } from '/imports/api/models/users';


// prevents annoying error message that there's no path for /
FlowRouter.wait();

describe('Boards', () => {
  let user = null;
  beforeEach(function (done) {
    stub(TAPi18n, '__').callsFake((arg) => arg);

    wipeDatabase(() => {
      const userId = Users.insert({}, () => {
        user = Users.findOne(userId);
        stub(Meteor, 'user').callsFake(() => user);
        stub(Meteor, 'userId').callsFake(() => user.id);
        done();
      });
    });
  });

  afterEach(function () {
    TAPi18n.__.restore();
    try {
      Meteor.user.restore();
      Meteor.userId.restore();
    } catch(error) {
      // this is for the case when we restore while testing
    }
  });

  describe('initial state', () => {
    it('has no items to begin with', () => {
      expect(Boards.find().count()).to.equal(0);
    });
    it('is a common meteor collection', () => {
      expect(Boards).to.have.property('find');
      expect(Boards).to.have.property('findOne');
      expect(Boards).to.have.property('insert');
      expect(Boards).to.have.property('update');
      expect(Boards).to.have.property('upsert');
      expect(Boards).to.have.property('remove');
      expect(Boards).to.have.property('allow');
      expect(Boards).to.have.property('deny');
    });
  });

  it('throws if there is no Meteor.user', () => {
    if (Meteor.isServer) {
      Meteor.user.restore();
      Meteor.userId.restore();
      expect(Meteor.userId()).to.be.null;
      expect(() => { Boards.insert({}); } ).to.throw(Error, 'User id is required');
    }
  });

  it('provides defaults to fields', () => {
    if (Meteor.isServer) {
      expect(user.id).to.be.a.string;
      expect(Meteor.userId()).not.to.be.null;
      printOwnProperties(Boards);
      const boardId = Boards.insert({
        userId: user.id,
        members: [
          {
            userId: user.id,
            isAdmin: true,
            isActive: true,
            isCommentOnly: false,
          },
        ],
      });
      expect(boardId).to.be.a.string;

      const board = Boards.findOne(boardId);
      // expect(board).to.have.property('createdAt').and.to.be.a.date;
      expect(board).to.have.property('_id').to.be.a.string;
    }
  });

  describe('other stuff', () => {

  });

});
