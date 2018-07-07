import { Meteor } from 'meteor/meteor';
import { Avatars } from '..';

Meteor.publish('my-avatars', function() {
  return Avatars.find({ userId: this.userId });
});
