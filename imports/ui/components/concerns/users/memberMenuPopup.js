import { Template } from 'meteor/templating-runtime';
import { AccountsTemplates } from 'meteor/useraccounts:core';

import { Popup } from '/imports/ui/components/utils/popup';
import './memberMenuPopup.tpl.jade';

Template.memberMenuPopup.events({
  'click .js-edit-profile': Popup.open('editProfile'),
  'click .js-change-settings': Popup.open('changeSettings'),
  'click .js-change-avatar': Popup.open('changeAvatar'),
  'click .js-change-password': Popup.open('changePassword'),
  'click .js-change-language': Popup.open('changeLanguage'),
  'click .js-edit-notification': Popup.open('editNotification'),
  'click .js-logout'(evt) {
    evt.preventDefault();

    AccountsTemplates.logout();
  },
  'click .js-go-setting'() {
    Popup.close();
  },
});
