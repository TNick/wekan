import { Template } from 'meteor/templating-runtime';

import { Users } from '/imports/api/models/users';
import './userAvatarInitials.tpl.jade';


Template.userAvatarInitials.helpers({
  initials() {
    const user = Users.findOne(this.userId);
    return user && user.getInitials();
  },

  viewPortWidth() {
    const user = Users.findOne(this.userId);
    return (user && user.getInitials().length || 1) * 12;
  },
});
