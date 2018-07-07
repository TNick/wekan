/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { assert, expect, should } from 'meteor/practicalmeteor:chai';
import { stub } from 'sinon';
import { wipeDatabase } from '/imports/checks/helpers';

import { Users } from './users';


// prevents annoying error message that there's no path for /
FlowRouter.wait();

describe('Initial state', () => {
  beforeEach(function () {
    wipeDatabase();
    stub(TAPi18n, '__').callsFake((arg) => arg);
  });

  afterEach(function () {

  });

  it('has no users', () => {
    expect(Users.find().count()).to.equal(0);
  });
});
