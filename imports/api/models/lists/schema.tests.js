/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { expect } from 'meteor/practicalmeteor:chai';
import { initTest, endTest } from '/imports/checks/helpers';

import { Lists } from '/imports/api/models/lists';


describe('Lists', () => {
  describe('Schema', () => {
    beforeEach(function (done) {
      initTest(done, ['settings']);
    });

    afterEach(function () {
      endTest();
    });

    describe('initial state', () => {
      it('has no items to begin with', () => {
        expect(Lists.find().count()).to.equal(0);
      });
    });

    describe('other stuff', () => {

    });

  });
});

