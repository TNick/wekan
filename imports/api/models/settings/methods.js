import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Accounts } from 'meteor/accounts-base';
import { TAPi18n } from 'meteor/tap:i18n';
import { Email } from 'meteor/email';
import { check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { InvitationCodes } from '/imports/api/models/invitationCodes';
import { Users } from '/imports/api/models/users';


function getRandomNum (min, max) {
  const range = max - min;
  const rand = Math.random();
  return (min + Math.round(rand * range));
}

function sendInvitationEmail (_id){
  const icode = InvitationCodes.findOne(_id);
  const author = Users.findOne(Meteor.userId());
  try {
    const params = {
      email: icode.email,
      inviter: Users.findOne(icode.authorId).username,
      user: icode.email.split('@')[0],
      icode: icode.code,
      url: FlowRouter.url('sign-up'),
    };
    const lang = author.getLanguage();
    Email.send({
      to: icode.email,
      from: Accounts.emailTemplates.from,
      subject: TAPi18n.__('email-invite-register-subject', params, lang),
      text: TAPi18n.__('email-invite-register-text', params, lang),
    });
  } catch (e) {
    InvitationCodes.remove(_id);
    throw new Meteor.Error('email-fail', e.message);
  }
}

Meteor.methods({
  sendInvitation(emails, boards) {
    check(emails, [String]);
    check(boards, [String]);
    const user = Users.findOne(Meteor.userId());
    if(!user.isAdmin){
      throw new Meteor.Error('not-allowed');
    }
    emails.forEach((email) => {
      if (email && SimpleSchema.RegEx.Email.test(email)) {
        const code = getRandomNum(100000, 999999);
        InvitationCodes.insert({code, email, boardsToBeInvited: boards, createdAt: new Date(), authorId: Meteor.userId()}, function(err, _id){
          if (!err && _id) {
            sendInvitationEmail(_id);
          } else {
            throw new Meteor.Error('invitation-generated-fail', err.message);
          }
        });
      }
    });
  },

  sendSMTPTestEmail() {
    if (!Meteor.userId()) {
      throw new Meteor.Error('invalid-user');
    }
    const user = Meteor.user();
    if (!user.emails && !user.emails[0] && user.emails[0].address) {
      throw new Meteor.Error('email-invalid');
    }
    this.unblock();
    const lang = user.getLanguage();
    try {
      Email.send({
        to: user.emails[0].address,
        from: Accounts.emailTemplates.from,
        subject: TAPi18n.__('email-smtp-test-subject', {lng: lang}),
        text: TAPi18n.__('email-smtp-test-text', {lng: lang}),
      });
    } catch ({message}) {
      throw new Meteor.Error('email-fail', `${TAPi18n.__('email-fail-text', {lng: lang})}: ${ message }`, message);
    }
    return {
      message: 'email-sent',
      email: user.emails[0].address,
    };
  },
});
