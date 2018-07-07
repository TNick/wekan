import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Settings = new Mongo.Collection('settings');

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
