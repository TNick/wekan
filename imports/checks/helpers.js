import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { describe, beforeEach, it } from 'meteor/meteortesting:mocha';

/**
 * In order for us to be able to reset the database from client side we provide
 * a `test.resetDatabase` method.
 *
 * Example use:
 *
 *     describe('my module', function (done) {
 *       // We need to wait until the method call is done before moving on, so we
 *       // use Mocha's async mechanism (calling a done callback)
 *       beforeEach(function (done) {
 *           Meteor.call('test.resetDatabase', done);
 *       });
 *     });
 */
if ((Meteor.isTest) || (Meteor.isAppTest)) {
  // NOTE: Before writing a method like this you'll want to double check
  // that this file is only going to be loaded in test mode!!
  Meteor.methods({
    'test.resetDatabase': () => resetDatabase(),
  });
}

/**
 * Lists object's own properties using Meteor._debug.
 *
 *  Example:
 *      printOwnProperties(TAPi18n);
 *
 * @param {*} obj The object to print
 */
export const printOwnProperties = (obj) => {
  Meteor._debug('========[ Object Properties ]========');
  Meteor._debug(obj);
  Meteor._debug('-------------------------------------');
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      try {
        Meteor._debug(`${key}: ${obj[key]}`);
      } catch(error) {
        Meteor._debug(`${key}: cannot print (${error})`);
      }
    }
  }
  Meteor._debug('=====================================');
};

/**
 * Function to clean the database from either cleint or server.
 */
export const wipeDatabase = () => {
  if (Meteor.isClient) {
    Meteor.call('test.resetDatabase');
  } else {
    resetDatabase();
  }
};
