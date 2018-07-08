import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';

import { Settings } from '/imports/api/models/settings';
import { Users } from '/imports/api/models/users';


Meteor.publish('setting', () => {
  return Settings.find({}, {fields:{disableRegistration: 1}});
});

Meteor.publish('mailServer', function () {
  if (!Match.test(this.userId, String))
    return [];
  const user = Users.findOne(this.userId);
  if(user && user.isAdmin){
    return Settings.find({}, {fields: {mailServer: 1}});
  }
  return [];
});
