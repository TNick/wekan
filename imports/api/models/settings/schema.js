import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { Users } from '/imports/api/models/users';


export const Settings = new Mongo.Collection('settings');

// ----------------------------[     Schema      ]----------------------------

Settings.attachSchema(new SimpleSchema({
  disableRegistration: {
    type: Boolean,
  },
  'mailServer.username': {
    type: String,
    optional: true,
  },
  'mailServer.password': {
    type: String,
    optional: true,
  },
  'mailServer.host': {
    type: String,
    optional: true,
  },
  'mailServer.port': {
    type: String,
    optional: true,
  },
  'mailServer.enableTLS': {
    type: Boolean,
    optional: true,
  },
  'mailServer.from': {
    type: String,
    optional: true,
  },
  createdAt: {
    type: Date,
    denyUpdate: true,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert) {
        return new Date();
      } else {
        this.unset();
      }
    },
  },
  modifiedAt: {
    type: Date,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isInsert) {
        return new Date();
      } else {
        this.unset();
      }
    },
  },
}));
Settings.helpers({
  mailUrl () {
    if (!this.mailServer.host) {
      return null;
    }
    const protocol = this.mailServer.enableTLS ? 'smtps://' : 'smtp://';
    if (!this.mailServer.username && !this.mailServer.password) {
      return `${protocol}${this.mailServer.host}:${this.mailServer.port}/`;
    }
    return `${protocol}${this.mailServer.username}:${encodeURIComponent(this.mailServer.password)}@${this.mailServer.host}:${this.mailServer.port}/`;
  },
});

// ----------------------------[   Alow / Deny   ]----------------------------

Settings.allow({
  update(userId) {
    const user = Users.findOne(userId);
    return user && user.isAdmin;
  },
});

// ----------------------------[     Various     ]----------------------------

if (Meteor.isServer) {
  Meteor.startup(() => {
    const setting = Settings.findOne({});
    if(!setting){
      const now = new Date();
      const domain = process.env.ROOT_URL.match(/\/\/(?:www\.)?(.*)?(?:\/)?/)[1];
      const from = `Wekan <wekan@${domain}>`;
      const defaultSetting = {disableRegistration: false, mailServer: {
        username: '', password: '', host: '', port: '', enableTLS: false, from,
      }, createdAt: now, modifiedAt: now};
      Settings.insert(defaultSetting);
    }
    const newSetting = Settings.findOne();
    if (!process.env.MAIL_URL && newSetting.mailUrl())
      process.env.MAIL_URL = newSetting.mailUrl();
    Accounts.emailTemplates.from = process.env.MAIL_FROM ? process.env.MAIL_FROM : newSetting.mailServer.from;
  });
}
