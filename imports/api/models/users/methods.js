import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';

import { isSandstorm } from '/imports/config/appConfig';
import { Users } from './schema';
import { Boards } from '/imports/api/models/boards';
import { Settings } from '/imports/api/models/settings';
import { InvitationCodes } from '/imports/api/models/invitationCodes';


if (Meteor.isServer) {
  Meteor.methods({
    // we accept userId, username, email
    inviteUserToBoard(username, boardId) {
      check(username, String);
      check(boardId, String);

      const inviter = Meteor.user();
      const board = Boards.findOne(boardId);
      const allowInvite = inviter &&
        board &&
        board.members &&
        _.contains(_.pluck(board.members, 'userId'), inviter._id) &&
        _.where(board.members, {userId: inviter._id})[0].isActive &&
        _.where(board.members, {userId: inviter._id})[0].isAdmin;
      if (!allowInvite) throw new Meteor.Error('error-board-notAMember');

      this.unblock();

      const posAt = username.indexOf('@');
      let user = null;
      if (posAt >= 0) {
        user = Users.findOne({emails: {$elemMatch: {address: username}}});
      } else {
        user = Users.findOne(username) || Users.findOne({username});
      }
      if (user) {
        if (user._id === inviter._id) throw new Meteor.Error('error-user-notAllowSelf');
      } else {
        if (posAt <= 0) throw new Meteor.Error('error-user-doesNotExist');
        if (Settings.findOne().disableRegistration) throw new Meteor.Error('error-user-notCreated');
        // Set in lowercase email before creating account
        const email = username.toLowerCase();
        username = email.substring(0, posAt);
        const newUserId = Accounts.createUser({username, email});
        if (!newUserId) throw new Meteor.Error('error-user-notCreated');
        // assume new user speak same language with inviter
        if (inviter.profile && inviter.profile.language) {
          Users.update(newUserId, {
            $set: {
              'profile.language': inviter.profile.language,
            },
          });
        }
        Accounts.sendEnrollmentEmail(newUserId);
        user = Users.findOne(newUserId);
      }

      board.addMember(user._id);
      user.addInvite(boardId);

      try {
        const params = {
          user: user.username,
          inviter: inviter.username,
          board: board.title,
          url: board.absoluteUrl(),
        };
        const lang = user.getLanguage();
        Email.send({
          to: user.emails[0].address.toLowerCase(),
          from: Accounts.emailTemplates.from,
          subject: TAPi18n.__('email-invite-subject', params, lang),
          text: TAPi18n.__('email-invite-text', params, lang),
        });
      } catch (e) {
        throw new Meteor.Error('email-fail', e.message);
      }
      return {username: user.username, email: user.emails[0].address};
    },
  });
  Accounts.onCreateUser((options, user) => {
    const userCount = Users.find().count();
    if (!isSandstorm && userCount === 0) {
      user.isAdmin = true;
      return user;
    }

    if (options.from === 'admin') {
      user.createdThroughApi = true;
      return user;
    }

    const disableRegistration = Settings.findOne().disableRegistration;
    if (!disableRegistration) {
      return user;
    }

    if (!options || !options.profile) {
      throw new Meteor.Error('error-invitation-code-blank', 'The invitation code is required');
    }
    const invitationCode = InvitationCodes.findOne({
      code: options.profile.invitationcode,
      email: options.email,
      valid: true,
    });
    if (!invitationCode) {
      throw new Meteor.Error('error-invitation-code-not-exist', 'The invitation code doesn\'t exist');
    } else {
      user.profile = {icode: options.profile.invitationcode};
      user.profile.boardView = 'board-view-lists';
    }

    return user;
  });
}


Meteor.methods({
  setUsername(username, userId) {
    check(username, String);
    const nUsersWithUsername = Users.find({username}).count();
    if (nUsersWithUsername > 0) {
      throw new Meteor.Error('username-already-taken');
    } else {
      Users.update(userId, {$set: {username}});
    }
  },
  toggleSystemMessages() {
    const user = Meteor.user();
    user.toggleSystem(user.hasHiddenSystemMessages());
  },
  changeLimitToShowCardsCount(limit) {
    check(limit, Number);
    Meteor.user().setShowCardsCountAt(limit);
  },
  setEmail(email, userId) {
    check(email, String);
    const existingUser = Users.findOne({'emails.address': email}, {fields: {_id: 1}});
    if (existingUser) {
      throw new Meteor.Error('email-already-taken');
    } else {
      Users.update(userId, {
        $set: {
          emails: [{
            address: email,
            verified: false,
          }],
        },
      });
    }
  },
  setUsernameAndEmail(username, email, userId) {
    check(username, String);
    check(email, String);
    check(userId, String);
    Meteor.call('setUsername', username, userId);
    Meteor.call('setEmail', email, userId);
  },
  setPassword(newPassword, userId) {
    check(userId, String);
    check(newPassword, String);
    if(Meteor.user().isAdmin){
      Accounts.setPassword(userId, newPassword);
    }
  },
});
