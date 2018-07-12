import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating-runtime';

import { Popup } from '/imports/ui/components/utils/popup';
import './changeSettingsPopup.tpl.jade';


Template.changeSettingsPopup.helpers({
  hiddenSystemMessages() {
    return Meteor.user().hasHiddenSystemMessages();
  },
  showCardsCountAt() {
    return Meteor.user().getLimitToShowCardsCount();
  },
});

Template.changeSettingsPopup.events({
  'click .js-toggle-system-messages'() {
    Meteor.call('toggleSystemMessages');
  },
  'click .js-apply-show-cards-at'(evt, tpl) {
    evt.preventDefault();
    const minLimit = parseInt(tpl.$('#show-cards-count-at').val(), 10);
    if (!isNaN(minLimit)) {
      Meteor.call('changeLimitToShowCardsCount', minLimit);
      Popup.back();
    }
  },
});
