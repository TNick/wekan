/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { expect, should as shouldFunc } from 'meteor/practicalmeteor:chai';
import { Users } from './users';

const should = shouldFunc();

describe('Initial state', () => {
  it('has settings on server', () => {
    expect(Settings.find().count()).to.be.equal(Meteor.isServer ? 1 : 0);
    if (Meteor.isServer) {
      const stgs = Settings.findOne();
      expect(stgs.disableRegistration).to.be.false;
      expect(stgs.mailServer.username).to.be.empty;
      expect(stgs.mailServer.password).to.be.empty;
      expect(stgs.mailServer.host).to.be.empty;
      expect(stgs.mailServer.port).to.be.empty;
      expect(stgs.mailServer.enableTLS).to.be.false;
      expect(stgs.mailServer.from).to.equal('Wekan <wekan@localhost:3000/>');
      stgs.createdAt.should.be.a('date');
      stgs.modifiedAt.should.be.a('date');
    }
  });
});
