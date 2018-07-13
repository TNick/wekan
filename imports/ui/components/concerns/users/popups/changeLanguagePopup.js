import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating-runtime';
import { TAPi18n } from 'meteor/tap:i18n';
import { _ } from 'meteor/underscore';

import { Users } from '/imports/api/models/users';
import './changeLanguagePopup.tpl.jade';


Template.changeLanguagePopup.helpers({
  languages() {
    return _.map(TAPi18n.getLanguages(), (lang, code) => {
      // Same code in /client/components/main/layouts.js
      // TODO : Make code reusable
      const tag = code;
      let name = lang.name;
      if (lang.name === 'br') {
        name = 'Brezhoneg';
      } else if (lang.name === 'ig') {
        name = 'Igbo';
      }
      return { tag, name };
    }).sort(function (a, b) {
      if (a.name === b.name) {
        return 0;
      } else {
        return a.name > b.name ? 1 : -1;
      }
    });
  },

  isCurrentLanguage() {
    return this.tag === TAPi18n.getLanguage();
  },
});

Template.changeLanguagePopup.events({
  'click .js-set-language'(evt) {
    Users.update(Meteor.userId(), {
      $set: {
        'profile.language': this.tag,
      },
    });
    evt.preventDefault();
  },
});
