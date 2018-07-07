/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { TAPi18n } from 'meteor/tap:i18n';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { expect } from 'meteor/practicalmeteor:chai';
import { stub } from 'sinon';
import { faker } from 'meteor/practicalmeteor:faker';
import {  wipeDatabase } from '/imports/checks/helpers';

import { Announcements } from '/imports/api/models/announcements';


// prevents annoying error message that there's no path for /
FlowRouter.wait();

describe('Announcements', () => {
  beforeEach(function (done) {
    wipeDatabase(done);
    stub(TAPi18n, '__').callsFake((arg) => arg);
  });

  afterEach(function () {
    TAPi18n.__.restore();
  });

  describe('initial state', () => {
    it('has no items to begin with', () => {
      expect(Announcements.find().count()).to.equal(0);
    });
  });

  describe('other stuff', () => {

  });

});
