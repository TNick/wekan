import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating-runtime';

import { AccountSettings } from '/imports/api/models/accountSettings';
import { Users } from '/imports/api/models/users';
import { Popup } from '/imports/ui/components/utils/popup';
import './editProfilePopup.tpl.jade';

Template.editProfilePopup.onCreated(() => {
  Meteor.subscribe('accountSettings');
});

Template.editProfilePopup.helpers({
  allowEmailChange() {
    const allowEmailChange = AccountSettings.findOne('accounts-allowEmailChange');
    return allowEmailChange === undefined ? true : allowEmailChange.booleanValue;
  },
  allowUserNameChange() {
    const allowUserNameChange = AccountSettings.findOne('accounts-allowUserNameChange');
    return allowUserNameChange === undefined ? true : allowUserNameChange.booleanValue;
  },
});

Template.editProfilePopup.events({
  submit(evt, tpl) {
    evt.preventDefault();
    const fullname = tpl.find('.js-profile-fullname').value.trim();
    const username = tpl.find('.js-profile-username').value.trim();
    const initials = tpl.find('.js-profile-initials').value.trim();
    const email = tpl.find('.js-profile-email').value.trim();
    let isChangeUserName = false;
    let isChangeEmail = false;
    Users.update(Meteor.userId(), {
      $set: {
        'profile.fullname': fullname,
        'profile.initials': initials,
      },
    });
    isChangeUserName = username !== Meteor.user().username;
    isChangeEmail = email.toLowerCase() !== Meteor.user().emails[0].address.toLowerCase();
    if (isChangeUserName && isChangeEmail) {
      Meteor.call('setUsernameAndEmail', username, email.toLowerCase(), Meteor.userId(), function (error) {
        const usernameMessageElement = tpl.$('.username-taken');
        const emailMessageElement = tpl.$('.email-taken');
        if (error) {
          const errorElement = error.error;
          if (errorElement === 'username-already-taken') {
            usernameMessageElement.show();
            emailMessageElement.hide();
          } else if (errorElement === 'email-already-taken') {
            usernameMessageElement.hide();
            emailMessageElement.show();
          }
        } else {
          usernameMessageElement.hide();
          emailMessageElement.hide();
          Popup.back();
        }
      });
    } else if (isChangeUserName) {
      Meteor.call('setUsername', username, Meteor.userId(), function (error) {
        const messageElement = tpl.$('.username-taken');
        if (error) {
          messageElement.show();
        } else {
          messageElement.hide();
          Popup.back();
        }
      });
    } else if (isChangeEmail) {
      Meteor.call('setEmail', email.toLowerCase(), Meteor.userId(), function (error) {
        const messageElement = tpl.$('.email-taken');
        if (error) {
          messageElement.show();
        } else {
          messageElement.hide();
          Popup.back();
        }
      });
    } else Popup.back();
  },
});
