import { Session } from 'meteor/session';
import { Template } from 'meteor/templating-runtime';
import { ESSearchResults } from 'meteor/matteodem:easy-search';
import { presences } from 'meteor/3stack:presence';

import { Popup } from '/imports/ui/components/utils/popup';
import { Users } from '/imports/api/models/users';
import './userAvatarInitials';
import './userAvatar.tpl.jade';
import './userAvatar.styl';


Template.userAvatar.helpers({
  userData() {
    // We need to handle a special case for the search results provided by the
    // `matteodem:easy-search` package. Since these results gets published in a
    // separate collection, and not in the standard Meteor.Users collection as
    // expected, we use a component parameter ("property") to distinguish the
    // two cases.
    const userCollection = this.esSearch ? ESSearchResults : Users;
    return userCollection.findOne(this.userId, {
      fields: {
        profile: 1,
        username: 1,
      },
    });
  },

  memberType() {
    const user = Users.findOne(this.userId);
    return user && user.isBoardAdmin() ? 'admin' : 'normal';
  },

  presenceStatusClassName() {
    const user = Users.findOne(this.userId);
    const userPresence = presences.findOne({ userId: this.userId });
    if (user && user.isInvitedTo(Session.get('currentBoard')))
      return 'pending';
    else if (!userPresence)
      return 'disconnected';
    else if (Session.equals('currentBoard', userPresence.state.currentBoardId))
      return 'active';
    else
      return 'idle';
  },
});

Template.userAvatar.events({
  'click .js-change-avatar': Popup.open('changeAvatar'),
});
