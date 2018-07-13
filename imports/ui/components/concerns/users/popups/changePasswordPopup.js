import { Template } from 'meteor/templating-runtime';

import './changePasswordPopup.tpl.jade';


// XXX For some reason the useraccounts autofocus isnt working in this case.
// See https://github.com/meteor-useraccounts/core/issues/384
Template.changePasswordPopup.onRendered(function () {
  this.find('#at-field-current_password').focus();
});
