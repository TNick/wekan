import { Template } from 'meteor/templating-runtime';

import { Popup } from '/imports/ui/components/utils/popup';
import './userAvatar';
import './headerUserBar.tpl.jade';


Template.headerUserBar.events({
  'click .js-open-header-member-menu': Popup.open('memberMenu'),
  'click .js-change-avatar': Popup.open('changeAvatar'),
});
