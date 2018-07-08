/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import {  expect } from 'meteor/practicalmeteor:chai';
import { stub } from 'sinon';
import { initTest, endTest } from '/imports/checks/helpers';
import { printOwnProperties } from '/imports/checks/helpers';

import { Boards } from '/imports/api/models/boards';
import { Users } from '/imports/api/models/users';


describe('Boards', () => {
  let stage = null;
  beforeEach(function (done) {
    expect(Boards.find().count()).to.equal(0);
    stage = initTest(done, ['settings', 'user', 'crtuser']);
  });

  afterEach(function () {
    endTest();
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
      // expect(() => { Boards.insert({}); } ).to.throw(Error, 'User id is required');
    }
  });

  it('provides defaults to fields', () => {
    if (Meteor.isServer) {
      expect(Meteor.userId()).to.be.a.string;
      const boardId = Boards.insert({
        userId: Meteor.userId(),
        members: [
          {
            userId: Meteor.userId(),
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
