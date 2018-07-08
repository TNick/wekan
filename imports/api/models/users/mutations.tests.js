/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { expect } from 'meteor/practicalmeteor:chai';
import { initTest, endTest } from '/imports/checks/helpers';


describe('Users', () => {
  describe('Schema', () => {
    beforeEach(function (done) {
      initTest(done, ['settings']);
    });

    afterEach(function () {
      endTest();
    });
  });
});
