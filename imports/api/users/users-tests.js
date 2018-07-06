/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { expect, should as shouldFunc } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { stubs } from 'meteor/practicalmeteor:sinon';

import { Meteor } from 'meteor/meteor';

import { Users } from './users';

const should = shouldFunc();

describe('Initial state', () => {
  beforeEach(function () {
    resetDatabase();
  });

  afterEach(function () {

  });

  it('has no users', () => {
    expect(Users.find().count()).to.equal(0);
  });
});
