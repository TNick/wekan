/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { TAPi18n } from 'meteor/tap:i18n';
import { expect } from 'meteor/practicalmeteor:chai';
import { stub } from 'sinon';
import { faker } from 'meteor/practicalmeteor:faker';
import {  wipeDatabase } from '/imports/checks/helpers';

import { Avatars } from '/imports/api/models/avatars';


describe('Avatars', () => {
  beforeEach(function (done) {
    wipeDatabase(done);
    stub(TAPi18n, '__').callsFake((arg) => arg);
  });

  afterEach(function () {
    TAPi18n.__.restore();
  });

  describe('initial state', () => {
    it('has no items to begin with', () => {
      expect(Avatars.find().count()).to.equal(0);
    });
  });

  describe('other stuff', () => {

  });

});