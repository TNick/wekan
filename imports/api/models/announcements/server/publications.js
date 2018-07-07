import { Meteor } from 'meteor/meteor';
import { Announcements } from '..';

Meteor.publish('announcements', function() {
  return Announcements.find();
});
