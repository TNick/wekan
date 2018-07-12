import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating-runtime';
import { $ } from 'meteor/jquery';

import { Announcements } from '/imports/api/models/announcements';
import { Utils } from '/imports/ui/lib/utils';
import { Popup } from '/imports/ui/components/utils/popup';
import './offlineWarning';
import '/imports/ui/components/concerns/users/headerUserBar';

import './header.tpl.jade';


Meteor.subscribe('user-admin');
Meteor.subscribe('boards');

Template.header.helpers({
  wrappedHeader() {
    return !Session.get('currentBoard');
  },

  hideLogo() {
    return Utils.isMiniScreen() && Session.get('currentBoard');
  },

  appIsOffline() {
    return !Meteor.status().connected;
  },

  hasAnnouncement() {
    const announcements =  Announcements.findOne();
    return announcements && announcements.enabled;
  },

  announcement() {
    $('.announcement').show();
    const announcements =  Announcements.findOne();
    return announcements && announcements.body;
  },
});

Template.header.events({
  'click .js-create-board': Popup.open('headerBarCreateBoard'),
  'click .js-close-announcement'() {
    $('.announcement').hide();
  },
  'click .js-select-list'() {
    Session.set('currentList', this._id);
    Session.set('currentCard', null);
  },
});
