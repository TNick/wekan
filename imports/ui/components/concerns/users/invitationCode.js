import { Template } from 'meteor/templating-runtime';
import { $ } from 'meteor/jquery';

import { Settings } from '/imports/api/models/settings';
import './invitationCode.tpl.jade';


Template.invitationCode.onRendered(() => {
  const setting = Settings.findOne();
  if (!setting || !setting.disableRegistration) {
    $('#invitationcode').hide();
  }
});
