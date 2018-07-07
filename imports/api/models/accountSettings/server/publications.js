import { Meteor } from 'meteor/meteor';
import { AccountSettings } from '..';

Meteor.publish('accountSettings', function() {
  return AccountSettings.find();
});
