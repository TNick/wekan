import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating-runtime';

import './editNotificationPopup.tpl.jade';


Template.editNotificationPopup.helpers({
  hasTag(tag) {
    const user = Meteor.user();
    return user && user.hasTag(tag);
  },
});

// we defined github like rules, see: https://github.com/settings/notifications
Template.editNotificationPopup.events({
  'click .js-toggle-tag-notify-participate'() {
    const user = Meteor.user();
    if (user) user.toggleTag('notify-participate');
  },
  'click .js-toggle-tag-notify-watch'() {
    const user = Meteor.user();
    if (user) user.toggleTag('notify-watch');
  },
});
